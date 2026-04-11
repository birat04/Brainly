"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-28 md:px-8 md:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_55%)]" />
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative mx-auto flex max-w-5xl flex-col items-center text-center"
      >
        <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Premium content management for modern teams
        </motion.div>
        <motion.h1
          variants={fadeInUp}
          className="text-balance text-4xl font-semibold tracking-tight md:text-6xl"
        >
          Your second brain,{" "}
          <span className="bg-gradient-to-r from-blue-400 via-primary to-purple-500 bg-clip-text text-transparent">
            shareable by design
          </span>
        </motion.h1>
        <motion.p variants={fadeInUp} className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Create rich content, generate unique public links, and track engagement with a polished dashboard
          experience inspired by the best SaaS products.
        </motion.p>
        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/signup">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#features">Learn More</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
