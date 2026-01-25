from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Location
from schemas import LocationSchema, LocationCreate
from uuid import UUID

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/", response_model=list[LocationSchema])
def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@router.post("/", response_model=LocationSchema)
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    new_loc = Location(**location.dict())
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return new_loc

@router.delete("/{id}")
def delete_location(id: str, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
    return {"status": "deleted"}
