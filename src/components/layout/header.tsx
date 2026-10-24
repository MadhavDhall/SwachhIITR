"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Broadcast,
  Lightning,
  Camera,
  CheckCircle,
  WarningCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/lib/auth/store";
import { useWasteStore } from "@/lib/store/waste-store";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useAuthStore();
  const { alerts, acknowledgeAlert, simulateSinglePing } = useWasteStore();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const handleSimulatePing = () => {
    simulateSinglePing();
    setPingSuccess(true);
    setTimeout(() => setPingSuccess(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-[#0b1f16]/85 backdrop-blur-md border-b border-emerald-200/10 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 mb-6">
      {/* Left: Environment Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SWACHH IITR OPERATIONS</span>
        </div>
        <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
          IIT Roorkee campus cleanliness network
        </span>
      </div>

      {/* Right: Actions and User Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Simulate Sensor Ping button */}
        <button
          onClick={handleSimulatePing}
          title="Record a campus bin reading"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
            pingSuccess
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white active:scale-95"
          )}
        >
          <Lightning size={14} weight="fill" className={pingSuccess ? "text-white" : "text-amber-400"} />
          <span className="hidden md:inline">{pingSuccess ? "Reading Saved!" : "Record Bin Reading"}</span>
        </button>

        {/* Quick Link to Scan */}
        <Link
          href="/scanner"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all active:scale-95 shadow-sm shadow-emerald-900/20"
        >
          <Camera size={14} weight="bold" />
          <span>Waste Image Review</span>
        </Link>

        {/* Alerts Button with Counter & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Alerts"
          >
            <Bell size={18} weight="regular" />
            {unacknowledgedAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-xs font-semibold text-white tracking-wide uppercase">
                  Active Alerts ({unacknowledgedAlerts.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live telemetry</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {unacknowledgedAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <span>All operational alerts resolved</span>
                  </div>
                ) : (
                  unacknowledgedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-2.5 rounded-lg border text-xs flex flex-col gap-1.5",
                        alert.severity === "critical"
                          ? "bg-red-950/40 border-red-800/40 text-red-200"
                          : alert.severity === "warning"
                          ? "bg-amber-950/40 border-amber-800/40 text-amber-200"
                          : "bg-slate-800/60 border-white/5 text-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <WarningCircle size={14} className={alert.severity === "critical" ? "text-red-400" : "text-amber-400"} />
                          {alert.binLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {alert.message}
                      </p>
                      <button
                        onClick={() => acknowledgeAlert(alert.id, user?.name ?? "Operator")}
                        className="self-end mt-1 px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role badge */}
        <div className="hidden sm:flex flex-col text-right pl-2 border-l border-white/10">
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
            {user?.name ?? "Priya Sharma"}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
            {user?.role ?? "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
