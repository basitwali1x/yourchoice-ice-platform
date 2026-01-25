from sqlalchemy import create_engine, Column, String, Integer, Boolean, ForeignKey, Date, Float, Enum as SqEnum, Text
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import uuid
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    dispatcher = "dispatcher"
    driver = "driver"
    technician = "technician"
    customer = "customer"

class OrderStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    assigned = "assigned"
    delivered = "delivered"
    cancelled = "cancelled"

class RouteStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class StopStatus(str, enum.Enum):
    pending = "pending"
    arrived = "arrived"
    completed = "completed"
    skipped = "skipped"

class PaymentMethod(str, enum.Enum):
    cash = "cash"
    check = "check"
    credit = "credit"
    charge = "charge"

class WorkOrderStatus(str, enum.Enum):
    open = "open"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(SqEnum(UserRole), nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True)
    phone = Column(String)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

class DistributionCenter(Base):
    __tablename__ = "distribution_centers"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String) # headquarters, distribution - matched to migration SQL
    address = Column(String)
    
    customers = relationship("Customer", back_populates="primary_dc")
    routes = relationship("Route", back_populates="dc")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String, nullable=False)
    billing_email = Column(String)
    billing_phone = Column(String)
    billing_address = Column(String)
    notes = Column(Text)
    primary_dc_id = Column(String, ForeignKey("distribution_centers.id"))
    distance_miles = Column(Float, default=0.0) 
    
    primary_dc = relationship("DistributionCenter", back_populates="customers")
    locations = relationship("Location", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    custom_prices = relationship("CustomerPrice", back_populates="customer")
    recurring_order = relationship("RecurringOrder", back_populates="customer", uselist=False)

class CustomerPrice(Base):
    __tablename__ = "customer_prices"
    customer_id = Column(String, ForeignKey("customers.id"), primary_key=True)
    product_id = Column(String, ForeignKey("products.id"), primary_key=True)
    price_cents = Column(Integer, nullable=False)
    
    customer = relationship("Customer", back_populates="custom_prices")
    product = relationship("Product")

class Location(Base):
    __tablename__ = "locations"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    location_name = Column(String)
    address_line = Column(String, nullable=False)
    city = Column(String)
    state = Column(String)
    zip = Column(String)
    access_notes = Column(Text)
    
    customer = relationship("Customer", back_populates="locations")
    work_orders = relationship("WorkOrder", back_populates="location")

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    bag_size_lbs = Column(Integer, nullable=False)
    sku = Column(String, unique=True)
    base_price_cents = Column(Integer, default=0)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    location_id = Column(String, ForeignKey("locations.id"))
    status = Column(SqEnum(OrderStatus), default=OrderStatus.submitted)
    requested_delivery_date = Column(Date)
    requested_window = Column(String)
    notes = Column(Text)
    
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    
    order = relationship("Order", back_populates="items")

class Route(Base):
    __tablename__ = "routes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    route_date = Column(Date, nullable=False)
    driver_id = Column(String, ForeignKey("users.id"))
    status = Column(SqEnum(RouteStatus), default=RouteStatus.draft)
    title = Column(String)
    notes = Column(Text)
    dc_id = Column(String, ForeignKey("distribution_centers.id"))
    
    dc = relationship("DistributionCenter", back_populates="routes")
    stops = relationship("RouteStop", back_populates="route")

class RouteStop(Base):
    __tablename__ = "route_stops"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    order_id = Column(String, ForeignKey("orders.id"))
    stop_sequence = Column(Integer, nullable=False)
    status = Column(SqEnum(StopStatus), default=StopStatus.pending)
    planned_notes = Column(Text)
    
    route = relationship("Route", back_populates="stops")
    delivery = relationship("Delivery", back_populates="route_stop", uselist=False)

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    route_stop_id = Column(String, ForeignKey("route_stops.id"), nullable=False, unique=True)
    delivered_20lb_qty = Column(Integer, default=0)
    delivered_8lb_qty = Column(Integer, default=0)
    payment = Column(SqEnum(PaymentMethod), nullable=False)
    amount_cents = Column(Integer, default=0)
    check_number = Column(String)
    card_last4 = Column(String)
    notes = Column(Text)
    photo_url = Column(String)
    signature_url = Column(String)
    
    route_stop = relationship("RouteStop", back_populates="delivery")

class WorkOrder(Base):
    __tablename__ = "work_orders"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    status = Column(SqEnum(WorkOrderStatus), default=WorkOrderStatus.open)
    priority = Column(Integer, default=2)
    issue_type = Column(String)
    description = Column(Text)
    assigned_to = Column(String, ForeignKey("users.id"))
    
    location = relationship("Location", back_populates="work_orders")

class SystemSetting(Base):
    __tablename__ = "system_settings"
    key = Column(String, primary_key=True)
    value = Column(Text)

class RecurringOrder(Base):
    __tablename__ = "recurring_orders"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    frequency = Column(String, default="weekly") # weekly, bi-weekly
    quantity_20lb = Column(Integer, default=0)
    quantity_8lb = Column(Integer, default=0)
    preferred_day = Column(String, default="Monday")
    
    customer = relationship("Customer", back_populates="recurring_order")

# Add back_populate to Customer as well (checking Customer class)
# Customer class is at line 70. I need to update it too.
