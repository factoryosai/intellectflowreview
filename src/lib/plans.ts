export type PlanId = "starter" | "growth" | "pro";

export type Plan = {
  id: PlanId;
  label: string;
  price: number;
  market: string;
  popular?: boolean;
  razorpayPlanId: string;
  paymentLink: string;
  features: string[];
};

/** Master feature list — order used for the pricing matrix (locked items shown greyed). */
export const ALL_FEATURES: string[] = [
  "QR + Public Review Page",
  "Unlimited review collection",
  "Smart QR (5★ → Google, 1–3★ private)",
  "AI Review Writer (2 SEO keywords)",
  "Negative Review Filter → Private",
  "Reviews Inbox + Counter",
  "1 FREE printed standee",
  "Basic review analytics",
  "AI Reply — 5 / month",
  "AI Reply — 50 / month",
  "AI Reply — Unlimited",
  "Live Google Reviews Import",
  "WhatsApp review reminder (24hr)",
  "GMB Post Generator — 1/mo",
  "GMB Post Generator — 5/mo",
  "GMB Post Generator — 15/mo",
  "Sentiment Analysis + Summary",
  "SEO Health Score + breakdown",
  "Review volume & rating trend",
  "Auto FAQ Generator — 3",
  "Auto FAQ Generator — 10",
  "Auto FAQ Generator — Unlimited",
  "Best Time to Ask + Post",
  "Weekly Smart PDF Report",
  "Competitor Tracking (SWOT) — 2",
  "Local Rank Tracker vs competitors",
  "Rating Drop Alert",
  "Hyperlocal Opportunity Alert",
  "WhatsApp Broadcast Pack — 5",
  "WhatsApp Broadcast Pack — 20",
  "Multi-standee & custom print designs",
  "1 FREE Business Website (built by us)",
  "Staff Training Tips (AI)",
  "Email support",
  "Priority email support",
  "Priority WhatsApp + phone support",
];

const STARTER_FEATURES = [
  "QR + Public Review Page",
  "Unlimited review collection",
  "Smart QR (5★ → Google, 1–3★ private)",
  "AI Review Writer (2 SEO keywords)",
  "Negative Review Filter → Private",
  "Reviews Inbox + Counter",
  "1 FREE printed standee",
  "Basic review analytics",
  "AI Reply — 5 / month",
  "GMB Post Generator — 1/mo",
  "Auto FAQ Generator — 3",
  "Staff Training Tips (AI)",
  "Email support",
];

const GROWTH_FEATURES = [
  "QR + Public Review Page",
  "Unlimited review collection",
  "Smart QR (5★ → Google, 1–3★ private)",
  "AI Review Writer (2 SEO keywords)",
  "Negative Review Filter → Private",
  "Reviews Inbox + Counter",
  "1 FREE printed standee",
  "Basic review analytics",
  "AI Reply — 50 / month",
  "Live Google Reviews Import",
  "WhatsApp review reminder (24hr)",
  "GMB Post Generator — 5/mo",
  "Sentiment Analysis + Summary",
  "SEO Health Score + breakdown",
  "Review volume & rating trend",
  "Auto FAQ Generator — 10",
  "Best Time to Ask + Post",
  "Weekly Smart PDF Report",
  "WhatsApp Broadcast Pack — 5",
  "Staff Training Tips (AI)",
  "Priority email support",
];

/** Lower-tier variants of a metered feature — Business Pro gets the higher variant instead. */
const SUPERSEDED_IN_PRO = new Set([
  "AI Reply — 5 / month",
  "AI Reply — 50 / month",
  "GMB Post Generator — 1/mo",
  "GMB Post Generator — 5/mo",
  "Auto FAQ Generator — 3",
  "Auto FAQ Generator — 10",
  "WhatsApp Broadcast Pack — 5",
  "Email support",
  "Priority email support",
]);

/** Business Pro = every feature in the master list (minus lower-tier variants). */
const PRO_FEATURES = ALL_FEATURES.filter((f) => !SUPERSEDED_IN_PRO.has(f));


export const PLANS: Plan[] = [
  {
    id: "starter",
    label: "Starter",
    price: 299,
    market: "₹8,000/mo",
    razorpayPlanId: "plan_TJK9VQUJTjUJzX",
    paymentLink: "https://rzp.io/rzp/LqrrlGL",
    features: STARTER_FEATURES,
  },
  {
    id: "growth",
    label: "Growth",
    price: 599,
    market: "₹25,000/mo",
    popular: true,
    razorpayPlanId: "plan_TJK9zXEpyUYWWe",
    paymentLink: "https://rzp.io/rzp/yAuLyOI",
    features: GROWTH_FEATURES,
  },
  {
    id: "pro",
    label: "Business Pro",
    price: 1299,
    market: "₹1,08,000/mo",
    razorpayPlanId: "plan_TJKAgU5sQe5JkV",
    paymentLink: "https://rzp.io/rzp/2H8vasj",
    features: PRO_FEATURES,
  },
];

/** Feature-gating helper: is this feature unlocked on the given plan? */
export function planHasFeature(plan: PlanId, feature: string): boolean {
  const p = PLANS.find((x) => x.id === plan);
  return !!p?.features.includes(feature);
}


export const TRIAL_DAYS = 3;

export type AccessState = {
  lifetimeFree: boolean;
  onTrial: boolean;
  trialDaysLeft: number;
  expired: boolean;
  plan: PlanId;
};

export function computeAccess(profile: {
  plan?: string | null;
  lifetime_free?: boolean | null;
  is_founder_free?: boolean | null;
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  created_at?: string | null;
} | null | undefined): AccessState {
  const plan = ((profile?.plan as PlanId) ?? "starter") as PlanId;
  const lifetimeFree = !!(profile?.lifetime_free || profile?.is_founder_free);
  const status = profile?.subscription_status ?? "trialing";
  const endsAt = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : new Date(new Date(profile?.created_at ?? Date.now()).getTime() + TRIAL_DAYS * 86400000);
  const msLeft = endsAt.getTime() - Date.now();
  const trialDaysLeft = Math.max(0, Math.ceil(msLeft / 86400000));
  const onTrial = !lifetimeFree && status === "trialing" && msLeft > 0;
  const expired = !lifetimeFree && status === "trialing" && msLeft <= 0;
  return { lifetimeFree, onTrial, trialDaysLeft, expired, plan };
}
