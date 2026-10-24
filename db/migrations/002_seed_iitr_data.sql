INSERT INTO users (id, email, name, role)
VALUES
  ('user_iitr_admin', 'admin@swachhiitr.in', 'SwachhIITR Administrator', 'admin'),
  ('user_iitr_operator', 'operator@swachhiitr.in', 'Campus Operations', 'operator'),
  ('user_iitr_driver', 'driver@swachhiitr.in', 'Campus Collection Team', 'driver')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

INSERT INTO bins
  (id, label, address, zone, latitude, longitude, capacity_liters, sensor_id,
   status, current_fill_pct, last_reading_at, predicted_overflow_at)
VALUES
  ('bin_001', 'IITR-MAIN-01', 'Main Gate, IIT Roorkee', 'Main Campus', 29.8642, 77.8963, 240, 'iitr_sensor_001', 'active', 64, NOW() - INTERVAL '12 minutes', NOW() + INTERVAL '18 hours'),
  ('bin_002', 'IITR-ACAD-02', 'Academic Area, IIT Roorkee', 'Academic Area', 29.8660, 77.8951, 240, 'iitr_sensor_002', 'active', 78, NOW() - INTERVAL '18 minutes', NOW() + INTERVAL '9 hours'),
  ('bin_003', 'IITR-JAMES-03', 'James Thomason Building', 'Academic Area', 29.8651, 77.8940, 360, 'iitr_sensor_003', 'active', 46, NOW() - INTERVAL '22 minutes', NULL),
  ('bin_004', 'IITR-HOSTEL-04', 'Azad Bhawan Hostel', 'Hostels', 29.8692, 77.8932, 360, 'iitr_sensor_004', 'active', 88, NOW() - INTERVAL '8 minutes', NOW() + INTERVAL '3 hours'),
  ('bin_005', 'IITR-HOSTEL-05', 'Rajendra Bhawan Hostel', 'Hostels', 29.8704, 77.8957, 360, 'iitr_sensor_005', 'active', 71, NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '11 hours'),
  ('bin_006', 'IITR-LIB-06', 'Central Library, IIT Roorkee', 'Academic Area', 29.8658, 77.8918, 240, 'iitr_sensor_006', 'active', 53, NOW() - INTERVAL '25 minutes', NULL),
  ('bin_007', 'IITR-SAC-07', 'Students Activity Centre', 'Student Zone', 29.8638, 77.8923, 360, 'iitr_sensor_007', 'active', 82, NOW() - INTERVAL '11 minutes', NOW() + INTERVAL '6 hours'),
  ('bin_008', 'IITR-SPORTS-08', 'Sports Complex', 'Sports Zone', 29.8619, 77.8947, 360, 'iitr_sensor_008', 'active', 39, NOW() - INTERVAL '31 minutes', NULL),
  ('bin_009', 'IITR-GANGA-09', 'Ganga Bhawan Hostel', 'Hostels', 29.8676, 77.8898, 360, 'iitr_sensor_009', 'active', 93, NOW() - INTERVAL '6 minutes', NOW() + INTERVAL '2 hours'),
  ('bin_010', 'IITR-RAIL-10', 'IIT Roorkee Railway Road Gate', 'Main Campus', 29.8624, 77.8980, 240, 'iitr_sensor_010', 'active', 57, NOW() - INTERVAL '20 minutes', NULL),
  ('bin_011', 'IITR-RES-11', 'Faculty Residences', 'Residential Zone', 29.8589, 77.8938, 360, 'iitr_sensor_011', 'active', 67, NOW() - INTERVAL '17 minutes', NOW() + INTERVAL '15 hours'),
  ('bin_012', 'IITR-WORK-12', 'Workshop Area', 'Service Zone', 29.8610, 77.8892, 360, 'iitr_sensor_012', 'active', 74, NOW() - INTERVAL '14 minutes', NOW() + INTERVAL '10 hours')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  address = EXCLUDED.address,
  zone = EXCLUDED.zone,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  capacity_liters = EXCLUDED.capacity_liters,
  sensor_id = EXCLUDED.sensor_id,
  status = EXCLUDED.status,
  current_fill_pct = EXCLUDED.current_fill_pct,
  last_reading_at = EXCLUDED.last_reading_at,
  predicted_overflow_at = EXCLUDED.predicted_overflow_at;

INSERT INTO vehicles (id, name, plate_number, type, capacity_kg, status, driver_id, latitude, longitude)
VALUES
  ('veh_iitr_01', 'Campus Green Collector 01', 'UK08-SW-0001', 'mini', 800, 'available', 'user_iitr_driver', 29.8642, 77.8963),
  ('veh_iitr_02', 'Campus Green Collector 02', 'UK08-SW-0002', 'mini', 800, 'available', 'user_iitr_driver', 29.8658, 77.8918)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  plate_number = EXCLUDED.plate_number,
  status = EXCLUDED.status,
  driver_id = EXCLUDED.driver_id,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

