"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { PLANS } from "@/lib/billing/plans";
import { useAuth } from "@/hooks/useAuth";

const tiers = Object.values(PLANS).map((p) => ({
  id: p.id,
  name: p.name,
  price: p.priceLabel,
  description: p.description,
  features: p.features,
  highlighted: p.highlighted ?? false,
  cta:
    p.id === "free"
      ? "Start for free"
      : p.id === "pro"
        ? "Upgrade to Pro"
        : "Contact sales",
}));

export function Pricing() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const hrefFor = (planId: string) => {
    if (planId === "free") return isAuthenticated ? "/dashboard" : "/signup";
    if (planId === "enterprise") return isAuthenticated ? "/dashboard/billing" : "/signup";
    return isAuthenticated ? "/dashboard/billing" : "/signup";
  };

  return (
    <section id="pricing" className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Simple plans that scale with you</h2>
          <p className="mt-4 text-muted-foreground">
            Transparent tiers with no surprises. Upgrade when you are ready—your content comes with you.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {tiers.map((tier) => (
            <motion.div key={tier.name} variants={fadeInUp}>
              <Card
                className={`glass flex h-full flex-col border-border/60 ${
                  tier.highlighted ? "border-primary/60 shadow-lg shadow-primary/10" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <p className="pt-4 text-3xl font-semibold">{tier.price}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      {f}
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    <Link
                      href={hrefFor(tier.id)}
                      onClick={(e) => {
                        if (isAuthenticated && tier.id !== "free") {
                          e.preventDefault();
                          router.push("/dashboard/billing");
                        }
                      }}
                    >
                      {tier.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
