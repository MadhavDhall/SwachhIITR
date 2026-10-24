"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, initAuthFromStorage } from "@/lib/auth/store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }
    const stored = initAuthFromStorage();
    if (stored) {
      setUser(stored);
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router, setUser]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">Loading WasteOS...</p>
      </div>
    </div>
  );
}
