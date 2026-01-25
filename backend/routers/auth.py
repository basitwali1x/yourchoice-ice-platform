from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
from models import User
import jwt
import datetime

SECRET_KEY = "yci-secret-key"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Auth"])

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=60*24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # In a real app we would hash passwords. For this demo: plain text match or generic
    # For demo ease, we just check if user exists.
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        # Fallback for demo if DB is empty or issues
        if form_data.username == "admin@yci.local" and form_data.password == "password":
            return {"access_token": create_access_token({"sub": "admin", "role": "admin"}), "token_type": "bearer"}
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Check password (placeholder)
    # if not verify_password(form_data.password, user.password_hash): ...
    
    token_data = {"sub": user.email, "role": user.role.value, "user_id": str(user.id)}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer"}
