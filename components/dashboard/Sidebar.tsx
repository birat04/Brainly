"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Share2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Content", href: "/dashboard/content" },
  { icon: Share2, label: "Shared", href: "/dashboard/shared" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMd, setIsMd] = useState(true);
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsMd(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const width = isMd ? (collapsed ? 88 : 280) : 280;

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
      active ? "bg-primary text-white" : "text-muted-foreground hover:bg-card hover:text-white",
    );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X /> : <Menu />}
      </Button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <motion.aside
        initial={false}
        animate={{ width }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 glass",
          "max-md:transition-transform max-md:duration-300",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 p-4 md:p-6">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
              C
            </div>
            {!collapsed && (
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                Cortexly
              </span>
            )}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="border-b border-border/50 px-3 py-3">
          <WorkspaceSwitcher collapsed={collapsed && isMd} />
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <motion.div whileHover={{ scale: 1.02, x: 2 }} className={linkClass(active)}>
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 p-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      <div className="hidden shrink-0 md:block" style={{ width }} aria-hidden />
    </>
  );
}
