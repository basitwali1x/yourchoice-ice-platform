from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from models import WorkOrder
from schemas import WorkOrderSchema, WorkOrderCreate
from uuid import UUID

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])

@router.get("/", response_model=list[WorkOrderSchema])
def get_work_orders(db: Session = Depends(get_db)):
    return db.query(WorkOrder).all()

@router.post("/", response_model=WorkOrderSchema)
def create_work_order(wo: WorkOrderCreate, db: Session = Depends(get_db)):
    new_wo = WorkOrder(**wo.dict())
    db.add(new_wo)
    db.commit()
    db.refresh(new_wo)
    return new_wo

@router.post("/{id}/complete")
def complete_work_order(id: str, db: Session = Depends(get_db)):
    wo = db.query(WorkOrder).filter(WorkOrder.id == id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    wo.status = "completed"
    db.commit()
    return {"status": "completed"}

@router.put("/{id}/status")
def update_work_order_status(id: str, status: str = Body(..., embed=True), db: Session = Depends(get_db)):
    wo = db.query(WorkOrder).filter(WorkOrder.id == id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    # Simple validation against enum could be added here, relying on strings for now
    wo.status = status
    db.commit()
    return {"status": status, "id": id}
