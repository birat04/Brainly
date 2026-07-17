import type Stripe from "stripe";
import { AppError } from "@/lib/errors";
import { parseObjectId } from "@/lib/object-id";
import {
  contentsCollection,
  usersCollection,
  workspacesCollection,
} from "@/lib/repos/collections";
import type { WorkspaceDoc } from "@/lib/repos/types";
import {
  getPlan,
  PLANS,
  resolveEffectivePlan,
  stripePriceIdForPlan,
  type PlanId,
  type SubscriptionStatus,
} from "@/lib/billing/plans";
import { getStripe, isStripeConfigured } from "@/lib/billing/stripe";
import { requireWorkspaceMember } from "@/lib/services/workspace.service";

function contentCountFilter(workspaceId: string) {
  const wid = parseObjectId(workspaceId, "workspaceId");
  return { workspaceId: wid };
}

export async function countWorkspaceContent(workspaceId: string): Promise<number> {
  const contents = await contentsCollection();
  return contents.countDocuments(contentCountFilter(workspaceId));
}

export async function getWorkspaceOrThrow(workspaceId: string): Promise<WorkspaceDoc> {
  const workspaces = await workspacesCollection();
  const ws = await workspaces.findOne({ _id: parseObjectId(workspaceId, "workspaceId") });
  if (!ws) throw AppError.notFound("Workspace not found");
  return ws;
}

export async function assertCanCreateContent(userId: string, workspaceId: string) {
  await requireWorkspaceMember(userId, workspaceId, "member");
  const ws = await getWorkspaceOrThrow(workspaceId);
  const effective = resolveEffectivePlan({
    plan: ws.plan,
    subscriptionStatus: ws.subscriptionStatus,
    currentPeriodEnd: ws.currentPeriodEnd,
  });
  const plan = getPlan(effective);
  const used = await countWorkspaceContent(workspaceId);

  if (plan.maxContent !== null && used >= plan.maxContent) {
    throw AppError.forbidden(
      `Plan limit reached (${used}/${plan.maxContent} items on ${plan.name}). Upgrade to add more content.`,
    );
  }

  if (ws.subscriptionStatus === "past_due") {
    // Soft warning path — still allowed during dunning retries
  }

  return { used, limit: plan.maxContent, plan: effective };
}

export async function getBillingStatus(userId: string, workspaceId: string) {
  const membership = await requireWorkspaceMember(userId, workspaceId, "member");
  const ws = await getWorkspaceOrThrow(workspaceId);
  const effective = resolveEffectivePlan({
    plan: ws.plan,
    subscriptionStatus: ws.subscriptionStatus,
    currentPeriodEnd: ws.currentPeriodEnd,
  });
  const plan = getPlan(effective);
  const used = await countWorkspaceContent(workspaceId);

  return {
    configured: isStripeConfigured(),
    plan: effective,
    planName: plan.name,
    subscriptionStatus: ws.subscriptionStatus ?? null,
    currentPeriodEnd: ws.currentPeriodEnd ? ws.currentPeriodEnd.toISOString() : null,
    usage: {
      content: used,
      contentLimit: plan.maxContent,
    },
    canManageBilling: membership.role === "owner" || membership.role === "admin",
    pastDue: ws.subscriptionStatus === "past_due",
    plans: Object.values(PLANS).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceLabel: p.priceLabel,
      features: p.features,
      highlighted: p.highlighted ?? false,
      maxContent: p.maxContent,
    })),
  };
}

async function ensureStripeCustomer(workspace: WorkspaceDoc): Promise<string> {
  if (workspace.stripeCustomerId) return workspace.stripeCustomerId;

  const stripe = getStripe();
  const users = await usersCollection();
  const owner = await users.findOne({ _id: workspace.ownerId });
  if (!owner) throw AppError.notFound("Workspace owner not found");

  const customer = await stripe.customers.create({
    email: owner.email,
    name: owner.fullName || owner.username,
    metadata: {
      workspaceId: workspace._id.toString(),
      ownerId: owner._id.toString(),
    },
  });

  const workspaces = await workspacesCollection();
  await workspaces.updateOne(
    { _id: workspace._id },
    { $set: { stripeCustomerId: customer.id, updatedAt: new Date() } },
  );

  return customer.id;
}

