"use client";

import { useState } from "react";
import {
  ChartBar,
  TrendUp,
  Recycle,
  Leaf,
  ShieldCheck,
  Drop,
  Calendar,
} from "@phosphor-icons/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useWasteStore } from "@/lib/store/waste-store";

// 7-day Fill Trends Data
const FILL_TRENDS_DATA = [
  { day: "Mon", southMumbai: 62, westernSuburbs: 54, easternSuburbs: 48 },
  { day: "Tue", southMumbai: 68, westernSuburbs: 61, easternSuburbs: 52 },
  { day: "Wed", southMumbai: 75, westernSuburbs: 69, easternSuburbs: 58 },
  { day: "Thu", southMumbai: 71, westernSuburbs: 64, easternSuburbs: 55 },
  { day: "Fri", southMumbai: 84, westernSuburbs: 78, easternSuburbs: 67 },
  { day: "Sat", southMumbai: 91, westernSuburbs: 86, easternSuburbs: 74 },
  { day: "Sun", southMumbai: 79, westernSuburbs: 72, easternSuburbs: 63 },
];

// Material Composition Breakdown
const COMPOSITION_DATA = [
  { name: "Organic", value: 38, color: "#22c55e" },
  { name: "Plastics", value: 26, color: "#3b82f6" },
  { name: "Paper / Cardboard", value: 16, color: "#f59e0b" },
  { name: "Glass", value: 9, color: "#06b6d4" },
  { name: "Metal", value: 6, color: "#94a3b8" },
  { name: "E-Waste", value: 5, color: "#ef4444" },
];

// Daily Collections & Overflows Prevented
const COLLECTION_HISTORY_DATA = [
  { day: "Mon", collectedKg: 4200, overflowsPrevented: 12 },
  { day: "Tue", collectedKg: 4850, overflowsPrevented: 15 },
  { day: "Wed", collectedKg: 5100, overflowsPrevented: 19 },
  { day: "Thu", collectedKg: 4600, overflowsPrevented: 14 },
  { day: "Fri", collectedKg: 6200, overflowsPrevented: 24 },
  { day: "Sat", collectedKg: 7100, overflowsPrevented: 28 },
  { day: "Sun", collectedKg: 5400, overflowsPrevented: 18 },
];

export default function AnalyticsPage() {
  const { bins, scans, routes } = useWasteStore();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Circular Analytics & Metrics
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              ESG Operations
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Fill rate dynamics, landfill diversion indices, and fleet carbon offset analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10 self-start sm:self-auto">
          <Calendar size={14} className="text-emerald-400" />
          <span>Last 7 Days (Telemetry Realtime)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Landfill Diversion Rate</span>
            <Recycle size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">68.4%</div>
          <span className="text-xs text-emerald-400 font-mono mt-1 block">
            +5.2% vs previous period
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Recycled Material</span>
            <Leaf size={18} className="text-green-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">37.45 Tons</div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Across 156 collections
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CO2 Avoided via OR-Tools</span>
            <TrendUp size={18} className="text-teal-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-teal-400 font-mono">4.82 tCO2e</div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Optimized route geometry
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overflows Prevented</span>
            <ShieldCheck size={18} className="text-blue-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-blue-400 font-mono">130 Cases</div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Predictive ultrasonic triggers
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: 7-Day Fill Dynamics by Zone */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/40 border border-white/[0.08] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Fill Level Progression by Zone (%)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregate daily average fill level monitoring across municipal sectors
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FILL_TRENDS_DATA}>
                <defs>
                  <linearGradient id="colorSouth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="southMumbai"
                  name="South Mumbai"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSouth)"
                />
                <Area
                  type="monotone"
                  dataKey="westernSuburbs"
                  name="Western Suburbs"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWest)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Material Stream Composition Donut */}
        <div className="lg:col-span-5 rounded-xl bg-slate-900/40 border border-white/[0.08] p-5 flex flex-col">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-white tracking-tight">
              WasteDNA Stream Composition
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Material percentages classified by YOLOv8 vision pipeline
            </p>
          </div>

          <div className="h-[240px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={COMPOSITION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {COMPOSITION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/[0.04] text-[11px] font-mono">
            {COMPOSITION_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}:</span>
                <span className="text-white font-bold ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Collections & Overflows Prevented Bar Chart */}
      <div className="rounded-xl bg-slate-900/40 border border-white/[0.08] p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white tracking-tight">
            Daily Waste Ingestion & Prevented Overflows
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total kilograms collected and critical overflows diverted through preemptive scheduling
          </p>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COLLECTION_HISTORY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} yAxisId="left" unit="kg" />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                yAxisId="right"
                orientation="right"
                unit=" alerts"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar
                yAxisId="left"
                dataKey="collectedKg"
                name="Volume Collected (kg)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="overflowsPrevented"
                name="Overflows Prevented"
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
