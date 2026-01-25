-- Real Data Migration: Products (Source: Arctic Ice Solutions ETL Default)
INSERT INTO products (id, name, bag_size_lbs, sku, base_price_cents)
VALUES
('c7f8a9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d', '8lb Ice Bag', 8, 'YCI-8LB', 350),
('d8e9f0a1-2b3c-4d5e-6f7a-8b9c0d1e2f3a', '20lb Ice Bag', 20, 'YCI-20LB', 700)
ON CONFLICT (sku) DO NOTHING;
