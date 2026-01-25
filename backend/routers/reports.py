from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Order, Route, Delivery, RouteStop, Customer, DistributionCenter
from typing import Optional
import datetime
from datetime import timedelta
import logging
import random

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/dashboard")
def get_dashboard_metrics(dc_id: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        today = datetime.date.today()
        
        # Base Queries
        q_rev = db.query(func.sum(Delivery.amount_cents))\
            .join(RouteStop, Delivery.route_stop_id == RouteStop.id)\
            .join(Route, RouteStop.route_id == Route.id)
            
        if dc_id:
            q_rev = q_rev.filter(Route.dc_id == dc_id)

        # 1. KPIs
        daily_rev = q_rev.filter(Route.route_date == today).scalar() or 0
        weekly_rev = q_rev.filter(Route.route_date >= today - timedelta(days=7)).scalar() or 0
        monthly_rev = q_rev.filter(Route.route_date >= today - timedelta(days=30)).scalar() or 0

        # Pending orders
        q_pending = db.query(Order).filter(Order.status == 'submitted')
        if dc_id:
            q_pending = q_pending.join(Customer, Order.customer_id == Customer.id).filter(Customer.primary_dc_id == dc_id)
        orders_pending = q_pending.count()

        # Active routes
        q_routes = db.query(Route).filter(Route.route_date == today)
        if dc_id:
            q_routes = q_routes.filter(Route.dc_id == dc_id)
        active_routes = q_routes.count()

        # Hub Summary (Always Global or filtered if requested)
        hubs = db.query(DistributionCenter)
        if dc_id:
            hubs = hubs.filter(DistributionCenter.id == dc_id)
        hubs = hubs.all()
        
        hub_summary = []
        for h in hubs:
            h_count = db.query(Customer).filter(Customer.primary_dc_id == h.id).count()
            hub_summary.append({
                "id": h.id,
                "name": h.name,
                "customer_count": h_count
            })

        # 2. Sales Heatmap
        heatmap = []
        for i in range(7, 0, -1):
            d = today - timedelta(days=i)
            rev = q_rev.filter(Route.route_date == d).scalar() or 0
            heatmap.append({"date": d.strftime("%m/%d"), "revenue": float(rev) / 100.0, "type": "actual"})
        
        heatmap.append({"date": "TODAY", "revenue": float(daily_rev) / 100.0, "type": "actual"})

        avg_rev = (float(weekly_rev) / 7.0) / 100.0 if weekly_rev else 150.0
        for i in range(1, 7):
            d = today + timedelta(days=i)
            proj = avg_rev * (1 + (random.random() * 0.4 - 0.1)) 
            heatmap.append({"date": d.strftime("%m/%d"), "revenue": round(proj, 2), "type": "projected"})

        # KPIs
        q_cust_count = db.query(Customer)
        if dc_id:
            q_cust_count = q_cust_count.filter(Customer.primary_dc_id == dc_id)

        return {
            "kpi": {
                "daily_revenue": float(daily_rev) / 100.0,
                "weekly_revenue": float(weekly_rev) / 100.0,
                "monthly_revenue": float(monthly_rev) / 100.0,
                "orders_pending": int(orders_pending),
                "active_routes": int(active_routes),
                "total_customers": q_cust_count.count()
            },
            "hub_summary": hub_summary,
            "sales_heatmap": heatmap
        }
    except Exception as e:
        logger.error(f"Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
