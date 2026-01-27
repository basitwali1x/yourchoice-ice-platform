import sqlite3
import math

# DC Coordinates
DCS = {
    'dc_leesville': (31.1435, -93.2607),
    'dc_lake_charles': (30.2266, -93.2174),
    'dc_lufkin': (31.3382, -94.7291)
}

def calculate_distance(lat1, lon1, lat2, lon2):
    r = 3958.8 # miles
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1-a))

def identify_misplaced():
    conn = sqlite3.connect('yci_sqlite.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT c.id, c.business_name, c.primary_dc_id, l.latitude, l.longitude, l.city, l.address_line
        FROM customers c
        JOIN locations l ON c.id = l.customer_id
    ''')
    rows = cursor.fetchall()
    
    misplaced = []
    counts_by_dc = {id: 0 for id in DCS.keys()}
    correct_counts = {id: 0 for id in DCS.keys()}
    
    for cust_id, name, current_dc, lat, lng, city, addr in rows:
        if current_dc in counts_by_dc:
            counts_by_dc[current_dc] += 1
            
        # Find nearest DC
        min_dist = float('inf')
        best_dc = None
        for dc_id, coords in DCS.items():
            dist = calculate_distance(lat, lng, coords[0], coords[1])
            if dist < min_dist:
                min_dist = dist
                best_dc = dc_id
        
        correct_counts[best_dc] += 1
        
        if current_dc != best_dc:
            misplaced.append((cust_id, name, current_dc, best_dc, lat, lng, city, addr, min_dist))
            
    print(f"Total customers processed: {len(rows)}")
    print("\n--- Current Counts ---")
    for dc_id, count in counts_by_dc.items():
        print(f"{dc_id}: {count}")
        
    print("\n--- Recommended Counts (Geofencing) ---")
    for dc_id, count in correct_counts.items():
        print(f"{dc_id}: {count}")
        
    print(f"\nFound {len(misplaced)} misplaced customers.")
    print("\n--- Sample Misplaced (Top 10) ---")
    for m in misplaced[:10]:
        print(f"Customer: {m[1]} | Current: {m[2]} -> Best: {m[3]} | Dist: {m[8]:.1f} mi | At: ({m[4]}, {m[5]}) | {m[6]}, {m[7]}")
        
    conn.close()
    return misplaced

if __name__ == "__main__":
    identify_misplaced()
