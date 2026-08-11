import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusiness, getMyProfile } from "@/lib/queries";
import { computeAccess, PLANS } from "@/lib/plans";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { MessageSquare, Star, QrCode, Gift, TrendingUp, Copy, ExternalLink, Crown, Clock, Download, Gauge, Trophy, Reply } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — IntellectFlow" },
      { name: "description", content: "Review analytics, SEO health, local rank score and your review QR code." },
      { property: "og:title", content: "Your Dashboard — IntellectFlow" },
      { property: "og:description", content: "Track reviews, SEO health and local ranking for your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type ReviewRow = { id: string; rating: number; status: string | null; review_text: string | null; customer_name: string | null; ai_generated: boolean | null; created_at: string | null };

function Dashboard() {
  const { data: biz } = useQuery({ queryKey: ["biz"], queryFn: getMyBusiness });
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const access = computeAccess(profile);

  const { data: reviews } = useQuery({
    queryKey: ["dash-reviews", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, status, review_text, customer_name, ai_generated, created_at")
        .eq("business_id", biz!.id)
        .order("created_at", { ascending: false })
        .limit(500);
      return (data ?? []) as ReviewRow[];
    },
  });

  const { data: competitors } = useQuery({
    queryKey: ["dash-competitors", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => (await supabase.from("competitors").select("competitor_name, competitor_rating, competitor_reviews").eq("business_id", biz!.id)).data ?? [],
  });

  const { data: gmbCount } = useQuery({
    queryKey: ["dash-gmb", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => (await supabase.from("gmb_posts").select("*", { count: "exact", head: true }).eq("business_id", biz!.id)).count ?? 0,
  });

  const qrRef = useRef<HTMLDivElement>(null);

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
  const list = reviews ?? [];

  // ---- Analytics ----
  const now = Date.now();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = now - i * 7 * 86400000;
    const start = end - 7 * 86400000;
    const rows = list.filter((r) => {
      const t = r.created_at ? new Date(r.created_at).getTime() : 0;
      return t > start && t <= end;
    });
    return { label: i === 0 ? "This wk" : `-${i}w`, count: rows.length, avg: rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0 };
  }).reverse();
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));

  const last30 = list.filter((r) => r.created_at && now - new Date(r.created_at).getTime() <= 30 * 86400000);
  const prev30 = list.filter((r) => {
    if (!r.created_at) return false;
    const age = now - new Date(r.created_at).getTime();
    return age > 30 * 86400000 && age <= 60 * 86400000;
  });
  const avg = (rows: ReviewRow[]) => (rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0);
  const ratingTrend = avg(last30) - avg(prev30);
  const handled = list.filter((r) => r.status && r.status !== "pending").length;
  const responseRate = list.length ? Math.round((handled / list.length) * 100) : 0;

  // ---- SEO score ----
  const seoItems = [
    { label: "Google Business Profile linked", ok: !!biz.gmb_link, pts: 25 },
    { label: "Business description added", ok: !!biz.description, pts: 10 },
    { label: "Phone number on profile", ok: !!biz.phone, pts: 10 },
    { label: "Address & city complete", ok: !!biz.address && !!biz.city, pts: 10 },
    { label: "Website linked", ok: !!biz.website, pts: 10 },
    { label: "Cover photo uploaded", ok: !!biz.photo_url, pts: 5 },
    { label: "10+ reviews collected", ok: list.length >= 10, pts: 15 },
    { label: "Rating above 4.0", ok: (biz.rating ?? 0) >= 4, pts: 10 },
    { label: "Published GMB posts", ok: (gmbCount ?? 0) > 0, pts: 5 },
  ];
  const seoScore = seoItems.reduce((s, i) => s + (i.ok ? i.pts : 0), 0);

  // ---- Rank score ----
  const comps = competitors ?? [];
  const myPower = (biz.rating ?? 0) * Math.log10((biz.total_reviews ?? list.length) + 10);
  const powers = comps.map((c) => (c.competitor_rating ?? 0) * Math.log10((c.competitor_reviews ?? 0) + 10));
  const better = powers.filter((p) => p < myPower).length;
  const position = powers.filter((p) => p > myPower).length + 1;
  const rankScore = comps.length ? Math.round((better / comps.length) * 100) : Math.min(100, Math.round(myPower * 18));

  return (
    <div className="space-y-5">
      {/* Trial / access banner */}
      {access.lifetimeFree ? (
        <div className="rounded-2xl border-2 border-[#c9a227] bg-[#fdf6ef] p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-[#c9a227]" />
          <div className="text-sm font-bold">Lifetime Free Access — all features unlocked, no billing.</div>
        </div>
      ) : access.onTrial ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
            <Clock className="w-4 h-4" /> {access.trialDaysLeft} day{access.trialDaysLeft === 1 ? "" : "s"} left in your free trial — every feature unlocked.
          </div>
          <Link to="/billing" className="h-9 px-3 rounded-lg bg-black text-white text-xs font-bold grid place-items-center">Choose a plan</Link>
        </div>
      ) : access.expired ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-bold text-orange-900">Your free trial has ended. Pick a plan to keep collecting reviews.</div>
          <Link to="/billing" className="h-9 px-3 rounded-lg bg-black text-white text-xs font-bold grid place-items-center">See plans</Link>
        </div>
      ) : null}

      {/* Topbar */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-black text-xl truncate">{biz.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
            <span className="truncate">/r/{biz.slug}</span>
            <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link copied"); }} className="p-1 hover:bg-zinc-100 rounded" aria-label="Copy review link">
              <Copy className="w-3 h-3" />
            </button>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="p-1 hover:bg-zinc-100 rounded" aria-label="Open review page">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-[#fdf6ef] border border-[#c9a227] rounded-full px-2.5 py-1 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-[#c9a227] text-[#c9a227]" /> {biz.rating}
          </div>
          <span className="text-[11px] uppercase font-bold bg-black text-white px-2 py-1 rounded">
            {access.lifetimeFree ? "Lifetime" : PLANS.find((p) => p.id === access.plan)?.label ?? "Starter"}
          </span>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ScoreCard icon={Gauge} title="SEO Score" value={seoScore} suffix="/100" hint={seoScore >= 80 ? "Excellent profile health" : seoScore >= 55 ? "Good — a few gaps left" : "Needs attention"} />
        <ScoreCard icon={Trophy} title="Local Rank Score" value={rankScore} suffix="/100" hint={comps.length ? `#${position} of ${comps.length + 1} tracked nearby` : "Add competitors to benchmark"} />
        <ScoreCard icon={Reply} title="Response Rate" value={responseRate} suffix="%" hint={`${handled} of ${list.length} reviews handled`} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={MessageSquare} label="Total reviews" value={list.length} />
        <Stat icon={Star} label="Avg rating (30d)" value={Number(avg(last30).toFixed(1))} />
        <Stat icon={QrCode} label="QR scans" value={biz.total_scans ?? 0} />
        <Stat icon={TrendingUp} label="Reviews (30d)" value={last30.length} />
      </div>

      {/* Charts + QR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Review volume — last 8 weeks</h2>
            <span className={"text-xs font-bold px-2 py-1 rounded " + (ratingTrend >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800")}>
              Rating trend {ratingTrend >= 0 ? "+" : ""}{ratingTrend.toFixed(2)}
            </span>
          </div>
          <div className="mt-5 flex items-end gap-2 h-40">
            {weeks.map((w) => (
              <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold text-zinc-500">{w.count}</div>
                <div className="w-full rounded-t-md bg-black/85" style={{ height: `${Math.max(4, (w.count / maxCount) * 120)}px` }} />
                <div className="text-[10px] text-zinc-400">{w.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = list.filter((r) => r.rating === n).length;
              return (
                <div key={n} className="rounded-lg bg-zinc-50 border border-black/5 p-2 text-center">
                  <div className="text-[11px] text-zinc-500 font-semibold flex items-center justify-center gap-0.5">{n}<Star className="w-3 h-3 fill-[#c9a227] text-[#c9a227]" /></div>
                  <div className="font-black">{c}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-5">
          <h2 className="font-black">Your review QR</h2>
          <p className="text-xs text-zinc-500">Print it, stick it, collect reviews.</p>
          <div ref={qrRef} className="mt-4 p-3 bg-white border border-black/10 rounded-xl grid place-items-center">
            <QRCodeSVG value={publicUrl} size={160} />
          </div>
          <button
            onClick={() => downloadQr(qrRef.current, `${biz.slug}-qr`)}
            className="mt-3 w-full h-11 rounded-lg bg-black text-white font-bold text-sm inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
          <Link to="/qr" className="mt-2 w-full h-11 rounded-lg border border-black/15 font-semibold text-sm grid place-items-center">More QR options</Link>
        </div>
      </div>

      {/* SEO breakdown */}
      <div className="bg-white border border-black/10 rounded-2xl p-5">
        <h2 className="font-black">SEO health breakdown</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {seoItems.map((i) => (
            <div key={i.label} className="flex items-center justify-between rounded-lg border border-black/5 bg-zinc-50 px-3 py-2 text-sm">
              <span className={i.ok ? "text-zinc-700" : "text-zinc-500"}>{i.label}</span>
              <span className={"text-[11px] font-bold px-2 py-0.5 rounded " + (i.ok ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800")}>
                {i.ok ? `+${i.pts}` : `Missing ${i.pts}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews feed */}
      <div className="bg-white border border-black/10 rounded-2xl">
        <div className="p-4 flex items-center justify-between border-b border-black/5">
          <h2 className="font-black">Recent reviews</h2>
          <Link to="/reviews" className="text-xs font-bold text-zinc-600 hover:text-black">View all</Link>
        </div>
        <div className="divide-y divide-black/5">
          {list.slice(0, 8).map((r) => (
            <div key={r.id} className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white grid place-items-center text-xs font-bold shrink-0">
                {(r.customer_name || "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{r.customer_name || "Anonymous"}</span>
                  <span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-[#c9a227] text-[#c9a227]" />)}</span>
                  <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded " + (r.status === "public" ? "bg-emerald-100 text-emerald-700" : r.status === "private" ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-700")}>
                    {r.status === "public" ? "Replied / public" : r.status === "private" ? "Private feedback" : "Awaiting reply"}
                  </span>
                  {r.ai_generated && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">AI</span>}
                </div>
                <p className="text-sm text-zinc-600 mt-1">{r.review_text}</p>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="p-8 text-center text-sm text-zinc-500">No reviews yet — share your QR to get the first one.</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/ai-reply" className="bg-white border border-black/10 rounded-xl p-4 hover:shadow-md">
          <Reply className="w-5 h-5 mb-2" />
          <div className="font-bold text-sm">AI reply drafts</div>
          <div className="text-xs text-zinc-500">Reply to every review fast</div>
        </Link>
        <Link to="/reviews" className="bg-white border border-black/10 rounded-xl p-4 hover:shadow-md">
          <MessageSquare className="w-5 h-5 mb-2" />
          <div className="font-bold text-sm">Reviews</div>
          <div className="text-xs text-zinc-500">Live Google + QR reviews</div>
        </Link>
        <Link to="/competitors" className="bg-white border border-black/10 rounded-xl p-4 hover:shadow-md">
          <Trophy className="w-5 h-5 mb-2" />
          <div className="font-bold text-sm">Competitors</div>
          <div className="text-xs text-zinc-500">Track your local rank</div>
        </Link>
      </div>
    </div>
  );
}

async function downloadQr(container: HTMLDivElement | null, fileName: string) {
  const svg = container?.querySelector("svg");
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
  await new Promise((r) => (img.onload = r));
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.drawImage(img, 0, 0, 1024, 1024);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${fileName}.png`;
  a.click();
}

function ScoreCard({ icon: Icon, title, value, suffix, hint }: { icon: React.ElementType; title: string; value: number; suffix: string; hint: string }) {
  const pct = suffix === "%" ? value : Math.min(100, value);
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">{title}</span>
        <Icon className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="mt-2 font-black text-3xl">
        {value}
        <span className="text-base font-bold text-zinc-400">{suffix}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-zinc-100 overflow-hidden">
        <div className="h-full rounded-full bg-[#c9a227]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
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
