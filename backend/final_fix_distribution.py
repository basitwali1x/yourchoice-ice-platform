import sqlite3
import pandas as pd
import os

CSV_DIR = 'C:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/temp_route_optimizer/backend'
DB_PATH = 'yci_sqlite.db'

def fix():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Baseline: Moving all customers to Leesville...")
    cursor.execute("UPDATE customers SET primary_dc_id = 'dc_leesville'")
    
    # 1. Keyword based assignment (Broad stroke)
    print("Stage 1: Keyword-based assignment...")
    
    # Lake Charles keywords
    lc_keywords = ["Lake Charles", "LA 706", "Sulphur", "Westlake", "Vinton", "Iowa", "Jennings", "Welsh", "Abbeville"]
    for kw in lc_keywords:
        cursor.execute('''
            UPDATE customers 
            SET primary_dc_id = 'dc_lake_charles' 
            WHERE id IN (
                SELECT c.id FROM customers c 
                JOIN locations l ON c.id = l.customer_id 
                WHERE l.address_line LIKE ? OR l.city LIKE ?
            )
        ''', (f'%{kw}%', f'%{kw}%'))
        
    # Lufkin keywords
    lufkin_keywords = ["Lufkin", "TX", "Huntington", "Zavalla", "Ratcliff", "Nacogdoches"]
    for kw in lufkin_keywords:
        cursor.execute('''
            UPDATE customers 
            SET primary_dc_id = 'dc_lufkin' 
            WHERE id IN (
                SELECT c.id FROM customers c 
                JOIN locations l ON c.id = l.customer_id 
                WHERE l.address_line LIKE ? OR l.city LIKE ?
            )
        ''', (f'%{kw}%', f'%{kw}%'))
        
    # 2. CSV Overrides (Fine tune to match user numbers)
    print("Stage 2: CSV Overrides...")
    
    # Target LC 90
    df_lc = pd.read_csv(os.path.join(CSV_DIR, 'real_lake_charles_customers_90.csv'))
    lc_names = [str(n).strip() for n in df_lc['Customer'].tolist()]
    for name in lc_names:
        cursor.execute("UPDATE customers SET primary_dc_id = 'dc_lake_charles' WHERE business_name = ?", (name,))
        
    # Target Lufkin 88
    # Note: the file lufkin_customers.csv has 88 customers (89 lines total)
    df_luf = pd.read_csv(os.path.join(CSV_DIR, 'lufkin_customers.csv'))
    luf_names = [str(n).strip() for n in df_luf['Customer'].tolist()]
    for name in luf_names:
        cursor.execute("UPDATE customers SET primary_dc_id = 'dc_lufkin' WHERE business_name = ?", (name,))

    conn.commit()
    
    # Final verification
    print("\n--- Final Verified Distribution ---")
    cursor.execute('SELECT id, name FROM distribution_centers')
    dcs = cursor.fetchall()
    for dc_id, name in dcs:
        cursor.execute('SELECT COUNT(*) FROM customers WHERE primary_dc_id = ?', (dc_id,))
        count = cursor.fetchone()[0]
        print(f"DC: {name} ({dc_id}) -> {count}")
        
    conn.close()

if __name__ == "__main__":
    fix()
