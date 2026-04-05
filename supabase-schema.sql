-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY,
  bill_number   TEXT NOT NULL,
  items         JSONB NOT NULL DEFAULT '[]',
  subtotal_paise INTEGER NOT NULL DEFAULT 0,
  discount_paise INTEGER NOT NULL DEFAULT 0,
  gst_paise     INTEGER NOT NULL DEFAULT 0,
  total_paise   INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','upi','card')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Open policy (add auth later if needed)
CREATE POLICY "allow_all" ON orders FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
