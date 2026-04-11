"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Link2, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { contentAPI } from "@/lib/api";
import { copyToClipboard } from "@/lib/utils";
import { pageVariants } from "@/lib/animations";
import type { Content } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function SharedPage() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await contentAPI.getSharedList();
      setItems(data);
    } catch {
      toast.error("Failed to load shared items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const copyLink = async (shareId: string) => {
    const url = `${window.location.origin}/brain/${shareId}`;
    await copyToClipboard(url);
    toast.success("Link copied");
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Distribution</p>
        <h2 className="text-3xl font-semibold tracking-tight">Shared links</h2>
        <p className="mt-2 text-muted-foreground">
          Manage visibility, copy URLs, and revoke access when you need to.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="glass border-dashed border-border/70">
          <CardHeader>
            <CardTitle>No shared items</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Generate a share link from the content table to see it listed here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="glass border-border/60">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">
                      {item.type}
                    </Badge>
                    <span>{item.viewCount} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Public</span>
                  <Switch
                    checked={item.isPublic}
                    onCheckedChange={async (checked) => {
                      try {
                        const updated = await contentAPI.updateShareState(item.id, { isPublic: checked });
                        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                      } catch {
                        toast.error("Could not update visibility");
                      }
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => void copyLink(item.shareId!)}>
                  <Copy className="h-4 w-4" />
                  Copy link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="gap-2 text-destructive"
                  onClick={async () => {
                    try {
                      await contentAPI.updateShareState(item.id, { isPublic: false, revoke: true });
                      toast.success("Share revoked");
                      await load();
                    } catch {
                      toast.error("Could not revoke");
                    }
                  }}
                >
                  <ShieldOff className="h-4 w-4" />
                  Revoke
                </Button>
                <div className="flex flex-1 items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" />
                  <span className="truncate">/brain/{item.shareId}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
