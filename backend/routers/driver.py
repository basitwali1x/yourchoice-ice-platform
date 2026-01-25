from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, Delivery, RecurringOrder, Customer, Route, RouteStop, OrderStatus
from pydantic import BaseModel
from typing import Optional
from datetime import date
import uuid

router = APIRouter(prefix="/driver", tags=["Driver"])

class DriverDeliverySchema(BaseModel):
    customer_id: str
    delivered_20lb_qty: int
    delivered_8lb_qty: int
    price_20lb: float
    price_8lb: float
    # Tax is calculated server-side now
    payment_method: str = "credit"

@router.post("/delivery")
def submit_driver_delivery(data: DriverDeliverySchema, db: Session = Depends(get_db)):
    # Check Customer
    cust = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Calculate Totals
    subtotal_cents = (data.delivered_20lb_qty * data.price_20lb * 100) + (data.delivered_8lb_qty * data.price_8lb * 100)
    tax_rate = 0.1075
    tax_cents = subtotal_cents * tax_rate
    total_cents = int(subtotal_cents + tax_cents)

    # 2. Create Order
    new_order = Order(
        customer_id=cust.id,
        order_date=date.today(),
        status=OrderStatus.completed,
        quantity_20lb=data.delivered_20lb_qty,
        quantity_8lb=data.delivered_8lb_qty,
        total_price_cents=total_cents
    )
    db.add(new_order)
    db.flush()

    # 4. Upsert Recurring Order (The "Learning" Log)
    recurring = db.query(RecurringOrder).filter(RecurringOrder.customer_id == cust.id).first()
    if not recurring:
        recurring = RecurringOrder(
            customer_id=cust.id,
            frequency="weekly",
            quantity_20lb=data.delivered_20lb_qty,
            quantity_8lb=data.delivered_8lb_qty,
            preferred_day="Monday"
        )
        db.add(recurring)
    else:
        recurring.quantity_20lb = data.delivered_20lb_qty
        recurring.quantity_8lb = data.delivered_8lb_qty
    
    db.commit()
    return {"status": "success", "order_id": new_order.id, "recurring_updated": True, "total_charged": total_cents / 100.0}
