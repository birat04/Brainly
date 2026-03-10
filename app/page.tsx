'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Share2, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-sm bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-lg">Brainly</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">
              How It Works
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/signin')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
            <p className="text-sm text-primary font-medium">Welcome to Brainly</p>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Manage & Share Your Content
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400">
              {' '}Effortlessly
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Securely create, organize, and share your knowledge with unique shareable links. Perfect for creators, teams, and professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/signup')} className="px-8">
              Start Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/signin')}>
              Sign In
            </Button>
          </div>
        </motion.div>

        {/* Floating Cards Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 relative h-96 hidden lg:block"
        >
          <div className="absolute top-10 left-20 w-64 h-40 rounded-2xl bg-card border border-primary/20 p-6 shadow-xl backdrop-blur">
            <div className="w-8 h-8 rounded bg-primary/20 mb-4" />
            <div className="space-y-3">
              <div className="h-2 bg-primary/20 rounded w-3/4" />
              <div className="h-2 bg-primary/20 rounded w-1/2" />
            </div>
          </div>
          <div className="absolute bottom-10 right-20 w-64 h-40 rounded-2xl bg-card border border-primary/20 p-6 shadow-xl backdrop-blur">
            <div className="w-8 h-8 rounded bg-primary/20 mb-4" />
            <div className="space-y-3">
              <div className="h-2 bg-primary/20 rounded w-3/4" />
              <div className="h-2 bg-primary/20 rounded w-1/2" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to manage and share content</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Shield, title: 'Secure Sharing', desc: 'Share content with unique, secure links' },
              { icon: Lock, title: 'Privacy First', desc: 'Control who sees your shared content' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Instant access and seamless experience' },
              { icon: Share2, title: 'Easy Collaboration', desc: 'Share with teams and manage permissions' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={item}
                className="group p-6 rounded-xl border border-primary/10 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300 cursor-pointer"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create', desc: 'Add your content with a simple form' },
              { step: '2', title: 'Organize', desc: 'Manage and organize your content library' },
              { step: '3', title: 'Share', desc: 'Generate shareable links instantly' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-12 w-24 h-1 bg-gradient-to-r from-primary/40 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you need</p>
          </div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full md:w-96 p-8 rounded-2xl border border-primary/20 bg-card hover:border-primary/40 transition-colors"
            >
              <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
              <p className="text-muted-foreground mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                {['Unlimited content', 'Shareable links', 'Basic analytics', 'Community support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" onClick={() => router.push('/signup')}>
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8">Join thousands of creators and teams using Brainly.</p>
          <Button size="lg" onClick={() => router.push('/signup')} className="px-8">
            Start Free Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 md:px-8 bg-card/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="font-semibold">Brainly</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 Brainly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
