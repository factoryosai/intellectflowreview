import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness } from "@/lib/queries";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/competitors")({ component: Comp });

function Comp() {
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");

  const { data: rows } = useQuery({
    queryKey: ["comp", biz?.id], enabled: !!biz?.id,
    queryFn: async () => (await supabase.from("competitors").select("*").eq("business_id", biz!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const add = async () => {
    if (!biz || !name) return;
    await supabase.from("competitors").insert({ business_id: biz.id, competitor_name: name, competitor_rating: rating ? Number(rating) : null });
    setName(""); setRating("");
    qc.invalidateQueries({ queryKey: ["comp", biz.id] });
    toast.success("Added");
  };
  const del = async (id: string) => {
    await supabase.from("competitors").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["comp", biz?.id] });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Competitors</h1>
      <div className="bg-white border border-black/10 rounded-2xl p-4 flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Competitor name" className="flex-1 min-w-[180px] h-10 rounded-lg border border-black/15 px-3 text-sm" />
        <input value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Rating" type="number" step="0.1" className="w-24 h-10 rounded-lg border border-black/15 px-3 text-sm" />
        <button onClick={add} className="h-10 px-4 rounded-lg bg-black text-white font-bold text-sm inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
      </div>
      <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/5">
        {(rows ?? []).length === 0 && <div className="p-6 text-center text-sm text-zinc-500">No competitors tracked yet.</div>}
        {(rows ?? []).map((c) => (
          <div key={c.id} className="p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{c.competitor_name}</div>
              <div className="text-xs text-zinc-500">Rating: {c.competitor_rating ?? "—"}</div>
            </div>
            <button onClick={() => del(c.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
