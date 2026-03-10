'use client';

import { motion } from 'framer-motion';
import { Share2, Link as LinkIcon } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useState } from 'react';

export default function SharedPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Shared Content</h1>
                <p className="text-muted-foreground">
                  Manage and track your shared content links
                </p>
              </div>

              {/* Empty State */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-primary/20 bg-card/50"
              >
                <Share2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No shared links yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Share your content from the dashboard to create shareable links here
                </p>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
