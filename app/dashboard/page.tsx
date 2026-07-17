"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Eye, FileText, Share2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useContent } from "@/hooks/useContent";
import { statsAPI } from "@/lib/api";
import { pageVariants } from "@/lib/animations";
import type { DashboardStats } from "@/types";
import { CreateContentDialog } from "@/components/dashboard/CreateContentDialog";
import { ContentCard } from "@/components/dashboard/ContentCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { contents, loading, fetchContents, deleteContent, shareContent } = useContent();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    void fetchContents();
  }, [fetchContents]);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await statsAPI.get();
        setStats(data);
      } catch {
        setStats({ totalContent: 0, sharedContent: 0, totalViews: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    void run();
  }, []);

  const recent = useMemo(() => contents.slice(0, 5), [contents]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Overview</p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
          </h2>
          <p className="mt-2 text-muted-foreground">Here is how your workspace is performing.</p>
        </div>
        <CreateContentDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatsCard title="Total content" value={stats?.totalContent ?? 0} icon={FileText} />
            <StatsCard title="Shared links" value={stats?.sharedContent ?? 0} icon={Share2} />
            <StatsCard title="Total views" value={stats?.totalViews ?? 0} icon={Eye} />
            <StatsCard title="Recent activity" value={recent.length} icon={Activity} hint="Latest items in feed" />
          </>
        )}
      </div>

      {stats && !statsLoading ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Plan: <span className="capitalize">{stats.plan ?? "free"}</span>
              {stats.pastDue ? (
                <span className="ml-2 text-destructive">(payment past due)</span>
              ) : null}
            </p>
            <p className="text-sm text-muted-foreground">
              {stats.totalContent}
              {stats.contentLimit != null ? ` / ${stats.contentLimit}` : " / ∞"} content items used
            </p>
            {stats.contentLimit != null ? (
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, Math.round((stats.totalContent / stats.contentLimit) * 100))}%`,
                  }}
                />
              </div>
            ) : null}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/billing">Manage billing</Link>
          </Button>
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent content</h3>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No content yet"
            description="Create your first note, article, or link to see it appear here."
            actionLabel="Go to content"
            onAction={() => router.push("/dashboard/content")}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map((c) => (
              <ContentCard
                key={c.id}
                content={c}
                onShare={() => void shareContent(c.id)}
                onDelete={() => setPendingDelete(c.id)}
              />
            ))}
          </div>
        )}
      </section>

      <AlertDialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) void deleteContent(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
