"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { contentAPI } from "@/lib/api";
import { copyToClipboard } from "@/lib/utils";
import type { Content } from "@/types";

interface ContentContextValue {
  contents: Content[];
  loading: boolean;
  fetchContents: (filters?: { type?: string; search?: string }) => Promise<void>;
  createContent: (data: {
    title: string;
    description?: string;
    type: string;
    tags: string[];
    url?: string;
    body?: string;
  }) => Promise<Content>;
  updateContentLocal: (content: Content) => void;
  deleteContent: (id: string) => Promise<void>;
  shareContent: (id: string) => Promise<string>;
  toggleShare: (
    id: string,
    body: { isPublic: boolean; revoke?: boolean },
  ) => Promise<Content>;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContents = useCallback(async (filters?: { type?: string; search?: string }) => {
    setLoading(true);
    try {
      const data = await contentAPI.getAll(filters);
      setContents(data);
    } catch {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  const createContent = useCallback(
    async (data: {
      title: string;
      description?: string;
      type: string;
      tags: string[];
      url?: string;
      body?: string;
    }) => {
      try {
        const created = await contentAPI.create(data);
        setContents((prev) => [created, ...prev]);
        toast.success("Content created successfully");
        return created;
      } catch (error: unknown) {
        const message =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(message || "Failed to create content");
        throw error;
      }
    },
    [],
  );

  const updateContentLocal = useCallback((content: Content) => {
    setContents((prev) => prev.map((c) => (c.id === content.id ? content : c)));
  }, []);

  const deleteContent = useCallback(async (id: string) => {
    try {
      await contentAPI.delete(id);
      setContents((prev) => prev.filter((c) => c.id !== id));
      toast.success("Content deleted");
    } catch {
      toast.error("Failed to delete content");
    }
  }, []);

  const shareContent = useCallback(async (id: string) => {
    try {
      const { shareId, url } = await contentAPI.generateShareLink(id);
      await copyToClipboard(url);
      toast.success("Link copied to clipboard!");
      setContents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, shareId, isPublic: true, updatedAt: new Date().toISOString() } : c,
        ),
      );
      return shareId;
    } catch {
      toast.error("Failed to generate share link");
      throw new Error("share failed");
    }
  }, []);

  const toggleShare = useCallback(async (id: string, body: { isPublic: boolean; revoke?: boolean }) => {
    try {
      const updated = await contentAPI.updateShareState(id, body);
      setContents((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(body.revoke ? "Share link revoked" : "Sharing updated");
      return updated;
    } catch {
      toast.error("Failed to update sharing");
      throw new Error("toggle share failed");
    }
  }, []);

  const value = useMemo(
    () => ({
      contents,
      loading,
      fetchContents,
      createContent,
      updateContentLocal,
      deleteContent,
      shareContent,
      toggleShare,
    }),
    [
      contents,
      loading,
      fetchContents,
      createContent,
      updateContentLocal,
      deleteContent,
      shareContent,
      toggleShare,
    ],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return ctx;
}
