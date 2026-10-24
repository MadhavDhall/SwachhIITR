"use client";

import { useState, useRef } from "react";
import {
  Camera,
  UploadSimple,
  Sparkle,
  CheckCircle,
  XCircle,
  WarningCircle,
  ArrowClockwise,
  Info,
  ShieldCheck,
  Recycle,
  Tag,
  NotePencil,
  Eye,
  Sliders,
} from "@phosphor-icons/react";
import { useWasteStore } from "@/lib/store/waste-store";
import { WASTE_CATEGORIES } from "@/data/seed";
import type { Detection, WasteScan } from "@/types";
import { cn } from "@/lib/utils";

// Preset images for local review testing
const DEMO_SAMPLES = [
  {
    id: "sample-1",
    title: "Mixed Municipal Plastics & Bottles",
    url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    detections: [
      { class: "plastic", confidence: 0.94, boundingBox: { x: 15, y: 20, width: 35, height: 40 } },
      { class: "plastic", confidence: 0.88, boundingBox: { x: 55, y: 30, width: 30, height: 45 } },
      { class: "metal", confidence: 0.79, boundingBox: { x: 40, y: 65, width: 25, height: 25 } },
    ],
  },
  {
    id: "sample-2",
    title: "Cardboard Packaging & Office Paper",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    detections: [
      { class: "paper", confidence: 0.96, boundingBox: { x: 10, y: 15, width: 60, height: 70 } },
      { class: "paper", confidence: 0.89, boundingBox: { x: 65, y: 40, width: 28, height: 45 } },
    ],
  },
  {
    id: "sample-3",
    title: "Discarded Circuit Boards & Batteries",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    detections: [
      { class: "ewaste", confidence: 0.91, boundingBox: { x: 25, y: 25, width: 50, height: 50 } },
      { class: "metal", confidence: 0.64, boundingBox: { x: 10, y: 70, width: 25, height: 20 } }, // <0.70 triggers uncertain flag
    ],
  },
  {
    id: "sample-4",
    title: "Organic Food Waste & Coffee Grounds",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    detections: [
      { class: "organic", confidence: 0.93, boundingBox: { x: 20, y: 15, width: 65, height: 70 } },
    ],
  },
];

