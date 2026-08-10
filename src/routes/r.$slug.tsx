import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { aiWriter } from "@/lib/ai.functions";
import { Star, Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/r/$slug")({
  ssr: false,
  loader: async ({ params }) => {
    const { data, error } = await supabase.from("businesses_public").select("id, name, slug, gmb_link, rating, total_reviews, city, address, description, business_type, photo_url").eq("slug", params.slug).maybeSingle();
    if (error || !data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Rate ${loaderData.name} — IntellectFlow` },
          { name: "description", content: `Share your experience at ${loaderData.name}. Get 10% OFF for positive reviews.` },
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

type Step = "rate" | "negative" | "positive" | "done";

function PublicReview() {
  const biz = Route.useLoaderData();
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<Step>("rate");
  const [customerName, setName] = useState("");
  const [customerPhone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<{ lang: string; text: string }[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const aiWriterFn = useServerFn(aiWriter);

  useEffect(() => {
    if (rating === 0) return;
    if (rating <= 2) setStep("negative");
    else setStep("positive");
  }, [rating]);

  const loadSuggestions = async () => {
    setBusy(true);
    try {
      const res = await aiWriterFn({ data: { rating, businessName: biz.name, businessType: (biz as any).business_type || "shop", businessDescription: (biz as any).description || undefined } });
      setSuggestions(res.suggestions || []);
    } catch {
      toast.error("AI suggestions unavailable");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (step === "positive" && suggestions.length === 0) loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const submitPrivate = async () => {
    if (!text.trim()) return toast.error("Please share your feedback");
    setBusy(true);
    try {
      const res = await fetch("/api/public/submit-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: biz.slug,
          rating,
          review_text: text,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setStep("done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const submitPublic = async () => {
    if (!text.trim()) return toast.error("Please write a review");
    setBusy(true);
    try {
      const res = await fetch("/api/public/submit-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: biz.slug,
          rating,
          review_text: text,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          ai_generated: suggestions.some((s) => s.text === text),
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      const json = (await res.json()) as { couponCode?: string | null; gmb_link?: string | null };
      if (json.couponCode) setCouponCode(json.couponCode);
      setStep("done");
      if (json.gmb_link) setTimeout(() => { window.location.href = json.gmb_link!; }, 3500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: "#fdf6ef" }}>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-black text-white grid place-items-center font-black text-lg" style={{ fontFamily: "var(--font-display)" }}>
              {biz.name.slice(0, 2).toUpperCase()}
            </div>
            <h1 className="mt-3 font-black text-2xl">{biz.name}</h1>
            <div className="mt-1 flex items-center justify-center gap-1 text-sm text-zinc-500">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
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
                  <button key={n} onClick={() => setRating(n)} className="p-1">
                    <Star className={"w-10 h-10 transition " + (n <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300")} />
                  </button>
                ))}
              </div>
              <div className="mt-6 text-center text-[11px] text-zinc-400">Powered by IntellectFlow</div>
            </>
          )}

          {step === "negative" && (
            <>
              <p className="mt-6 text-sm text-zinc-600">
                We're sorry. Your feedback goes <b>privately to the owner</b>, not to Google.
              </p>
              <div className="mt-4 space-y-2">
                <input className="w-full h-11 rounded-lg border border-black/15 px-3 text-sm" placeholder="Your name (optional)" value={customerName} onChange={(e) => setName(e.target.value)} />
                <input className="w-full h-11 rounded-lg border border-black/15 px-3 text-sm" placeholder="Phone (optional)" value={customerPhone} onChange={(e) => setPhone(e.target.value)} />
                <textarea className="w-full min-h-[100px] rounded-lg border border-black/15 px-3 py-2 text-sm" placeholder="Tell us what went wrong…" value={text} onChange={(e) => setText(e.target.value)} />
              </div>
              <button onClick={submitPrivate} disabled={busy} className="mt-4 w-full h-12 rounded-xl bg-black text-white font-bold disabled:opacity-60">
                {busy ? "Sending…" : "Send private feedback"}
              </button>
            </>
          )}

          {step === "positive" && (
            <>
              <p className="mt-6 text-sm text-zinc-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Pick or edit a review — get <b>10% OFF</b>.
              </p>
              <div className="mt-3 space-y-2">
                {busy && suggestions.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Writing suggestions…</div>
                )}
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setText(s.text)}
                    className={"w-full text-left p-3 rounded-lg border transition " +
                      (text === s.text ? "border-black bg-zinc-50" : "border-zinc-200 hover:border-zinc-400")}>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase">{s.lang}</div>
                    <div className="text-sm text-zinc-700 mt-0.5">{s.text}</div>
                  </button>
                ))}
              </div>
              <textarea className="mt-3 w-full min-h-[80px] rounded-lg border border-black/15 px-3 py-2 text-sm" placeholder="Or write your own…" value={text} onChange={(e) => setText(e.target.value)} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input className="h-10 rounded-lg border border-black/15 px-3 text-sm" placeholder="Name (optional)" value={customerName} onChange={(e) => setName(e.target.value)} />
                <input className="h-10 rounded-lg border border-black/15 px-3 text-sm" placeholder="Phone (optional)" value={customerPhone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <button onClick={submitPublic} disabled={busy || !text} className="mt-4 w-full h-12 rounded-xl bg-black text-white font-bold disabled:opacity-40">
                {busy ? "Posting…" : "Post review + get 10% OFF"}
              </button>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 grid place-items-center mx-auto">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="mt-3 font-black text-xl">
                {rating <= 2 ? "Thank you — sent privately" : "Thank you!"}
              </h2>
              {rating > 2 && couponCode && (
                <div className="mt-4 mx-auto max-w-xs bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-xl p-4">
                  <div className="text-[10px] font-bold text-yellow-800 uppercase">Your coupon</div>
                  <div className="mt-1 font-black text-2xl tracking-widest">{couponCode}</div>
                  <div className="text-xs text-yellow-800 mt-1">10% OFF · valid 30 days</div>
                </div>
              )}
              {rating > 2 && biz.gmb_link && (
                <p className="mt-4 text-xs text-zinc-500">Redirecting you to Google…</p>
              )}
              {rating <= 2 && (
                <p className="mt-3 text-sm text-zinc-600">Not posted to Google. The owner will reach out.</p>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-zinc-500 mt-4">
          Powered by <span className="font-bold">IntellectFlow</span>
        </p>
      </div>
    </div>
  );
}
