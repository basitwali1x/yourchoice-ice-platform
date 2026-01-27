from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserRole
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: str # admin, staff, driver
    phone: Optional[str] = ""

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    is_active: bool

@router.get("/", response_model=List[UserResponse])
def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if exists
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Map role string to Enum
    try:
        role_enum = UserRole[user.role]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid role. Options: admin, staff, driver")
    
    new_user = User(
        id=str(uuid.uuid4()),
        full_name=user.full_name,
        email=user.email,
        password_hash=user.password, # In real app, hash this!
        role=role_enum,
        phone=user.phone,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"status": "success"}