export default function ScannerPage() {
  const { addScan, verifyScan } = useWasteStore();

  const [activeImage, setActiveImage] = useState<string>(DEMO_SAMPLES[0].url);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>(DEMO_SAMPLES[0].detections);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredDetection, setHoveredDetection] = useState<number | null>(null);
  const [auditNotes, setAuditNotes] = useState("");
  const [verificationDone, setVerificationDone] = useState<boolean | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalObjects = currentDetections.length;
  const avgConfidence = totalObjects > 0
    ? currentDetections.reduce((sum, d) => sum + d.confidence, 0) / totalObjects
    : 0;

  const classCounts = currentDetections.reduce((acc, d) => {
    acc[d.class] = (acc[d.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hasUncertain = currentDetections.some((d) => d.confidence < 0.7);

  // Handle custom file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const payload = (await response.json()) as { asset?: { url: string }; error?: string };

      if (!response.ok || !payload.asset?.url) {
        throw new Error(payload.error || "Image upload failed");
      }

      setActiveImage(payload.asset.url);
      await runInference(payload.asset.url, file);
    } catch (error) {
      setIsProcessing(false);
      setUploadError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const handleSelectSample = (sample: typeof DEMO_SAMPLES[0]) => {
    setUploadError(null);
    setActiveImage(sample.url);
    setIsProcessing(true);
    setVerificationDone(null);
    setAuditNotes("");

    setTimeout(() => {
      setCurrentDetections(sample.detections);
      setIsProcessing(false);
    }, 600);
  };

  const runInference = async (imgUrl: string, file?: File) => {
    setIsProcessing(true);
    setVerificationDone(null);

    const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
    if (apiUrl && file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/inference/detect`, {
          method: "POST",
          body: formData,
        });
        const result = (await response.json()) as {
          detections?: Array<{
            class: string;
            confidence: number;
            boundingBox: Detection["boundingBox"];
          }>;
          detail?: string;
        };

        if (!response.ok || !result.detections) {
          throw new Error(result.detail || "Inference service failed");
        }

        setCurrentDetections(
          result.detections.map((detection) => ({
            class: detection.class,
            confidence: detection.confidence,
            boundingBox: detection.boundingBox,
          }))
        );
        setIsProcessing(false);
        return;
      } catch (error) {
        setUploadError(
          error instanceof Error
            ? `Image saved, but campus review was unavailable: ${error.message}. Showing local review instead.`
            : "Inference service unavailable. Showing demo inference instead."
        );
      }
    }

    setTimeout(() => {
      const simulated: Detection[] = [
        { class: "plastic", confidence: 0.92, boundingBox: { x: 20, y: 25, width: 30, height: 35 } },
        { class: "organic", confidence: 0.84, boundingBox: { x: 55, y: 40, width: 35, height: 40 } },
        { class: "metal", confidence: 0.68, boundingBox: { x: 30, y: 70, width: 25, height: 20 } },
      ];
      setCurrentDetections(simulated);
      setIsProcessing(false);
    }, 900);
  };

  const handleVerify = (approved: boolean) => {
    const newScan: WasteScan = {
      id: `scan_${Date.now()}`,
      imageUrl: activeImage,
      detections: currentDetections,
      classCounts,
      totalObjects,
      averageConfidence: avgConfidence,
      hasUncertainResults: hasUncertain,
      verificationStatus: approved ? "verified" : "rejected",
      verifiedBy: "Operations Supervisor",
      verifiedAt: new Date().toISOString(),
      scannedBy: "SwachhIITR Image Review",
      notes: auditNotes || (approved ? "Material classes verified for sorting line." : "Rejected during auditor inspection."),
      createdAt: new Date().toISOString(),
      isSimulated: true,
    };

    addScan(newScan);
    setVerificationDone(approved);
  };

  return (
    <div className="space-y-6">
      {/* Title & Edge Model Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              SwachhIITR Image Review
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Campus Review Pipeline
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time material classification, multi-object localization, and automated circular sorting recommendations.
          </p>
        </div>

        {/* Upload Action */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-md shadow-emerald-950/30"
          >
            <UploadSimple size={16} weight="bold" />
            <span>Upload Waste Image</span>
          </button>
        </div>
      </div>

      {/* Demo Samples Quick Bar */}
      {uploadError && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-200 text-xs">
          {uploadError}
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs text-slate-400 font-mono whitespace-nowrap mr-2">Preset Samples:</span>
        {DEMO_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => handleSelectSample(sample)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
              activeImage === sample.url
                ? "bg-slate-800 text-emerald-400 border-emerald-500/40"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-white/5"
            )}
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Uncertain Review Required Banner (When applicable) */}
      {hasUncertain && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <WarningCircle size={20} className="text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-white">Attention: Low-Confidence Detection Detected</span>
              <p className="text-amber-300/80 text-[11px] mt-0.5">
                One or more objects scored below 70% confidence threshold. Human audit validation recommended before routing to processing facilities.
              </p>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-amber-900/60 text-amber-300 font-mono text-[10px] uppercase font-semibold">
            Audit Required
          </span>
        </div>
      )}

      {/* Main Interactive Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Image Canvas with Bounding Boxes */}
        <div className="lg:col-span-7 flex flex-col rounded-xl bg-slate-900/40 border border-white/[0.08] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Inference Viewport
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>{totalObjects} Items Located</span>
              <span className="opacity-30">|</span>
              <span className="text-emerald-400">{(avgConfidence * 100).toFixed(1)}% Avg Conf</span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-white/5 flex items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-xs font-mono text-emerald-400 tracking-wider">
                  Running Neural Segmentation...
                </span>
              </div>
            ) : (
              <>
                <img
                  src={activeImage}
                  alt="Waste to segment"
                  className="w-full h-full object-cover"
                />

                {/* SVG / HTML Bounding Boxes Overlay */}
                <div className="absolute inset-0 pointer-events-auto">
                  {currentDetections.map((d, idx) => {
                    const isHovered = hoveredDetection === idx;
                    const isUncertain = d.confidence < 0.7;
                    const cat = WASTE_CATEGORIES.find((c) => c.name.toLowerCase().includes(d.class.toLowerCase())) || WASTE_CATEGORIES[0];
                    const boxColor = isUncertain ? "#f59e0b" : cat?.color || "#10b981";

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredDetection(idx)}
                        onMouseLeave={() => setHoveredDetection(null)}
                        style={{
                          left: `${d.boundingBox.x}%`,
                          top: `${d.boundingBox.y}%`,
                          width: `${d.boundingBox.width}%`,
                          height: `${d.boundingBox.height}%`,
                          borderColor: boxColor,
                        }}
                        className={cn(
                          "absolute border-2 rounded transition-all duration-150 cursor-pointer",
                          isHovered
                            ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 scale-[1.01]"
                            : "bg-black/10 z-10"
                        )}
                      >
                        {/* Class label tag on box */}
                        <div
                          style={{ backgroundColor: boxColor }}
                          className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-950 uppercase flex items-center gap-1 shadow"
                        >
                          <span>{d.class}</span>
                          <span>{(d.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Bottom helper instructions */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Hover bounding boxes to inspect class specifications</span>
            <span>Review Model: Campus Materials</span>
          </div>
        </div>

        {/* Right 5 Cols: Detection Breakdown & Verification */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Class Breakdown & Recycling Guide */}
          <div className="rounded-xl bg-slate-900/40 border border-white/[0.08] p-4 flex-1">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2 mb-3">
              <Tag size={16} className="text-emerald-400" />
              <span>Identified Stream Breakdown</span>
            </h2>

            <div className="space-y-2.5">
              {Object.entries(classCounts).map(([className, count]) => {
                const cat = WASTE_CATEGORIES.find((c) =>
                  c.name.toLowerCase().includes(className.toLowerCase())
                );

                return (
                  <div
                    key={className}
                    className="p-3 rounded-lg bg-slate-900/80 border border-white/[0.04] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat?.color || "#10b981" }}
                        />
                        <span className="font-semibold text-xs text-white capitalize">
                          {cat?.name || className}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-emerald-400 border border-white/5 font-bold">
                        {count} item{count > 1 ? "s" : ""}
                      </span>
                    </div>

                    {cat?.recommendation && (
                      <div className="text-[11px] text-slate-400 mt-1 pl-4.5 border-l-2 border-white/10 ml-1">
                        <span className="text-slate-200 font-medium font-mono text-[10px]">
                          Pathway: {cat.recommendation.method}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {cat.recommendation.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Auditor Verification Panel */}
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Auditor Verification Workflow</span>
              </h3>

              {verificationDone !== null ? (
                <div
                  className={cn(
                    "p-3 rounded-lg text-xs flex items-center gap-2 font-medium",
                    verificationDone
                      ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/60 border border-red-500/40 text-red-300"
                  )}
                >
                  {verificationDone ? (
                    <>
                      <CheckCircle size={18} weight="fill" className="text-emerald-400" />
                      <span>Verified & Committed to Circular Waste Ledger!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} weight="fill" className="text-red-400" />
                      <span>Scan Rejected & Marked for Manual Sorting Re-inspection.</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Optional auditor notes (e.g., contamination observed, clean PET plastic)"
                    className="w-full h-16 p-2 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleVerify(true)}
                      className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-emerald-950/20"
                    >
                      <CheckCircle size={16} weight="bold" />
                      <span>Accept & Verify</span>
                    </button>
                    <button
                      onClick={() => handleVerify(false)}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-red-900/40 hover:border-red-500/30 border border-white/10 active:scale-[0.98] text-slate-300 hover:text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <XCircle size={16} weight="bold" />
                      <span>Reject Scan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
