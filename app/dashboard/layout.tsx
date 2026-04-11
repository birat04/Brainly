import type { ReactNode } from "react";
import { ContentProvider } from "@/hooks/useContent";
import { DashboardTop } from "@/components/dashboard/DashboardTop";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ContentProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col md:pl-0">
          <DashboardTop />
          <div className="flex-1 px-4 py-8 md:px-8">{children}</div>
        </div>
      </div>
    </ContentProvider>
  );
}
