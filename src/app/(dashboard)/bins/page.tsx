"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  ListDashes,
  MagnifyingGlass,
  Funnel,
  Lightning,
  Clock,
  BatteryCharging,
  Broadcast,
  CheckCircle,
  WarningCircle,
  Truck,
  Trash,
  X,
  Gauge,
  Cpu,
} from "@phosphor-icons/react";
import { useWasteStore } from "@/lib/store/waste-store";
import { cn, getFillUrgency, getUrgencyColor } from "@/lib/utils";
import type { Bin } from "@/types";

// Dynamically load Map with SSR false to prevent Leaflet window errors
const BinMap = dynamic(() => import("@/components/bins/bin-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] rounded-xl bg-slate-900 flex items-center justify-center border border-white/10">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading Geospatial Fleet Map...</span>
      </div>
    </div>
  ),
});

export default function BinsPage() {
  const { bins, selectedBinId, selectBin, simulateSinglePing, updateBinFill } = useWasteStore();

  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  const selectedBin = bins.find((b) => b.id === selectedBinId) || null;

  // Filtered bins
  const filteredBins = bins.filter((bin) => {
    const matchesSearch =
      bin.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.zone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = zoneFilter === "all" || bin.zone === zoneFilter;

    let matchesUrgency = true;
    const fill = bin.currentFillPct ?? 0;
    if (urgencyFilter === "critical") matchesUrgency = fill >= 90;
    else if (urgencyFilter === "warning") matchesUrgency = fill >= 70 && fill < 90;
    else if (urgencyFilter === "normal") matchesUrgency = fill < 70;
    else if (urgencyFilter === "offline") matchesUrgency = bin.status === "offline";

    return matchesSearch && matchesZone && matchesUrgency;
  });

  const zones = Array.from(new Set(bins.map((b) => b.zone)));

  const handleSimulateBinPing = (binId: string) => {
    simulateSinglePing(binId);
  };

  const handleEmptyBin = (binId: string) => {
    updateBinFill(binId, 5);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              BinSync Geospatial Fleet
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              {bins.length} Smart Bins
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ultrasonic sensor telemetry, predictive volume forecasting, and spatial cluster tracking.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === "map"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <MapPin size={15} weight="bold" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === "list"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <ListDashes size={15} weight="bold" />
            <span>List Matrix</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, street, or zone..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        {/* Zone select */}
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">All Zones ({zones.length})</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>

        {/* Urgency select */}
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">All Urgencies</option>
          <option value="critical">Critical (&ge;90%)</option>
          <option value="warning">Warning (70-89%)</option>
          <option value="normal">Normal (&lt;70%)</option>
          <option value="offline">Offline Sensors</option>
        </select>

        <span className="text-xs font-mono text-slate-400 ml-auto">
          Showing {filteredBins.length} of {bins.length}
        </span>
      </div>

      {/* Main Container: Map or List with Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Map or List (8 Cols if selected, 12 if not) */}
        <div className={cn("transition-all duration-200", selectedBin ? "lg:col-span-8" : "lg:col-span-12")}>
          {viewMode === "map" ? (
            <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-2xl relative">
              <BinMap
                bins={filteredBins}
                selectedBin={selectedBin}
                onSelectBin={(bin) => selectBin(bin.id)}
              />
            </div>
          ) : (
            /* List Matrix View */
            <div className="rounded-xl bg-slate-900/40 border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-slate-950/60 font-mono text-slate-400">
                    <th className="p-3">Bin ID / Label</th>
                    <th className="p-3">Location & Zone</th>
                    <th className="p-3">Fill %</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Ultrasonic Distance</th>
                    <th className="p-3">Overflow Est.</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredBins.map((bin) => {
                    const fill = bin.currentFillPct ?? 0;
                    const urgency = getFillUrgency(fill);
                    const distanceCm = Math.round(100 - fill * 0.8);
                    const isSelected = selectedBin?.id === bin.id;

                    return (
                      <tr
                        key={bin.id}
                        onClick={() => selectBin(bin.id)}
                        className={cn(
                          "cursor-pointer hover:bg-white/[0.03] transition-colors",
                          isSelected && "bg-emerald-950/30"
                        )}
                      >
                        <td className="p-3 font-semibold text-white font-mono flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              urgency === "critical"
                                ? "bg-red-500 animate-pulse"
                                : urgency === "warning"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            )}
                          />
                          {bin.label}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-200">{bin.address}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{bin.zone}</div>
                        </td>
                        <td className="p-3 font-mono">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded font-bold",
                              urgency === "critical"
                                ? "bg-red-950/80 text-red-400 border border-red-700/50"
                                : urgency === "warning"
                                ? "bg-amber-950/80 text-amber-400 border border-amber-700/50"
                                : "bg-emerald-950/80 text-emerald-400 border border-emerald-700/50"
                            )}
                          >
                            {fill}%
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{bin.capacityLiters} L</td>
                        <td className="p-3 font-mono text-emerald-400">{distanceCm} cm</td>
                        <td className="p-3 font-mono text-slate-400">
                          {bin.predictedOverflowAt
                            ? `< ${Math.max(1, Math.round((new Date(bin.predictedOverflowAt).getTime() - Date.now()) / 3600000))} hrs`
                            : "Normal"}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateBinPing(bin.id);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-white/10 mr-1"
                          >
                            Ping
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Selected Bin Inspector Drawer (4 Cols) */}
        {selectedBin && (
          <div className="lg:col-span-4 rounded-xl bg-slate-900/70 border border-white/10 p-5 space-y-5 relative backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-mono">{selectedBin.label}</h2>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                      selectedBin.status === "active"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    {selectedBin.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedBin.address}</p>
              </div>
              <button
                onClick={() => selectBin(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ultrasonic Telemetry & Gauge */}
            <div className="p-4 rounded-lg bg-slate-950/80 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Fill Volume Level
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {selectedBin.currentFillPct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
                <div
                  style={{ width: `${selectedBin.currentFillPct}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    (selectedBin.currentFillPct ?? 0) >= 90
                      ? "bg-red-500"
                      : (selectedBin.currentFillPct ?? 0) >= 70
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04] text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">Sensor Distance</span>
                  <span className="text-emerald-400 font-semibold">
                    {Math.round(100 - (selectedBin.currentFillPct ?? 0) * 0.8)} cm
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Rated Volume</span>
                  <span className="text-slate-300 font-semibold">{selectedBin.capacityLiters} Liters</span>
                </div>
              </div>
            </div>

            {/* IoT Device Metrics */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Broadcast size={14} className="text-emerald-400" />
                  Sensor Node ID
                </span>
                <span className="text-slate-200">{selectedBin.sensorId || "ESP32-NODE-01"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <BatteryCharging size={14} className="text-emerald-400" />
                  Battery Level
                </span>
                <span className="text-slate-200">92% (LiFePO4)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  Predicted Overflow
                </span>
                <span className="text-amber-400 font-semibold">
                  {selectedBin.predictedOverflowAt
                    ? new Date(selectedBin.predictedOverflowAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "No overflow anticipated"}
                </span>
              </div>
            </div>

            {/* Actions for this bin */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSimulateBinPing(selectedBin.id)}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <Lightning size={14} weight="fill" />
                <span>Simulate Sensor Reading Ping</span>
              </button>

              <button
                onClick={() => handleEmptyBin(selectedBin.id)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all border border-white/10"
              >
                <Trash size={14} />
                <span>Mark as Collected (Reset to 5%)</span>
              </button>

              <Link
                href="/routes"
                className="w-full py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all border border-white/5"
              >
                <Truck size={14} />
                <span>Add to Collection Route</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