export async function createCheckoutSession(params: {
  userId: string;
  workspaceId: string;
  plan: PlanId;
}) {
  if (params.plan === "free") {
    throw AppError.badRequest("Free plan does not require checkout");
  }
  if (params.plan === "enterprise" && !stripePriceIdForPlan("enterprise")) {
    throw AppError.badRequest("Enterprise billing is sales-assisted. Contact support to upgrade.");
  }

  await requireWorkspaceMember(params.userId, params.workspaceId, "admin");
  const priceId = stripePriceIdForPlan(params.plan);
  if (!priceId) {
    throw AppError.badRequest(`Missing Stripe price ID for plan "${params.plan}"`);
  }

  const ws = await getWorkspaceOrThrow(params.workspaceId);
  const customerId = await ensureStripeCustomer(ws);
  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${baseUrl}/dashboard/billing?checkout=canceled`,
    client_reference_id: params.workspaceId,
    metadata: {
      workspaceId: params.workspaceId,
      plan: params.plan,
      userId: params.userId,
    },
    subscription_data: {
      metadata: {
        workspaceId: params.workspaceId,
        plan: params.plan,
      },
    },
  });

  if (!session.url) throw AppError.badRequest("Stripe did not return a checkout URL");
  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(params: {
  userId: string;
  workspaceId: string;
}) {
  await requireWorkspaceMember(params.userId, params.workspaceId, "admin");
  const ws = await getWorkspaceOrThrow(params.workspaceId);
  if (!ws.stripeCustomerId) {
    throw AppError.badRequest("No billing customer yet. Upgrade to a paid plan first.");
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/billing`,
  });
  return { url: session.url };
}

function planFromPriceId(priceId: string | undefined): PlanId {
  const pro = process.env.STRIPE_PRICE_PRO?.trim();
  const enterprise = process.env.STRIPE_PRICE_ENTERPRISE?.trim();
  if (priceId && pro && priceId === pro) return "pro";
  if (priceId && enterprise && priceId === enterprise) return "enterprise";
  return "pro";
}

async function applySubscriptionToWorkspace(
  workspaceId: string,
  subscription: Stripe.Subscription,
  planHint?: PlanId,
) {
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = planHint ?? planFromPriceId(priceId);
  const workspaces = await workspacesCollection();
  const status = subscription.status as SubscriptionStatus;

  const effectivePlan =
    status === "active" || status === "trialing" || status === "past_due"
      ? plan
      : resolveEffectivePlan({
          plan,
          subscriptionStatus: status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

  await workspaces.updateOne(
    { _id: parseObjectId(workspaceId, "workspaceId") },
    {
      $set: {
        plan: effectivePlan === "free" && status === "canceled" ? "free" : plan,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
    },
  );

  // After cancel at period end, keep plan until period ends via resolveEffectivePlan
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    const periodEnd = new Date(subscription.current_period_end * 1000);
    if (periodEnd <= new Date()) {
      await workspaces.updateOne(
        { _id: parseObjectId(workspaceId, "workspaceId") },
        { $set: { plan: "free", updatedAt: new Date() } },
      );
    }
  }
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId || session.client_reference_id;
      const plan = (session.metadata?.plan as PlanId) || "pro";
      if (!workspaceId || !session.subscription) break;

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
      const workspaces = await workspacesCollection();
      if (session.customer) {
        await workspaces.updateOne(
          { _id: parseObjectId(workspaceId, "workspaceId") },
          {
            $set: {
              stripeCustomerId: String(session.customer),
              updatedAt: new Date(),
            },
          },
        );
      }
      await applySubscriptionToWorkspace(workspaceId, subscription, plan);
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const workspaceId = subscription.metadata?.workspaceId;
      if (!workspaceId) {
        // Fallback: find by subscription id
        const workspaces = await workspacesCollection();
        const ws = await workspaces.findOne({ stripeSubscriptionId: subscription.id });
        if (!ws) break;
        await applySubscriptionToWorkspace(ws._id.toString(), subscription);
        break;
      }
      await applySubscriptionToWorkspace(workspaceId, subscription);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) break;
      const workspaces = await workspacesCollection();
      await workspaces.updateOne(
        { stripeCustomerId: customerId },
        { $set: { subscriptionStatus: "past_due", updatedAt: new Date() } },
      );
      break;
    }
    default:
      break;
  }
}
