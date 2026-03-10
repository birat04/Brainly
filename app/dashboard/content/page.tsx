'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Share2 } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateContentDialog } from '@/components/dashboard/CreateContentDialog';
import { useAuth } from '@/hooks/useAuth';
import { useContent } from '@/hooks/useContent';
import { format } from 'date-fns';

export default function ContentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { content, loading, createContent, deleteContent } = useContent();

  const handleCreateContent = async (data: { title: string; type: string; link?: string }) => {
    setCreating(true);
    try {
      await createContent(data);
    } finally {
      setCreating(false);
    }
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Content Library</h1>
                  <p className="text-muted-foreground">
                    Manage all your saved content
                  </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Add Content
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Content Table */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-16 rounded-lg bg-card/50 border border-border"
                    />
                  ))}
                </div>
              ) : filteredContent.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-card/50 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContent.map((item, i) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-border hover:bg-card/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium truncate max-w-xs">
                                {item.title}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {item.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {format(new Date(item.createdAt), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    if (item.link) {
                                      navigator.clipboard.writeText(item.link);
                                    }
                                  }}
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:text-destructive"
                                  onClick={() => deleteContent(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 px-6 rounded-xl border-2 border-dashed border-primary/20 bg-card/50"
                >
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'No content matches your search' : 'No content yet'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setDialogOpen(true)}>
                      Create Content
                    </Button>
                  )}
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
