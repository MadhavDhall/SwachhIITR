"use client";

import { create } from "zustand";
import type {
  Bin,
  SensorReading,
  WasteScan,
  Route,
  Alert,
  Vehicle,
  ThresholdConfig,
  DashboardStats,
} from "@/types";
import {
  DEFAULT_THRESHOLDS,
  DEMO_ALERTS,
  DEMO_BINS,
  DEMO_ROUTES,
  DEMO_VEHICLES,
  DEMO_WASTE_SCANS,
} from "@/data/seed";

interface SwachhIITRState {
  bins: Bin[];
  scans: WasteScan[];
  routes: Route[];
  alerts: Alert[];
  vehicles: Vehicle[];
  thresholds: ThresholdConfig;
  stats: DashboardStats;
  selectedBinId: string | null;
  isSimulatingSensors: boolean;

  // Actions
  hydrate: () => Promise<void>;
  selectBin: (id: string | null) => void;
  updateBinFill: (binId: string, fillPct: number) => void;
  addSensorReading: (binId: string, distanceCm: number, fillPct: number) => void;
  addScan: (scan: WasteScan) => void;
  verifyScan: (scanId: string, verified: boolean, auditorName?: string) => void;
  acknowledgeAlert: (alertId: string, userName?: string) => void;
  optimizeRoutes: (params?: { maxThreshold?: number }) => Promise<void>;
  updateRouteStatus: (routeId: string, status: Route["status"]) => void;
  updateThresholds: (thresholds: Partial<ThresholdConfig>) => void;
  toggleSensorSimulation: () => void;
  simulateSinglePing: (binId?: string) => void;
}

