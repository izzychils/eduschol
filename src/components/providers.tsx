"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { SessionProvider } from "@/lib/session";
import { StoreProvider } from "@/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SessionProvider>
        <StoreProvider>{children}</StoreProvider>
      </SessionProvider>
    </ToastProvider>
  );
}
