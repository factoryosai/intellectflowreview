import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/queries";
import { PLANS, computeAccess, type PlanId } from "@/lib/plans";
import { Check, Crown, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Plans & Billing — IntellectFlow" },
      { name: "description", content: "Compare Starter, Growth and Business Pro plans and manage your IntellectFlow subscription." },
      { property: "og:title", content: "Plans & Billing — IntellectFlow" },
      { property: "og:description", content: "Compare Starter, Growth and Business Pro plans for your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Billing,
});

function Billing() {
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const access = computeAccess(profile);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-black text-2xl md:text-3xl">Plans & Billing</h1>
        <p className="text-sm text-zinc-500">Everything you get on each plan — no hidden "everything in X" fine print.</p>
      </div>

      {/* Status card */}
      <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase font-bold tracking-wide text-zinc-500">Current access</div>
          {access.lifetimeFree ? (
            <div className="mt-1 inline-flex items-center gap-2 font-black text-xl">
              <Crown className="w-5 h-5 text-[#c9a227]" /> Lifetime Free Access
            </div>
          ) : (
            <div className="mt-1 font-black text-xl capitalize">
              {PLANS.find((p) => p.id === access.plan)?.label ?? "Starter"} · ₹{PLANS.find((p) => p.id === access.plan)?.price ?? 299}/mo
            </div>
          )}
        </div>
        {access.lifetimeFree ? (
          <span className="text-xs font-bold bg-[#c9a227] text-black px-3 py-1.5 rounded-full">Granted by IntellectFlow — no billing</span>
        ) : access.onTrial ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {access.trialDaysLeft} day{access.trialDaysLeft === 1 ? "" : "s"} left in free trial
          </span>
        ) : access.expired ? (
          <span className="text-xs font-bold bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full">Trial ended — pick a plan to continue</span>
        ) : (
          <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-full">Subscription active</span>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {PLANS.map((p) => {
          const current = !access.lifetimeFree && access.plan === (p.id as PlanId);
          return (
            <div
              key={p.id}
              className={[
                "rounded-2xl border-2 p-5 bg-white relative",
                current ? "border-[#c9a227] shadow-lg" : p.popular ? "border-black" : "border-zinc-200",
              ].join(" ")}
            >
              {current && (
                <span className="absolute -top-3 left-5 text-[10px] font-black uppercase bg-[#c9a227] text-black px-2 py-1 rounded">Current plan</span>
              )}
              {!current && p.popular && (
                <span className="absolute -top-3 left-5 text-[10px] font-black uppercase bg-black text-white px-2 py-1 rounded">Most popular</span>
              )}
              <div className="font-black text-lg mt-1">{p.label}</div>
              <div className="text-xs text-zinc-500">{p.market}</div>
              <div className="mt-2 font-black text-3xl">
                ₹{p.price}
                <span className="text-sm font-normal text-zinc-500">/mo</span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" /> <span className="text-zinc-700">{f}</span>
                  </li>
                ))}
              </ul>

              {access.lifetimeFree ? (
                <div className="mt-5 w-full h-11 rounded-lg bg-[#fdf6ef] border border-[#c9a227] grid place-items-center text-sm font-bold text-black">
                  <span className="inline-flex items-center gap-1.5"><Crown className="w-4 h-4 text-[#c9a227]" /> Included — Lifetime Free</span>
                </div>
              ) : (
                <a
                  href={p.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    "mt-5 w-full h-11 rounded-lg grid place-items-center font-bold text-sm",
                    current ? "bg-zinc-100 text-zinc-700" : "bg-black text-white",
                  ].join(" ")}
                >
                  {current ? "Manage / renew" : `Choose ${p.label}`}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500">
        Payments are processed securely by Razorpay. After payment your plan is activated within a few minutes — contact support if it doesn't update.
      </p>
    </div>
  );
}
