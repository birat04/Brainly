"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { billingAPI } from "@/lib/api";
import { pageVariants } from "@/lib/animations";
import type { BillingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BillingPageInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await billingAPI.status();
      setStatus(data);
    } catch {
      toast.error("Could not load billing status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast.success("Subscription updated. It may take a moment to reflect.");
      void load();
    } else if (checkout === "canceled") {
      toast.message("Checkout canceled");
    }
  }, [searchParams, load]);

  const startCheckout = async (plan: "pro" | "enterprise") => {
    setBusy(plan);
    try {
      const { url } = await billingAPI.checkout(plan);
      window.location.href = url;
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Checkout failed");
      setBusy(null);
    }
  };

  const openPortal = async () => {
    setBusy("portal");
    try {
      const { url } = await billingAPI.portal();
      window.location.href = url;
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Could not open billing portal");
      setBusy(null);
    }
  };

  const usagePct =
    status && status.usage.contentLimit
      ? Math.min(100, Math.round((status.usage.content / status.usage.contentLimit) * 100))
      : 0;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Workspace</p>
        <h2 className="text-3xl font-semibold tracking-tight">Billing & plan</h2>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and monitor usage against plan limits.
        </p>
      </div>

      {status?.pastDue ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          Payment past due. Update your payment method to avoid losing Pro features at period end.
        </div>
      ) : null}

      {!status?.configured ? (
        <div className="rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
          Stripe is not configured in this environment. Set{" "}
          <code className="text-foreground">STRIPE_SECRET_KEY</code>,{" "}
          <code className="text-foreground">STRIPE_PRICE_PRO</code>, and{" "}
          <code className="text-foreground">STRIPE_WEBHOOK_SECRET</code> to enable checkout.
          Plan limits still apply on Free.
        </div>
      ) : null}

      {loading || !status ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current plan
                </CardTitle>
                <CardDescription>
                  {status.planName}
                  {status.subscriptionStatus ? ` · ${status.subscriptionStatus}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {status.currentPeriodEnd ? (
                  <p>Current period ends {new Date(status.currentPeriodEnd).toLocaleDateString()}</p>
                ) : (
                  <p>No active paid subscription.</p>
                )}
              </CardContent>
              <CardFooter>
                {status.canManageBilling && status.configured ? (
                  <Button variant="outline" onClick={() => void openPortal()} disabled={!!busy}>
                    {busy === "portal" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Manage billing
                  </Button>
                ) : null}
              </CardFooter>
            </Card>

            <Card className="glass border-border/60">
              <CardHeader>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Content items in this workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-semibold">
                  {status.usage.content}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / {status.usage.contentLimit ?? "∞"}
                  </span>
                </p>
                {status.usage.contentLimit ? (
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {status.plans.map((plan) => {
              const current = plan.id === status.plan;
              return (
                <Card
                  key={plan.id}
                  className={`glass flex flex-col border-border/60 ${
                    plan.highlighted ? "border-primary/50" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <p className="pt-2 text-2xl font-semibold">{plan.priceLabel}</p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        {f}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    {current ? (
                      <Button className="w-full" disabled variant="secondary">
                        Current plan
                      </Button>
                    ) : plan.id === "free" ? (
                      <Button className="w-full" variant="outline" disabled>
                        Included
                      </Button>
                    ) : plan.id === "enterprise" && !status.configured ? (
                      <Button className="w-full" variant="outline" asChild>
                        <a href="mailto:hello@cortexly.app">Contact sales</a>
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={!status.canManageBilling || !status.configured || !!busy}
                        onClick={() => void startCheckout(plan.id as "pro" | "enterprise")}
                      >
                        {busy === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Upgrade to {plan.name}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      }
    >
      <BillingPageInner />
    </Suspense>
  );
}
