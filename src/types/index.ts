/* ────────────────────────────────────────────────────────────
 * WasteOS — Core Domain Types
 * ──────────────────────────────────────────────────────────── */

// ── Roles & Auth ───────────────────────────────────────────
export type UserRole = "admin" | "operator" | "driver";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string; // ISO 8601
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

// ── Bins ───────────────────────────────────────────────────
export type BinStatus = "active" | "maintenance" | "offline" | "decommissioned";

export interface BinLocation {
  lat: number;
  lng: number;
}

export interface Bin {
  id: string;
  label: string;
  location: BinLocation;
  address: string;
  zone: string;
  capacityLiters: number;
  sensorId: string | null;
  status: BinStatus;
  currentFillPct: number | null;
  lastReadingAt: string | null;
  predictedOverflowAt: string | null;
  createdAt: string;
}

// ── Sensor Readings ────────────────────────────────────────
export interface SensorReading {
  id: string;
  binId: string;
  timestamp: string;
  distanceCm: number;
  fillPct: number;
  batteryPct: number | null;
  rssi: number | null;
  isSimulated: boolean;
}

export type SensorHealth = "healthy" | "degraded" | "offline" | "unknown";

export interface SensorStatus {
  sensorId: string;
  binId: string;
  health: SensorHealth;
  lastSeenAt: string | null;
  batteryPct: number | null;
  readingIntervalMinutes: number | null;
  /** Freshness: minutes since last reading */
  minutesSinceLastReading: number | null;
}

// ── Waste Scans (WasteDNA) ─────────────────────────────────
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  class: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface WasteScan {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  detections: Detection[];
  classCounts: Record<string, number>;
  totalObjects: number;
  averageConfidence: number;
  hasUncertainResults: boolean;
  verificationStatus: VerificationStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
  scannedBy: string;
  notes: string;
  createdAt: string;
  isSimulated?: boolean;
}

// ── Waste Records ──────────────────────────────────────────
export interface DisposalRecommendation {
  method: string;
  instructions: string;
  recyclable: boolean;
  hazardous: boolean;
}

export interface WasteRecord {
  id: string;
  scanId: string;
  wasteClass: string;
  count: number;
  confidence: number;
  recommendation: DisposalRecommendation;
  createdAt: string;
}

// ── Waste Categories (configurable) ───────────────────────
export interface WasteCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  recommendation: DisposalRecommendation;
}

// ── Vehicles ───────────────────────────────────────────────
export type VehicleStatus = "available" | "en_route" | "maintenance" | "offline";
export type VehicleType = "compactor" | "side_loader" | "rear_loader" | "mini";

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: VehicleType;
  capacityKg: number;
  status: VehicleStatus;
  driverId: string | null;
  driverName: string | null;
  currentLocation: BinLocation | null;
  createdAt: string;
}

// ── Routes ─────────────────────────────────────────────────
export type RouteStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface RouteStop {
  order: number;
  binId: string;
  binLabel: string;
  location: BinLocation;
  address?: string;
  fillPct?: number | null;
  fillPctAtDispatch?: number;
  estimatedArrival?: string | null;
  status?: string;
  collected?: boolean;
}

export interface Route {
  id: string;
  name?: string;
  vehicleId: string;
  vehicleName: string;
  driverName?: string | null;
  stops: RouteStop[];
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  capacityUtilizationPct?: number;
  totalBins?: number;
  collectedBins?: number;
  status: RouteStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ── Collections ────────────────────────────────────────────
export interface Collection {
  id: string;
  binId: string;
  binLabel: string;
  routeId: string | null;
  collectedBy: string;
  collectedAt: string;
  preFillPct: number;
  postFillPct: number | null;
  verified: boolean;
  notes: string;
}

// ── Alerts ─────────────────────────────────────────────────
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertType =
  | "overflow_imminent"
  | "sensor_offline"
  | "battery_low"
  | "missed_collection"
  | "contamination_detected"
  | "maintenance_due";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  binId: string | null;
  binLabel: string | null;
  message: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

// ── Analytics ──────────────────────────────────────────────
export interface FillTrendPoint {
  timestamp: string;
  avgFillPct: number;
  binCount: number;
}

export interface RecyclingMetric {
  category: string;
  totalKg: number;
  recycledKg: number;
  recoveryRate: number;
}

export interface DashboardStats {
  totalBins: number;
  activeBins: number;
  urgentBins: number;
  totalScans: number;
  totalCollections: number;
  activeVehicles: number;
  totalVehicles: number;
  activeAlerts: number;
  avgFillLevel: number;
  collectionEfficiency: number | null;
}

// ── Settings ───────────────────────────────────────────────
export interface ThresholdConfig {
  warningFillPct: number;
  criticalFillPct: number;
  sensorOfflineMinutes: number;
  batteryLowPct: number;
  maxUploadSizeMb: number;
  confidenceThreshold: number;
}
