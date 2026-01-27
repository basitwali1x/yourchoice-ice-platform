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
    no_tax: bool = False  # Option to skip tax calculation

@router.post("/delivery")
def submit_driver_delivery(data: DriverDeliverySchema, db: Session = Depends(get_db)):
    # Check Customer
    cust = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Calculate Totals
    # Subtotal
    sub_20lb = data.delivered_20lb_qty * data.price_20lb
    sub_8lb = data.delivered_8lb_qty * data.price_8lb
    subtotal = sub_20lb + sub_8lb
    
    # Apply tax only if not tax-exempt
    if data.no_tax:
        tax = 0.0
        total = subtotal
        tax_note = "TAX EXEMPT"
    else:
        tax_rate = 0.1075
        tax = subtotal * tax_rate
        total = subtotal + tax
        tax_note = f"Tax: ${tax:.2f}"
    
    total_cents = int(total * 100)

    # 1. Create Order record for history/summary
    new_order = Order(
        customer_id=cust.id,
        order_date=date.today(),
        status=OrderStatus.delivered,
        quantity_20lb=data.delivered_20lb_qty,
        quantity_8lb=data.delivered_8lb_qty,
        total_price_cents=total_cents,
        payment_method=data.payment_method,
        notes=f"Driver direct delivery. Sub: ${subtotal:.2f}, {tax_note}"
    )
    db.add(new_order)
    db.flush()

    # 2. Update Recurring Order (Learning logic)
    recurring = db.query(RecurringOrder).filter(RecurringOrder.customer_id == cust.id).first()
    if not recurring:
        recurring = RecurringOrder(
            customer_id=cust.id,
            frequency="weekly",
            quantity_20lb=data.delivered_20lb_qty,
            quantity_8lb=data.delivered_8lb_qty,
            preferred_day=date.today().strftime("%A")
        )
        db.add(recurring)
    else:
        recurring.quantity_20lb = data.delivered_20lb_qty
        recurring.quantity_8lb = data.delivered_8lb_qty
        recurring.preferred_day = date.today().strftime("%A")
    
    db.commit()
    
    return {
        "status": "success", 
        "order_id": new_order.id, 
        "receipt": {
            "customer_name": cust.business_name,
            "date": str(date.today()),
            "items": [
                {"name": "20lb Bag", "qty": data.delivered_20lb_qty, "price": data.price_20lb, "subtotal": sub_20lb},
                {"name": "8lb Bag", "qty": data.delivered_8lb_qty, "price": data.price_8lb, "subtotal": sub_8lb}
            ],
            "subtotal": subtotal,
            "tax": tax,
            "total": total,
            "payment_method": data.payment_method,
            "tax_exempt": data.no_tax
        }
    }
