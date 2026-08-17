import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(system: string, user: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

// AI Writer — short review suggestions, each with 2 relevant SEO keywords
export const aiWriter = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({
      rating: z.number().min(1).max(5),
      businessName: z.string().min(1).max(120),
      businessType: z.string().default("shop"),
      businessCity: z.string().max(120).optional(),
      businessDescription: z.string().max(2000).optional(),
      count: z.number().min(1).max(8).default(5),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const system = `You write SHORT, natural Google reviews for small Indian businesses. Always return STRICT JSON only, no markdown fences.`;
    const user = `Business: ${data.businessName} (${data.businessType})${data.businessCity ? ` in ${data.businessCity}` : ""}
${data.businessDescription ? `About: ${data.businessDescription}\n` : ""}Rating: ${data.rating}/5

Write ${data.count} DIFFERENT review options. Rules:
- Each review is SHORT: 12-20 words max, one or two sentences.
- Each review must naturally include exactly 2 relevant local-SEO keywords (e.g. service/product + city or "${data.businessType}").
- Sound like a real customer, no hashtags, no emojis, no quotes around the text.
- Mix languages: at least one Gujarati, one Hinglish, rest English.

Return JSON: { "suggestions": [ {"lang":"English","text":"...","keywords":["...","..."]} ] }`;
    const raw = await callAI(system, user);
    try {
      const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
      return JSON.parse(cleaned) as { suggestions: { lang: string; text: string; keywords?: string[] }[] };
    } catch {
      return { suggestions: [{ lang: "English", text: raw.slice(0, 200), keywords: [] }] };
    }
  });

// AI Reply — 3 owner reply variants
export const aiReply = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({
      reviewText: z.string().min(1).max(2000),
      rating: z.number().min(1).max(5),
      businessName: z.string().max(120).optional(),
      businessDescription: z.string().max(2000).optional(),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const system = `You are a friendly Indian business owner replying to Google reviews. Return STRICT JSON only.`;
    const user = `${data.businessName ? `Business: ${data.businessName}\n` : ""}${data.businessDescription ? `About: ${data.businessDescription}\n` : ""}Customer review (${data.rating}★): "${data.reviewText}"

Return JSON: { "replies": [ {"lang":"Hinglish","text":"..."}, {"lang":"Gujarati","text":"..."}, {"lang":"English","text":"..."} ] }
Each about 30 words, warm and specific. If rating <= 2, apologize and invite the customer to reach out.`;
    const raw = await callAI(system, user);
    try {
      const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
      return JSON.parse(cleaned) as { replies: { lang: string; text: string }[] };
    } catch {
      return { replies: [{ lang: "English", text: raw.slice(0, 200) }] };
    }
  });

// GMB Post generator
export const gmbPost = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({
      businessName: z.string().min(1).max(120),
      offerOrEvent: z.string().min(1).max(400),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const system = `You write engaging Google Business Profile posts for Indian small businesses. About 90-110 words, include a clear CTA and 3-5 relevant hashtags.`;
    const user = `Business: ${data.businessName}
Offer/event: ${data.offerOrEvent}
Return only the post text.`;
    return { content: (await callAI(system, user)).trim() };
  });

// Auto FAQ Generator — builds Google-Business-Profile-ready Q&A pairs
export const generateFAQs = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({
      businessName: z.string().min(1).max(120),
      businessType: z.string().default("shop"),
      businessCity: z.string().max(120).optional(),
      businessDescription: z.string().max(2000).optional(),
      recentReviewTexts: z.array(z.string().max(500)).max(10).default([]),
      count: z.number().min(3).max(15).default(8),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const system = `You write short, helpful FAQ pairs for a small business's Google Business Profile Q&A section. Return STRICT JSON only, no markdown fences.`;
    const user = `Business: ${data.businessName} (${data.businessType})${data.businessCity ? ` in ${data.businessCity}` : ""}
${data.businessDescription ? `About: ${data.businessDescription}\n` : ""}${data.recentReviewTexts.length ? `Recent customer reviews (use these for context on what customers actually ask/care about):\n${data.recentReviewTexts.map((t) => `- ${t}`).join("\n")}\n` : ""}
Write ${data.count} DIFFERENT FAQ pairs a real customer would search for or ask before visiting. Rules:
- Questions: short, natural, how a customer would type them (e.g. "Do you have parking?", "What are your timings?").
- Answers: 1-2 sentences, specific to this business, friendly tone, no placeholders like "[insert]".
- Cover a mix: timings/location, pricing/offers, services/products, policies, and anything relevant from the reviews.
- No duplicate questions.

Return JSON: { "faqs": [ {"question":"...","answer":"..."} ] }`;
    const raw = await callAI(system, user);
    try {
      const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
      return JSON.parse(cleaned) as { faqs: { question: string; answer: string }[] };
    } catch {
      return { faqs: [] };
    }
  });

// Competitor SWOT — analyzes tracked competitors against this business
export const competitorSwot = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z.object({
      businessName: z.string().min(1).max(120),
      businessType: z.string().default("shop"),
      businessCity: z.string().max(120).optional(),
      businessRating: z.number().min(0).max(5).optional(),
      businessReviewCount: z.number().min(0).optional(),
      competitors: z.array(z.object({
        name: z.string(),
        rating: z.number().nullable().optional(),
        reviewCount: z.number().nullable().optional(),
      })).min(1).max(10),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const system = `You are a local-business growth consultant. Compare a business against its tracked competitors and produce a short SWOT analysis. Return STRICT JSON only, no markdown fences.`;
    const compLines = data.competitors
      .map((c) => `- ${c.name}: ${c.rating ?? "?"}★ (${c.reviewCount ?? "?"} reviews)`)
      .join("\n");
    const user = `Business: ${data.businessName} (${data.businessType})${data.businessCity ? ` in ${data.businessCity}` : ""}
This business: ${data.businessRating ?? "?"}★ (${data.businessReviewCount ?? "?"} reviews)

Tracked competitors:
${compLines}

Write a SWOT analysis based on the rating/review-count gap and typical patterns for this business type. Rules:
- Each of strengths/weaknesses/opportunities/threats: 2-4 short bullet points, max 15 words each.
- Be specific and actionable, not generic filler.
- Base conclusions on the actual numbers given (e.g. review count gap, rating gap).

Return JSON: { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] }`;
    const raw = await callAI(system, user);
    try {
      const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
      return JSON.parse(cleaned) as {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
      };
    } catch {
      return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    }
  });

// Sentiment analysis
export const sentiment = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ text: z.string().min(1).max(2000) }).parse(raw))
  .handler(async ({ data }) => {
    const system = `You classify short Google reviews. Return STRICT JSON only.`;
    const user = `Review: "${data.text}"
Return JSON: { "sentiment": "positive|neutral|negative", "score": 0.0-1.0, "summary": "one short sentence" }`;
    const raw = await callAI(system, user);
    try {
      return JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "").trim());
    } catch {
      return { sentiment: "neutral", score: 0.5, summary: raw.slice(0, 120) };
    }
  });
