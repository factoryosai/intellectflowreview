import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness } from "@/lib/queries";
import { getPlaceDetails, type PlaceSuggestion } from "@/lib/places.functions";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { useState } from "react";
import { Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/competitors")({ component: Comp });

function Comp() {
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const qc = useQueryClient();
  const details = useServerFn(getPlaceDetails);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["comp", biz?.id], enabled: !!biz?.id,
    queryFn: async () => (await supabase.from("competitors").select("*").eq("business_id", biz!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const addFromPlace = async (s: PlaceSuggestion) => {
    if (!biz) return;
    setBusy(true);
    try {
      const d = await details({ data: { place_id: s.place_id } });
      const { error } = await supabase.from("competitors").insert({
        business_id: biz.id,
        competitor_name: d.name,
        competitor_address: d.address,
        competitor_rating: d.rating ?? null,
        competitor_reviews: d.user_rating_count ?? null,
      });
      if (error) throw new Error(error.message);
      setQ("");
      qc.invalidateQueries({ queryKey: ["comp", biz.id] });
      toast.success(`${d.name} added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add competitor");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    await supabase.from("competitors").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["comp", biz?.id] });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-black text-2xl">Competitors</h1>
        <p className="text-sm text-zinc-500">Start typing a competitor's name — pick from Google suggestions to track their live rating.</p>
      </div>
      <div className="bg-white border border-black/10 rounded-2xl p-4">
        <PlaceSearchInput
          value={q}
          onValueChange={setQ}
          disabled={busy || !biz}
          placeholder="Search a nearby competitor…"
          onSelect={addFromPlace}
        />
        {busy && <div className="mt-2 text-xs text-zinc-500 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching Google data…</div>}
      </div>
      <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/5">
        {(rows ?? []).length === 0 && <div className="p-6 text-center text-sm text-zinc-500">No competitors tracked yet.</div>}
        {(rows ?? []).map((c) => (
          <div key={c.id} className="p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{c.competitor_name}</div>
              {c.competitor_address && <div className="text-xs text-zinc-500 truncate">{c.competitor_address}</div>}
              <div className="text-xs text-zinc-500 inline-flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-[#c9a227] text-[#c9a227]" />
                {c.competitor_rating ?? "—"} · {c.competitor_reviews ?? 0} reviews
              </div>
            </div>
            <button onClick={() => del(c.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
