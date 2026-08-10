import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star, QrCode, MessageSquare, Sparkles, Shield, Gift, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
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
  const notify = (msg: string) => toast.success(msg);

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
              Customer scans → Review → Coupon
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
        <h2 className="text-center font-black text-2xl md:text-3xl tracking-tight">
          8 tools. <span className="text-gradient-purple">One price.</span>
        </h2>
        <p className="text-center text-zinc-600 mt-2 text-sm md:text-base">Rs 55,500/mo market value at Rs 299/mo</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: QrCode, title: "QR + /r/slug", value: "Rs 1k", desc: "Custom slug for your shop" },
            { icon: Sparkles, title: "AI Writer", value: "Rs 3k/mo", desc: "Gujarati Hinglish English" },
            { icon: Shield, title: "Negative Filter", value: "Rs 7k/mo", desc: "1-2 star private to WhatsApp" },
            { icon: Gift, title: "Coupon Engine", value: "Rs 1.5k", desc: "Auto 10% OFF on review" },
            { icon: MessageSquare, title: "Reviews Inbox", value: "Rs 5k/mo", desc: "All reviews one place" },
            { icon: Sparkles, title: "AI Reply", value: "Rs 5k/mo", desc: "Instant 3 variants" },
            { icon: TrendingUp, title: "GMB Manager", value: "Rs 8k/mo", desc: "Auto posts + Q&A" },
            { icon: Gift, title: "Standee FREE", value: "Rs 1.5k FREE", desc: "Each plan gets one" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-black/10 p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <f.icon className="w-4 h-4 text-zinc-500" />
                  <span className="font-bold text-sm">{f.title}</span>
                </div>
                <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded">{f.value}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-[1080px] mx-auto px-4 md:px-6 py-16">
        <h2 className="text-center font-black text-3xl md:text-4xl tracking-tight">
          Simple pricing — <span className="text-gradient-brand">Rs 55k value at Rs 299</span>
        </h2>
        <p className="text-center text-zinc-600 mt-3 text-sm md:text-base">
          All plans include 1 Standee FREE • No hidden fees • Cancel anytime
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* Starter */}
          <PlanCard
            name="Starter"
            price="299"
            marketValue="Rs 8k/mo"
            popular={false}
            dark={false}
            cta="Start Free - Value Rs 8k/mo"
            features={[
              "5 AI Reply / month",
              "1 Public /r/slug page",
              "1 Poster design FREE",
              "1 Standee FREE (Rs 1.5k value)",
              "QR code + custom slug",
              "Negative review filter",
              "10% OFF coupon engine",
              "Reviews inbox",
              "Email support",
              "Cancel anytime",
            ]}
            onClick={() => notify("Starter plan checkout coming next")}
          />
          {/* Growth */}
          <PlanCard
            name="Growth"
            price="599"
            marketValue="Rs 25k/mo"
            popular
            dark
            cta="Choose Growth - Rs 25k Value"
            features={[
              "Everything in Starter",
              "50 AI Reply / mo (3 variants) — Rs 5k/mo",
              "GMB Auto Posts 5/mo — Rs 8k/mo",
              "WhatsApp Automation — Rs 3k/mo",
              "Stickers 20+ designs — Rs 2k/mo",
              "5 Public pages — Rs 5k/mo",
              "Sentiment analysis",
              "Poster + Standee FREE — Rs 3k",
              "Priority WhatsApp support",
              "80% customers choose this",
            ]}
            onClick={() => notify("Growth plan checkout coming next")}
          />
          {/* Pro */}
          <PlanCard
            name="Business Pro"
            price="1299"
            marketValue="Rs 55k+/mo"
            popular={false}
            dark={false}
            cta="Go Business Pro - Rs 55k+ Value"
            features={[
              "Everything in Growth",
              "Unlimited AI Reply",
              "GMB 15 posts/mo",
              "Q&A Insights — Rs 8k",
              "Sentiment Pro — Rs 5k",
              "Competitor tracking (2) — Rs 12k",
              "Website FREE — Rs 10k",
              "Stickers 50+ • Posters 5",
              "Premium Standee + Table Stand FREE — Rs 4.5k",
              "Lifetime updates",
            ]}
            onClick={() => notify("Pro plan checkout coming next")}
          />
        </div>

        {/* Founder banner */}
        <div className="mt-8 rounded-2xl bg-black text-white p-6 text-center">
          <div className="text-xs font-bold tracking-widest text-yellow-400 uppercase">Founder Special</div>
          <div className="mt-2 font-black text-lg md:text-xl">
            All plans include a Standee — Starter Rs 1.5k • Growth Rs 3k • Pro Premium Rs 4.5k FREE
          </div>
          <div className="mt-2 text-sm text-white/70">
            intellectflowteam@gmail.com • Visavadar, Gujarat
          </div>
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
            © 2025 IntellectFlow.in • Made in Visavadar, Gujarat
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

function PlanCard({
  name, price, marketValue, popular, dark, cta, features, onClick,
}: {
  name: string; price: string; marketValue: string; popular: boolean; dark: boolean; cta: string;
  features: string[]; onClick: () => void;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl p-6 flex flex-col",
        dark
          ? "bg-black text-white shadow-2xl md:scale-[1.02] border border-black"
          : "bg-white border-2 border-zinc-200",
      ].join(" ")}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[11px] font-black tracking-wide px-3 py-1 rounded-full border border-black/10 shadow">
          MOST POPULAR • 80%
        </div>
      )}
      <div className="text-sm font-bold uppercase tracking-wider opacity-70">{name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-black">Rs {price}</span>
        <span className={dark ? "text-white/60 text-sm" : "text-zinc-500 text-sm"}>/mo</span>
      </div>
      <div className={"mt-1 text-xs " + (dark ? "text-white/60" : "text-zinc-500")}>
        Market value <span className="line-through">{marketValue}</span>
      </div>

      <ul className="mt-5 space-y-2.5 text-sm flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className={"w-4 h-4 shrink-0 mt-0.5 " + (dark ? "text-emerald-400" : "text-emerald-600")} />
            <span className={dark ? "text-white/90" : "text-zinc-700"}>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className={[
          "mt-6 h-12 rounded-xl font-bold text-sm transition",
          dark
            ? "bg-white text-black hover:bg-zinc-100"
            : "bg-white text-black border-2 border-black hover:bg-black hover:text-white",
        ].join(" ")}
      >
        {cta}
      </button>
    </div>
  );
}
