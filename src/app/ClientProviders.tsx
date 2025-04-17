"use client";
import { AppStateProvider } from "@/contexts/AppStateContext";
import ConvexClientProvider from "./providers";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <AppStateProvider>
        {children}
      </AppStateProvider>
    </ConvexClientProvider>
  );
}
