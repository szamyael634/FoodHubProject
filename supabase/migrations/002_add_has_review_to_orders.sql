-- Add has_review column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS has_review BOOLEAN DEFAULT false;

-- Create index on has_review for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_has_review ON orders(has_review);
