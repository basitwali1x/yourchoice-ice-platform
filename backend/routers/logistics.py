from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from models import DistributionCenter, Route, Customer, Delivery, RouteStop, Location
import models
from schemas import DistributionCenterSchema
from typing import List

router = APIRouter(prefix="/logistics", tags=["Logistics"])

@router.get("/distribution-centers", response_model=List[DistributionCenterSchema])
def get_dcs(db: Session = Depends(get_db)):
    return db.query(DistributionCenter).all()

@router.get("/status")
def get_logistics_status(db: Session = Depends(get_db)):
    dcs = db.query(DistributionCenter).all()
    stats = []
    for dc in dcs:
        route_count = db.query(Route).filter(Route.dc_id == dc.id).count()
        cust_count = db.query(Customer).filter(Customer.primary_dc_id == dc.id).count()
        stats.append({
            "id": dc.id,
            "name": dc.name,
            "type": dc.type, # Fixed: matched model 'type'
            "routes": route_count,
            "customers": cust_count
        })
    return stats
@router.get("/deliveries")
def get_deliveries(dc_id: Optional[str] = None, db: Session = Depends(get_db)):
    # Join Delivery -> RouteStop -> Route -> DC
    # Join RouteStop -> Location -> Customer
    results = []
    
    # Fetch all deliveries
    query = db.query(
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
        query = query.filter(models.Route.dc_id == dc_id)
        
    deliveries = query.all()

    for d, rs, r, c, l in deliveries:
        results.append({
            "id": d.id,
            "date": r.route_date,
            "customer_name": c.business_name,
            "location_name": l.location_name or l.address_line,
            "items": f"20lb: {d.delivered_20lb_qty}, 8lb: {d.delivered_8lb_qty}",
            "payment_method": d.payment,
            "amount_collected": d.amount_cents / 100.0,
            "driver": "Driver", # Placeholder, would need User join
            "proof_url": d.photo_url or "https://placehold.co/100x100?text=No+Photo",
            "notes": d.notes
        })
    
    return results
