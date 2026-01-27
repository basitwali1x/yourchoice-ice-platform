import pandas as pd
import sqlite3
import uuid
import os

# Paths
CSV_PATH = r"C:\Users\Basit\.gemini\antigravity\scratch\yci_data_import\your choice ice app data\Cleaned_Customer_Data.csv"
DB_PATH = r"C:\Users\Basit\.gemini\antigravity\playground\golden-curiosity\backend\yci_sqlite.db"

def import_customers():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV not found at {CSV_PATH}")
        return

    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} customers from CSV.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing customers/locations if necessary? 
    # For now, let's keep them and just add new ones, or use business_name as a key.
    # Actually, a clean wipe for real production import is often better if starting fresh.
    # But let's just insert with IGNORE or check existence.

    import_count = 0
    for _, row in df.iterrows():
        b_name = str(row['Customer']).strip()
        address = str(row['Full Address']).strip()
        phone = str(row['Main Phone']).strip() if pd.notna(row['Main Phone']) else ""
        depot = str(row['Depot']).strip()
        truck = str(row['Truck']).strip()
        day = str(row['Day']).strip()

        # Map Depot to DC ID
        dc_id = 'dc_leesville'
        if 'Lake Charles' in depot:
            dc_id = 'dc_lake_charles'
        elif 'Lufkin' in depot:
            dc_id = 'dc_lufkin'
        
        c_id = str(uuid.uuid4())
        
        try:
            # Check if exists
            cursor.execute("SELECT id FROM customers WHERE business_name = ?", (b_name,))
            existing = cursor.fetchone()
            if existing:
                continue

            # Insert Customer
            cursor.execute("""
                INSERT INTO customers (id, business_name, billing_address, billing_phone, primary_dc_id, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (c_id, b_name, address, phone, dc_id, f"Imported from Zip - Truck: {truck}, Day: {day}"))

            # Insert Location
            l_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO locations (id, customer_id, location_name, address_line)
                VALUES (?, ?, ?, ?)
            """, (l_id, c_id, "Main Site", address))
            
            # Setup Recurring Order
            ro_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO recurring_orders (id, customer_id, preferred_day, frequency)
                VALUES (?, ?, ?, ?)
            """, (ro_id, c_id, day if day else "Monday", "weekly"))

            import_count += 1
        except Exception as e:
            print(f"Error importing {b_name}: {e}")

    conn.commit()
    conn.close()
    print(f"Successfully imported {import_count} new customers.")

if __name__ == "__main__":
    import_customers()