export const useWasteStore = create<SwachhIITRState>((set, get) => ({
  bins: [],
  scans: [],
  routes: [],
  alerts: [],
  vehicles: [],
  thresholds: DEFAULT_THRESHOLDS,
  stats: {
    totalBins: 0,
    activeBins: 0,
    urgentBins: 0,
    totalScans: 0,
    totalCollections: 0,
    activeVehicles: 0,
    totalVehicles: 0,
    activeAlerts: 0,
    avgFillLevel: 0,
    collectionEfficiency: null,
  },
  selectedBinId: null,
  isSimulatingSensors: false,

  hydrate: async () => {
    const results = await Promise.allSettled([
      fetch("/api/bins"),
      fetch("/api/scans"),
      fetch("/api/routes"),
      fetch("/api/alerts"),
    ]);
    const payloads = await Promise.all(
      results.map(async (result) => {
        if (result.status === "rejected" || !result.value.ok) {
          return {};
        }
        return result.value.json();
      })
    );
    const [bins, scans, routes, alerts] = payloads;
    // Keep the operations UI useful when the hosted API is unavailable.
    // Successful API responses still take priority over local demo records.
    const nextBins = bins.bins?.length ? bins.bins : DEMO_BINS;
    const nextScans = scans.scans?.length ? scans.scans : DEMO_WASTE_SCANS;
    const nextRoutes = routes.routes?.length ? routes.routes : DEMO_ROUTES;
    const nextAlerts = alerts.alerts?.length ? alerts.alerts : DEMO_ALERTS;
    set({
      bins: nextBins,
      scans: nextScans,
      routes: nextRoutes,
      alerts: nextAlerts,
      vehicles: DEMO_VEHICLES,
      stats: {
        totalBins: nextBins.length,
        activeBins: nextBins.filter((bin: Bin) => bin.status === "active").length,
        urgentBins: nextBins.filter((bin: Bin) => (bin.currentFillPct ?? 0) >= 85).length,
        totalScans: scans.total ?? nextScans.length,
        totalCollections: 0,
        activeVehicles: DEMO_VEHICLES.filter((vehicle) => vehicle.status !== "offline").length,
        totalVehicles: DEMO_VEHICLES.length,
        activeAlerts: nextAlerts.filter((alert: Alert) => !alert.acknowledged).length,
        avgFillLevel: nextBins.length
          ? nextBins.reduce((sum: number, bin: Bin) => sum + (bin.currentFillPct ?? 0), 0) /
            nextBins.length
          : 0,
        collectionEfficiency: null,
      },
    });
  },

  selectBin: (id) => set({ selectedBinId: id }),

  updateBinFill: (binId, fillPct) =>
    set((state) => {
      const updatedBins = state.bins.map((bin) =>
        bin.id === binId
          ? {
              ...bin,
              currentFillPct: fillPct,
              lastReadingAt: new Date().toISOString(),
              predictedOverflowAt:
                fillPct > 85
                  ? new Date(Date.now() + 2 * 3600000).toISOString()
                  : bin.predictedOverflowAt,
            }
          : bin
      );
      return { bins: updatedBins };
    }),

  addSensorReading: (binId, distanceCm, fillPct) => {
    set((state) => {
      const updatedBins = state.bins.map((b) =>
        b.id === binId
          ? {
              ...b,
              currentFillPct: fillPct,
              lastReadingAt: new Date().toISOString(),
            }
          : b
      );

      // Check if threshold alert needed
      let updatedAlerts = [...state.alerts];
      if (fillPct >= state.thresholds.criticalFillPct) {
        const bin = state.bins.find((b) => b.id === binId);
        const existing = updatedAlerts.find(
          (a) => a.binId === binId && a.type === "overflow_imminent" && !a.acknowledged
        );
        if (!existing) {
          updatedAlerts.unshift({
            id: `alt_${Date.now()}`,
            type: "overflow_imminent",
            severity: "critical",
            binId,
            binLabel: bin?.label || binId,
            message: `Fill level surged to ${fillPct}%, critical overflow threshold reached`,
            acknowledged: false,
            acknowledgedBy: null,
            acknowledgedAt: null,
            createdAt: new Date().toISOString(),
          });
        }
      }

      return {
        bins: updatedBins,
        alerts: updatedAlerts,
      };
    });
  },

  addScan: (scan) =>
    set((state) => ({
      scans: [scan, ...state.scans],
      stats: {
        ...state.stats,
        totalScans: state.stats.totalScans + 1,
      },
    })),

  verifyScan: (scanId, verified, auditorName = "Operations Lead") =>
    set((state) => ({
      scans: state.scans.map((s) =>
        s.id === scanId
          ? {
              ...s,
              verificationStatus: verified ? "verified" : "rejected",
              verifiedBy: auditorName,
              verifiedAt: new Date().toISOString(),
            }
          : s
      ),
    })),

  acknowledgeAlert: (alertId, userName = "Operator") =>
    set((state) => {
      const updatedAlerts = state.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              acknowledged: true,
              acknowledgedBy: userName,
              acknowledgedAt: new Date().toISOString(),
            }
          : a
      );
      return {
        alerts: updatedAlerts,
        stats: {
          ...state.stats,
          activeAlerts: updatedAlerts.filter((a) => !a.acknowledged).length,
        },
      };
    }),

  optimizeRoutes: async (params) => {
    const response = await fetch("/api/routes/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ min_fill_threshold: params?.maxThreshold ?? 70 }),
    });
    if (!response.ok) {
      throw new Error("Unable to plan a campus collection route");
    }
    const result = await response.json();
    if (result.routes?.length) {
      set((state) => ({ routes: [...result.routes, ...state.routes] }));
    }
  },

  updateRouteStatus: (routeId, status) =>
    set((state) => ({
      routes: state.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              status,
              startedAt:
                status === "in_progress" && !r.startedAt
                  ? new Date().toISOString()
                  : r.startedAt,
              completedAt:
                status === "completed"
                  ? new Date().toISOString()
                  : r.completedAt,
            }
          : r
      ),
    })),

  updateThresholds: (newThresholds) =>
    set((state) => ({
      thresholds: { ...state.thresholds, ...newThresholds },
    })),

  toggleSensorSimulation: () =>
    set((state) => ({ isSimulatingSensors: !state.isSimulatingSensors })),

  simulateSinglePing: (targetBinId) => {
    const { bins, updateBinFill } = get();
    const target = targetBinId
      ? bins.find((b) => b.id === targetBinId)
      : bins[Math.floor(Math.random() * bins.length)];

    if (target) {
      const current = target.currentFillPct ?? 50;
      // Add a realistic 2-5% fill drift
      const delta = Math.floor(Math.random() * 6) - 1;
      const nextFill = Math.min(100, Math.max(5, current + delta));
      void fetch("/api/sensor-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binId: target.id,
          distanceCm: Math.max(0, target.capacityLiters * (1 - nextFill / 100) / 10),
          fillPct: nextFill,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save ping");
        }
        updateBinFill(target.id, nextFill);
      }).catch((error) => {
        console.error("Ping failed", error);
      });
    }
  },
}));
