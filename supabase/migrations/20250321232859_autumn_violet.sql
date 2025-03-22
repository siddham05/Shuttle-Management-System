/*
  # Add transfer support for routes

  1. New Tables
    - `transfer_points`
      - `id` (uuid, primary key)
      - `stop_id` (uuid, references stops)
      - `name` (text)
      - `wait_time` (integer) - Average wait time in minutes
      - `created_at` (timestamp)

  2. Changes
    - Add transfer-related fields to bookings table
      - `transfer_point_id` (uuid, references transfer_points)
      - `second_route_id` (uuid, references routes)
      - `total_wait_time` (integer)

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Create transfer points table
CREATE TABLE IF NOT EXISTS transfer_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid REFERENCES stops(id) ON DELETE CASCADE,
  name text NOT NULL,
  wait_time integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

-- Add transfer fields to bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'transfer_point_id'
  ) THEN
    ALTER TABLE bookings 
      ADD COLUMN transfer_point_id uuid REFERENCES transfer_points(id) ON DELETE SET NULL,
      ADD COLUMN second_route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
      ADD COLUMN total_wait_time integer;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE transfer_points ENABLE ROW LEVEL SECURITY;

-- Policies for transfer_points
CREATE POLICY "Anyone can view transfer points"
  ON transfer_points
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify transfer points"
  ON transfer_points
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );