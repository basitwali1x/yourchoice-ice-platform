from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db, engine, DATABASE_URL
from models import DistributionCenter, Route, Customer, Delivery, RouteStop, Location
import models
from schemas import DistributionCenterSchema
from typing import List, Optional

router = APIRouter(prefix="/logistics", tags=["Logistics"])

@router.get("/distribution-centers", response_model=List[DistributionCenterSchema])
def get_dcs(db: Session = Depends(get_db)):
    return db.query(DistributionCenter).all()

@router.get("/diag-db")
def diag_db():
    import os
    from sqlalchemy import inspect, text
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
    except Exception as e:
        tables = f"Error: {e}"
        
    counts = {}
    try:
        with engine.connect() as conn:
            for table in tables:
                try:
                    res = conn.execute(text(f"SELECT count(*) FROM {table}")).fetchone()
                    counts[table] = res[0]
                except:
                    counts[table] = "err"
    except Exception as e:
        counts = f"Error connecting for counts: {e}"

    usernames = []
    try:
        with engine.connect() as conn:
            user_res = conn.execute(text("SELECT email FROM users")).fetchall()
            usernames = [r[0] for r in user_res]
    except:
        pass

    return {
        "cwd": os.getcwd(),
        "db_url": str(DATABASE_URL),
        "db_exists": os.path.exists(DATABASE_URL.replace("sqlite:///", "")),
        "counts": counts,
        "usernames": usernames,
        "tables": tables
    }

@router.get("/status")
def get_logistics_status(db: Session = Depends(get_db)):
    try:
        dcs = db.query(DistributionCenter).all()
        stats = []
        for dc in dcs:
            route_count = db.query(Route).filter(Route.dc_id == dc.id).count()
            cust_count = db.query(Customer).filter(Customer.primary_dc_id == dc.id).count()
            stats.append({
                "id": dc.id,
                "name": dc.name,
                "type": dc.type,
                "routes": route_count,
                "customers": cust_count
            })
        return stats
    except Exception as e:
        import traceback
        return {
            "error": str(e), 
            "traceback": traceback.format_exc(),
            "db_url": str(DATABASE_URL)
        }
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    import os
    import shutil
    import uuid
    
    # Path relative to backend/
    UPLOAD_DIR = "data/uploads"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return the URL that can be used to access the file
    # In production, this would be a full URL, but here we return relative to /uploads
    return {"url": f"/uploads/{filename}"}

@router.get("/deliveries")
def get_deliveries(dc_id: Optional[str] = None, db: Session = Depends(get_db)):
    results = []
    
    # 1. Fetch Route-based deliveries
    query_deliveries = db.query(
        models.Delivery, 
        models.RouteStop, 
        models.Route, 
        models.Customer,
        models.Location
    ).join(models.RouteStop, models.Delivery.route_stop_id == models.RouteStop.id)\
     .join(models.Route, models.RouteStop.route_id == models.Route.id)\
     .join(models.Location, models.RouteStop.location_id == models.Location.id)\
     .join(models.Customer, models.Location.customer_id == models.Customer.id)
    
    if dc_id:
        query_deliveries = query_deliveries.filter(models.Route.dc_id == dc_id)
        
    deliveries = query_deliveries.all()

    for d, rs, r, c, l in deliveries:
        results.append({
            "id": d.id,
            "date": str(r.route_date),
            "customer_name": c.business_name,
            "location_name": l.location_name or l.address_line,
            "items": f"20lb: {d.delivered_20lb_qty}, 8lb: {d.delivered_8lb_qty}",
            "payment_method": d.payment.value if hasattr(d.payment, 'value') else str(d.payment),
            "amount_collected": d.amount_cents / 100.0,
            "driver": "Driver",
            "proof_url": d.photo_url if d.photo_url else "https://placehold.co/100x100?text=No+Photo",
            "notes": d.notes,
            "type": "route"
        })
    
    # 2. Fetch Direct Orders (from Driver direct submission)
    query_orders = db.query(models.Order, models.Customer).join(models.Customer, models.Order.customer_id == models.Customer.id)\
        .filter(models.Order.status == models.OrderStatus.delivered)
    
    if dc_id:
        query_orders = query_orders.filter(models.Customer.primary_dc_id == dc_id)
        
    direct_orders = query_orders.all()
    for o, c in direct_orders:
        results.append({
            "id": o.id,
            "date": str(o.order_date),
            "customer_name": c.business_name,
            "location_name": "Direct Delivery",
            "items": f"20lb: {o.quantity_20lb}, 8lb: {o.quantity_8lb}",
            "payment_method": o.payment_method or "unknown",
            "amount_collected": (o.total_price_cents or 0) / 100.0,
            "driver": "Driver",
            "proof_url": o.photo_url if o.photo_url else "https://placehold.co/100x100?text=Direct+Sale",
            "notes": o.notes,
            "type": "direct"
        })

    # Sort by date descending
    results.sort(key=lambda x: x['date'], reverse=True)
    return results
