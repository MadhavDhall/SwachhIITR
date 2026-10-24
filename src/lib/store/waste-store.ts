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
  DEMO_BINS,
  DEMO_WASTE_SCANS as DEMO_SCANS,
  DEMO_ROUTES,
  DEMO_ALERTS,
  DEMO_VEHICLES,
  DEFAULT_THRESHOLDS,
  DEMO_DASHBOARD_STATS,
} from "@/data/seed";

interface WasteOSState {
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

export const useWasteStore = create<WasteOSState>((set, get) => ({
  bins: DEMO_BINS,
  scans: DEMO_SCANS,
  routes: DEMO_ROUTES,
  alerts: DEMO_ALERTS,
  vehicles: DEMO_VEHICLES,
  thresholds: DEFAULT_THRESHOLDS,
  stats: DEMO_DASHBOARD_STATS,
  selectedBinId: null,
  isSimulatingSensors: false,

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
    // Simulate real OR-Tools VRP / TSP optimization calculation
    await new Promise((resolve) => setTimeout(resolve, 800));

    set((state) => {
      // Pick bins above 70% fill for collection
      const urgentBins = state.bins.filter(
        (b) => (b.currentFillPct ?? 0) >= (params?.maxThreshold ?? 70)
      );

      const updatedRoutes: Route[] = [
        {
          id: `rt_${Date.now()}_1`,
          name: "Priority Cluster A - South Mumbai",
          vehicleId: "veh_001",
          vehicleName: "E-Compactor Alpha (MH-01-EA-1042)",
          status: "planned",
          totalDistanceKm: 14.8,
          estimatedDurationMinutes: 42,
          totalBins: Math.max(3, Math.ceil(urgentBins.length / 2)),
          collectedBins: 0,
          stops: [
            {
              binId: "bin_001",
              binLabel: "MRN-A01",
              location: { lat: 19.076, lng: 72.8777 },
              order: 1,
              status: "pending",
              estimatedArrival: new Date(Date.now() + 15 * 60000).toISOString(),
              fillPctAtDispatch: 87,
            },
            {
              binId: "bin_010",
              binLabel: "CLB-J10",
              location: { lat: 18.9067, lng: 72.8147 },
              order: 2,
              status: "pending",
              estimatedArrival: new Date(Date.now() + 30 * 60000).toISOString(),
              fillPctAtDispatch: 95,
            },
            {
              binId: "bin_005",
              binLabel: "CST-E05",
              location: { lat: 18.94, lng: 72.8353 },
              order: 3,
              status: "pending",
              estimatedArrival: new Date(Date.now() + 45 * 60000).toISOString(),
              fillPctAtDispatch: 71,
            },
          ],
          createdAt: new Date().toISOString(),
          startedAt: null,
          completedAt: null,
        },
        {
          id: `rt_${Date.now()}_2`,
          name: "Priority Cluster B - Western Suburbs",
          vehicleId: "veh_002",
          vehicleName: "Heavy Compactor Beta (MH-02-TC-8891)",
          status: "planned",
          totalDistanceKm: 21.4,
          estimatedDurationMinutes: 58,
          totalBins: 2,
          collectedBins: 0,
          stops: [
            {
              binId: "bin_003",
              binLabel: "ANR-C03",
              location: { lat: 19.1197, lng: 72.8464 },
              order: 1,
              status: "pending",
              estimatedArrival: new Date(Date.now() + 20 * 60000).toISOString(),
              fillPctAtDispatch: 93,
            },
            {
              binId: "bin_002",
              binLabel: "BND-B02",
              location: { lat: 19.0544, lng: 72.8403 },
              order: 2,
              status: "pending",
              estimatedArrival: new Date(Date.now() + 40 * 60000).toISOString(),
              fillPctAtDispatch: 45,
            },
          ],
          createdAt: new Date().toISOString(),
          startedAt: null,
          completedAt: null,
        },
      ];

      return {
        routes: [...updatedRoutes, ...state.routes],
      };
    });
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
      updateBinFill(target.id, nextFill);
    }
  },
}));
