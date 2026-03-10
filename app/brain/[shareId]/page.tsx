'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Share2, Copy, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brainAPI } from '@/lib/api';
import { SharedBrain } from '@/types';
import { toast } from 'sonner';

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [data, setData] = useState<SharedBrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedBrain = async () => {
      try {
        setLoading(true);
        const response = await brainAPI.getShared(shareId);
        setData(response.data);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to load shared content';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedBrain();
  }, [shareId]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      article: '📄',
      link: '🔗',
      note: '📝',
      video: '🎥',
      image: '🖼️',
    };
    return icons[type] || '📌';
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      article: 'bg-blue-500/20 text-blue-400',
      link: 'bg-green-500/20 text-green-400',
      note: 'bg-yellow-500/20 text-yellow-400',
      video: 'bg-purple-500/20 text-purple-400',
      image: 'bg-pink-500/20 text-pink-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Share
              </>
            )}
          </Button>
        </div>
      </nav>

      {/* Loading State */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-32 rounded-lg bg-card/50 border border-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Content */}
      {data && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 py-12 space-y-8"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shared Brain</h1>
            <p className="text-muted-foreground text-lg">
              {data.owner?.username && `Shared by ${data.owner.username}`}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {data.content.length} {data.content.length === 1 ? 'item' : 'items'} shared
            </p>
          </div>

          {/* Content List */}
          {data.content.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {data.content.map((content, i) => (
                <motion.div
                  key={content.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="p-6 rounded-lg border border-primary/10 bg-card hover:border-primary/30 transition-all group"
                >
                  {/* Type Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium mb-4 ${getTypeBadgeColor(content.type)}`}>
                    <span>{getTypeIcon(content.type)}</span>
                    <span className="capitalize">{content.type}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {content.title}
                  </h3>

                  {/* Tags */}
                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-secondary/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Link Button */}
                  {content.link && (
                    <a
                      href={content.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition mt-4 font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      Open Link
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No content shared yet</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-16 text-center">
        <p className="text-muted-foreground">
          Shared with Brainly -{' '}
          <Link href="/" className="text-primary hover:underline">
            Create your own
          </Link>
        </p>
      </footer>
    </div>
  );
}
