'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { CreateContentDialog } from '@/components/dashboard/CreateContentDialog';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { useAuth } from '@/hooks/useAuth';
import { useContent } from '@/hooks/useContent';
import { Content } from '@/types';
import { brainAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { content, loading, createContent, deleteContent } = useContent();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Close sidebar on mobile by default
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleCreateContent = async (data: { title: string; type: string; link?: string }) => {
    setCreating(true);
    try {
      await createContent(data);
    } finally {
      setCreating(false);
    }
  };

  const handleShare = async (contentItem: Content) => {
    // generate a share link via API and copy it to clipboard
    try {
      const response = await brainAPI.share({ contentIds: [contentItem.id] });
      const sharePath = response.data.shareLink;
      const link = `${window.location.origin}${sharePath}`;
      await navigator.clipboard.writeText(link);
      toast.success('Share link copied to clipboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create share link';
      toast.error(message);
    }
  };

  const stats = [
    { label: 'Total Content', value: content.length, icon: FileText },
    { label: 'Shared', value: Math.floor(content.length * 0.6), icon: Share2 },
    { label: 'Views', value: content.length * 47, icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome back, {user?.username || 'User'}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Here's what's happening with your content today
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="p-6 rounded-xl border border-primary/10 bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      </div>
                      <Icon className="w-10 h-10 text-primary/40" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your Content</h2>
                  <p className="text-muted-foreground">
                    {content.length} {content.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Content
                </Button>
              </div>

              {/* Content Grid or Empty State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      className="h-48 rounded-xl bg-card/50 border border-border"
                    />
                  ))}
                </div>
              ) : content.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {content.map((item) => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      onDelete={deleteContent}
                      onShare={handleShare}
                      loading={loading}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-primary/20 bg-card/50"
                >
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first piece of content to get started
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    Create Content
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Create Content Dialog */}
      <CreateContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateContent}
        loading={creating}
      />
    </div>
  );
}
