from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Customer, Location, CustomerPrice
from schemas import CustomerSchema, CustomerCreate, CustomerPriceBase
from typing import List, Optional

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/", response_model=List[CustomerSchema])
def get_customers(dc_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Customer)
    if dc_id:
        query = query.filter(Customer.primary_dc_id == dc_id)
    return query.all()

@router.post("/", response_model=CustomerSchema)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    new_cust = Customer(**customer.dict())
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    return new_cust

@router.get("/{id}", response_model=CustomerSchema)
def get_customer(id: str, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust

@router.put("/{id}", response_model=CustomerSchema)
def update_customer(id: str, customer: CustomerCreate, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer.dict().items():
        setattr(cust, key, value)
    
    db.commit()
    db.refresh(cust)
    return cust

@router.post("/{id}/pricing")
def set_custom_pricing(id: str, pricing: List[CustomerPriceBase], db: Session = Depends(get_db)):
    # Remove existing
    db.query(CustomerPrice).filter(CustomerPrice.customer_id == id).delete()
    
    for p in pricing:
        cp = CustomerPrice(
            customer_id=id,
            product_id=p.product_id,
            price_cents=p.price_cents
        )
        db.add(cp)
    
    db.commit()
    return {"status": "success"}
