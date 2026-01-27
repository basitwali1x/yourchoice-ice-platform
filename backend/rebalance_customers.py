import sqlite3
import pandas as pd
import os

CSV_DIR = 'C:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/temp_route_optimizer/backend'
DB_PATH = 'yci_sqlite.db'

MAPPINGS = [
    {
        'file': 'real_lake_charles_customers_90.csv',
        'dc_id': 'dc_lake_charles',
        'name_col': 'Customer',
        'addr_col': 'Address',
        'lat_col': 'Latitude',
        'lng_col': 'Longitude'
    },
    {
        'file': 'lufkin_customers.csv',
        'dc_id': 'dc_lufkin',
        'name_col': 'Customer',
        'addr_col': 'Address',
        'lat_col': 'Latitude',
        'lng_col': 'Longitude'
    },
    {
        'file': 'leesville_customers.csv',
        'dc_id': 'dc_leesville',
        'name_col': 'Customer',
        'addr_col': 'Address',
        'lat_col': 'Latitude',
        'lng_col': 'Longitude'
    }
]

def rebalance():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    total_updated = 0
    
    for mapping in MAPPINGS:
        file_path = os.path.join(CSV_DIR, mapping['file'])
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        print(f"Processing {mapping['file']} for DC {mapping['dc_id']}...")
        df = pd.read_csv(file_path)
        
        for _, row in df.iterrows():
            name = str(row[mapping['name_col']]).strip()
            lat = float(row[mapping['lat_col']])
            lng = float(row[mapping['lng_col']])
            addr = str(row[mapping['addr_col']])
            
            # Update customer DC
            cursor.execute('''
                UPDATE customers 
                SET primary_dc_id = ? 
                WHERE business_name = ?
            ''', (mapping['dc_id'], name))
            
            if cursor.rowcount > 0:
                # Update location coordinates
                cursor.execute('''
                    UPDATE locations 
                    SET latitude = ?, longitude = ?, address_line = ?
                    WHERE customer_id = (SELECT id FROM customers WHERE business_name = ?)
                ''', (lat, lng, addr, name))
                total_updated += cursor.rowcount
            else:
                # Try to create if not exists? (User might have missing ones)
                # For now just log
                # print(f"  Customer not found in DB: {name}")
                pass
                
    conn.commit()
    
    # Check final counts
    print("\n--- Final Distribution ---")
    cursor.execute('SELECT id, name FROM distribution_centers')
    dcs = cursor.fetchall()
    for dc_id, name in dcs:
        cursor.execute('SELECT COUNT(*) FROM customers WHERE primary_dc_id = ?', (dc_id,))
        print(f"{name}: {cursor.fetchone()[0]}")
        
    conn.close()
    print(f"\nDone. Updated {total_updated} location records.")

if __name__ == "__main__":
    rebalance()
