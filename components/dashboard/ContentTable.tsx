"use client";

import { formatDate } from "@/lib/utils";
import type { Content } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Pencil, Share2, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { contentAPI } from "@/lib/api";

interface ContentTableProps {
  items: Content[];
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export function ContentTable({ items, onDelete, onRefresh }: ContentTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Content | null>(null);

  const share = async (c: Content) => {
    try {
      const { url } = await contentAPI.generateShareLink(c.id);
      await copyToClipboard(url);
      toast.success("Link copied to clipboard");
      onRefresh();
    } catch {
      toast.error("Could not create share link");
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {c.type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <div className="flex flex-wrap gap-1">
                    {c.tags?.slice(0, 4).map((t) => (
                      <span key={t} className="text-xs text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" aria-label="Share" onClick={() => void share(c)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {c.shareId ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Copy link"
                        onClick={async () => {
                          const base = window.location.origin;
                          await copyToClipboard(`${base}/brain/${c.shareId}`);
                          toast.success("Copied");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this content?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item will be removed from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteId) return;
                try {
                  await onDelete(deleteId);
                } catch {
                  toast.error("Delete failed");
                } finally {
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <AlertDialogContent className="glass sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Quick edit</AlertDialogTitle>
            <AlertDialogDescription>Update the title and description for this item.</AlertDialogDescription>
          </AlertDialogHeader>
          {editing ? (
            <QuickEditForm
              content={editing}
              onDone={() => {
                setEditing(null);
                onRefresh();
              }}
            />
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function QuickEditForm({ content, onDone }: { content: Content; onDone: () => void }) {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description ?? "");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await contentAPI.update(content.id, { title, description });
          toast.success("Saved");
          onDone();
        } catch {
          toast.error("Update failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel type="button">Close</AlertDialogCancel>
        <Button type="submit" disabled={loading}>
          Save
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
