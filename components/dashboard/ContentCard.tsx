"use client";

import { formatDate } from "@/lib/utils";
import type { Content } from "@/types";
import { motion } from "framer-motion";
import { ExternalLink, Share2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ContentCardProps {
  content: Content;
  onShare: () => void;
  onDelete: () => void;
}

export function ContentCard({ content, onShare, onDelete }: ContentCardProps) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group glass relative overflow-hidden border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="secondary" className="capitalize">
                {content.type}
              </Badge>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{content.title}</h3>
            </div>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button size="icon" variant="ghost" onClick={onShare} aria-label="Share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          {content.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          {content.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {content.tags.map((t) => (
                <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(content.createdAt)}</span>
          {content.url ? (
            <a
              href={content.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span>{content.viewCount} views</span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
