'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Content } from '@/types';
import { format } from 'date-fns';

interface ContentCardProps {
  content: Content;
  onDelete: (id: string) => Promise<void>;
  onShare: (content: Content) => void;
  loading?: boolean;
}

export function ContentCard({
  content,
  onDelete,
  onShare,
  loading = false,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    if (content.link) {
      navigator.clipboard.writeText(content.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(content.id);
    } finally {
      setDeleting(false);
    }
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      className="group relative p-6 rounded-xl border border-primary/10 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300 cursor-default"
    >
      {/* Content Type Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getTypeBadgeColor(content.type)}`}>
          <span>{getTypeIcon(content.type)}</span>
          <span className="capitalize">{content.type}</span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
            title="Copy link"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onShare(content)}
            className="h-8 w-8 p-0"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting || loading}
            className="h-8 w-8 p-0 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {content.title}
      </h3>

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {content.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-secondary/50 text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          {content.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              +{content.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <time className="text-xs text-muted-foreground">
          {format(new Date(content.createdAt), 'MMM d, yyyy')}
        </time>
        {content.link && (
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View →
          </a>
        )}
      </div>
    </motion.div>
  );
}
