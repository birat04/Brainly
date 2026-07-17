"use client";

import { ChevronsUpDown, Check } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { workspaces, activeWorkspaceId, switchWorkspace, loading } = useWorkspace();
  const active = workspaces.find((w) => w.id === activeWorkspaceId);

  if (loading && workspaces.length === 0) {
    return (
      <div className={cn("rounded-lg bg-card/50 px-3 py-2 text-xs text-muted-foreground", collapsed && "px-2")}>
        {collapsed ? "…" : "Loading…"}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full justify-between gap-2 rounded-lg border border-border/50 bg-card/40 px-3 py-2 text-left font-normal hover:bg-card",
            collapsed && "justify-center px-2",
          )}
          aria-label="Switch workspace"
        >
          <span className="min-w-0 flex-1 truncate text-sm">
            {collapsed ? (active?.name?.[0] ?? "W") : active?.name ?? "Workspace"}
          </span>
          {!collapsed ? <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" /> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => void switchWorkspace(ws.id)}
            className="flex items-center justify-between gap-2"
          >
            <span className="truncate">
              {ws.name}
              <span className="ml-1 text-xs text-muted-foreground">({ws.role})</span>
            </span>
            {ws.id === activeWorkspaceId ? <Check className="h-4 w-4 shrink-0" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
