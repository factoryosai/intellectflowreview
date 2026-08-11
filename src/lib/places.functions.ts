import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://places.googleapis.com/v1";

function key() {
  const k = process.env.GOOGLE_API_KEY || process.env.GOOGLE_ANALYTICS_API_KEY;
  if (!k) throw new Error("Missing GOOGLE_API_KEY");
  return k;
}

export type PlaceSuggestion = {
  place_id: string;
  primary: string;
  secondary: string;
};

export type PlaceSummary = {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  user_rating_count?: number;
};

export type PlaceDetails = {
  place_id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_rating_count?: number;
  city?: string;
  photo_url?: string;
  google_maps_uri?: string;
  business_type?: string;
  reviews?: { author: string; rating: number; text: string; time: string }[];
};

export const searchPlaces = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({ query: z.string().trim().min(2, "Enter at least 2 characters").max(200) }).parse(raw),
  )
  .handler(async ({ data }): Promise<{ results: PlaceSummary[] }> => {
    let res: Response;
    try {
      res = await fetch(`${BASE}/places:searchText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key(),
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({ textQuery: data.query, regionCode: "IN" }),
      });
    } catch {
      throw new Error("Could not reach Google Places. Check your internet and try again.");
    }
    if (!res.ok) {
      const body = await res.text();
      console.error(`[places.search] ${res.status}: ${body}`);
      if (res.status === 403) throw new Error("Google Places API key is not authorized. Enable 'Places API (New)' on the key.");
      if (res.status === 429) throw new Error("Too many searches — try again in a moment.");
      throw new Error(`Google Places search failed (${res.status}). Try a different search.`);
    }
    const json = (await res.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        rating?: number;
        userRatingCount?: number;
      }>;
    };
    return {
      results:
        json.places?.map((p) => ({
          place_id: p.id,
          name: p.displayName?.text ?? "",
          address: p.formattedAddress ?? "",
          rating: p.rating,
          user_rating_count: p.userRatingCount,
        })) ?? [],
    };
  });


export const getPlaceDetails = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({ place_id: z.string().min(1).max(200) }).parse(raw),
  )
  .handler(async ({ data }): Promise<PlaceDetails> => {
    let res: Response;
    try {
      res = await fetch(`${BASE}/places/${encodeURIComponent(data.place_id)}`, {
        headers: {
          "X-Goog-Api-Key": key(),
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,internationalPhoneNumber,nationalPhoneNumber,websiteUri,rating,userRatingCount,googleMapsUri,addressComponents,photos,primaryTypeDisplayName,reviews",
        },
      });
    } catch {
      throw new Error("Could not reach Google Places. Check your internet and try again.");
    }
    if (!res.ok) {
      const body = await res.text();
      console.error(`[places.details] ${res.status}: ${body}`);
      if (res.status === 403) throw new Error("Google Places API key is not authorized. Enable 'Places API (New)' on the key.");
      if (res.status === 404) throw new Error("This business is no longer available on Google.");
      throw new Error(`Failed to load business details (${res.status}).`);
    }
    const p = (await res.json()) as any;

    const city =
      p.addressComponents?.find((c: any) =>
        c.types?.some((t: string) => t === "locality" || t === "administrative_area_level_2"),
      )?.longText ?? undefined;

    let photo_url: string | undefined;
    const photoName = p.photos?.[0]?.name as string | undefined;
    if (photoName) {
      photo_url = `${BASE}/${photoName}/media?maxWidthPx=800&key=${key()}`;
    }

    return {
      place_id: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      phone: p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? undefined,
      website: p.websiteUri ?? undefined,
      rating: p.rating,
      user_rating_count: p.userRatingCount,
      city,
      photo_url,
      google_maps_uri: p.googleMapsUri,
      business_type: p.primaryTypeDisplayName?.text,
      reviews: p.reviews?.slice(0, 5).map((r: any) => ({
        author: r.authorAttribution?.displayName ?? "Customer",
        rating: r.rating ?? 0,
        text: r.text?.text ?? r.originalText?.text ?? "",
        time: r.publishTime ?? "",
      })),
    };
  });

// Type-ahead suggestions while the user is typing (Places Autocomplete - New)
export const autocompletePlaces = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({ input: z.string().trim().min(2).max(200) }).parse(raw),
  )
  .handler(async ({ data }): Promise<{ suggestions: PlaceSuggestion[] }> => {
    let res: Response;
    try {
      res = await fetch(`${BASE}/places:autocomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key() },
        body: JSON.stringify({
          input: data.input,
          regionCode: "IN",
          includedRegionCodes: ["in"],
        }),
      });
    } catch {
      throw new Error("Could not reach Google Places. Check your internet and try again.");
    }
    if (!res.ok) {
      const body = await res.text();
      console.error(`[places.autocomplete] ${res.status}: ${body}`);
      if (res.status === 403) throw new Error("Google Places API key is not authorized. Enable 'Places API (New)' on the key.");
      return { suggestions: [] };
    }
    const json = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId?: string;
          structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
          text?: { text?: string };
        };
      }>;
    };
    return {
      suggestions:
        json.suggestions
          ?.map((s) => s.placePrediction)
          .filter((p): p is NonNullable<typeof p> => !!p?.placeId)
          .map((p) => ({
            place_id: p.placeId!,
            primary: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
            secondary: p.structuredFormat?.secondaryText?.text ?? "",
          })) ?? [],
    };
  });
