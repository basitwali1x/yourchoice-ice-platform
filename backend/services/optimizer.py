from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from typing import List, Dict, Optional, Any, Tuple
import math
import logging
from .maps import GoogleMapsService

logger = logging.getLogger(__name__)

DEPOT_CONSTRAINTS = {
    "Lufkin": {
        "max_distance": 50, 
        "max_stops": 15, 
        "max_hours": 10
    },
    "Lake Charles": {
        "max_distance": 75, 
        "max_stops": 15, 
        "max_hours": 10
    },
    "Leesville": {
        "max_distance": 100, 
        "max_stops": 20, 
        "max_hours": 10
    }
}

class RouteOptimizer:
    def __init__(self, depot_radius: float = 75):
        self.maps = GoogleMapsService()
        self.depot_radius = depot_radius
        
    async def optimize_dc_routes(self, depot_name: str, depot_address: str, locations: List[Any], num_vehicles: int) -> List[Dict]:
        """
        Optimize routes for a specific DC.
        locations: List of Location objects from SQLAlchemy
        """
        if not locations:
            return []

        # 1. Geocode locations if coordinates are missing (0.0, 0.0)
        depot_coords = self.maps.geocode_address(depot_address)
        
        points = []
        for loc in locations:
            lat = loc.latitude
            lng = loc.longitude
            if lat == 0.0 or lng == 0.0 or lat is None:
                lat, lng = self.maps.geocode_address(loc.address_line + ", " + (loc.city or ""))
                # Update loc object in memory so we can use it, but caller should save to DB if needed
                loc.latitude = lat
                loc.longitude = lng
            points.append((lat, lng))

        # 2. Setup OR-Tools
        # 0 is the depot
        all_coords = [depot_coords] + points
        manager = pywrapcp.RoutingIndexManager(len(all_coords), num_vehicles, 0)
        routing = pywrapcp.RoutingModel(manager)

        # 3. Distance Matrix
        distance_matrix = await self.maps.calculate_distance_matrix(all_coords)

        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(distance_matrix[from_node][to_node] * 100) # Int for OR-Tools

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # 4. Add Constraints (Distance)
        dimension_name = 'Distance'
        max_dist_miles = DEPOT_CONSTRAINTS.get(depot_name, {}).get("max_distance", 100)
        routing.AddDimension(
            transit_callback_index,
            0,  # no slack
            int(max_dist_miles * 2 * 100), # Max distance per vehicle (round trip)
            True,  # start cumul to zero
            dimension_name
        )
        distance_dimension = routing.GetDimensionOrDie(dimension_name)
        distance_dimension.SetGlobalSpanCostCoefficient(100)

        # 5. Solve
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.FromSeconds(30)

        solution = routing.SolveWithParameters(search_parameters)

        if solution:
            return self._extract_routes(manager, routing, solution, locations, depot_name)
        else:
            logger.warning(f"OR-Tools failed to solve for {depot_name}. Falling back to chunking.")
            return self._fallback_chunking(locations, num_vehicles, depot_name)

    def _extract_routes(self, manager, routing, solution, locations, depot_name):
        routes = []
        for vehicle_id in range(routing.vehicles()):
            stops = []
            index = routing.Start(vehicle_id)
            sequence = 1
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                if node_index > 0:
                    loc = locations[node_index - 1]
                    stops.append({
                        "sequence": sequence,
                        "location": {
                            "id": loc.id,
                            "name": loc.location_name,
                            "address": loc.address_line,
                            "city": loc.city,
                            "latitude": loc.latitude,
                            "longitude": loc.longitude
                        },
                        "customer": {
                            "id": loc.customer.id,
                            "name": loc.customer.business_name
                        }
                    })
                    sequence += 1
                index = solution.Value(routing.NextVar(index))
            
            if stops:
                routes.append({
                    "vehicle_id": vehicle_id + 1,
                    "stops": stops,
                    "stop_count": len(stops),
                    "depot": depot_name
                })
        return routes

    def _fallback_chunking(self, locations, num_vehicles, depot_name):
        chunk_size = math.ceil(len(locations) / num_vehicles)
        routes = []
        for i in range(num_vehicles):
            start = i * chunk_size
            chunk = locations[start : start + chunk_size]
            if not chunk: continue
            
            stops = []
            for idx, loc in enumerate(chunk):
                stops.append({
                    "sequence": idx + 1,
                    "location": {
                        "id": loc.id,
                        "name": loc.location_name,
                        "address": loc.address_line,
                        "city": loc.city,
                        "latitude": loc.latitude,
                        "longitude": loc.longitude
                    },
                    "customer": {
                        "id": loc.customer.id,
                        "name": loc.customer.business_name
                    }
                })
            routes.append({
                "vehicle_id": i + 1,
                "stops": stops,
                "stop_count": len(stops),
                "depot": depot_name
            })
        return routes
