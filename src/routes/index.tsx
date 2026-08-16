import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star, QrCode, MessageSquare, Sparkles, Shield, Gift, TrendingUp, ArrowRight, Lock } from "lucide-react";
import { PLANS, ALL_FEATURES, type Plan } from "@/lib/plans";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IntellectFlow — QR se Google Reviews Automation for Local Shops" },
      { name: "description", content: "QR standee se 5★ Google reviews, negative feedback private, AI reply & GMB posts. ₹55k/mo agency value at ₹299/mo. 3-day free trial." },
      { property: "og:title", content: "IntellectFlow — QR se Google Reviews Automation" },
      { property: "og:description", content: "Smart QR, AI review writer, AI replies, GMB posts and analytics for local businesses from ₹299/mo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});


function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-[9px] bg-black text-white font-black"
      style={{ width: size, height: size, fontSize: size * 0.42, fontFamily: "var(--font-display)" }}
    >
      IF
    </div>
  );
}

function Landing() {
  return (

    <div className="min-h-screen" style={{ backgroundColor: "#fdf6ef" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur bg-[#fdf6ef]/80 border-b border-black/5">
        <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="font-black tracking-tight text-lg md:text-xl">IntellectFlow</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
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
      <section className="max-w-[1120px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full border border-black/10 px-4 py-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs md:text-sm font-semibold text-zinc-700">500+ Businesses • Rs 55k+ → Rs 299</span>
          </div>
        </div>

        <h1 className="mt-6 text-center font-black tracking-[-0.04em] leading-[0.92] text-[36px] sm:text-[52px] md:text-[64px]">
          <span className="block text-black">Aap Dukaan Chalao,</span>
          <span className="block text-gradient-brand">Google Hum</span>
          <span className="block text-gradient-purple">Sambhalenge</span>
        </h1>

        <p className="mt-6 text-center text-zinc-600 max-w-[560px] mx-auto text-base md:text-lg leading-relaxed">
          QR to Google Review full automation. <span className="font-semibold text-zinc-900">Rs 55,500/mo</span> market value tools at just{" "}
          <span className="font-semibold text-zinc-900">Rs 299/mo</span>. Lifetime Free for founder businesses.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 max-w-md mx-auto">
          <Link
            to="/auth"
            className="w-full h-[52px] rounded-xl bg-black text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] transition inline-flex items-center justify-center gap-2"
          >
            Start at Rs 299/mo <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link to="/auth" className="h-11 rounded-lg bg-white border border-black/10 font-semibold text-sm hover:bg-zinc-50 inline-flex items-center justify-center">
              Login
            </Link>
            <Link to="/auth" className="h-11 rounded-lg bg-white border border-black/10 font-semibold text-sm hover:bg-zinc-50 inline-flex items-center justify-center">
              Try Demo
            </Link>
          </div>
        </div>

        {/* Hero card */}
        <div className="mt-10 max-w-[640px] mx-auto bg-white rounded-2xl border border-black/10 shadow-sm p-4 md:p-5 flex items-center gap-4">
          <div className="shrink-0 w-24 h-24 rounded-xl bg-black text-white grid place-items-center font-black text-2xl">
            <QrCode className="w-12 h-12" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[17px] md:text-lg leading-tight">
              Customer scans → Review → Google
            </div>
            <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
              Negative reviews go to WhatsApp <span className="font-semibold">(Rs 7k/mo value)</span>. Positive → Google. Auto GMB posts <span className="font-semibold">Rs 8k/mo value</span>.
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live • 500+ businesses using
            </span>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="max-w-[1120px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <h2 className="text-center font-black text-2xl md:text-3xl tracking-tight">
          Trusted by <span className="text-gradient-brand">500+ happy business owners</span> across Gujarat
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Rakesh Bhai", biz: "Rakesh Tea Stall", city: "Visavadar", text: "4.8 se 4.95 rating hui 21 din mein. QR standee lagane ke baad daily 10-12 review aa rahe hain." },
            { name: "Priya Salon", biz: "Glow Beauty Salon", city: "Junagadh", text: "Negative reviews ab WhatsApp pe aate hain privately. Google pe sirf 5 star. Bahut acha system." },
            { name: "Dr. Mehta", biz: "Mehta Clinic", city: "Rajkot", text: "AI reply feature time bachata hai. GMB posts auto ho jate hain. Worth every rupee at Rs 299." },
          ].map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-black/10 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white grid place-items-center font-bold text-sm">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.biz} • {t.city}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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

      {/* FEATURES */}
      <section className="max-w-[1000px] mx-auto px-4 md:px-6 py-16">
        <h2 className="text-center font-black text-2xl md:text-4xl tracking-tight">
          8 tools. <span className="text-gradient-purple">One price.</span>
        </h2>
        <p className="text-center text-zinc-600 mt-2 text-sm md:text-base font-medium">Rs 55,500/mo market value at Rs 299/mo</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Sparkles, title: "AI Review Writer", desc: "4 suggestions: Gujarati, Hinglish, English, Pro." },
            { icon: MessageSquare, title: "Negative Filter", desc: "1-2 stars go private via WhatsApp." },
            { icon: Star, title: "Live Google Reviews", desc: "New reviews sync automatically." },
            { icon: TrendingUp, title: "GMB Post + Image", desc: "Festival & offer posts auto-generated." },
            { icon: Shield, title: "Competitor SWOT", desc: "Track 2 nearby, weekly analysis." },
            { icon: QrCode, title: "Best Time to Ask", desc: "AI-picked hour with highest 5★ chance." },
            { icon: Gift, title: "Auto FAQs", desc: "Generated from your business description." },
            { icon: ArrowRight, title: "Weekly PDF Report", desc: "Ratings, sentiment, action items." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-black/10 p-5 hover:shadow-md transition">
              <f.icon className="w-5 h-5 text-zinc-800" />
              <div className="mt-3 font-black text-base tracking-tight">{f.title}</div>
              <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-[1120px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <h2 className="text-center font-black text-3xl md:text-4xl tracking-tight">
          Simple pricing. <span className="text-gradient-brand">Locked features shown clearly.</span>
        </h2>
        <p className="text-center text-zinc-600 mt-3 text-sm md:text-base font-medium">
          Standee always FREE • No hidden fees • Cancel anytime
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>


        <div className="mt-6 rounded-2xl bg-[#1f1b16] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="font-bold text-sm md:text-base">
            Total market value ₹1,08,000/mo — yours from ₹299/mo
          </div>
          <Link to="/auth" className="h-10 px-5 rounded-full bg-[#f5c518] text-zinc-900 font-black text-sm inline-flex items-center gap-1.5">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1000px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <h2 className="text-center font-black text-2xl md:text-3xl tracking-tight">
          Setup in <span className="text-gradient-purple">10 minutes</span>
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { n: "1", t: "Signup + business search", d: "Type your shop name, pick it from Google suggestions." },
            { n: "2", t: "Get QR + review page", d: "Custom /r/your-slug page with your branding." },
            { n: "3", t: "Standee counter pe rakho", d: "Free printed standee shipped to your shop." },
            { n: "4", t: "Reviews aana shuru", d: "5★ → Google, 1–3★ → your private inbox." },
          ].map((s) => (
            <div key={s.n} className="bg-white rounded-xl border border-black/10 p-4">
              <div className="w-8 h-8 rounded-lg bg-black text-white grid place-items-center font-black text-sm">{s.n}</div>
              <div className="mt-3 font-bold text-sm">{s.t}</div>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[820px] mx-auto px-4 md:px-6 py-16 border-t border-black/5">
        <h2 className="text-center font-black text-2xl md:text-3xl tracking-tight">Common questions</h2>
        <div className="mt-8 space-y-3">
          {[
            { q: "Free trial kitne din ka hai?", a: "3 din ka full-access free trial. Card ki zaroorat nahi — trial ke baad plan choose karein." },
            { q: "Kya negative review Google pe jayega?", a: "Nahi. 1–3★ rating private feedback form pe jaati hai jo sirf aapko dikhti hai." },
            { q: "Standee kitne ka hai?", a: "Har plan me 1 printed standee bilkul FREE (₹1,500 value)." },
            { q: "Cancel kar sakte hain?", a: "Haan, kabhi bhi. Koi lock-in nahi, koi hidden charge nahi." },
          ].map((f) => (
            <div key={f.q} className="bg-white rounded-xl border border-black/10 p-4">
              <div className="font-bold text-sm">{f.q}</div>
              <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 mt-8">
        <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-black tracking-tight">IntellectFlow</span>
          </div>
          <div className="text-xs text-zinc-500">
            © 2025 IntellectFlow.in
          </div>
          <div className="flex gap-4 text-xs text-zinc-500">
            <Link to="/" className="hover:text-black">Privacy</Link>
            <Link to="/" className="hover:text-black">Terms</Link>
            <a href="mailto:intellectflowteam@gmail.com" className="hover:text-black">Contact</a>
          </div>
        </div>
      </footer>


      {/* MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-[360px]">
        <div className="bg-black text-white rounded-full p-1.5 flex gap-1.5 shadow-2xl">
          <Link
            to="/auth"
            className="flex-1 h-11 rounded-full bg-white text-black font-bold text-sm inline-flex items-center justify-center"
          >
            Start Rs 299
          </Link>
          <Link
            to="/auth"
            className="w-20 h-11 rounded-full border border-white/30 font-bold text-sm inline-flex items-center justify-center"
          >
            Login
          </Link>
        </div>
      </div>
      <div className="md:hidden h-20" />
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const included = new Set(plan.features);
  return (
    <div
      className={[
        "relative rounded-2xl p-6 flex flex-col bg-white",
        plan.popular ? "border-2 border-[#c9a227] shadow-xl" : "border border-zinc-200 shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-2xl font-black tracking-tight">{plan.label}</span>
        {plan.popular && (
          <span className="bg-[#f5c518] text-zinc-900 text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full">
            POPULAR
          </span>
        )}
        {plan.id === "pro" && (
          <span className="bg-[#2f2a1f] text-[#f5c518] text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full">
            BEST VALUE
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[44px] leading-none font-black tracking-[-0.03em]">₹{plan.price}</span>
        <span className="text-zinc-500 text-sm font-bold">/mo</span>
      </div>
      <div className="mt-1.5 text-xs text-zinc-500 font-bold">
        Market <span className="line-through">{plan.market}</span>
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
        className={[
          "mt-6 h-12 rounded-full font-black text-sm transition grid place-items-center text-white shadow-lg",
          plan.popular
            ? "bg-gradient-to-r from-[#f0a020] to-[#e2571f] hover:brightness-105"
            : "bg-gradient-to-r from-[#6d4bd8] to-[#4f46e5] hover:brightness-105",
        ].join(" ")}
      >
        Get Started at ₹{plan.price}/mo
      </Link>
    </div>
  );
}

