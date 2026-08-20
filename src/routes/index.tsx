import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check, Star, QrCode, Sparkles, ArrowRight, Lock, Building2, Route as RouteIcon, Reply, Zap, Gauge,
  HelpCircle, Image as ImageIcon, Users, Radar, Target, MapPin, Bot, Trophy, MessageSquare, AlertTriangle,
  TrendingUp, MessageCircle, Package, Download, ShieldCheck, ScanLine,
} from "lucide-react";
import { PLANS, ALL_FEATURES, type Plan } from "@/lib/plans";
import { PublicFooter } from "@/components/PublicPageShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IntellectFlow — QR se Google Reviews Automation for Local Shops" },
      { name: "description", content: "QR standee se 5★ Google reviews, negative feedback private, AI reply & GMB posts. 25 tools ek dashboard mein — ₹299/mo se. 3-day free trial." },
      { property: "og:title", content: "IntellectFlow — QR se Google Reviews Automation" },
      { property: "og:description", content: "Smart QR, AI review writer, AI replies, GMB posts, local SEO scoring and competitor intelligence for local businesses from ₹299/mo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-[9px] bg-[var(--ink)] text-white font-black"
      style={{ width: size, height: size, fontSize: size * 0.42, fontFamily: "var(--font-display)" }}
    >
      IF
    </div>
  );
}

const TOOLS = [
  { icon: Building2, t: "One-Click Google Import", d: "Search your business, connect — address, photos, rating auto-fill." },
  { icon: QrCode, t: "Instant QR Review Page", d: "Custom /r/your-shop page, live the moment you sign up." },
  { icon: Sparkles, t: "AI Review Writer", d: "Writes the review for your customer — they just approve & post." },
  { icon: RouteIcon, t: "Smart 5★ Routing", d: "5★ → straight to Google. 1–3★ → private inbox, not public." },
  { icon: Reply, t: "AI Reply Generator", d: "3 reply variants — Hindi, Gujarati, English — for any review." },
  { icon: Zap, t: "Auto Reply on Negatives", d: "A ready reply appears the second a low rating comes in." },
  { icon: Gauge, t: "AI Sentiment Analysis", d: "Every review auto-tagged positive, neutral or negative." },
  { icon: HelpCircle, t: "Auto FAQ Generator", d: "AI drafts your Google Business Profile Q&A section for you." },
  { icon: ImageIcon, t: "GMB Post Generator", d: "AI-written posts for offers, updates and festivals." },
  { icon: Users, t: "Competitor Tracking", d: "Search and pin any competitor to watch their rating." },
  { icon: Radar, t: "Auto-Fetch Nearby (2km)", d: "Finds your closest competitors on Google automatically." },
  { icon: Target, t: "Auto SWOT Analysis", d: "Strengths, weaknesses, opportunities, threats — AI-written." },
  { icon: Gauge, t: "SEO Health Score", d: "How complete and trustworthy your Google profile looks." },
  { icon: MapPin, t: "GEO (Local Pack) Score", d: "Your readiness to show up in the Google Maps top-3." },
  { icon: Bot, t: "AEO (AI Answer) Score", d: "How citable you are to ChatGPT, Gemini & voice search." },
  { icon: Trophy, t: "Local Rank Score", d: "Your position against every tracked competitor nearby." },
  { icon: MessageSquare, t: "Response Rate Tracker", d: "What share of reviews you've actually replied to." },
  { icon: AlertTriangle, t: "Rating-Drop Alerts", d: "Flags a slipping rating before it becomes a trend." },
  { icon: TrendingUp, t: "Rating Trend Charts", d: "Weekly rating & volume, at a glance." },
  { icon: MessageCircle, t: "WhatsApp Reminders", d: "Nudges customers who haven't left a review yet." },
  { icon: Package, t: "Free Printed QR Standee", d: "A counter-ready standee shipped to your shop." },
  { icon: Download, t: "Downloadable QR Codes", d: "Print-ready QR for stickers, menus, bills, packaging." },
  { icon: ScanLine, t: "QR Scan Analytics", d: "See how many people scan, day by day." },
  { icon: ShieldCheck, t: "Secure Google Login", d: "No passwords to manage — sign in with Google." },
  { icon: Star, t: "Multi-Plan Billing", d: "Starter, Growth or Pro — upgrade anytime via Razorpay." },
];

