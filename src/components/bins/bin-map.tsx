"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Bin } from "@/types";
import { getFillUrgency } from "@/lib/utils";

// Custom icon creator using Leaflet DivIcon
function createBinIcon(bin: Bin, isSelected: boolean) {
  const fill = bin.currentFillPct ?? 0;
  const urgency = getFillUrgency(fill);

  let bgClass = "bg-emerald-500 text-emerald-950 border-emerald-400";
  if (urgency === "critical") bgClass = "bg-red-500 text-white border-red-300 animate-bounce";
  else if (urgency === "warning") bgClass = "bg-amber-500 text-slate-950 border-amber-300";
  else if (bin.status === "offline") bgClass = "bg-slate-700 text-slate-300 border-slate-500";

  return L.divIcon({
    className: "custom-bin-pin",
    html: `
      <div style="
        width: ${isSelected ? "36px" : "30px"};
        height: ${isSelected ? "36px" : "30px"};
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        font-family: monospace;
        font-weight: 700;
        font-size: ${isSelected ? "12px" : "11px"};
        transition: all 0.2s ease-out;
        border: 2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.4)"};
      " class="${bgClass}">
        ${fill}%
      </div>
    `,
    iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
    iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
  });
}

function MapController({ selectedBin }: { selectedBin: Bin | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedBin) {
      map.flyTo([selectedBin.location.lat, selectedBin.location.lng], 14, {
        duration: 1.2,
      });
    }
  }, [selectedBin, map]);
  return null;
}

interface BinMapProps {
  bins: Bin[];
  selectedBin: Bin | null;
  onSelectBin: (bin: Bin) => void;
}

export default function BinMap({ bins, selectedBin, onSelectBin }: BinMapProps) {
  // IIT Roorkee default coordinates
  const centerLat = selectedBin ? selectedBin.location.lat : 29.8642;
  const centerLng = selectedBin ? selectedBin.location.lng : 77.8963;

  return (
    <div className="w-full h-full min-h-[480px] rounded-xl overflow-hidden relative border border-white/10 z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map-tiles"
        />
        <MapController selectedBin={selectedBin} />

        {bins.map((bin) => {
          const isSelected = selectedBin?.id === bin.id;
          return (
            <Marker
              key={bin.id}
              position={[bin.location.lat, bin.location.lng]}
              icon={createBinIcon(bin, isSelected)}
              eventHandlers={{
                click: () => onSelectBin(bin),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 text-slate-900 font-sans">
                  <div className="font-bold text-xs">{bin.label}</div>
                  <div className="text-[11px] text-slate-600">{bin.address}</div>
                  <div className="text-[11px] font-mono mt-1 font-semibold text-emerald-700">
                    Fill Level: {bin.currentFillPct}% ({bin.capacityLiters}L)
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
