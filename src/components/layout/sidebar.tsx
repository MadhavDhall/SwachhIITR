"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HouseLine,
  Camera,
  MapPin,
  Path,
  BookOpen,
  ChartBar,
  GearSix,
  SignOut,
  List,
  X,
  Recycle,
  Bell,
  CaretLeft,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth/store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Command Center", icon: HouseLine },
  { href: "/scanner", label: "WasteDNA", icon: Camera },
  { href: "/bins", label: "BinSync", icon: MapPin },
  { href: "/routes", label: "Route Planner", icon: Path },
  { href: "/ledger", label: "Waste Ledger", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: ChartBar },
  { href: "/settings", label: "Settings", icon: GearSix },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-colors"
        aria-label="Open navigation"
      >
        <List size={20} weight="bold" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col",
          "bg-slate-950 border-r border-white/[0.06]",
          "transition-all duration-300 ease-out",
          collapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <Recycle size={18} weight="bold" className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                WasteOS
              </span>
              <span className="text-[10px] text-emerald-500/80 font-mono tracking-wide uppercase">
                Operations
              </span>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "text-white/50 hover:text-white/90 hover:bg-white/[0.04]",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  size={20}
                  weight={isActive ? "fill" : "regular"}
                  className="flex-shrink-0"
                />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center h-10 mx-2 mb-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CaretLeft
            size={16}
            className={cn(
              "transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>

        {/* User section */}
        <div className="border-t border-white/[0.06] px-3 py-3 flex-shrink-0">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white/80">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") ?? "?"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">
                  {user?.name ?? "Guest"}
                </p>
                <p className="text-[11px] text-white/40 capitalize">
                  {user?.role ?? "unknown"}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded-md hover:bg-white/[0.04]"
                title="Sign out"
              >
                <SignOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
