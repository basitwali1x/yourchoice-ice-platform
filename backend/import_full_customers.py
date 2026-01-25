import pandas as pd
import uuid

# Load data again
excel_path = "c:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/backend/arctic_data_source/all_customers.xlsx"

try:
    df = pd.read_excel(excel_path)
    print(f"Processing {len(df)} customers from source...")

    sql_statements = []
    
    loc_lc = 'b5f96a4a-10f8-436e-9538-3490710609b5'
    loc_hq = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    loc_other = 'c8d7e6f5-a4b3-2c1d-0e9f-8a7b6c5d4e3f'
    
    sql_statements.append(f"INSERT INTO locations (id, location_name, address_line, city, state, zip) VALUES ('{loc_other}', 'Regional Hub', 'TBD', 'TBD', 'LA', '00000') ON CONFLICT DO NOTHING;")

    for idx, row in df.iterrows():
        c_id = str(uuid.uuid4())
        name = str(row.get("name", row.get("Customer", f"Customer #{idx+1}"))).replace("'", "''")
        addr = str(row.get("address", row.get("Address", ""))).replace("'", "''")
        
        sql_statements.append(f"INSERT INTO customers (id, business_name, billing_address, notes) VALUES ('{c_id}', '{name}', '{addr}', 'Legacy Import');")
        
        l_id = str(uuid.uuid4())
        sql_statements.append(f"INSERT INTO locations (id, customer_id, location_name, address_line, city, state, zip) VALUES ('{l_id}', '{c_id}', '{name} Site', '{addr}', 'Unknown', 'LA', '70000');")

    with open("c:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/backend/migrations/004_full_customers.sql", "w") as f:
        f.write("-- Full Customer Import\n")
        f.write(";\n".join(sql_statements) + ";")
        
    print(f"Generated clean SQL for {len(df)} customers.")

except Exception as e:
    print(f"Error: {e}")
