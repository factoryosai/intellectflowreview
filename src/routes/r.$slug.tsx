import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Check, Copy, Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/r/$slug")({
  ssr: false,
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("businesses_public")
      .select("id, name, slug, gmb_link, rating, total_reviews, city, address, description, business_type, photo_url")
      .eq("slug", params.slug)
      .maybeSingle();
    if (error || !data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Rate ${loaderData.name ?? "this business"} — IntellectFlow` },
          { name: "description", content: `Share your experience at ${loaderData.name ?? "this business"} in one tap.` },
          { property: "og:title", content: `Rate ${loaderData.name ?? "this business"}` },
          { property: "og:description", content: "Tap a star, pick a review, post it on Google in seconds." },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Business not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4" style={{ backgroundColor: "#fdf6ef" }}>
      <div className="text-center">
        <h1 className="font-black text-3xl">Business not found</h1>
        <p className="text-sm text-zinc-500 mt-2">Check the QR code or link.</p>
      </div>
    </div>
  ),
  component: PublicReview,
});

type Step = "rate" | "negative" | "positive" | "redirect" | "done";

function buildTemplates(name: string, type: string) {
  const t = type || "business";
  return [
    `Great experience at ${name}. Friendly staff and excellent service — highly recommended!`,
    `${name} is the best ${t} in the area. Quality is consistently good and prices are fair.`,
    `Visited ${name} today and was really impressed. Clean, quick and very professional.`,
    `Superb service at ${name}. The team went out of their way to help me. 5 stars!`,
    `Highly recommend ${name}. Great quality, honest pricing and a very welcoming team.`,
    `${name} નો અનુભવ ખૂબ સરસ રહ્યો. સ્ટાફ ખૂબ સહકારી અને સેવા ઉત્તમ છે.`,
    `${name} में बहुत अच्छा अनुभव रहा। स्टाफ मददगार है और सर्विस शानदार है।`,
  ];
}

function PublicReview() {
  const biz = Route.useLoaderData();
  const bizName = biz.name ?? "this business";
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<Step>("rate");
  const [customerName, setName] = useState("");
  const [customerPhone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const templates = useMemo(() => buildTemplates(bizName, biz.business_type ?? "shop"), [bizName, biz.business_type]);

  useEffect(() => {
    if (rating === 0) return;
    setStep(rating <= 3 ? "negative" : "positive");
  }, [rating]);

  const submit = async (positive: boolean) => {
    const res = await fetch("/api/public/submit-review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: biz.slug,
        rating,
        review_text: text,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        ai_generated: positive && templates.includes(text),
      }),
    });
    if (!res.ok) throw new Error("Submit failed");
    return (await res.json()) as { gmb_link?: string | null };
  };

  const submitPrivate = async () => {
    if (!text.trim()) return toast.error("Please share your feedback");
    setBusy(true);
    try {
      await submit(false);
      setStep("done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const copyAndGoToGoogle = async () => {
    if (!text.trim()) return toast.error("Pick or write a review first");
    setBusy(true);
    try {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* clipboard may be blocked; the review text is still shown below */
      }
      const json = await submit(true);
      toast.success("Review copied! Paste it in Google's review box.");
      const link = json.gmb_link ?? biz.gmb_link ?? null;
      if (link) {
        setStep("redirect");
        let n = 3;
        setCountdown(n);
        const timer = setInterval(() => {
          n -= 1;
          setCountdown(n);
          if (n <= 0) {
            clearInterval(timer);
            window.location.href = link;
          }
        }, 1000);
      } else {
        setStep("done");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const googleLink = biz.gmb_link ?? "";

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: "#fdf6ef" }}>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-black text-white grid place-items-center font-black text-lg">
              {bizName.slice(0, 2).toUpperCase()}
            </div>
            <h1 className="mt-3 font-black text-2xl">{bizName}</h1>
            <div className="mt-1 flex items-center justify-center gap-1 text-sm text-zinc-500">
              <Star className="w-3.5 h-3.5 fill-[#c9a227] text-[#c9a227]" />
              <span className="font-semibold text-zinc-700">{biz.rating}</span>
              <span>· {biz.total_reviews ?? 0} reviews</span>
              {biz.city && <span>· {biz.city}</span>}
            </div>
          </div>

          {step === "rate" && (
            <>
              <p className="mt-6 text-center font-semibold">How was your experience?</p>
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} className="p-1" aria-label={`${n} star`}>
                    <Star className={"w-10 h-10 transition " + (n <= rating ? "fill-[#c9a227] text-[#c9a227]" : "text-zinc-300")} />
                  </button>
                ))}
              </div>
              <div className="mt-6 text-center text-[11px] text-zinc-400">Powered by IntellectFlow</div>
            </>
          )}

          {step === "negative" && (
            <>
              <div className="mt-6 flex items-start gap-2 text-sm text-zinc-600 bg-zinc-50 border border-black/5 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>We're sorry it wasn't perfect. Your feedback goes <b>privately to the owner</b> — it is not posted to Google.</span>
              </div>
              <div className="mt-4 space-y-2">
                <input className="w-full h-11 rounded-lg border border-black/15 px-3 text-sm" placeholder="Your name (optional)" value={customerName} onChange={(e) => setName(e.target.value)} />
                <input className="w-full h-11 rounded-lg border border-black/15 px-3 text-sm" placeholder="Phone (optional)" value={customerPhone} onChange={(e) => setPhone(e.target.value)} />
                <textarea className="w-full min-h-[110px] rounded-lg border border-black/15 px-3 py-2 text-sm" placeholder="Tell us what went wrong…" value={text} onChange={(e) => setText(e.target.value)} />
              </div>
              <button onClick={submitPrivate} disabled={busy} className="mt-4 w-full h-12 rounded-xl bg-black text-white font-bold disabled:opacity-60">
                {busy ? "Sending…" : "Send private feedback"}
              </button>
              <button onClick={() => { setRating(0); setStep("rate"); }} className="mt-2 w-full h-10 text-sm text-zinc-500">Back</button>
            </>
          )}

          {step === "positive" && (
            <>
              <p className="mt-6 text-sm font-semibold">Pick a review — we'll copy it and take you to Google.</p>
              <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto pr-0.5">
                {templates.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setText(s)}
                    className={
                      "w-full text-left p-3 rounded-lg border transition text-sm " +
                      (text === s ? "border-[#c9a227] bg-[#fdf6ef]" : "border-zinc-200 hover:border-zinc-400")
                    }
                  >
                    <span className="text-zinc-700">{s}</span>
                    {text === s && <Check className="inline w-4 h-4 ml-1 text-emerald-600" />}
                  </button>
                ))}
              </div>
              <textarea
                className="mt-3 w-full min-h-[80px] rounded-lg border border-black/15 px-3 py-2 text-sm"
                placeholder="Or write your own…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input className="h-10 rounded-lg border border-black/15 px-3 text-sm" placeholder="Name (optional)" value={customerName} onChange={(e) => setName(e.target.value)} />
                <input className="h-10 rounded-lg border border-black/15 px-3 text-sm" placeholder="Phone (optional)" value={customerPhone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <button onClick={copyAndGoToGoogle} disabled={busy} className="mt-4 w-full h-12 rounded-xl bg-black text-white font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                {busy ? "Preparing…" : "Copy & post on Google"}
              </button>
              {!googleLink && <p className="mt-2 text-[11px] text-orange-600 text-center">This business hasn't linked its Google profile yet — your review is saved for the owner.</p>}
              <button onClick={() => { setRating(0); setStep("rate"); }} className="mt-2 w-full h-10 text-sm text-zinc-500">Back</button>
            </>
          )}

          {step === "redirect" && (
            <div className="mt-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 grid place-items-center">
                <Check className="w-6 h-6 text-emerald-700" />
              </div>
              <h2 className="mt-3 font-black text-xl">Copied to your clipboard!</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Taking you to Google in <b>{countdown}</b>s. On the Google page, <b>long-press the review box and tap Paste</b>, then hit Post.
              </p>
              <div className="mt-3 text-left text-xs bg-zinc-50 border border-black/10 rounded-lg p-3 text-zinc-600">{text}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("Copied again"))} className="flex-1 h-11 rounded-lg border border-black/15 text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                  <Copy className="w-4 h-4" /> Copy again
                </button>
                <a href={googleLink} className="flex-1 h-11 rounded-lg bg-black text-white text-sm font-bold inline-flex items-center justify-center gap-1.5">
                  <ExternalLink className="w-4 h-4" /> Go now
                </a>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="mt-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 grid place-items-center">
                <Check className="w-6 h-6 text-emerald-700" />
              </div>
              <h2 className="mt-3 font-black text-xl">Thank you!</h2>
              <p className="mt-1 text-sm text-zinc-600">
                {rating <= 3 ? "The owner has received your feedback privately and will get in touch." : "Your review has been saved."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
