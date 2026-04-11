"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Eye, FileText, Share2 } from "lucide-react";
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
