INSERT INTO waste_scans
  (id, image_url, thumbnail_url, scanned_by, verification_status,
   verified_by, verified_at, total_objects, average_confidence,
   has_uncertain_results, notes, is_simulated)
VALUES
  ('scan_iitr_003',
   'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80',
   'user_iitr_operator', 'verified', 'user_iitr_operator', NOW() - INTERVAL '5 hours',
   5, 0.89, FALSE, 'Mixed recyclable material review from the campus collection point', TRUE),
  ('scan_iitr_004',
   'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
   'user_iitr_operator', 'verified', 'user_iitr_operator', NOW() - INTERVAL '1 day',
   3, 0.93, FALSE, 'Paper and cardboard segregation check near the academic area', TRUE),
  ('scan_iitr_005',
   'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
   'user_iitr_operator', 'pending', NULL, NULL,
   3, 0.82, TRUE, 'E-waste review awaiting operator verification', TRUE),
  ('scan_iitr_006',
   'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
   'user_iitr_operator', 'verified', 'user_iitr_operator', NOW() - INTERVAL '2 days',
   2, 0.91, FALSE, 'Organic waste sample from the student dining area', TRUE)
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
  ('scan_iitr_003', 'Plastic', 0.94, 15, 18, 32, 38, '{"method":"Plastic recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_003', 'Plastic', 0.88, 54, 24, 28, 42, '{"method":"Plastic recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_003', 'Metal', 0.86, 39, 62, 24, 24, '{"method":"Metal recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_003', 'Paper', 0.83, 68, 55, 22, 30, '{"method":"Paper recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_003', 'Organic', 0.84, 10, 68, 25, 20, '{"method":"Composting","recyclable":false,"hazardous":false}'),
  ('scan_iitr_004', 'Paper', 0.96, 12, 16, 60, 55, '{"method":"Paper recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_004', 'Paper', 0.90, 65, 42, 25, 40, '{"method":"Paper recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_004', 'Cardboard', 0.93, 30, 65, 42, 25, '{"method":"Paper recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_005', 'E-waste', 0.91, 25, 22, 50, 50, '{"method":"Specialized disposal","recyclable":false,"hazardous":true}'),
  ('scan_iitr_005', 'Metal', 0.68, 10, 70, 25, 20, '{"method":"Metal recycling","recyclable":true,"hazardous":false}'),
  ('scan_iitr_005', 'Battery', 0.86, 62, 65, 20, 25, '{"method":"Specialized disposal","recyclable":false,"hazardous":true}'),
  ('scan_iitr_006', 'Organic', 0.93, 20, 15, 65, 70, '{"method":"Composting","recyclable":false,"hazardous":false}'),
  ('scan_iitr_006', 'Organic', 0.89, 58, 62, 28, 25, '{"method":"Composting","recyclable":false,"hazardous":false}')
ON CONFLICT DO NOTHING;
