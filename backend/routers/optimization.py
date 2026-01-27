from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
import logging
import math
from datetime import date, timedelta

from database import get_db
from models import (
    Customer, Location, RecurringOrder, Route, RouteStop, 
    Delivery, DistributionCenter, Order, OrderStatus, RouteStatus
)

# Initialize router
router = APIRouter(
    prefix="/optimization",
    tags=["optimization"],
    responses={404: {"description": "Not found"}},
)

from services.optimizer import RouteOptimizer
from services.maps import GoogleMapsService

ORTOOLS_AVAILABLE = True # We know it's installed or will be
logger = logging.getLogger(__name__)

# --- Schemas ---

class OptimizationRequest(BaseModel):
    dc_id: str
    start_date: date  # The Monday of the week to schedule
    
class OptimizationResponse(BaseModel):
    status: str
    message: str
    schedule: Dict[str, Any] # Day -> Routes

# --- Constants & Configuration ---
# User constraints for drivers/trucks
DRIVER_COUNTS = {
    "Lake Charles": 1,
    "Lufkin": 1,
    "Leesville": 5
}
# Fallback if DC name doesn't match keys exactly
DEFAULT_DRIVERS = 1

LC_SCHEDULE = {
    "Monday": ["Johnson Bayou", "Lake Charles"],
    "Tuesday": ["Henderson", "Lafayette", "Rayne", "Church Point", "St. Martinville", "Crowley", "Welsh", "Jennings"],
    "Wednesday": ["Starks", "Vinton", "Sulphur", "Sasol"],
    "Thursday": ["Kinder", "Elton", "Moss Bluff"],
    "Friday": [] # Off
}

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

# --- Helper Logic: Coordinate Calculation ---

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    if not lat1 or not lon1 or not lat2 or not lon2:
        return 0.0
        
    # Convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 3956 # Radius of earth in miles. Use 6371 for km
    return c * r

# --- Core Logic: Clustering ---

def cluster_by_city(locations: List[Location]) -> Dict[str, List[Location]]:
    """
    Group locations by their city name (normalized).
    """
    clusters = {}
    for loc in locations:
        if not loc.city:
            city_key = "Unknown"
        else:
            city_key = loc.city.strip().title()
            
        if city_key not in clusters:
            clusters[city_key] = []
        clusters[city_key].append(loc)
    return clusters

def balance_clusters_to_days(clusters: Dict[str, List[Location]], max_stops_per_day: int = 100) -> Dict[str, List[Location]]:
    """
    Assign each City-Cluster to a Day of Week.
    Goal: Keep Daily Total Stops relatively balanced (and under capacity if possible).
    
    Simple Greedy Algorithm:
    1. Sort clusters by size (largest first).
    2. Assign to the emptiest day.
    """
    # 1. Prepare buckets
    day_buckets = {day: [] for day in DAYS_OF_WEEK}
    day_counts = {day: 0 for day in DAYS_OF_WEEK}
    
    # 2. Sort clusters by size (descending)
    sorted_clusters = sorted(clusters.items(), key=lambda item: len(item[1]), reverse=True)
    
    for city, locs in sorted_clusters:
        # Find the day with the minimum current count
        best_day = min(day_counts, key=day_counts.get)
        
        # Assign
        day_buckets[best_day].extend(locs)
        day_counts[best_day] += len(locs)
        
    return day_buckets

# --- Core Logic: Routing (TSP per Vehicle) ---

async def create_routes_for_day(locations: List[Location], num_vehicles: int, depot_name: str, depot_address: str) -> List[Dict]:
    """
    Given a list of locations for a single day, and N vehicles,
    create N optimized routes using OR-Tools (CVRP/TSP).
    """
    if not locations:
        return []

    optimizer = RouteOptimizer()
    routes = await optimizer.optimize_dc_routes(depot_name, depot_address, locations, num_vehicles)
    return routes

# --- API Endpoints ---

@router.post("/generate-schedule", response_model=OptimizationResponse)
async def generate_schedule(req: OptimizationRequest, db: Session = Depends(get_db)):
    """
    Generate a weekly schedule for a specific DC.
    Groups customers by City, then balances across M-F.
    Then splits into routes based on Driver Count.
    """
    # 1. Get DC and Config
    dc = db.query(DistributionCenter).filter(DistributionCenter.id == req.dc_id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="Distribution Center not found")
    
    # Ensure DC has coordinates
    if not dc.latitude or not dc.longitude:
        maps = GoogleMapsService()
        lat, lng = maps.geocode_address(dc.address or f"{dc.name} Depot")
        dc.latitude = lat
        dc.longitude = lng
        db.commit()

    driver_count = DRIVER_COUNTS.get(dc.name, DEFAULT_DRIVERS)
    
    # 2. Get All Active Locations for this DC
    locations = (
        db.query(Location)
        .join(Customer)
        .filter(Customer.primary_dc_id == req.dc_id)
        .limit(250)
        .all()
    )
    
    if not locations:
        return OptimizationResponse(
            status="warning", 
            message="No locations found for this DC.", 
            schedule={}
        )

    # 3. Cluster by City or Use Manual Strategy if LC
    if dc.name == "Lake Charles":
        daily_assignments = {day: [] for day in DAYS_OF_WEEK}
        for loc in locations:
            city_found = False
            loc_city = (loc.city or "").strip().title()
            for day, cities in LC_SCHEDULE.items():
                if loc_city in [c.title() for c in cities]:
                    daily_assignments[day].append(loc)
                    city_found = True
                    break
            
            # Catch-all: If city not in schedule, put it in Monday or Tuesday based on lat/lng (fallback)
            if not city_found:
                # Default to Monday if we can't place it
                daily_assignments["Monday"].append(loc)
    else:
        city_clusters = cluster_by_city(locations)
        daily_assignments = balance_clusters_to_days(city_clusters)
    
    # 5. Generate Routes per Day
    final_schedule = {}
    
    for day in DAYS_OF_WEEK:
        day_locs = daily_assignments[day]
        if not day_locs:
            final_schedule[day] = []
            continue
            
        # Optimization Step using OR-Tools
        routes = await create_routes_for_day(day_locs, driver_count, dc.name, dc.address)
        final_schedule[day] = routes
        
    # Commit any coordinates updated during optimization
    db.commit()

    return OptimizationResponse(
        status="success",
        message=f"Optimized schedule for {dc.name} with {driver_count} drivers using OR-Tools.",
        schedule=final_schedule
    )
