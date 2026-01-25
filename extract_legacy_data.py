import sqlite3
import json
import os

LEGACY_DB_PATH = "c:/Users/Basit/.gemini/antigravity/playground/perihelion-sunspot/arctic-ice-solutions/backend/app.db"
OUTPUT_DIR = "c:/Users/Basit/.gemini/antigravity/playground/golden-curiosity/backend/arctic_data_source"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def dump_table(cursor, table_name):
    print(f"Dumping {table_name}...")
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        # Get column names
        column_names = [description[0] for description in cursor.description]
        
        data = []
        for row in rows:
            data.append(dict(zip(column_names, row)))
            
        with open(f"{OUTPUT_DIR}/{table_name}.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        
        print(f"  -> Saved {len(data)} rows to {table_name}.json")
        return len(data)
    except Exception as e:
        print(f"  -> Error: {e}")
        return 0

def main():
    if not os.path.exists(LEGACY_DB_PATH):
        print(f"Error: Legacy DB not found at {LEGACY_DB_PATH}")
        return

    conn = sqlite3.connect(LEGACY_DB_PATH)
    cursor = conn.cursor()
    
    # List tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f"Found {len(tables)} tables: {[t[0] for t in tables]}")
    
    total_rows = 0
    for table in tables:
        total_rows += dump_table(cursor, table[0])
        
    conn.close()
    print(f"\nTotal extracted rows: {total_rows}")

if __name__ == "__main__":
    main()
