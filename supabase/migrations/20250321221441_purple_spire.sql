/*
  # Add campus locations and routes

  1. New Data
    - Add initial campus stops with coordinates
    - Add campus shuttle routes
    - Create route-stop relationships

  2. Changes
    - Insert data into stops table
    - Insert data into routes table
    - Insert data into route_stops table
*/

-- Add campus stops
INSERT INTO stops (id, name, latitude, longitude)
VALUES
  ('1c7d0e7d-2e71-4d5e-8cf5-86e1d1f0e543', 'Main Gate', 40.7589, -73.9851),
  ('2a8b4f6c-9d3e-4c7a-b5d2-1e9f8a7b6c54', 'Library', 40.7592, -73.9848),
  ('3d9c5e8b-4f2a-4b6d-9c3e-2f1d8e7c5b4a', 'Student Center', 40.7587, -73.9853),
  ('4e0d6f9c-5b3a-4c8b-8d4f-3e2e9f8d7c6b', 'Academic Block', 40.7590, -73.9847),
  ('5f1e7e0d-6c4b-4d9c-9e5f-4a3f0e9e8d7c', 'Sports Complex', 40.7585, -73.9855),
  ('6f2f8a1e-7d5c-4e0d-0f6f-5e4f1a0f9e8d', 'Cafeteria', 40.7588, -73.9850);

-- Add campus routes
INSERT INTO routes (id, name, description, peak_hours, estimated_time)
VALUES
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', 'Main Loop', 'Circular route covering all major stops', ARRAY['08:00', '12:00', '17:00'], 20),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Express Route', 'Direct route between main points', ARRAY['09:00', '13:00', '18:00'], 15),
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Academic Circuit', 'Connects academic buildings', ARRAY['07:30', '11:30', '16:30'], 25);

-- Connect routes with stops
INSERT INTO route_stops (route_id, stop_id, stop_order)
VALUES
  -- Main Loop
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', '1c7d0e7d-2e71-4d5e-8cf5-86e1d1f0e543', 1),
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', '2a8b4f6c-9d3e-4c7a-b5d2-1e9f8a7b6c54', 2),
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', '3d9c5e8b-4f2a-4b6d-9c3e-2f1d8e7c5b4a', 3),
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', '4e0d6f9c-5b3a-4c8b-8d4f-3e2e9f8d7c6b', 4),
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', '5f1e7e0d-6c4b-4d9c-9e5f-4a3f0e9e8d7c', 5),
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', '6f2f8a1e-7d5c-4e0d-0f6f-5e4f1a0f9e8d', 6),

  -- Express Route
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '1c7d0e7d-2e71-4d5e-8cf5-86e1d1f0e543', 1),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '4e0d6f9c-5b3a-4c8b-8d4f-3e2e9f8d7c6b', 2),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '6f2f8a1e-7d5c-4e0d-0f6f-5e4f1a0f9e8d', 3),

  -- Academic Circuit
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '2a8b4f6c-9d3e-4c7a-b5d2-1e9f8a7b6c54', 1),
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '4e0d6f9c-5b3a-4c8b-8d4f-3e2e9f8d7c6b', 2),
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '3d9c5e8b-4f2a-4b6d-9c3e-2f1d8e7c5b4a', 3);