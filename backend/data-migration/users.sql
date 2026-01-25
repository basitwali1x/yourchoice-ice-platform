-- Real Data Migration: Users (Source: Arctic Ice Solutions ETL Default)
-- Note: Passwords are hashed placeholders from legacy system.
INSERT INTO users (id, role, full_name, email, password_hash)
VALUES
('e9f0a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b', 'manager', 'System Manager', 'manager@arcticice.com', '$2b$12$fkpOy4Rp6n.B5Eo52PxImeDh1UFh3PKm7h3nVR3BUz.FlsoYXSgFS')
ON CONFLICT (email) DO NOTHING;
