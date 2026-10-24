"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, initAuthFromStorage } from "@/lib/auth/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useWasteStore } from "@/lib/store/waste-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [ready, setReady] = useState(false);
  const hydrate = useWasteStore((state) => state.hydrate);

  useEffect(() => {
    if (!isAuthenticated) {
      const stored = initAuthFromStorage();
      if (stored) {
        setUser(stored);
        setReady(true);
      } else {
        router.replace("/login");
      }
    } else {
      setReady(true);
    }
  }, [isAuthenticated, router, setUser]);

  useEffect(() => {
    if (ready) {
      hydrate().catch((error) => {
        console.error("Failed to load SwachhIITR data", error);
      });
    }
  }, [hydrate, ready]);

  if (!ready) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading SwachhIITR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex bg-[#0b1f16] text-slate-100">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] transition-all duration-300">
        <div className="p-4 lg:p-6 max-w-[1600px] min-h-[100dvh] flex flex-col">
          <Header />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
