import sqlite3
import os
import sys

# Add current directory to path so we can import services
sys.path.append(os.getcwd())

from services.maps import GoogleMapsService

def populate_coordinates():
    maps = GoogleMapsService()
    conn = sqlite3.connect('yci_sqlite.db')
    cursor = conn.cursor()
    
    # 1. Update Distribution Centers
    cursor.execute('SELECT id, name, address FROM distribution_centers')
    dcs = cursor.fetchall()
    print(f"Updating {len(dcs)} Distribution Centers...")
    for dc_id, name, address in dcs:
        lat, lng = maps.geocode_address(address or f"{name} Depot")
        cursor.execute('UPDATE distribution_centers SET latitude = ?, longitude = ? WHERE id = ?', (lat, lng, dc_id))
    
    # 2. Update Locations
    cursor.execute('SELECT id, address_line, city FROM locations WHERE (latitude = 0.0 OR longitude = 0.0 OR latitude IS NULL)')
    locations = cursor.fetchall()
    print(f"Updating {len(locations)} Locations...")
    
    updates = []
    count = 0
    for loc_id, addr, city in locations:
        lat, lng = maps.geocode_address(f"{addr}, {city}")
        updates.append((lat, lng, loc_id))
        count += 1
        if count % 50 == 0:
            print(f"Processed {count}...")
            
    cursor.executemany('UPDATE locations SET latitude = ?, longitude = ? WHERE id = ?', updates)
    
    conn.commit()
    conn.close()
    print("Done populating coordinates.")

if __name__ == "__main__":
    populate_coordinates()
