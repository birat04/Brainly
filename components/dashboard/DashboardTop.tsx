"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/dashboard/Header";

const titles: Record<string, { title: string; showSearch?: boolean }> = {
  "/dashboard": { title: "Dashboard" },
  "/dashboard/content": { title: "Content", showSearch: true },
  "/dashboard/shared": { title: "Shared links" },
  "/dashboard/team": { title: "Team" },
  "/dashboard/billing": { title: "Billing" },
  "/dashboard/settings": { title: "Settings" },
};

export function DashboardTop() {
  const pathname = usePathname();
  const meta = titles[pathname] ?? { title: "Dashboard" };
  return <Header title={meta.title} showSearch={meta.showSearch} />;
}
