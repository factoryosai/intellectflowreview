import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/coupons")({ component: Coupons });

function Coupons() {
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const { data: coupons } = useQuery({
    queryKey: ["coupons", biz?.id], enabled: !!biz?.id,
    queryFn: async () => (await supabase.from("coupons").select("*").eq("business_id", biz!.id).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Coupons</h1>
      <p className="text-sm text-zinc-500">Auto-generated when customers post 4-5★ reviews.</p>
      <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr><th className="text-left p-3">Code</th><th className="text-left p-3">Discount</th><th className="text-left p-3">Used</th><th className="text-left p-3">Created</th></tr>
          </thead>
          <tbody>
            {(coupons ?? []).length === 0 && <tr><td colSpan={4} className="p-6 text-center text-zinc-500">No coupons yet.</td></tr>}
            {(coupons ?? []).map((c) => (
              <tr key={c.id} className="border-t border-black/5">
                <td className="p-3 font-mono font-bold">{c.code}</td>
                <td className="p-3">{c.discount}</td>
                <td className="p-3">{c.used_count ?? 0}</td>
                <td className="p-3 text-zinc-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
