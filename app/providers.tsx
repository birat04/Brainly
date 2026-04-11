"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
