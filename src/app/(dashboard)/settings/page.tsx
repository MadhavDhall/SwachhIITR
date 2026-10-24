"use client";

import { useState } from "react";
import {
  GearSix,
  CheckCircle,
  FloppyDisk,
  Database,
  CloudArrowUp,
  Cpu,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useWasteStore } from "@/lib/store/waste-store";

export default function SettingsPage() {
  const { thresholds, updateThresholds } = useWasteStore();

  const [formState, setFormState] = useState(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              System Settings & Architecture
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Config Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure telemetry alert thresholds, Render PostgreSQL, Cloudinary storage, and vision pipelines.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-medium font-mono animate-in fade-in">
            <CheckCircle size={16} weight="fill" className="text-emerald-400" />
            <span>Settings Persisted</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operational Thresholds Section */}
        <div className="rounded-xl bg-slate-900/60 border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <GearSix size={18} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Operational Alert Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Warning Fill Threshold (%)
              </label>
              <input
                type="number"
                min="30"
                max="90"
                value={formState.warningFillPct}
                onChange={(e) => setFormState({ ...formState, warningFillPct: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-[10px] text-slate-500 block">Triggers amber warning in BinSync matrix</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Critical Overflow Threshold (%)
              </label>
              <input
                type="number"
                min="70"
                max="99"
                value={formState.criticalFillPct}
                onChange={(e) => setFormState({ ...formState, criticalFillPct: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-[10px] text-slate-500 block">Triggers immediate route dispatch & push alert</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Sensor Offline Inactivity (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="720"
                value={formState.sensorOfflineMinutes}
                onChange={(e) => setFormState({ ...formState, sensorOfflineMinutes: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-[10px] text-slate-500 block">Flag device offline if no ping is received</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                WasteDNA Minimum Confidence Cutoff
              </label>
              <input
                type="number"
                step="0.05"
                min="0.4"
                max="0.95"
                value={formState.confidenceThreshold}
                onChange={(e) => setFormState({ ...formState, confidenceThreshold: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-[10px] text-slate-500 block">Inferences below this threshold require human auditor sign-off</span>
            </div>
          </div>
        </div>

        {/* Render architecture section */}
        <div className="rounded-xl bg-slate-900/60 border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <CloudArrowUp size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Cloud Connectors & Backends</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Database size={15} className="text-amber-400" />
                  Render PostgreSQL
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                  CONFIGURE ENV
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Bins, readings, scans, routes, alerts, and audit events</p>
              <p className="text-[11px] text-slate-500">Connection checked through /api/health</p>
            </div>

            {/* Python FastAPI */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Cpu size={15} className="text-teal-400" />
                  FastAPI Python Service
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]">
                  LOCAL / SIMULATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">URL: {process.env.NEXT_PUBLIC_FASTAPI_URL || "Not configured"}</p>
              <p className="text-[11px] text-slate-500">Engines: Ultralytics YOLOv8 + Google OR-Tools VRP</p>
            </div>

            {/* Cloudinary Storage */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <CloudArrowUp size={15} className="text-indigo-400" />
                  Cloudinary Storage
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                  CONFIGURE ENV
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Waste images and thumbnails</p>
              <p className="text-[11px] text-slate-500">Uploads handled server-side via /api/uploads</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-emerald-950/40"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
