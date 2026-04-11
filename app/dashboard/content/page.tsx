"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { pageVariants } from "@/lib/animations";
import { CreateContentDialog } from "@/components/dashboard/CreateContentDialog";
import { ContentTable } from "@/components/dashboard/ContentTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";

const PAGE_SIZE = 8;

export default function ContentPage() {
  const { contents, loading, fetchContents, deleteContent } = useContent();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    void fetchContents({
      type: type === "all" ? undefined : type,
      search: search.trim() || undefined,
    });
  }, [fetchContents, type, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contents.filter((c) => (q ? c.title.toLowerCase().includes(q) : true));
  }, [contents, search]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, type]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Library</p>
          <h2 className="text-3xl font-semibold tracking-tight">Your content</h2>
        </div>
        <CreateContentDialog />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="md:w-56">
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nothing here yet"
          description="Create your first item or adjust filters to see results."
        />
      ) : (
        <>
          <ContentTable
            items={pageItems}
            onDelete={deleteContent}
            onRefresh={() =>
              void fetchContents({
                type: type === "all" ? undefined : type,
                search: search.trim() || undefined,
              })
            }
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1 hover:bg-card disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1 hover:bg-card disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
