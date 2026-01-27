import sqlite3
import os

db_path = '/app/backend/data/yci_sqlite.db'
if not os.path.exists(db_path):
    # Fallback for local testing if needed, though this runs on Fly
    db_path = 'backend/data/yci_sqlite.db'

def init_db():
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Distribution Centers
    cur.execute('''
        CREATE TABLE IF NOT EXISTS distribution_centers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT,
            address TEXT,
            latitude FLOAT,
            longitude FLOAT
        )
    ''')
    
    dcs = [
        ('dc_leesville', 'Leesville', 'Headquarters', '1707 Smart Street, Leesville, LA 71446', 31.1435, -93.2607),
        ('dc_lake_charles', 'Lake Charles', 'Distribution', '220 Bunker Road, Lake Charles, LA 70601', 30.2266, -93.2174),
        ('dc_lufkin', 'Lufkin', 'Distribution', '1107 Weiner St, Lufkin, TX 75904', 31.3382, -94.7291)
    ]
    
    cur.executemany('INSERT OR IGNORE INTO distribution_centers (id, name, type, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)', dcs)
    
    # 2. Ensure customers table has primary_dc_id
    try:
        cur.execute('ALTER TABLE customers ADD COLUMN primary_dc_id TEXT REFERENCES distribution_centers(id)')
    except sqlite3.OperationalError:
        pass # Already exists
        
    try:
        cur.execute('ALTER TABLE customers ADD COLUMN distance_miles FLOAT DEFAULT 0.0')
    except sqlite3.OperationalError:
        pass

    conn.commit()
    print("Database initialization complete.")
    conn.close()

if __name__ == "__main__":
    init_db()
