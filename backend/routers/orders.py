from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, OrderItem, Product, Customer
from uuid import UUID
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/orders", tags=["Orders"])

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    customer_id: str
    requested_delivery_date: str
    items: List[OrderItemCreate]

@router.post("/")
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Simple creation
    new_order = Order(
        customer_id=order.customer_id,
        requested_delivery_date=order.requested_delivery_date,
        status="submitted"
    )
    db.add(new_order)
    db.flush() # get ID

    for item in order.items:
        db_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(db_item)
    
    db.commit()
    return {"status": "success", "id": str(new_order.id)}

@router.get("/")
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()