function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur bg-[var(--paper)]/85 border-b border-black/5">
        <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="font-black tracking-tight text-lg md:text-xl">IntellectFlow</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/auth" search={{ mode: "signup" } as any} className="hidden md:inline-flex text-sm font-semibold text-black/70 hover:text-black px-3 py-2">
              Free Demo
            </Link>
            <Link to="/auth" className="inline-flex items-center rounded-full bg-white border border-black/10 shadow-sm px-4 py-2 text-sm font-bold hover:shadow-md transition">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative max-w-[1120px] mx-auto px-4 md:px-6 pt-14 md:pt-20 pb-16 md:pb-24">
          <div className="flex justify-center">
            <div className="eyebrow inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[var(--brass-deep)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brass)] animate-pulse" />
              25 tools · one QR code
            </div>
          </div>

          <h1 className="mt-6 text-center font-black tracking-[-0.04em] leading-[0.95] text-[36px] sm:text-[52px] md:text-[62px] text-[var(--ink)]">
            Aap Dukaan Chalao,
            <br />
            Google Hum Sambhalenge.
          </h1>

          <p className="mt-6 text-center text-zinc-600 max-w-[560px] mx-auto text-base md:text-lg leading-relaxed">
            Ek QR standee se Google reviews, AI replies, competitor tracking aur local SEO — sab automatic.
            Starting at <span className="font-bold text-[var(--ink)]">₹299/mo</span>, 3-day free trial.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 max-w-md mx-auto">
            <Link
              to="/auth"
              className="w-full h-[52px] rounded-xl bg-[var(--ink)] text-white font-black text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition inline-flex items-center justify-center gap-2"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/auth" className="h-11 px-6 rounded-lg bg-white border border-black/10 font-semibold text-sm hover:bg-zinc-50 inline-flex items-center justify-center">
              Login to your dashboard
            </Link>
          </div>

          {/* Signature visual — the standee, as a torn ticket stub */}
          <div className="ticket-card mt-14 max-w-[600px] mx-auto shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 flex items-center gap-4">
              <div className="shrink-0 w-20 h-20 rounded-xl bg-[var(--ink)] text-white grid place-items-center">
                <QrCode className="w-10 h-10" />
              </div>
              <div className="min-w-0">
                <div className="eyebrow text-zinc-400">Counter standee</div>
                <div className="font-bold text-[17px] leading-tight mt-0.5">Scan → AI writes it → Google</div>
              </div>
            </div>
            <div className="ticket-tear">
              <span className="ticket-tear-hole" style={{ left: -7 }} />
              <span className="ticket-tear-hole" style={{ right: -7 }} />
            </div>
            <div className="p-5 md:p-6 flex items-center justify-between gap-3 font-mono-brand text-xs">
              <span className="text-zinc-500">RATING <b className="text-[var(--ink)]">4.9</b> / 5.0</span>
              <span className="text-zinc-500">TODAY <b className="text-[var(--ink)]">+14</b> REVIEWS</span>
              <span className="text-emerald-700 font-semibold">● LIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW A REVIEW ACTUALLY HAPPENS */}
      <section className="max-w-[1000px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <div className="eyebrow text-center text-[var(--brass-deep)]">The customer's side</div>
        <h2 className="text-center font-black text-2xl md:text-4xl tracking-tight mt-2 text-[var(--ink)]">
          Kaise ek review 20 second mein ban jaata hai
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { t: "QR scan karta hai", d: "Counter standee ya bill pe laga QR customer apne phone se scan karta hai." },
            { t: "AI review likh deta hai", d: "Business ke context se AI ek ready review draft turant dikha deta hai." },
            { t: "Customer select karta hai", d: "Customer AI wala review use kare ya khud edit kare — apni marzi se." },
            { t: "Seedha Google par redirect", d: "5★ diya to seedha Google review page khulta hai — wahi post ho jaata hai." },
          ].map((s, i) => (
            <div key={s.t} className="ticket-card p-4">
              <div className="font-mono-brand text-[var(--brass-deep)] text-xs font-bold">STEP {i + 1}</div>
              <div className="mt-2 font-bold text-sm text-[var(--ink)]">{s.t}</div>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-zinc-400 max-w-lg mx-auto">
          1–3★ deta hai to Google par nahi jaata — feedback private rehta hai, sirf aapko dikhta hai.
        </p>
      </section>

      {/* SOCIAL PROOF */}
      <section className="max-w-[1120px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <h2 className="text-center font-black text-2xl md:text-3xl tracking-tight text-[var(--ink)]">
          Happy business owners
        </h2>
        <p className="text-center text-zinc-500 text-sm mt-2">Illustrative example — your first reviews here could be your own customers.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Rakesh Bhai", biz: "Rakesh Tea Stall", city: "Visavadar", text: "4.8 se 4.95 rating hui 21 din mein. QR standee lagane ke baad daily 10-12 review aa rahe hain." },
            { name: "Priya", biz: "Glow Beauty Salon", city: "Junagadh", text: "Negative reviews ab private aate hain. Google pe sirf 5 star dikhta hai. Bahut acha system." },
            { name: "Dr. Mehta", biz: "Mehta Clinic", city: "Rajkot", text: "AI reply feature time bachata hai. GMB posts auto ho jate hain. Worth every rupee." },
          ].map((t) => (
            <div key={t.name} className="ticket-card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--ink)] text-white grid place-items-center font-bold text-sm">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.biz} • {t.city}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--brass)] text-[var(--brass)]" />
                ))}
              </div>
              <p className="mt-3 text-sm text-zinc-700 leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-zinc-50 border border-black/5 py-6 px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-zinc-500">
          <span>☕ Tea Stalls</span>
          <span>💇 Salons</span>
          <span>🍽️ Restaurants</span>
          <span>🏥 Clinics</span>
          <span>🛒 Kirana</span>
        </div>
      </section>

      {/* 25 TOOLS */}
      <section className="max-w-[1120px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <div className="eyebrow text-center text-[var(--brass-deep)]">Everything in one dashboard</div>
        <h2 className="text-center font-black text-2xl md:text-4xl tracking-tight mt-2 text-[var(--ink)]">
          25 tools. <span style={{ color: "var(--brass-deep)" }}>One price.</span>
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((f) => (
            <div key={f.t} className="ticket-card p-4 flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-[var(--ink)] text-white grid place-items-center shrink-0">
                <f.icon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="font-bold text-sm text-[var(--ink)]">{f.t}</div>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-[1120px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <div className="eyebrow text-center text-[var(--brass-deep)]">Pricing</div>
        <h2 className="text-center font-black text-2xl md:text-4xl tracking-tight mt-2 text-[var(--ink)]">
          Simple, upfront pricing
        </h2>
        <p className="text-center text-zinc-500 mt-2 text-sm md:text-base">No lock-in. Cancel anytime.</p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (setup) */}
      <section className="max-w-[1000px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <h2 className="text-center font-black text-2xl md:text-3xl tracking-tight text-[var(--ink)]">
          Setup in <span style={{ color: "var(--brass-deep)" }}>10 minutes</span>
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { n: "1", t: "Signup + business search", d: "Google se login karo, apna shop naam type karke connect karo." },
            { n: "2", t: "Details auto-fetch hoti hain", d: "Address, photos, rating, contact — sab khud aa jaata hai." },
            { n: "3", t: "Standee counter pe rakho", d: "Free printed standee seedha aapke shop par shipped." },
            { n: "4", t: "Reviews aana shuru", d: "5★ → Google, 1–3★ → aapki private inbox." },
          ].map((s) => (
            <div key={s.n} className="ticket-card p-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white grid place-items-center font-black text-sm">{s.n}</div>
              <div className="mt-3 font-bold text-sm text-[var(--ink)]">{s.t}</div>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[820px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <h2 className="text-center font-black text-2xl md:text-3xl tracking-tight text-[var(--ink)]">Common questions</h2>
        <div className="mt-8 space-y-3">
          {[
            { q: "Free trial kitne din ka hai?", a: "3 din ka full-access free trial. Card ki zaroorat nahi — trial ke baad plan choose karein." },
            { q: "Kya negative review Google pe jayega?", a: "Nahi. 1–3★ rating private feedback form pe jaati hai jo sirf aapko dikhti hai." },
            { q: "Standee kitne ka hai?", a: "Har plan me 1 printed standee bilkul FREE." },
            { q: "Cancel kar sakte hain?", a: "Haan, kabhi bhi. Koi lock-in nahi, koi hidden charge nahi. Details Refund & Cancellation page par hain." },
          ].map((f) => (
            <div key={f.q} className="ticket-card p-4">
              <div className="font-bold text-sm text-[var(--ink)]">{f.q}</div>
              <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />

      {/* MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-[360px]">
        <div className="bg-[var(--ink)] text-white rounded-full p-1.5 flex gap-1.5 shadow-2xl">
          <Link to="/auth" className="flex-1 h-11 rounded-full bg-white/10 font-black text-sm inline-flex items-center justify-center">
            Start free trial
          </Link>
          <Link to="/auth" className="w-20 h-11 rounded-full border border-white/30 font-bold text-sm inline-flex items-center justify-center">
            Login
          </Link>
        </div>
      </div>
      <div className="md:hidden h-24" />
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const included = new Set(plan.features);
  return (
    <div
      className={[
        "ticket-card relative p-6 flex flex-col bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl",
        plan.popular ? "border-2 !border-[var(--brass)] shadow-lg md:scale-[1.02]" : "shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-2xl font-black tracking-tight text-[var(--ink)]">{plan.label}</span>
        {plan.popular && (
          <span className="bg-[var(--brass)] text-white text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full">
            POPULAR
          </span>
        )}
        {plan.id === "pro" && (
          <span className="bg-[var(--ink)] text-[var(--brass)] text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full">
            BEST VALUE
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1 font-mono-brand">
        <span className="text-[44px] leading-none font-black tracking-[-0.03em] text-[var(--ink)]">₹{plan.price}</span>
        <span className="text-zinc-500 text-sm font-bold">/mo</span>
      </div>

      <ul className="mt-5 space-y-2 text-[13px] flex-1">
        {ALL_FEATURES.map((f) => {
          const on = included.has(f);
          return (
            <li key={f} className="flex items-start gap-2">
              {on ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 shrink-0 mt-1 text-zinc-300" />
              )}
              <span className={on ? "text-zinc-900 font-bold" : "text-zinc-400 font-medium"}>{f}</span>
            </li>
          );
        })}
      </ul>

      <Link
        to="/auth"
        className="mt-6 h-12 rounded-full font-black text-sm transition grid place-items-center text-white shadow-lg bg-[var(--ink)] hover:brightness-110"
      >
        Get Started at ₹{plan.price}/mo
      </Link>
    </div>
  );
}
