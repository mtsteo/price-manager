-- Price Manager Database Schema
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  store TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_price_records_product_id ON price_records(product_id);
CREATE INDEX idx_price_records_recorded_at ON price_records(recorded_at);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for now (adjust based on your auth needs)
CREATE POLICY "Allow anonymous access to products" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to price_records" ON price_records
  FOR ALL USING (true) WITH CHECK (true);

-- Monthly Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store TEXT NOT NULL,
  purchased_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchases_purchased_at ON purchases(purchased_at);
CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to purchases" ON purchases
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to purchase_items" ON purchase_items
  FOR ALL USING (true) WITH CHECK (true);
