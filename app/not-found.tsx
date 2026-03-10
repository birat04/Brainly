'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-40 left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-8"
        >
          <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400 mb-4">
            404
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/')}
            className="gap-2 px-6"
            size="lg"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="gap-2 px-6"
            size="lg"
          >
            Go Back
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
