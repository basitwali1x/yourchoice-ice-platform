import hashlib
import math
from typing import List, Dict, Tuple, Optional

class GoogleMapsService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        
    def geocode_address(self, address: str) -> Tuple[float, float]:
        """Geocode an address to get latitude and longitude (fallback to mock)"""
        return self._generate_realistic_coordinates(address)
    
    def _generate_realistic_coordinates(self, address: str) -> Tuple[float, float]:
        """Generate realistic coordinates using hash-based approach with depot-based distribution"""
        if not address:
            return (0.0, 0.0)
            
        # Match specific depots if they appear in address
        if "1707 Smart Street, Leesville" in address or "Leesville Depot" in address:
            return (31.1435, -93.2607)
        elif "220 Bunker Road, Lake Charles" in address or "Lake Charles Depot" in address:
            return (30.2266, -93.2174)
        elif "1107 Weiner St, Lufkin" in address or "Lufkin Depot" in address:
            return (31.3382, -94.7291)
        else:
            hash_val = int(hashlib.md5(address.encode()).hexdigest()[:8], 16)
            
            # Region detection
            if any(k in address for k in ["Lufkin", "TX", "Huntington", "Zavalla", "Ratcliff"]):
                base_lat, base_lng = 31.3382, -94.7291
            elif any(k in address for k in ["Lake Charles", "LA 706"]):
                base_lat, base_lng = 30.2266, -93.2174
            else:
                base_lat, base_lng = 31.1435, -93.2607
            
            lat_range = 0.08
            lng_range = 0.08
            
            lat_variation = ((hash_val % 1000) / 1000.0 - 0.5) * lat_range
            lng_variation = (((hash_val >> 10) % 1000) / 1000.0 - 0.5) * lng_range
            
            return (base_lat + lat_variation, base_lng + lng_variation)
    
    def calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate haversine distance in miles"""
        if not all([lat1, lng1, lat2, lng2]):
            return 999.9
            
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        
        dlng = lng2 - lng1
        dlat = lat2 - lat1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 3958.8 # Earth radius in miles
        
        return c * r

    async def calculate_distance_matrix(self, locations: List[Tuple[float, float]]) -> List[List[float]]:
        """Calculate mock distance matrix for coordinates"""
        n = len(locations)
        matrix = [[0.0 for _ in range(n)] for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i == j:
                    matrix[i][j] = 0.0
                else:
                    matrix[i][j] = self.calculate_distance(
                        locations[i][0], locations[i][1],
                        locations[j][0], locations[j][1]
                    )
        return matrix
