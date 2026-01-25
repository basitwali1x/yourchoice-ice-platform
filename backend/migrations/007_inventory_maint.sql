-- Seed Products (Internal Inventory)
INSERT OR IGNORE INTO products (id, name, bag_size_lbs, sku, base_price_cents) VALUES ('p1', 'Crystal Premium Ice (Small)', 8, 'ICE-8LB', 250);
INSERT OR IGNORE INTO products (id, name, bag_size_lbs, sku, base_price_cents) VALUES ('p2', 'Crystal Premium Ice (Large)', 20, 'ICE-20LB', 500);

-- Seed Maintenance (Work Orders)
-- Need a location first
INSERT OR IGNORE INTO work_orders (id, location_id, status, priority, issue_type, description) VALUES ('wo1', 'loc_1', 'open', 1, 'Vehicle', 'Truck #04 - Brake pads replacement needed');
INSERT OR IGNORE INTO work_orders (id, location_id, status, priority, issue_type, description) VALUES ('wo2', 'loc_1', 'in_progress', 3, 'Equipment', 'Lake Charles Warehouse - Freezer door seal leak');
INSERT OR IGNORE INTO work_orders (id, location_id, status, priority, issue_type, description) VALUES ('wo3', 'loc_2', 'open', 2, 'Vehicle', 'Truck #12 - Oil change scheduled');