INSERT INTO sensor_readings
  (id, bin_id, sensor_id, recorded_at, distance_cm, fill_pct, battery_pct, rssi, is_simulated, payload)
SELECT
  'reading_iitr_' || b.id,
  b.id,
  b.sensor_id,
  b.last_reading_at,
  ROUND((100 - b.current_fill_pct) * b.capacity_liters / 1000, 2),
  b.current_fill_pct,
  88,
  -62,
  TRUE,
  jsonb_build_object('source', 'IITR demo seed', 'campus', 'IIT Roorkee')
FROM bins b
WHERE b.id LIKE 'bin_%'
ON CONFLICT (id) DO NOTHING;

INSERT INTO alerts (id, type, severity, bin_id, message)
VALUES
  ('alert_iitr_004', 'overflow_imminent', 'critical', 'bin_004', 'IITR-HOSTEL-04 is at 88% capacity'),
  ('alert_iitr_009', 'overflow_imminent', 'critical', 'bin_009', 'IITR-GANGA-09 is at 93% capacity'),
  ('alert_iitr_002', 'overflow_imminent', 'warning', 'bin_002', 'IITR-ACAD-02 is approaching collection threshold')
ON CONFLICT (id) DO UPDATE SET
  severity = EXCLUDED.severity,
  bin_id = EXCLUDED.bin_id,
  message = EXCLUDED.message;

INSERT INTO waste_scans
  (id, image_url, thumbnail_url, scanned_by, verification_status,
   verified_by, verified_at, total_objects, average_confidence,
   has_uncertain_results, notes, is_simulated)
VALUES
  ('scan_iitr_001', 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
   'https://res.cloudinary.com/demo/image/upload/w_400/sample.jpg',
   'user_iitr_operator', 'verified', 'user_iitr_operator', NOW() - INTERVAL '2 hours',
   4, 0.91, FALSE, 'Campus canteen segregation review', TRUE),
  ('scan_iitr_002', 'https://res.cloudinary.com/demo/image/upload/coffee_cup.jpg',
   'https://res.cloudinary.com/demo/image/upload/w_400/coffee_cup.jpg',
   'user_iitr_operator', 'pending', NULL, NULL,
   2, 0.84, TRUE, 'Student activity area review pending', TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  scanned_by = EXCLUDED.scanned_by,
  verification_status = EXCLUDED.verification_status,
  verified_by = EXCLUDED.verified_by,
  verified_at = EXCLUDED.verified_at,
  total_objects = EXCLUDED.total_objects,
  average_confidence = EXCLUDED.average_confidence,
  has_uncertain_results = EXCLUDED.has_uncertain_results,
  notes = EXCLUDED.notes;

INSERT INTO detections
  (scan_id, class_name, confidence, box_x, box_y, box_width, box_height, recommendation)
VALUES
  ('scan_iitr_001', 'Paper', 0.94, 12, 16, 30, 34,
   '{"method":"Paper recycling","instructions":"Place in the dry recyclable stream","recyclable":true,"hazardous":false}'),
  ('scan_iitr_001', 'Plastic', 0.91, 52, 22, 28, 39,
   '{"method":"Plastic recycling","instructions":"Rinse and place in the dry recyclable stream","recyclable":true,"hazardous":false}'),
  ('scan_iitr_001', 'Organic', 0.89, 28, 62, 36, 27,
   '{"method":"Composting","instructions":"Place in the wet waste stream","recyclable":false,"hazardous":false}'),
  ('scan_iitr_002', 'Plastic', 0.84, 18, 25, 42, 38,
   '{"method":"Plastic recycling","instructions":"Rinse and place in the dry recyclable stream","recyclable":true,"hazardous":false}')
ON CONFLICT DO NOTHING;

INSERT INTO routes
  (id, name, vehicle_id, status, total_distance_km, estimated_duration_minutes)
VALUES
  ('route_iitr_priority', 'IITR Priority Collection', 'veh_iitr_01', 'planned', 8.6, 32)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  vehicle_id = EXCLUDED.vehicle_id,
  status = EXCLUDED.status,
  total_distance_km = EXCLUDED.total_distance_km,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes;

INSERT INTO route_stops (route_id, bin_id, stop_order, fill_pct_at_dispatch)
VALUES
  ('route_iitr_priority', 'bin_009', 1, 93),
  ('route_iitr_priority', 'bin_004', 2, 88),
  ('route_iitr_priority', 'bin_007', 3, 82)
ON CONFLICT (route_id, stop_order) DO UPDATE SET
  bin_id = EXCLUDED.bin_id,
  fill_pct_at_dispatch = EXCLUDED.fill_pct_at_dispatch;
