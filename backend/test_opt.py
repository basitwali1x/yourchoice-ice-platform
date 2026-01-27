import sqlite3
import os
import sys
import asyncio
from typing import List

# Add current directory to path
sys.path.append(os.getcwd())

from services.optimizer import RouteOptimizer

# Mock Location class to avoid SQLAlchemy dependency for simple test
class MockLocation:
    def __init__(self, id, name, addr, city, lat, lng, cust_id, cust_name):
        self.id = id
        self.location_name = name
        self.address_line = addr
        self.city = city
        self.latitude = lat
        self.longitude = lng
        self.customer = type('obj', (object,), {'id': cust_id, 'business_name': cust_name})

async def test_optimizer():
    print("Starting optimizer test...")
    conn = sqlite3.connect('yci_sqlite.db')
    cursor = conn.cursor()
    
    # Get DC
    cursor.execute('SELECT name, address FROM distribution_centers WHERE id = ?', ('dc_leesville',))
    dc_name, dc_addr = cursor.fetchone()
    
    # Get some locations
    cursor.execute('''
        SELECT l.id, l.location_name, l.address_line, l.city, l.latitude, l.longitude, c.id, c.business_name 
        FROM locations l
        JOIN customers c ON l.customer_id = c.id
        WHERE c.primary_dc_id = ?
        LIMIT 20
    ''', ('dc_leesville',))
    rows = cursor.fetchall()
    
    locations = []
    for row in rows:
        locations.append(MockLocation(*row))
    
    print(f"Testing with {len(locations)} locations from {dc_name}")
    
    optimizer = RouteOptimizer()
    routes = await optimizer.optimize_dc_routes(dc_name, dc_addr, locations, num_vehicles=2)
    
    print(f"Generated {len(routes)} routes.")
    for route in routes:
        print(f"Vehicle {route['vehicle_id']}: {route['stop_count']} stops")
        for stop in route['stops'][:3]: # Show first 3 stops
            print(f"  - {stop['location']['name']} at {stop['location']['address']}")
            
    conn.close()

if __name__ == "__main__":
    asyncio.run(test_optimizer())
