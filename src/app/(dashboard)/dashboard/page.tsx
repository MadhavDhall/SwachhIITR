"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Camera,
  ChartLineUp,
  CheckCircle,
  Clock,
  Leaf,
  Lightning,
  MapPin,
  Recycle,
  Sparkle,
  TrendUp,
  Truck,
  WarningCircle,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/lib/auth/store";
import { useWasteStore } from "@/lib/store/waste-store";
import { cn, formatDistanceToNow } from "@/lib/utils";

const categoryColors = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-lime-500",
  "bg-amber-400",
  "bg-cyan-500",
  "bg-slate-400",
];

const trend = [42, 55, 48, 67, 61, 76, 82];

function initials(name?: string) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "OP"
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { bins, scans, routes, alerts, stats, simulateSinglePing } = useWasteStore();

  const urgentBins = bins
    .filter((bin) => (bin.currentFillPct ?? 0) >= 70)
    .sort((a, b) => (b.currentFillPct ?? 0) - (a.currentFillPct ?? 0));
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged);
  const activeRoutes = routes.filter(
    (route) => route.status === "planned" || route.status === "in_progress"
  );
  const verifiedScans = scans.filter((scan) => scan.verificationStatus === "verified");
  const averageFill = Math.round(stats.avgFillLevel);
  const recyclingRate = scans.length
    ? Math.round((verifiedScans.length / scans.length) * 100)
    : 0;
  const wasteDiverted = verifiedScans.reduce(
    (total, scan) => total + Math.max(scan.totalObjects, 1) * 2,
    0
  );

  const categories = [
    { name: "Organic", value: Math.max(verifiedScans.filter((scan) => scan.classCounts.organic).length, 0) },
    { name: "Plastic", value: verifiedScans.filter((scan) => scan.classCounts.plastic).length },
    { name: "Paper", value: verifiedScans.filter((scan) => scan.classCounts.paper).length },
    { name: "Metal", value: verifiedScans.filter((scan) => scan.classCounts.metal).length },
    { name: "Glass", value: verifiedScans.filter((scan) => scan.classCounts.glass).length },
    { name: "E-waste", value: verifiedScans.filter((scan) => scan.classCounts["e-waste"]).length },
  ];
  const categoryTotal = categories.reduce((total, category) => total + category.value, 0);

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-[#123c31] to-teal-900 p-6 shadow-xl shadow-emerald-950/20 sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-24 right-24 h-44 w-44 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-100">
              <Leaf size={14} weight="fill" />
              Smart campus operations
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Namaste, {user?.name?.split(" ")[0] ?? "there"} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/75">
              Your actions today help build a cleaner tomorrow. Keep IIT Roorkee moving
              toward a healthier, low-waste campus.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-lime-950/20 transition hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2 focus:ring-offset-emerald-950"
            >
              <Camera size={17} weight="bold" />
              Report waste
            </Link>
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <Truck size={17} weight="bold" />
              Schedule pickup
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Operational overview">
        {[
          {
            label: "Total waste reports",
            value: scans.length,
            note: `${verifiedScans.length} verified`,
            icon: Recycle,
            tone: "text-emerald-400 bg-emerald-400/10",
          },
          {
            label: "Recycling rate",
            value: `${recyclingRate}%`,
            note: "Based on verified reviews",
            icon: Leaf,
            tone: "text-lime-400 bg-lime-400/10",
          },
          {
            label: "Active collection requests",
            value: activeRoutes.length,
            note: `${urgentBins.length} bins need attention`,
            icon: Truck,
            tone: "text-sky-400 bg-sky-400/10",
          },
          {
            label: "CO₂ impact estimate",
            value: `${wasteDiverted} kg`,
            note: "Diversion estimate from records",
            icon: ChartLineUp,
            tone: "text-amber-300 bg-amber-300/10",
          },
        ].map(({ label, value, note, icon: Icon, tone }) => (
          <div
            key={label}
            className="group rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 shadow-lg shadow-black/5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/30"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">{label}</p>
              <span className={cn("rounded-xl p-2.5", tone)}>
                <Icon size={21} weight="duotone" />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <TrendUp size={13} className="text-emerald-400" />
              {note}
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5 shadow-lg shadow-black/5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Waste category breakdown</h2>
              <p className="mt-1 text-sm text-slate-400">Verified material reviews from your campus</p>
            </div>
            <Link href="/analytics" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
              View analytics <ArrowRight size={14} className="ml-1 inline" />
            </Link>
          </div>
          <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-center">
            <div
              className="mx-auto grid h-44 w-44 shrink-0 place-items-center rounded-full"
              style={{
                background: categoryTotal
                  ? `conic-gradient(#22c55e 0 ${Math.min(recyclingRate, 100)}%, #134e4a ${Math.min(recyclingRate, 100)}% 100%)`
                  : "conic-gradient(#334155 0 100%)",
              }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full bg-slate-900 text-center">
                <div>
                  <p className="text-3xl font-semibold text-white">{categoryTotal}</p>
                  <p className="text-xs text-slate-400">items reviewed</p>
                </div>
              </div>
            </div>
            <div className="w-full space-y-3">
              {categories.map((category, index) => {
                const percentage = categoryTotal ? Math.round((category.value / categoryTotal) * 100) : 0;
                return (
                  <div key={category.name}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className={cn("h-2.5 w-2.5 rounded-full", categoryColors[index])} />
                        {category.name}
                      </span>
                      <span className="font-medium text-slate-400">{percentage}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div className={cn("h-full rounded-full", categoryColors[index])} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-950/45 p-5 shadow-lg shadow-emerald-950/10 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">Sustainability impact</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Small actions, real change.</h2>
            </div>
            <span className="rounded-xl bg-emerald-400/15 p-2.5 text-emerald-300">
              <Leaf size={22} weight="fill" />
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-100/70">
            You&apos;ve helped divert <strong className="font-semibold text-white">{wasteDiverted} kg</strong> of waste
            from landfills through verified campus operations this month.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xl font-semibold text-white">{Math.round(wasteDiverted / 10)}</p>
              <p className="mt-1 text-[11px] text-emerald-100/60">tree equivalents</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xl font-semibold text-white">{wasteDiverted} kg</p>
              <p className="mt-1 text-[11px] text-emerald-100/60">diverted</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xl font-semibold text-white">{recyclingRate}%</p>
              <p className="mt-1 text-[11px] text-emerald-100/60">verified rate</p>
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400" style={{ width: `${Math.max(recyclingRate, 3)}%` }} />
          </div>
          <p className="mt-2 text-xs text-emerald-100/60">Keep reviewing waste to grow this impact.</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5 shadow-lg shadow-black/5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Waste trend</h2>
              <p className="mt-1 text-sm text-slate-400">Operational activity over the last 7 days</p>
            </div>
            <span className="rounded-lg bg-emerald-400/10 p-2 text-emerald-400"><ChartLineUp size={18} /></span>
          </div>
          <div className="mt-8 flex h-36 items-end gap-2 border-b border-white/[0.08] px-1">
            {trend.map((height, index) => (
              <div key={index} className="group flex h-full flex-1 items-end">
                <div className="relative w-full rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all duration-300 group-hover:from-lime-500 group-hover:to-lime-300" style={{ height: `${height}%` }}>
                  <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-[10px] text-emerald-300 group-hover:block">{height}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-slate-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5 shadow-lg shadow-black/5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent reports</h2>
              <p className="mt-1 text-sm text-slate-400">Latest waste reviews and collection activity</p>
            </div>
            <Link href="/scanner" className="shrink-0 text-xs font-medium text-emerald-400 hover:text-emerald-300">
              All reports <ArrowRight size={14} className="ml-1 inline" />
            </Link>
          </div>
          <div className="mt-5 divide-y divide-white/[0.07]">
            {scans.slice(0, 4).map((scan) => (
              <div key={scan.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-800">
                  <img src={scan.thumbnailUrl ?? scan.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">{scan.totalObjects} waste items detected</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatDistanceToNow(scan.createdAt)} · {scan.scannedBy}</p>
                </div>
                <span className={cn("rounded-full px-2 py-1 text-[10px] font-medium capitalize", scan.verificationStatus === "verified" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300")}>
                  {scan.verificationStatus}
                </span>
              </div>
            ))}
            {!scans.length && (
              <div className="flex flex-col items-center py-8 text-center">
                <Sparkle size={26} className="text-emerald-400" />
                <p className="mt-3 text-sm text-slate-300">No reports yet</p>
                <Link href="/scanner" className="mt-2 text-xs text-emerald-400 hover:underline">Report your first waste item</Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5 shadow-lg shadow-black/5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Collection requests</h2>
            <p className="mt-1 text-sm text-slate-400">Bins and routes that need the next operational step</p>
          </div>
          <Link href="/routes" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">Open planner <ArrowRight size={14} className="ml-1 inline" /></Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {urgentBins.slice(0, 4).map((bin) => {
            const fill = Math.round(bin.currentFillPct ?? 0);
            return (
              <div key={bin.id} className="rounded-xl border border-white/[0.07] bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{bin.label}</p>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500"><MapPin size={12} />{bin.zone}</p>
                  </div>
                  <span className={cn("rounded-full px-2 py-1 text-[10px] font-medium", fill >= 85 ? "bg-red-400/10 text-red-300" : "bg-amber-400/10 text-amber-300")}>{fill}% full</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-amber-300"><Clock size={12} /> Awaiting pickup</span>
                  <span className="ml-auto">{bin.address}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={cn("h-full rounded-full", fill >= 85 ? "bg-red-400" : "bg-amber-400")} style={{ width: `${fill}%` }} /></div>
              </div>
            );
          })}
          {!urgentBins.length && (
            <div className="col-span-full flex items-center gap-3 rounded-xl border border-dashed border-emerald-400/20 bg-emerald-400/5 p-5 text-sm text-emerald-200/80">
              <CheckCircle size={22} className="text-emerald-400" />
              All monitored bins are below the collection threshold.
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-300"><WarningCircle size={20} /></div><div><p className="text-sm font-medium text-slate-300">Active alerts</p><p className="mt-1 text-2xl font-semibold text-white">{activeAlerts.length}</p></div></div>
          <Link href="/settings" className="mt-4 inline-flex items-center text-xs text-emerald-400 hover:underline">Review alerts <ArrowRight size={13} className="ml-1" /></Link>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-sky-400/10 p-2.5 text-sky-300"><Lightning size={20} /></div><div><p className="text-sm font-medium text-slate-300">Average bin fill</p><p className="mt-1 text-2xl font-semibold text-white">{averageFill}%</p></div></div>
          <button onClick={() => simulateSinglePing()} className="mt-4 inline-flex items-center text-xs text-emerald-400 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400">Record a live reading <ArrowRight size={13} className="ml-1" /></button>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><Bell size={20} /></div><div><p className="text-sm font-medium text-slate-300">Campus network</p><p className="mt-1 text-2xl font-semibold text-white">{bins.length} bins</p></div></div>
          <p className="mt-4 text-xs text-slate-500">{stats.activeBins} active monitoring points · {activeRoutes.length} routes in progress</p>
        </div>
      </section>
    </div>
  );
}
