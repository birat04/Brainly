"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { workspacesAPI } from "@/lib/api";
import { setAuthToken } from "@/lib/utils";
import type { Workspace } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  loading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setActiveWorkspaceId(null);
      setLoading(false);
      return;
    }
    try {
      const result = await workspacesAPI.list();
      setWorkspaces(result.data);
      setActiveWorkspaceId(result.activeWorkspaceId);
    } catch {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    void refreshWorkspaces();
  }, [refreshWorkspaces]);

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (workspaceId === activeWorkspaceId) return;
      try {
        const result = await workspacesAPI.switch(workspaceId);
        setAuthToken(result.token);
        setActiveWorkspaceId(result.workspaceId);
        toast.success("Workspace switched");
        // Reload dashboard data scoped to the new workspace
        window.location.reload();
      } catch {
        toast.error("Could not switch workspace");
      }
    },
    [activeWorkspaceId],
  );

  const value = useMemo(
    () => ({
      workspaces,
      activeWorkspaceId,
      loading,
      switchWorkspace,
      refreshWorkspaces,
    }),
    [workspaces, activeWorkspaceId, loading, switchWorkspace, refreshWorkspaces],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
