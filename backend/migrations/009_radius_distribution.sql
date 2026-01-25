-- Distribute customers more realistically across the 3 hubs with distance simulations
-- We assume an 85-mile service radius from each hub.

-- 1. Leesville Hub (HQ) - Already defaulted, but let's give them distances
UPDATE customers SET distance_miles = ABS(64.2 - (RANDOM() % 40)) WHERE primary_dc_id = 'dc_leesville';

-- 2. Redistribute ~33% of TBD customers to Lake Charles
UPDATE customers 
SET primary_dc_id = 'dc_lake_charles', 
    distance_miles = ABS(42.5 + (RANDOM() % 35))
WHERE id IN (SELECT id FROM customers WHERE billing_address LIKE '%TBD%' LIMIT (SELECT COUNT(*) / 3 FROM customers WHERE billing_address LIKE '%TBD%'));

-- 3. Redistribute another ~33% of TBD customers to Lufkin
UPDATE customers 
SET primary_dc_id = 'dc_lufkin', 
    distance_miles = ABS(55.8 + (RANDOM() % 28))
WHERE id IN (SELECT id FROM customers WHERE billing_address LIKE '%TBD%' AND primary_dc_id = 'dc_leesville' LIMIT (SELECT COUNT(*) / 3 FROM customers WHERE billing_address LIKE '%TBD%'));

-- 4. Set specific distances for the verified regional seeds
UPDATE customers SET distance_miles = 12.4 WHERE id = 'lc_cust_1';
UPDATE customers SET distance_miles = 8.9 WHERE id = 'lc_cust_2';
UPDATE customers SET distance_miles = 15.6 WHERE id = 'lufkin_cust_1';
