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

export const PLANS: Plan[] = [
  {
    id: "starter",
    label: "Starter",
    price: 299,
    market: "Rs 8k/mo agency value",
    razorpayPlanId: "plan_TJK9VQUJTjUJzX",
    paymentLink: "https://rzp.io/rzp/LqrrlGL",
    features: [
      "Unlimited review collection",
      "Smart QR code (5★ → Google, 1–3★ → private)",
      "Public review page (/r/your-slug)",
      "AI review writer for customers",
      "AI reply drafts for Google reviews",
      "1 FREE printed standee",
      "Basic review analytics",
      "Email support",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    price: 599,
    market: "Rs 25k/mo agency value",
    popular: true,
    razorpayPlanId: "plan_TJK9zXEpyUYWWe",
    paymentLink: "https://rzp.io/rzp/yAuLyOI",
    features: [
      "Unlimited review collection",
      "Smart QR code (5★ → Google, 1–3★ → private)",
      "Public review page (/r/your-slug)",
      "AI review writer for customers",
      "AI reply drafts for Google reviews",
      "1 FREE printed standee",
      "Google Business post generator",
      "WhatsApp review automation",
      "SEO health score + breakdown",
      "Review volume & rating trend analytics",
      "Priority email support",
    ],
  },
  {
    id: "pro",
    label: "Business Pro",
    price: 1299,
    market: "Rs 55k+/mo agency value",
    razorpayPlanId: "plan_TJKAgU5sQe5JkV",
    paymentLink: "https://rzp.io/rzp/2H8vasj",
    features: [
      "Unlimited review collection",
      "Smart QR code (5★ → Google, 1–3★ → private)",
      "Public review page (/r/your-slug)",
      "AI review writer for customers",
      "AI reply drafts for Google reviews",
      "1 FREE printed standee",
      "Google Business post generator",
      "WhatsApp review automation",
      "SEO health score + breakdown",
      "Review volume & rating trend analytics",
      "Local rank tracker vs competitors",
      "Competitor monitoring & alerts",
      "Sentiment analytics",
      "Multi-standee & custom print designs",
      "Priority WhatsApp + phone support",
    ],
  },
];

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
