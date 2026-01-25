-- Create Master Distribution Centers Table if needed, or link to Locations
-- Let's use the existing locations table as the source for "DC" (Distribution Centers)
-- We also need to tag customers with their primary DC.

-- 1. Create a DistributionCenters table for clarity
CREATE TABLE IF NOT EXISTS distribution_centers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Headquarters & Production' or 'Distribution'
    address TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- 2. Insert the 3 Core Locations
INSERT OR IGNORE INTO distribution_centers (id, name, type, address) VALUES 
('dc_leesville', 'Leesville', 'Headquarters & Production', 'Leesville, LA'),
('dc_lake_charles', 'Lake Charles', 'Distribution', 'Lake Charles, LA'),
('dc_lufkin', 'Lufkin', 'Distribution', 'Lufkin, TX');

-- 3. Add dc_id to Customers table to associate them with a specific center
ALTER TABLE customers ADD COLUMN primary_dc_id TEXT REFERENCES distribution_centers(id);

-- 4. Assign current customers to Leesville by default (as they were imported without a tag)
UPDATE customers SET primary_dc_id = 'dc_leesville' WHERE primary_dc_id IS NULL;

-- 5. Seed some specific customers for Lake Charles and Lufkin for verification
INSERT OR IGNORE INTO customers (id, business_name, billing_address, primary_dc_id) VALUES 
('lc_cust_1', 'Lake Charles Seafood Mart', '101 Bay Rd, Lake Charles, LA', 'dc_lake_charles'),
('lc_cust_2', 'Cajun Stop Retail', '202 Spice St, Lake Charles, LA', 'dc_lake_charles'),
('lufkin_cust_1', 'Texas Pine Grocers', '300 Forest Ave, Lufkin, TX', 'dc_lufkin');

-- 6. Add dc_id to Routes to track regional dispatch
ALTER TABLE routes ADD COLUMN dc_id TEXT REFERENCES distribution_centers(id);
UPDATE routes SET dc_id = 'dc_leesville' WHERE dc_id IS NULL;
