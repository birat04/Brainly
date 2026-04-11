"use client";

import { motion } from "framer-motion";
import { Link2, Lock, Share2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const items = [
  {
    title: "Lightning-fast library",
    body: "Organize articles, notes, links, and media with powerful filters and instant search.",
    icon: Zap,
  },
  {
    title: "Unique share links",
    body: "Every item can expose a public /brain/:id route with analytics-friendly view counts.",
    icon: Share2,
  },
  {
    title: "Enterprise-ready auth",
    body: "Secure JWT sessions, validated inputs, and a dashboard layout built for scale.",
    icon: Lock,
  },
  {
    title: "Deep linking",
    body: "Copy polished URLs in one click and toggle visibility without leaving the table.",
    icon: Link2,
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Everything you need to ship content</h2>
          <p className="mt-4 text-muted-foreground">
            Opinionated defaults, tasteful motion, and a cohesive dark UI so you can focus on ideas—not
            infrastructure.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-6 md:grid-cols-2"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} variants={fadeInUp}>
                <Card className="glass h-full border-border/60 transition hover:border-primary/40">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
