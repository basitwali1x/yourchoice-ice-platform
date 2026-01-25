-- Real Data Migration: Locations (Source: Arctic Ice Solutions ETL Default)
INSERT INTO locations (id, location_name, address_line, city, state, zip, access_notes)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Leesville HQ & Production', '123 Ice Plant Rd', 'Leesville', 'LA', '71446', 'Headquarters'),
('b5f96a4a-10f8-436e-9538-3490710609b5', 'Lake Charles Distribution', '456 Distribution Ave', 'Lake Charles', 'LA', '70601', 'Distribution Center')
ON CONFLICT (id) DO NOTHING;
