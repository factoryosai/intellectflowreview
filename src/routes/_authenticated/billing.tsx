import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/queries";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/billing")({ component: Billing });

const PLANS = [
  { id: "starter", price: 299, market: "Rs 8k/mo", label: "Starter", features: ["Unlimited reviews", "AI writer + reply", "QR + public page", "1 FREE standee"] },
  { id: "growth", price: 599, market: "Rs 25k/mo", label: "Growth", popular: true, features: ["Everything in Starter", "GMB post generator", "WhatsApp automation", "Coupons"] },
  { id: "pro", price: 1299, market: "Rs 55k+/mo", label: "Pro", features: ["Everything in Growth", "Competitor tracking", "Sentiment analytics", "Priority support"] },
] as const;

function Billing() {
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const change = async (plan: "starter" | "growth" | "pro") => {
    if (!profile) return;
    const price = PLANS.find((p) => p.id === plan)!.price;
    await supabase.from("profiles").update({ plan, plan_price: price }).eq("id", profile.id);
    await supabase.from("subscriptions").insert({ user_id: profile.id, plan, price, market_value: PLANS.find((p) => p.id === plan)!.market });
    toast.success("Plan updated");
  };

  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Billing</h1>
      <div className="bg-white border border-black/10 rounded-2xl p-4">
        <div className="text-sm text-zinc-500">Current plan</div>
        <div className="mt-1 font-black text-xl capitalize">{profile?.plan ?? "starter"} · Rs {profile?.plan_price ?? 299}/mo</div>
        {profile?.is_founder_free && <div className="mt-1 inline-block text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Lifetime Free (Founder)</div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PLANS.map((p) => (
          <div key={p.id} className={"rounded-2xl border-2 p-5 bg-white " + ((p as { popular?: boolean }).popular ? "border-black" : "border-zinc-200")}>
            <div className="font-black text-lg">{p.label}</div>
            <div className="text-xs text-zinc-500">Market {p.market}</div>
            <div className="mt-2 font-black text-3xl">Rs {p.price}<span className="text-sm font-normal text-zinc-500">/mo</span></div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" /> {f}</li>)}
            </ul>
            <button onClick={() => change(p.id)} className="mt-4 w-full h-11 rounded-lg bg-black text-white font-bold text-sm">
              {profile?.plan === p.id ? "Current" : "Choose"}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500">Payment integration (Razorpay/Stripe) can be enabled on request.</p>
    </div>
  );
}
