"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals getting started.",
    features: ["Up to 25 items", "Public sharing", "Community support"],
    cta: "Start for free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For creators who live in their workspace.",
    features: ["Unlimited items", "Advanced analytics", "Priority support", "Custom branding"],
    cta: "Upgrade to Pro",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Let’s talk",
    description: "Security, compliance, and dedicated success.",
    features: ["SSO / SAML", "Dedicated infra", "Audit logs", "24/7 phone support"],
    cta: "Contact sales",
    href: "/signup",
    highlighted: false,
  },
];

export function Pricing() {
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
                  <Button asChild className="w-full" variant={tier.highlighted ? "default" : "outline"}>
                    <Link href={tier.href}>{tier.cta}</Link>
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
