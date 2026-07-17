export type PlanId = "free" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | null;

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  /** Max content items; null = unlimited */
  maxContent: number | null;
  priceLabel: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "For individuals getting started.",
    maxContent: 25,
    priceLabel: "$0",
    features: ["Up to 25 items", "Public sharing", "Community support"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For creators who live in their workspace.",
    maxContent: 1000,
    priceLabel: "$19",
    features: ["Up to 1,000 items", "Advanced analytics", "Priority support", "Custom branding"],
    highlighted: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Security, compliance, and dedicated success.",
    maxContent: null,
    priceLabel: "Let’s talk",
    features: ["Unlimited items", "SSO / SAML", "Audit logs", "24/7 phone support"],
  },
};

export function getPlan(planId: PlanId | string | undefined): PlanDefinition {
  if (planId && planId in PLANS) return PLANS[planId as PlanId];
  return PLANS.free;
}

/** Resolve the plan used for usage limits given Stripe subscription state. */
export function resolveEffectivePlan(input: {
  plan: PlanId | string;
  subscriptionStatus?: SubscriptionStatus | string | null;
  currentPeriodEnd?: Date | string | null;
}): PlanId {
  const plan = (input.plan in PLANS ? input.plan : "free") as PlanId;
  if (plan === "free") return "free";

  const status = input.subscriptionStatus ?? null;
  const periodEnd = input.currentPeriodEnd ? new Date(input.currentPeriodEnd) : null;
  const now = new Date();

  if (status === "active" || status === "trialing" || status === "past_due") {
    return plan;
  }

  // Grace until paid period ends after cancel
  if ((status === "canceled" || status === "unpaid") && periodEnd && periodEnd > now) {
    return plan;
  }

  return "free";
}

export function stripePriceIdForPlan(plan: PlanId): string | null {
  if (plan === "pro") return process.env.STRIPE_PRICE_PRO?.trim() || null;
  if (plan === "enterprise") return process.env.STRIPE_PRICE_ENTERPRISE?.trim() || null;
  return null;
}
