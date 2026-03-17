"use client";

import { Toaster } from "sonner";
import { NuggetProvider } from "@/context/NuggetContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuggetProvider>
      {children}
      <Toaster richColors position="top-center" />
    </NuggetProvider>
  );
}
