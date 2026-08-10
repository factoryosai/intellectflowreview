import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness } from "@/lib/queries";
import { Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reviews")({ component: Reviews });

function Reviews() {
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const { data: reviews } = useQuery({
    queryKey: ["all-reviews", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => (await supabase.from("reviews").select("*").eq("business_id", biz!.id).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Reviews</h1>
      <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/5">
        {(reviews ?? []).length === 0 && <div className="p-8 text-center text-sm text-zinc-500">No reviews yet.</div>}
        {(reviews ?? []).map((r) => (
          <div key={r.id} className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white grid place-items-center text-xs font-bold shrink-0">{(r.customer_name || "A").slice(0, 1).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{r.customer_name || "Anonymous"}</span>
                <span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</span>
                <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded " + (r.status === "public" ? "bg-emerald-100 text-emerald-700" : r.status === "private" ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-700")}>{r.status}</span>
                {r.ai_generated && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">AI</span>}
              </div>
              <p className="text-sm text-zinc-600 mt-1">{r.review_text}</p>
              <div className="text-[11px] text-zinc-400 mt-1">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
