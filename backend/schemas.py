from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime

class UserBase(BaseModel):
    email: str
    role: str

class DistributionCenterSchema(BaseModel):
    id: str
    name: str
    type: Optional[str] = None # Updated to match model/migration
    address: Optional[str] = None
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    model_config = ConfigDict(from_attributes=True)

class LocationBase(BaseModel):
    location_name: Optional[str] = None
    address_line: str
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    access_notes: Optional[str] = None

class LocationCreate(LocationBase):
    customer_id: str

class LocationSchema(LocationBase):
    id: str
    customer_id: str
    model_config = ConfigDict(from_attributes=True)

class CustomerPriceBase(BaseModel):
    product_id: str
    price_cents: int

class CustomerPriceSchema(CustomerPriceBase):
    model_config = ConfigDict(from_attributes=True)

class CustomerBase(BaseModel):
    business_name: str
    billing_email: Optional[str] = None
    billing_phone: Optional[str] = None
    billing_address: Optional[str] = None
    notes: Optional[str] = None
    primary_dc_id: Optional[str] = None
    distance_miles: Optional[float] = 0.0

class CustomerCreate(CustomerBase):
    pass

class CustomerSchema(CustomerBase):
    id: str
    locations: List[LocationSchema] = []
    custom_prices: List[CustomerPriceSchema] = []
    primary_dc: Optional[DistributionCenterSchema] = None
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    bag_size_lbs: int
    sku: Optional[str] = None
    base_price_cents: int
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductSchema(ProductBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class WorkOrderBase(BaseModel):
    priority: int = 2
    issue_type: Optional[str] = None
    description: Optional[str] = None

class WorkOrderCreate(WorkOrderBase):
    location_id: str
    assigned_to: Optional[str] = None

class WorkOrderSchema(WorkOrderBase):
    id: str
    location_id: str
    status: str
    model_config = ConfigDict(from_attributes=True)

class DeliveryCreate(BaseModel):
    route_stop_id: str
    delivered_20lb_qty: int
    delivered_8lb_qty: int
    payment: str
    amount_cents: int
    check_number: Optional[str] = None
    card_last4: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    signature_url: Optional[str] = None

class RouteStopSchema(BaseModel):
    id: str
    location_id: str
    status: str
    stop_sequence: int
    model_config = ConfigDict(from_attributes=True)

class RouteSchema(BaseModel):
    id: str
    title: Optional[str]
    status: str
    stops: List[RouteStopSchema] = []
    dc: Optional[DistributionCenterSchema] = None
    model_config = ConfigDict(from_attributes=True)
