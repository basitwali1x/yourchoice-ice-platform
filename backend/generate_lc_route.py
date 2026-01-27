import sys
import os
import asyncio
import sqlite3
import uuid

# Add current dir to sys.path to import from services
sys.path.append(os.getcwd())

from services.optimizer import RouteOptimizer

# Mock Location class for the optimizer
class MockLocation:
    def __init__(self, id, name, address, city, lat, lng, customer_id, customer_name):
        self.id = id
        self.location_name = name
        self.address_line = address
        self.city = city
        self.latitude = lat
        self.longitude = lng
        self.customer = MockCustomer(customer_id, customer_name)

class MockCustomer:
    def __init__(self, id, name):
        self.id = id
        self.business_name = name

async def run_lake_charles_optimization():
    DB_PATH = "yci_sqlite.db"
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Fetch Lake Charles Customers
    cursor.execute("""
        SELECT c.id as customer_id, c.business_name, l.id as location_id, l.address_line, l.city, l_other.latitude, l_other.longitude
        FROM customers c
        JOIN locations l ON c.id = l.customer_id
        LEFT JOIN locations l_other ON l.id = l_other.id
        WHERE c.primary_dc_id = 'dc_lake_charles'
    """)
    rows = cursor.fetchall()
    
    locations = []
    for row in rows:
        locations.append(MockLocation(
            row['location_id'],
            row['business_name'],
            row['address_line'],
            row['city'],
            0.0, # Will be geocoded by optimizer mock
            0.0,
            row['customer_id'],
            row['business_name']
        ))

    print(f"Optimizing route for {len(locations)} Lake Charles customers...")

    optimizer = RouteOptimizer()
    # Lake Charles Depot Address
    depot_address = "220 Bunker Road, Lake Charles, LA 70601"
    
    # Run optimization for 1 vehicle (the driver mentioned)
    optimized_routes = await optimizer.optimize_dc_routes("Lake Charles", depot_address, locations, 1)

    if not optimized_routes:
        print("Failed to optimize routes.")
        return

    route = optimized_routes[0]
    print(f"\nOPTIMIZED LAKE CHARLES ROUTE (Driver Smitty)")
    print("="*60)
    for stop in route['stops']:
        print(f"Stop {stop['sequence']}: {stop['customer']['name']} - {stop['location']['address']}")
    print("="*60)
    print(f"Total Stops: {route['stop_count']}")

    # Save to file
    with open("lake_charles_optimized_route.txt", "w") as f:
        f.write(f"OPTIMIZED LAKE CHARLES ROUTE (Driver Smitty)\n")
        f.write("="*60 + "\n")
        for stop in route['stops']:
            f.write(f"Stop {stop['sequence']}: {stop['customer']['name']} - {stop['location']['address']}\n")
        f.write("="*60 + "\n")

    conn.close()

if __name__ == "__main__":
    asyncio.run(run_lake_charles_optimization())
