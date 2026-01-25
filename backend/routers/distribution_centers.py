from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import DistributionCenter
from schemas import DistributionCenterSchema
from typing import List

router = APIRouter(prefix="/distribution-centers", tags=["Distribution Centers"])

@router.get("/", response_model=List[DistributionCenterSchema])
def get_distribution_centers(db: Session = Depends(get_db)):
    return db.query(DistributionCenter).all()

@router.get("/{id}", response_model=DistributionCenterSchema)
def get_distribution_center(id: str, db: Session = Depends(get_db)):
    dc = db.query(DistributionCenter).filter(DistributionCenter.id == id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="Distribution Center not found")
    return dc
