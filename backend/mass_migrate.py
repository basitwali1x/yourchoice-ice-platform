import json
import uuid
import datetime

source_path = "c:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/temp_arctic_repo/imported_sales_data.json"
out_sql = "c:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/backend/migrations/005_mass_migration.sql"

print("Loading mass data JSON...")
with open(source_path, "r") as f:
    data = json.load(f)

customers = data.get("customers", [])
orders = data.get("orders", [])

sql_lines = ["-- Mass Migration of Real Data"]

# 1. Locations
locs = [
    ('loc_1', 'Leesville HQ', '123 Ice Plant Rd', 'Leesville', 'LA', '71446'),
    ('loc_2', 'Lake Charles Dist', '456 Distribution Ave', 'Lake Charles', 'LA', '70601'),
    ('loc_3', 'Lufkin Dist', '789 Lufkin St', 'Lufkin', 'TX', '75901'),
    ('loc_4', 'Jasper Warehouse', '321 Jasper Hwy', 'Jasper', 'TX', '75951')
]
for l in locs:
    sql_lines.append(f"INSERT INTO locations (id, location_name, address_line, city, state, zip) VALUES ('{l[0]}', '{l[1]}', '{l[2]}', '{l[3]}', '{l[4]}', '{l[5]}') ON CONFLICT (id) DO NOTHING;")

# 2. Customers
print(f"Processing {len(customers)} customers...")
for c in customers:
    cid = c.get("id")
    name = c.get("name", "").replace("'", "''")
    addr = c.get("address", "").replace("'", "''")
    phone = c.get("phone", "")
    email = c.get("email", "")
    sql_lines.append(f"INSERT INTO customers (id, business_name, billing_address, billing_phone, billing_email, notes) VALUES ('{cid}', '{name}', '{addr}', '{phone}', '{email}', 'Real Legacy Data') ON CONFLICT DO NOTHING;")
    
    # Create the required Site Location for each customer
    loc_id = str(uuid.uuid4())
    sql_lines.append(f"INSERT INTO locations (id, customer_id, location_name, address_line, city, state, zip) VALUES ('{loc_id}', '{cid}', 'Site A', '{addr}', 'TBD', 'LA', '00000') ON CONFLICT DO NOTHING;")

# 3. Orders & Deliveries
print(f"Processing last 2000 orders for heatmap...")
sorted_orders = sorted(orders, key=lambda x: x.get('date', ''), reverse=True)[:2000]

# Pre-map customers
cust_name_to_id = {c['name']: c['id'] for c in customers}

# Ensure we have a default user for creator/submitted_by
user_id = 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6'
sql_lines.append(f"INSERT INTO users (id, role, full_name, email, password_hash) VALUES ('{user_id}', 'admin', 'System Admin', 'admin@yci.local', 'hashed') ON CONFLICT DO NOTHING;")

for o in sorted_orders:
    oid = str(uuid.uuid4())
    cname = o.get("customer_name")
    match_cid = cust_name_to_id.get(cname)
    if not match_cid: continue
    
    # Find one location for this customer to use in order
    # (Since we just created one 'Site A', we'll just use a subquery or fixed link if we tracked it)
    # Actually, for simplicity in migration SQL:
    date = o.get("date", datetime.date.today().isoformat())
    amount = int(float(o.get("total_amount", 0)) * 100)
    
    # Correct columns for 'orders' table
    sql_lines.append(f"INSERT INTO orders (id, customer_id, status, requested_delivery_date) VALUES ('{oid}', '{match_cid}', 'delivered', '{date.split('T')[0]}');")
    
    # Matching Route and Delivery
    rid = str(uuid.uuid4())
    sql_lines.append(f"INSERT INTO routes (id, title, status, route_date) VALUES ('{rid}', 'Historical Archive', 'completed', '{date.split('T')[0]}');")
    
    sid = str(uuid.uuid4())
    # We need a location_id. For legacy migration, we'll just link to Leesville HQ as the route origin point stop
    sql_lines.append(f"INSERT INTO route_stops (id, route_id, location_id, order_id, status, stop_sequence) VALUES ('{sid}', '{rid}', 'loc_1', '{oid}', 'completed', 1);")
    
    # Deliveries MUST have a payment method
    sql_lines.append(f"INSERT INTO deliveries (id, route_stop_id, payment, amount_cents) VALUES ('{str(uuid.uuid4())}', '{sid}', 'cash', {amount});")

print("Writing SQL file...")
with open(out_sql, "w") as f:
    f.write("\n".join(sql_lines))
print("Done.")
