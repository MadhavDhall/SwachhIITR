"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Clock,
  Sparkle,
  DownloadSimple,
  ArrowRight,
  ShieldCheck,
  Tag,
  Eye,
  X,
  Funnel,
} from "@phosphor-icons/react";
import { useWasteStore } from "@/lib/store/waste-store";
import { WASTE_CATEGORIES } from "@/data/seed";
import type { WasteScan } from "@/types";
import { cn } from "@/lib/utils";

export default function LedgerPage() {
  const { scans, verifyScan } = useWasteStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedScan, setSelectedScan] = useState<WasteScan | null>(scans[0] || null);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.id.toLowerCase().includes(search.toLowerCase()) ||
      scan.notes.toLowerCase().includes(search.toLowerCase()) ||
      scan.scannedBy.toLowerCase().includes(search.toLowerCase()) ||
      Object.keys(scan.classCounts).some((k) => k.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || scan.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportData = () => {
    const jsonStr = JSON.stringify(scans, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wasteos-ledger-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Circular Waste Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Immutable Traceability
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Auditable record of material streams, human verification workflows, and ESG compliance tracking.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 hover:text-white border border-white/10 text-xs font-semibold tracking-wide transition-all self-start sm:self-auto"
        >
          <DownloadSimple size={16} weight="bold" />
          <span>Export Ledger (JSON)</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Scan ID, material tag, or notes..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">All Verification Statuses</option>
          <option value="verified">Verified Only</option>
          <option value="pending">Pending Audit</option>
          <option value="rejected">Rejected Only</option>
        </select>

        <span className="text-xs font-mono text-slate-400 ml-auto">
          {filteredScans.length} records found
        </span>
      </div>

      {/* Main Container: Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Ledger Entries Table (7 or 8 Cols) */}
        <div className={cn("transition-all", selectedScan ? "lg:col-span-7" : "lg:col-span-12")}>
          <div className="rounded-xl bg-slate-900/40 border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-slate-950/60 font-mono text-slate-400">
                  <th className="p-3">Scan Ref</th>
                  <th className="p-3">Detected Classes</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredScans.map((scan) => {
                  const isSelected = selectedScan?.id === scan.id;

                  return (
                    <tr
                      key={scan.id}
                      onClick={() => setSelectedScan(scan)}
                      className={cn(
                        "cursor-pointer hover:bg-white/[0.03] transition-colors",
                        isSelected && "bg-emerald-950/30"
                      )}
                    >
                      <td className="p-3 font-semibold text-white font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{scan.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block font-normal">
                          {scan.scannedBy}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(scan.classCounts).map(([cls, count]) => (
                            <span
                              key={cls}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-white/5 capitalize"
                            >
                              {cls} ({count})
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-emerald-400">
                        {(scan.averageConfidence * 100).toFixed(0)}%
                      </td>

                      <td className="p-3 font-mono">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            scan.verificationStatus === "verified"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                              : scan.verificationStatus === "rejected"
                              ? "bg-red-950/80 text-red-400 border border-red-500/40"
                              : "bg-amber-950/80 text-amber-400 border border-amber-500/40"
                          )}
                        >
                          {scan.verificationStatus}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-slate-400">
                        {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Selected Scan Inspector (5 Cols) */}
        {selectedScan && (
          <div className="lg:col-span-5 rounded-xl bg-slate-900/70 border border-white/10 p-5 space-y-4 relative backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h2 className="text-sm font-bold text-white font-mono">{selectedScan.id}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Scanned by {selectedScan.scannedBy}</p>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Image Preview with Bounding Box Overlay */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-white/5">
              <img
                src={selectedScan.imageUrl}
                alt="Scan inspection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0">
                {selectedScan.detections.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      left: `${d.boundingBox.x}%`,
                      top: `${d.boundingBox.y}%`,
                      width: `${d.boundingBox.width}%`,
                      height: `${d.boundingBox.height}%`,
                    }}
                    className="absolute border border-emerald-400 bg-emerald-500/20"
                  >
                    <span className="absolute -top-4 left-0 text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 px-1 rounded">
                      {d.class} {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Details & Verification Trigger */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Detected Units:</span>
                <span className="text-white font-bold">{selectedScan.totalObjects} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Average Confidence:</span>
                <span className="text-emerald-400 font-bold">
                  {(selectedScan.averageConfidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verified By:</span>
                <span className="text-slate-200">{selectedScan.verifiedBy || "Pending Review"}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.04]">
                <span className="text-slate-500 block text-[10px]">Notes:</span>
                <p className="text-slate-300 italic text-[11px] mt-0.5">
                  "{selectedScan.notes || "Standard vision detection ingestion."}"
                </p>
              </div>
            </div>

            {selectedScan.verificationStatus === "pending" && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => verifyScan(selectedScan.id, true)}
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle size={15} />
                  <span>Verify Entry</span>
                </button>
                <button
                  onClick={() => verifyScan(selectedScan.id, false)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle size={15} />
                  <span>Reject Entry</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
