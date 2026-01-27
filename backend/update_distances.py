import sqlite3
import math
from services.maps import GoogleMapsService

def update_distances():
    maps = GoogleMapsService()
    conn = sqlite3.connect('yci_sqlite.db')
    cursor = conn.cursor()
    
    # Get all DCs with coordinates
    cursor.execute('SELECT id, latitude, longitude FROM distribution_centers')
    dcs = {row[0]: (row[1], row[2]) for row in cursor.fetchall()}
    
    # Get all customers with their primary DC and primary location coordinates
    cursor.execute('''
        SELECT c.id, c.primary_dc_id, l.latitude, l.longitude
        FROM customers c
        JOIN locations l ON c.id = l.customer_id
    ''')
    rows = cursor.fetchall()
    
    updates = []
    for cust_id, dc_id, loc_lat, loc_lng in rows:
        if dc_id in dcs:
            dc_lat, dc_lng = dcs[dc_id]
            dist = maps.calculate_distance(loc_lat, loc_lng, dc_lat, dc_lng)
            updates.append((dist, cust_id))
            
    if updates:
        print(f"Updating {len(updates)} customer distances...")
        cursor.executemany('UPDATE customers SET distance_miles = ? WHERE id = ?', updates)
        conn.commit()
    
    conn.close()
    print("Distance synchronization complete.")

if __name__ == "__main__":
    update_distances()
