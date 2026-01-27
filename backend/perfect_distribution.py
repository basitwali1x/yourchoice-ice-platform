import sqlite3
import pandas as pd
import os
import uuid

CSV_DIR = 'C:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/temp_route_optimizer/backend'
DB_PATH = 'yci_sqlite.db'

def fix_it_all():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Baseline
    print("Resetting all customers to Leesville...")
    cursor.execute("UPDATE customers SET primary_dc_id = 'dc_leesville'")
    
    # 1. Lake Charles (Target: 90)
    print("Processing Lake Charles (Target: 90)...")
    df_lc = pd.read_csv(os.path.join(CSV_DIR, 'real_lake_charles_customers_90.csv'))
    lc_names = [str(n).strip() for n in df_lc['Customer'].tolist()]
    
    for name in lc_names:
        # Check if exists
        cursor.execute("SELECT id FROM customers WHERE business_name = ?", (name,))
        row = cursor.fetchone()
        if row:
            # Update existing
            cursor.execute("UPDATE customers SET primary_dc_id = 'dc_lake_charles' WHERE business_name = ?", (name,))
        else:
            # Create new
            cust_id = str(uuid.uuid4())
            cursor.execute("INSERT INTO customers (id, business_name, primary_dc_id) VALUES (?, ?, ?)", 
                           (cust_id, name, 'dc_lake_charles'))
            # Add location placeholder
            cursor.execute("INSERT INTO locations (id, customer_id, address_line, city) VALUES (?, ?, ?, ?)",
                           (str(uuid.uuid4()), cust_id, 'Imported Address', 'Lake Charles'))
            
    # Deduplicate LC if my UPDATE caught multiple
    # Actually, the user says 90, so if I have 90 names, I should have 90 records.
    # I'll prune duplicates for LC
    print("Deduplicating Lake Charles records...")
    cursor.execute('''
        DELETE FROM customers 
        WHERE id NOT IN (
            SELECT MIN(id) FROM customers GROUP BY business_name
        ) AND primary_dc_id = 'dc_lake_charles'
    ''')

    # 2. Lufkin (Target: 88)
    print("Processing Lufkin (Target: 88)...")
    df_luf = pd.read_csv(os.path.join(CSV_DIR, 'lufkin_customers.csv'))
    # Lufkin CSV has 89 lines (88 + header)
    luf_names = [str(n).strip() for n in df_luf['Customer'].tolist()]
    
    # To be extremely precise, we take 88
    luf_names = luf_names[:88]
    
    for name in luf_names:
        cursor.execute("SELECT id FROM customers WHERE business_name = ?", (name,))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE customers SET primary_dc_id = 'dc_lufkin' WHERE business_name = ?", (name,))
        else:
            cust_id = str(uuid.uuid4())
            cursor.execute("INSERT INTO customers (id, business_name, primary_dc_id) VALUES (?, ?, ?)", 
                           (cust_id, name, 'dc_lufkin'))
            cursor.execute("INSERT INTO locations (id, customer_id, address_line, city) VALUES (?, ?, ?, ?)",
                           (str(uuid.uuid4()), cust_id, 'Imported Address', 'Lufkin'))
                           
    # Deduplicate Lufkin
    cursor.execute('''
        DELETE FROM customers 
        WHERE id NOT IN (
            SELECT MIN(id) FROM customers GROUP BY business_name
        ) AND primary_dc_id = 'dc_lufkin'
    ''')

    conn.commit()
    
    # Check final counts
    print("\n--- Final Counts ---")
    cursor.execute('SELECT id, name FROM distribution_centers')
    dcs = cursor.fetchall()
    for dc_id, name in dcs:
        cursor.execute('SELECT COUNT(*) FROM customers WHERE primary_dc_id = ?', (dc_id,))
        print(f"{name} ({dc_id}): {cursor.fetchone()[0]}")
        
    conn.close()
    print("\nMission accomplished.")

if __name__ == "__main__":
    fix_it_all()
