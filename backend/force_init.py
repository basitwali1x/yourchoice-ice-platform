from sqlalchemy import create_engine, text
from database import engine, DATABASE_URL
from models import Base, User, UserRole
import uuid
import traceback

def force_init():
    print(f"Force initializing {DATABASE_URL}")
    try:
        Base.metadata.create_all(bind=engine)
        print("Metadata create_all finished.")
    except Exception as e:
        print("METADATA CREATE_ALL FAILED:")
        traceback.print_exc()
    
    with engine.begin() as conn:
        try:
            print("Seeding/Ensuring default users...")
            # driver1@yci.local / password
            conn.execute(text("""
                INSERT OR IGNORE INTO users (id, role, full_name, email, phone, password_hash, is_active)
                VALUES (:id, :role, :name, :email, :phone, :pw, :active)
            """), {
                "id": str(uuid.uuid4()),
                "role": "driver",
                "name": "Driver One",
                "email": "driver1@yci.local",
                "phone": "0000000000",
                "pw": "password",
                "active": True
            })
            # admin@yci.local / password
            conn.execute(text("""
                INSERT OR IGNORE INTO users (id, role, full_name, email, phone, password_hash, is_active)
                VALUES (:id, :role, :name, :email, :phone, :pw, :active)
            """), {
                "id": str(uuid.uuid4()),
                "role": "admin",
                "name": "Admin User",
                "email": "admin@yci.local",
                "phone": "0000000000",
                "pw": "password",
                "active": True
            })
            print("User seed finished.")
        except Exception as e:
            print(f"User seed error: {e}")
            traceback.print_exc()
            
        try:
            # Seed DCs
            conn.execute(text("CREATE TABLE IF NOT EXISTS distribution_centers (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT, address TEXT, latitude FLOAT, longitude FLOAT)"))
            dcs = [
                ('dc_leesville', 'Leesville', 'Headquarters', '1707 Smart Street, Leesville, LA 71446', 31.1435, -93.2607),
                ('dc_lake_charles', 'Lake Charles', 'Distribution', '220 Bunker Road, Lake Charles, LA 70601', 30.2266, -93.2174),
                ('dc_lufkin', 'Lufkin', 'Distribution', '1107 Weiner St, Lufkin, TX 75904', 31.3382, -94.7291)
            ]
            for dc_id, name, dc_type, addr, lat, lng in dcs:
                conn.execute(text("""
                    INSERT OR IGNORE INTO distribution_centers (id, name, type, address, latitude, longitude)
                    VALUES (:id, :name, :type, :address, :latitude, :longitude)
                """), {"id": dc_id, "name": name, "type": dc_type, "address": addr, "latitude": lat, "longitude": lng})
        except Exception as e:
            print(f"DC Seed failed: {e}")

    print("Force init cycle done.")

if __name__ == "__main__":
    force_init()
