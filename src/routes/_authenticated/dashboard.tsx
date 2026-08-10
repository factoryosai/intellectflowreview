import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness, getMyProfile } from "@/lib/queries";
import { MessageSquare, Star, QrCode, Gift, TrendingUp, MessageCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const { data: reviews } = useQuery({
    queryKey: ["recent-reviews", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").eq("business_id", biz!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });
  const { data: counts } = useQuery({
    queryKey: ["counts", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => {
      const [rev, gmb, wa, cp] = await Promise.all([
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("business_id", biz!.id),
        supabase.from("gmb_posts").select("*", { count: "exact", head: true }).eq("business_id", biz!.id),
        supabase.from("whatsapp_logs").select("*", { count: "exact", head: true }).eq("business_id", biz!.id),
        supabase.from("coupons").select("used_count").eq("business_id", biz!.id),
      ]);
      const coupons_used = (cp.data ?? []).reduce((s: number, c) => s + (c.used_count ?? 0), 0);
      return { reviews: rev.count ?? 0, gmb: gmb.count ?? 0, wa: wa.count ?? 0, coupons_used };
    },
  });

  if (!biz) {
    return (
      <div className="bg-white border border-black/10 rounded-2xl p-8 text-center">
        <h2 className="font-black text-xl">Finish setting up your business</h2>
        <p className="text-sm text-zinc-500 mt-1">Complete onboarding to see your dashboard.</p>
        <Link to="/onboarding" className="mt-4 inline-flex h-10 items-center rounded-lg bg-black text-white px-4 text-sm font-bold">Complete setup</Link>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/r/${biz.slug}`;

  return (
    <div className="space-y-5">
      {/* Topbar */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-black text-xl truncate">{biz.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
            <span className="truncate">/r/{biz.slug}</span>
            <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link copied"); }} className="p-1 hover:bg-zinc-100 rounded">
              <Copy className="w-3 h-3" />
            </button>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="p-1 hover:bg-zinc-100 rounded">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-2.5 py-1 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {biz.rating}
          </div>
          <span className="text-[11px] uppercase font-bold bg-black text-white px-2 py-1 rounded">{profile?.plan ?? "starter"}</span>
          {profile?.is_founder_free && (
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Lifetime Free</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={MessageSquare} label="Reviews" value={counts?.reviews ?? 0} />
        <Stat icon={Star} label="Rating" value={biz.rating ?? 0} />
        <Stat icon={QrCode} label="QR Scans" value={biz.total_scans ?? 0} />
        <Stat icon={Gift} label="Coupons Used" value={counts?.coupons_used ?? 0} />
        <Stat icon={TrendingUp} label="GMB Posts" value={counts?.gmb ?? 0} />
        <Stat icon={MessageCircle} label="WhatsApp Sent" value={counts?.wa ?? 0} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/qr" className="bg-white border border-black/10 rounded-xl p-4 hover:shadow-md">
          <QrCode className="w-5 h-5 mb-2" />
          <div className="font-bold text-sm">Generate QR</div>
          <div className="text-xs text-zinc-500">Download PNG / SVG</div>
        </Link>
        <Link to="/gmb" className="bg-white border border-black/10 rounded-xl p-4 hover:shadow-md">
          <TrendingUp className="w-5 h-5 mb-2" />
          <div className="font-bold text-sm">Create GMB Post</div>
          <div className="text-xs text-zinc-500">AI-generated content</div>
        </Link>
        <a href={publicUrl} target="_blank" rel="noreferrer" className="bg-white border border-black/10 rounded-xl p-4 hover:shadow-md">
          <ExternalLink className="w-5 h-5 mb-2" />
          <div className="font-bold text-sm">View public page</div>
          <div className="text-xs text-zinc-500">/r/{biz.slug}</div>
        </a>
      </div>

      {/* Recent reviews */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black">Recent reviews</h2>
          <Link to="/reviews" className="text-xs font-semibold text-zinc-600 hover:text-black">View all →</Link>
        </div>
        {(!reviews || reviews.length === 0) ? (
          <p className="text-sm text-zinc-500 py-6 text-center">No reviews yet. Share your QR to get started.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {reviews.map((r) => (
              <li key={r.id} className="py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white grid place-items-center text-xs font-bold shrink-0">
                  {(r.customer_name || "A").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.customer_name || "Anonymous"}</span>
                    <span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</span>
                    <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded " +
                      (r.status === "public" ? "bg-emerald-100 text-emerald-700" :
                       r.status === "private" ? "bg-orange-100 text-orange-700" :
                       "bg-zinc-100 text-zinc-700")}>{r.status}</span>
                  </div>
                  <p className="text-sm text-zinc-600 mt-0.5 line-clamp-2">{r.review_text || "(no text)"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <div className="bg-white border border-black/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-semibold">{label}</span>
        <Icon className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="mt-2 font-black text-2xl">{value}</div>
    </div>
  );
}
