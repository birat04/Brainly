"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { contentAPI } from "@/lib/api";
import type { SharedContentPublic } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/marketing/Navbar";

export default function PublicBrainPage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId;
  const [data, setData] = useState<SharedContentPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await contentAPI.getShared(shareId);
        setData(res);
      } catch {
        setError("This link is invalid or no longer public.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-16">
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-8 w-2/3 rounded-md" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
          <div>
            <p className="text-sm font-semibold text-primary">Cortexly</p>
            <h1 className="mt-3 text-3xl font-semibold">Content unavailable</h1>
            <p className="mt-3 text-muted-foreground">{error}</p>
          </div>
          <Button asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative overflow-hidden px-4 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_55%)]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto max-w-3xl space-y-8"
        >
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="capitalize">
              {data.type}
            </Badge>
            <span>{formatDate(data.createdAt)}</span>
            {data.author ? <span>by @{data.author.username}</span> : null}
          </div>

          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{data.title}</h1>
            {data.description ? (
              <p className="mt-4 text-lg text-muted-foreground">{data.description}</p>
            ) : null}
          </div>

          <Card className="glass border-border/60">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              {data.url ? (
                <a href={data.url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  {data.url}
                </a>
              ) : null}
              {data.body ? <p className="whitespace-pre-wrap text-foreground">{data.body}</p> : null}
              {data.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">{data.viewCount} views</p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Create your own Brain</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">Learn more</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
