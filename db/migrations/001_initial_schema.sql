CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'driver')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bins (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  zone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  capacity_liters INTEGER NOT NULL CHECK (capacity_liters > 0),
  sensor_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'maintenance', 'offline', 'decommissioned')),
  current_fill_pct NUMERIC(5, 2) CHECK (current_fill_pct BETWEEN 0 AND 100),
  last_reading_at TIMESTAMPTZ,
  predicted_overflow_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id TEXT PRIMARY KEY,
  bin_id TEXT NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
  sensor_id TEXT,
  recorded_at TIMESTAMPTZ NOT NULL,
  distance_cm NUMERIC(8, 2) NOT NULL CHECK (distance_cm >= 0),
  fill_pct NUMERIC(5, 2) NOT NULL CHECK (fill_pct BETWEEN 0 AND 100),
  battery_pct NUMERIC(5, 2) CHECK (battery_pct BETWEEN 0 AND 100),
  rssi INTEGER,
  is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS sensor_readings_bin_time_idx
  ON sensor_readings (bin_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS waste_scans (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  scanned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  total_objects INTEGER NOT NULL DEFAULT 0 CHECK (total_objects >= 0),
  average_confidence NUMERIC(5, 4) NOT NULL DEFAULT 0 CHECK (average_confidence BETWEEN 0 AND 1),
  has_uncertain_results BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL REFERENCES waste_scans(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  confidence NUMERIC(5, 4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  box_x NUMERIC(8, 2) NOT NULL,
  box_y NUMERIC(8, 2) NOT NULL,
  box_width NUMERIC(8, 2) NOT NULL CHECK (box_width >= 0),
  box_height NUMERIC(8, 2) NOT NULL CHECK (box_height >= 0),
  recommendation JSONB
);
CREATE INDEX IF NOT EXISTS detections_scan_idx ON detections (scan_id);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('compactor', 'side_loader', 'rear_loader', 'mini')),
  capacity_kg INTEGER NOT NULL CHECK (capacity_kg > 0),
  status TEXT NOT NULL CHECK (status IN ('available', 'en_route', 'maintenance', 'offline')),
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  name TEXT,
  vehicle_id TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  total_distance_km NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  bin_id TEXT NOT NULL REFERENCES bins(id) ON DELETE RESTRICT,
  stop_order INTEGER NOT NULL CHECK (stop_order > 0),
  fill_pct_at_dispatch NUMERIC(5, 2),
  estimated_arrival TIMESTAMPTZ,
  collected BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (route_id, stop_order)
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  bin_id TEXT NOT NULL REFERENCES bins(id) ON DELETE RESTRICT,
  route_id TEXT REFERENCES routes(id) ON DELETE SET NULL,
  collected_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pre_fill_pct NUMERIC(5, 2) NOT NULL CHECK (pre_fill_pct BETWEEN 0 AND 100),
  post_fill_pct NUMERIC(5, 2) CHECK (post_fill_pct BETWEEN 0 AND 100),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  bin_id TEXT REFERENCES bins(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS alerts_active_idx ON alerts (acknowledged, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_events_entity_idx
  ON audit_events (entity_type, entity_id, created_at DESC);
