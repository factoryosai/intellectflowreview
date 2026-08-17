import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness } from "@/lib/queries";
import { getPlaceDetails, type PlaceSuggestion } from "@/lib/places.functions";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { useState } from "react";
import { Trash2, Star, Loader2, Sparkles, TrendingUp, TrendingDown, Target, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { competitorSwot } from "@/lib/ai.functions";
import { supabase as sb } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/competitors")({ component: Comp });

type Swot = { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };

function Comp() {
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const qc = useQueryClient();
  const details = useServerFn(getPlaceDetails);
  const swotFn = useServerFn(competitorSwot);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [swotBusy, setSwotBusy] = useState(false);

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

  const generateSwot = async () => {
    if (!biz || !(rows ?? []).length) return;
    setSwotBusy(true);
    try {
      const res = await swotFn({
        data: {
          businessName: biz.name,
          businessType: biz.business_type ?? "shop",
          businessCity: biz.city ?? undefined,
          businessRating: biz.rating ?? undefined,
          businessReviewCount: biz.total_reviews ?? undefined,
          competitors: (rows ?? []).map((c) => ({
            name: c.competitor_name,
            rating: c.competitor_rating,
            reviewCount: c.competitor_reviews,
          })),
        },
      });
      await sb.from("businesses").update({ swot_summary: res, swot_generated_at: new Date().toISOString() }).eq("id", biz.id);
      qc.invalidateQueries({ queryKey: ["biz"] });
      toast.success("SWOT analysis generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate SWOT analysis");
    } finally {
      setSwotBusy(false);
    }
  };

  const swot = (biz as any)?.swot_summary as Swot | null | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-black text-2xl">Competitors</h1>
          <p className="text-sm text-zinc-500">Start typing a competitor's name — pick from Google suggestions to track their live rating.</p>
        </div>
        <button
          onClick={generateSwot}
          disabled={swotBusy || !(rows ?? []).length}
          className="h-10 px-4 rounded-lg bg-black text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-60 shrink-0"
        >
          {swotBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {swot ? "Refresh SWOT" : "Generate SWOT Analysis"}
        </button>
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

      {swot && (
        <div className="bg-white border border-black/10 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-black text-sm uppercase tracking-wide">SWOT Analysis</h2>
            {(biz as any)?.swot_generated_at && (
              <span className="text-[11px] text-zinc-400">Updated {new Date((biz as any).swot_generated_at).toLocaleDateString()}</span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <SwotBlock icon={TrendingUp} label="Strengths" items={swot.strengths} color="text-emerald-700 bg-emerald-50 border-emerald-200" />
            <SwotBlock icon={TrendingDown} label="Weaknesses" items={swot.weaknesses} color="text-red-700 bg-red-50 border-red-200" />
            <SwotBlock icon={Target} label="Opportunities" items={swot.opportunities} color="text-blue-700 bg-blue-50 border-blue-200" />
            <SwotBlock icon={ShieldAlert} label="Threats" items={swot.threats} color="text-orange-700 bg-orange-50 border-orange-200" />
          </div>
        </div>
      )}

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

function SwotBlock({
  icon: Icon,
  label,
  items,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  items: string[];
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <ul className="space-y-1">
        {(items ?? []).map((it, i) => (
          <li key={i} className="text-xs text-zinc-700 flex gap-1.5">
            <span className="opacity-50">•</span> {it}
          </li>
        ))}
        {(!items || !items.length) && <li className="text-xs text-zinc-400">—</li>}
      </ul>
    </div>
  );
}
