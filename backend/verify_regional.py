from sqlalchemy.orm import Session
from database import get_db, engine
import models
from models import DistributionCenter, Route

def verify():
    print("Verifying Regional Structure...")
    db = next(get_db())
    
    # 1. Check Distribution Centers
    dcs = db.query(DistributionCenter).all()
    print(f"Found {len(dcs)} Distribution Centers:")
    for dc in dcs:
        print(f" - {dc.name} ({dc.type})")
        
    if len(dcs) == 0:
        print("FAIL: No Distribution Centers found. Migrations likely not run.")
        return

    # 2. Check Route Filtering logic (ORM check)
    # We might not have routes, but we can check if the query runs without error
    try:
        leesville_routes = db.query(Route).filter(Route.dc_id == 'dc_leesville').all()
        print(f"Query for Leesville routes successful (count: {len(leesville_routes)})")
    except Exception as e:
        print(f"FAIL: Route query failed: {e}")
        
    print("Verification Complete.")

if __name__ == "__main__":
    verify()
