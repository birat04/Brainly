"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import type { AppNotification } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const result = await notificationsAPI.list();
      setItems(result.data);
      setUnreadCount(result.unreadCount);
    } catch {
      /* ignore while logged out / loading */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 60_000);
    return () => clearInterval(id);
  }, [load]);

  const onOpen = async (open: boolean) => {
    if (open) await load();
  };

  const markAll = async () => {
    await notificationsAPI.markAllRead();
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  };

  const onClickItem = async (n: AppNotification) => {
    if (!n.readAt) {
      try {
        await notificationsAPI.markRead(n.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)),
        );
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <DropdownMenu onOpenChange={(o) => void onOpen(o)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 glass">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-xs font-normal text-primary hover:underline"
              onClick={() => void markAll()}
            >
              Mark all read
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          items.slice(0, 8).map((n) => (
            <DropdownMenuItem key={n.id} asChild className="cursor-pointer">
              <Link
                href={n.href || "/dashboard"}
                onClick={() => void onClickItem(n)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className={`text-sm ${n.readAt ? "text-muted-foreground" : "font-medium"}`}>
                  {n.title}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
