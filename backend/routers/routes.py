from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Route, RouteStop, Delivery, Order, OrderStatus
from schemas import RouteSchema, DeliveryCreate
import uuid

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.get("/", response_model=list[RouteSchema])
def get_routes(dc_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Route)
    if dc_id:
        query = query.filter(Route.dc_id == dc_id)
    return query.all()

@router.get("/{id}")
def get_route(id: str, db: Session = Depends(get_db)):
    return db.query(Route).filter(Route.id == id).first()

@router.post("/{stop_id}/delivery")
def submit_delivery(stop_id: str, delivery: DeliveryCreate, db: Session = Depends(get_db)):
    stop = db.query(RouteStop).filter(RouteStop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    new_delivery = Delivery(
        route_stop_id=stop.id,
        delivered_20lb_qty=delivery.delivered_20lb_qty,
        delivered_8lb_qty=delivery.delivered_8lb_qty,
        payment=delivery.payment,
        amount_cents=delivery.amount_cents,
        check_number=delivery.check_number,
        card_last4=delivery.card_last4,
        notes=delivery.notes
    )
    db.add(new_delivery)
    stop.status = "completed"
    
    # Update linked order status if exists
    if stop.order_id:
        order = db.query(Order).get(stop.order_id)
        if order: order.status = OrderStatus.delivered

    db.commit()
    return {"status": "success"}
