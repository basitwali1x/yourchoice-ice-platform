from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from database import get_db
from models import Customer, Order, Product, SystemSetting, Delivery, RouteStop, Route, Location, OrderStatus, OrderItem
import pandas as pd
import gspread
import shutil
import os
import uuid
import json
from datetime import datetime

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("/status")
def get_integrations_status(db: Session = Depends(get_db)):
    gs_id = db.query(SystemSetting).filter(SystemSetting.key == "google_sheet_id").first()
    qb_connected = db.query(SystemSetting).filter(SystemSetting.key == "qb_connected").first()
    
    return {
        "google_sheets": {
            "connected": gs_id is not None,
            "sheet_id": gs_id.value if gs_id else None
        },
        "quickbooks": {
            "connected": qb_connected.value == "true" if qb_connected else False
        }
    }

@router.post("/settings")
def update_setting(key: str = Body(...), value: str = Body(...), db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if setting:
        setting.value = value
    else:
        db.add(SystemSetting(key=key, value=value))
    db.commit()
    return {"status": "saved"}

# --- EXCEL IMPORT ---

@router.post("/import/excel")
async def import_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        if not temp_path.endswith(('.xlsx', '.xls')):
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Invalid file format. Use .xlsx")

        imported_customers = 0
        imported_orders = 0
        
        try:
            with pd.ExcelFile(temp_path) as xls:
                # 1. PROCESS CUSTOMERS
                if "Customers" in xls.sheet_names:
                    df = pd.read_excel(xls, sheet_name="Customers")
                    for _, row in df.iterrows():
                        name = str(row.get("Business Name", row.get("Customer", "")))
                        if name and name != "nan":
                            exists = db.query(Customer).filter(Customer.business_name == name).first()
                            if not exists:
                                cust_id = str(uuid.uuid4())
                                db.add(Customer(
                                    id=cust_id,
                                    business_name=name,
                                    billing_address=str(row.get("Address", "")),
                                    notes="Imported via Excel"
                                ))
                                # Auto-create location
                                db.add(Location(
                                    id=str(uuid.uuid4()),
                                    customer_id=cust_id,
                                    location_name="Main Location",
                                    address_line=str(row.get("Address", "")),
                                    city=str(row.get("City", "")),
                                    state=str(row.get("State", ""))
                                ))
                                imported_customers += 1
                
                # 2. PROCESS ORDERS
                if "Orders" in xls.sheet_names:
                    df = pd.read_excel(xls, sheet_name="Orders")
                    for _, row in df.iterrows():
                        cust_name = str(row.get("Customer", ""))
                        cust = db.query(Customer).filter(Customer.business_name == cust_name).first()
                        if cust:
                            order_id = str(uuid.uuid4())
                            db.add(Order(
                                id=order_id,
                                customer_id=cust.id,
                                status=OrderStatus.delivered,
                                requested_delivery_date=pd.to_datetime(row.get("Date", datetime.now())).date(),
                                notes=f"Legacy Order Import: {row.get('Notes', '')}"
                            ))
                            imported_orders += 1
                
                db.commit()
        except Exception as e:
            raise e
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass

        return {"status": "success", "imported_customers": imported_customers, "imported_orders": imported_orders}
    except Exception as e:
        # Final catch-all if something leaked
        if os.path.exists(temp_path): 
            try: os.remove(temp_path)
            except: pass
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quickbooks/auth")
def qb_auth(db: Session = Depends(get_db)):
    # Simulation: Auto-connect for demo
    update_setting("qb_connected", "true", db)
    return {"url": "#connected"}

@router.post("/upload/legacy")
async def upload_legacy_doc(file: UploadFile = File(...)):
    try:
        # Create directory if not exists (redundant safety)
        upload_dir = "data/legacy_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1]
        filename = f"{file_id}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "status": "success", 
            "filename": filename, 
            "original_name": file.filename,
            "message": "Securely archived in Legacy Vault"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
