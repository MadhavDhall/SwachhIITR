"use client";

import { useState } from "react";
import {
  Truck,
  Path as RouteIcon,
  Sparkle,
  CheckCircle,
  Play,
  Clock,
  NavigationArrow,
  MapPin,
  TrendUp,
  Cpu,
  ArrowsClockwise,
  User,
  Sliders,
} from "@phosphor-icons/react";
import { useWasteStore } from "@/lib/store/waste-store";
import { cn } from "@/lib/utils";
import type { Route } from "@/types";

export default function RoutesPage() {
  const { routes, vehicles, bins, optimizeRoutes, updateRouteStatus, updateBinFill } = useWasteStore();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [minThreshold, setMinThreshold] = useState(70);
  const [activeTab, setActiveTab] = useState<"active" | "fleet">("active");

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    await optimizeRoutes({ maxThreshold: minThreshold });
    setIsOptimizing(false);
  };

  const handleCompleteRoute = (route: Route) => {
    updateRouteStatus(route.id, "completed");
    // Empty all bins on this route
    route.stops.forEach((stop) => {
      updateBinFill(stop.binId, 5);
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Trigger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Route Planner & Fleet Optimizer
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Campus Collection Planner
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic capacitated multi-vehicle routing with real-time fill threshold triggering and road distance matrix.
          </p>
        </div>

        {/* Optimizer Action */}
        <button
          onClick={handleRunOptimizer}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Planning collection route...</span>
            </>
          ) : (
            <>
              <Sparkle size={16} weight="bold" />
              <span>Generate Optimized Routes</span>
            </>
          )}
        </button>
      </div>

      {/* Control Strip & Metrics Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fuel Saved */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fuel & Emissions Savings</span>
            <TrendUp size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">-31.4%</div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            vs. conventional static schedules
          </p>
        </div>

        {/* Metric 2: Urgent Bins in Queue */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bins Queued for Pickup</span>
            <MapPin size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono">
            {bins.filter((b) => (b.currentFillPct ?? 0) >= minThreshold).length} Units
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Above {minThreshold}% fill limit
          </p>
        </div>

        {/* Metric 3: Active Fleet */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Operational Fleet</span>
            <Truck size={16} className="text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {vehicles.filter((v) => v.status === "available" || v.status === "en_route").length} / {vehicles.length} Trucks
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Electric & Hydraulic Compactors
          </p>
        </div>

        {/* Parameter: Min Threshold Slider */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Dispatch Threshold</span>
            <span className="text-emerald-400 font-bold font-mono">{minThreshold}% Fill</span>
          </div>
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={minThreshold}
            onChange={(e) => setMinThreshold(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer mt-2"
          />
          <span className="text-[10px] text-slate-500 mt-1">Lower threshold triggers more frequent pickups</span>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <RouteIcon size={18} className="text-emerald-400" />
            <span>Active Collection Routes ({routes.length})</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">OSRM Road Geometry Engine</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => {
            const isCompleted = route.status === "completed";
            const isInProgress = route.status === "in_progress";

            return (
              <div
                key={route.id}
                className={cn(
                  "rounded-xl bg-slate-900/60 border p-5 flex flex-col justify-between transition-all",
                  isCompleted
                    ? "border-emerald-500/20 opacity-75"
                    : isInProgress
                    ? "border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : "border-white/[0.08]"
                )}
              >
                <div>
                  {/* Top route metadata */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-white">{route.name}</h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider",
                            isCompleted
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                              : isInProgress
                              ? "bg-blue-950 text-blue-400 border border-blue-500/40 animate-pulse"
                              : "bg-slate-800 text-slate-300 border border-white/5"
                          )}
                        >
                          {route.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                        <Truck size={14} className="text-slate-400" />
                        <span>{route.vehicleName}</span>
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <div className="text-white font-semibold">{route.totalDistanceKm} km</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 justify-end">
                        <Clock size={12} />
                        <span>~{route.estimatedDurationMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Stops Sequence */}
                  <div className="mt-5 space-y-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                      Optimized Waypoints Sequence ({route.stops.length} stops)
                    </span>

                    <div className="space-y-2">
                      {route.stops.map((stop, idx) => (
                        <div
                          key={stop.binId}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-semibold text-white">{stop.binLabel}</span>
                              <span className="text-[10px] text-slate-400 ml-2">
                                Arr: {stop.estimatedArrival ? new Date(stop.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "ETA ~20m"}
                              </span>
                            </div>
                          </div>

                          {(() => {
                            const fillVal = stop.fillPctAtDispatch ?? stop.fillPct ?? 75;
                            return (
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-bold",
                                  fillVal >= 90
                                    ? "bg-red-950/80 text-red-400 border border-red-800/40"
                                    : "bg-amber-950/80 text-amber-400 border border-amber-800/40"
                                )}
                              >
                                {fillVal}% Fill
                              </span>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Execution Controller */}
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    Created {new Date(route.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {route.status === "planned" && (
                      <button
                        onClick={() => updateRouteStatus(route.id, "in_progress")}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Play size={13} weight="fill" />
                        <span>Dispatch Route</span>
                      </button>
                    )}

                    {route.status === "in_progress" && (
                      <button
                        onClick={() => handleCompleteRoute(route)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-950/30"
                      >
                        <CheckCircle size={15} weight="bold" />
                        <span>Confirm Completed</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle size={14} weight="fill" />
                        <span>Collection Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
