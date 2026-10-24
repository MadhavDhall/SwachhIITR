"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trash,
  WarningCircle,
  Camera,
  Truck,
  CheckCircle,
  ArrowRight,
  Broadcast,
  Lightning,
  Sparkle,
  TrendUp,
  MapPin,
  Clock,
  BatteryCharging,
  Cpu,
} from "@phosphor-icons/react";
import { useWasteStore } from "@/lib/store/waste-store";
import { cn, formatDistanceToNow, getFillUrgency } from "@/lib/utils";

export default function DashboardPage() {
  const {
    bins,
    scans,
    routes,
    alerts,
    stats,
    simulateSinglePing,
  } = useWasteStore();

  const [simulating, setSimulating] = useState(false);

  // Derived stats
  const urgentBins = bins
    .filter((b) => (b.currentFillPct ?? 0) >= 70)
    .sort((a, b) => (b.currentFillPct ?? 0) - (a.currentFillPct ?? 0));

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const activeRoutes = routes.filter((r) => r.status === "in_progress" || r.status === "planned");
  const recentScans = scans.slice(0, 4);

  const handleQuickPing = (binId: string) => {
    setSimulating(true);
    simulateSinglePing(binId);
    setTimeout(() => setSimulating(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time urban telemetry, AI waste stream inference, and dynamic fleet dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/scanner"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-emerald-950/40"
          >
            <Camera size={16} weight="bold" />
            <span>Launch WasteDNA</span>
          </Link>
          <Link
            href="/routes"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 hover:text-white border border-white/10 text-xs font-semibold tracking-wide transition-all"
          >
            <Truck size={16} weight="bold" />
            <span>Dispatch Fleet</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Bins & Network */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Monitored Bins</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Trash size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{bins.length}</span>
            <span className="text-xs text-emerald-400 flex items-center font-mono">
              <TrendUp size={12} className="mr-0.5" /> 100% telemetry online
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.04] pt-2">
            <span>Avg Fill: {stats.avgFillLevel.toFixed(1)}%</span>
            <span className="font-mono text-emerald-400">{bins.filter(b => b.status === "active").length} active sensors</span>
          </div>
        </div>

        {/* KPI 2: Overflow Risk */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Overflow Critical (&ge;70%)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <WarningCircle size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-amber-400">{urgentBins.length}</span>
            <span className="text-xs text-slate-400">
              of {bins.length} units
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.04] pt-2">
            <span>Immediate dispatch needed</span>
            <span className="text-amber-400 font-mono font-medium">{activeAlerts.length} active alerts</span>
          </div>
        </div>

        {/* KPI 3: WasteDNA Detection */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Inferred Scans</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Sparkle size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{scans.length}</span>
            <span className="text-xs text-teal-400 flex items-center font-mono">
              98.2% accuracy
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.04] pt-2">
            <span>Verified: {scans.filter(s => s.verificationStatus === "verified").length}</span>
            <span className="text-slate-400 font-mono">YOLOv8 Edge model</span>
          </div>
        </div>

        {/* KPI 4: Fleet Utilization */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Route Efficiency</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Truck size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">87.2%</span>
            <span className="text-xs text-blue-400 flex items-center font-mono">
              -31% fuel burned
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.04] pt-2">
            <span>Active Routes: {activeRoutes.length}</span>
            <span className="font-mono text-blue-400">OR-Tools VRP</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Bins Matrix & Live IoT Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Attention Matrix */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/40 border border-white/[0.08] p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span>Priority Collection Queue</span>
                <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-[11px] font-mono">
                  {urgentBins.length} Requires Action
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bins flagged by ultrasonic sensors nearing max volume capacity
              </p>
            </div>
            <Link
              href="/bins"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>View Full Fleet</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06] flex-1">
            {urgentBins.map((bin) => {
              const fill = bin.currentFillPct ?? 0;
              const urgency = getFillUrgency(fill);
              return (
                <div
                  key={bin.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 border",
                        fill >= 90
                          ? "bg-red-950/60 border-red-700/50 text-red-400"
                          : "bg-amber-950/60 border-amber-700/50 text-amber-400"
                      )}
                    >
                      {fill}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          {bin.label}
                        </span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                          {bin.zone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[280px]">
                        {bin.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    {/* Time to overflow */}
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-end font-mono">
                        <Clock size={12} className="text-slate-400" />
                        <span>Overflow:</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-400 font-mono">
                        {bin.predictedOverflowAt
                          ? `< ${Math.max(1, Math.round((new Date(bin.predictedOverflowAt).getTime() - Date.now()) / 3600000))}h`
                          : "Imminent"}
                      </span>
                    </div>

                    {/* Sensor ping trigger */}
                    <button
                      onClick={() => handleQuickPing(bin.id)}
                      disabled={simulating}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all active:scale-95 flex items-center gap-1.5"
                      title="Trigger instantaneous sensor ping via simulated MQTT"
                    >
                      <Lightning size={13} className="text-amber-400" />
                      <span>Ping</span>
                    </button>

                    <Link
                      href={`/routes`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all"
                    >
                      Dispatch
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Live IoT Telemetry & Sensor Simulator */}
        <div className="rounded-xl bg-slate-900/40 border border-white/[0.08] p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <Broadcast size={18} className="text-emerald-400" />
                <span>ESP32 Sensor Telemetry</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live simulated MQTT stream over AWS IoT Core topic <code className="text-emerald-400 font-mono">wasteos/sensors/+/data</code>
              </p>
            </div>
          </div>

          {/* Quick simulator status */}
          <div className="my-4 p-3 rounded-lg bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Sensor Model:</span>
              <span className="font-mono text-slate-200">ESP32 + HC-SR04</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">MQTT Broker:</span>
              <span className="font-mono text-emerald-400">iot.eu-west-1.amazonaws.com</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Sampling Rate:</span>
              <span className="font-mono text-slate-200">Every 15 mins (Simulated)</span>
            </div>
          </div>

          {/* Real-time reading logs */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
            {bins.slice(0, 5).map((bin) => {
              const distanceCm = Math.round(100 - (bin.currentFillPct ?? 0) * 0.8);
              return (
                <div
                  key={bin.id}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-white/[0.04] flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-200 font-semibold">{bin.label}</span>
                  </div>
                  <div className="text-right text-slate-400">
                    <span className="text-emerald-400 font-semibold">{distanceCm} cm</span>
                    <span className="mx-1.5 opacity-30">|</span>
                    <span className="text-slate-300">{bin.currentFillPct}% fill</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/[0.06] mt-4">
            <Link
              href="/settings"
              className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Cpu size={14} />
              <span>Configure IoT Simulator & Topics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: WasteDNA AI Recent Scans Preview */}
      <div className="rounded-xl bg-slate-900/40 border border-white/[0.08] p-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Sparkle size={18} className="text-emerald-400" />
              <span>WasteDNA Recent Inferences</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-object bounding boxes, class counts, and automated material recommendations
            </p>
          </div>
          <Link
            href="/ledger"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>Audit Waste Ledger</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {recentScans.map((scan) => (
            <div
              key={scan.id}
              className="rounded-xl bg-slate-900/60 border border-white/[0.06] p-3 flex flex-col group hover:border-emerald-500/30 transition-all"
            >
              {/* Scan Thumbnail with Simulated Bounding Box Overlay */}
              <div className="relative aspect-[4/3] rounded-lg bg-slate-950 overflow-hidden border border-white/5 flex items-center justify-center">
                <img
                  src={scan.imageUrl}
                  alt="Waste scan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Simulated Bounding Box Overlay */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono text-emerald-300">
                  {scan.totalObjects} objects detected
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-white/90">
                    {(scan.averageConfidence * 100).toFixed(0)}% conf
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-medium font-mono uppercase tracking-wider",
                      scan.verificationStatus === "verified"
                        ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-400"
                        : "bg-amber-950/80 border border-amber-500/40 text-amber-400"
                    )}
                  >
                    {scan.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Class breakdown */}
              <div className="mt-3 space-y-1.5 flex-1">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(scan.classCounts).map(([cls, count]) => (
                    <span
                      key={cls}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-white/5 capitalize"
                    >
                      {cls}: {count}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic line-clamp-1 pt-1">
                  "{scan.notes || "Autonomous vision detection"}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
                <span>By {scan.scannedBy}</span>
                <span className="font-mono">{new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
