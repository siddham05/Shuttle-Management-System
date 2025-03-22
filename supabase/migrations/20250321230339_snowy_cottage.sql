/*
  # Add transactions table for point recharge

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `amount` (integer, points added)
      - `payment_method` (text)
      - `payment_id` (text, UPI transaction ID)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on transactions table
    - Add policies for users to view their own transactions
    - Add policy for admins to view all transactions
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL,
  payment_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed'))
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update transaction status
CREATE POLICY "Admins can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );