import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { gmbPost } from "@/lib/ai.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness } from "@/lib/queries";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/gmb")({ component: Gmb });

function Gmb() {
  const fn = useServerFn(gmbPost);
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const qc = useQueryClient();
  const [offer, setOffer] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ["gmb-posts", biz?.id], enabled: !!biz?.id,
    queryFn: async () => (await supabase.from("gmb_posts").select("*").eq("business_id", biz!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const generate = async () => {
    if (!biz) return;
    if (!offer.trim()) return toast.error("Enter an offer or event");
    setBusy(true);
    try {
      const res = await fn({ data: { businessName: biz.name, offerOrEvent: offer } });
      setContent(res.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!biz || !content) return;
    await supabase.from("gmb_posts").insert({ business_id: biz.id, content, status: "draft" });
    toast.success("Saved as draft");
    qc.invalidateQueries({ queryKey: ["gmb-posts", biz.id] });
  };

  const del = async (id: string) => {
    await supabase.from("gmb_posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["gmb-posts", biz?.id] });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">GMB Posts</h1>
      <div className="bg-white border border-black/10 rounded-2xl p-4 md:p-5 space-y-3">
        <input value={offer} onChange={(e) => setOffer(e.target.value)} className="w-full h-11 rounded-lg border border-black/15 px-3 text-sm" placeholder="e.g. 20% off Diwali sweets this week" />
        <button onClick={generate} disabled={busy} className="h-11 px-5 rounded-lg bg-black text-white font-bold text-sm disabled:opacity-60 inline-flex items-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate post
        </button>
        {content && (
          <>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full min-h-[160px] rounded-lg border border-black/15 px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(content); toast.success("Copied"); }} className="h-10 px-4 rounded-lg border border-black/15 text-sm font-semibold inline-flex items-center gap-2"><Copy className="w-4 h-4" /> Copy</button>
              <button onClick={save} className="h-10 px-4 rounded-lg bg-black text-white text-sm font-bold">Save draft</button>
            </div>
          </>
        )}
      </div>

      <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/5">
        {(posts ?? []).length === 0 && <div className="p-6 text-center text-sm text-zinc-500">No posts yet.</div>}
        {(posts ?? []).map((p) => (
          <div key={p.id} className="p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase text-zinc-500">{p.status}</div>
              <p className="text-sm mt-1 whitespace-pre-wrap">{p.content}</p>
            </div>
            <button onClick={() => del(p.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
