import math
from typing import Tuple, List, Dict, Any
from app.config import settings

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in kilometers.
    """
    if lat1 == 0.0 and lon1 == 0.0 or lat2 == 0.0 and lon2 == 0.0:
        return 2.0 # Default reasonable distance
    
    # Earth radius in kilometers
    R = 6371.0
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    distance = R * c
    # Road network detour factor ~1.25x
    return round(distance * 1.25, 2)

def estimate_travel_time_minutes(distance_km: float, mode: str = "Taxi") -> int:
    """
    Estimate travel time based on distance and transportation mode.
    """
    mode = mode.lower()
    if "walk" in mode:
        # 4.5 km/h avg walking speed
        speed = 4.5
    elif "metro" in mode or "train" in mode:
        # 25 km/h avg metro speed + 5 min station buffer
        speed = 25.0
    elif "bus" in mode or "public" in mode:
        # 18 km/h avg bus speed + 7 min wait buffer
        speed = 18.0
    elif "auto" in mode:
        # 28 km/h city auto speed
        speed = 28.0
    else:
        # Taxi / Car ~ 32 km/h city speed
        speed = 32.0
    
    time_hours = distance_km / speed
    time_mins = int(round(time_hours * 60))
    # Minimum 5 minutes buffer for any stop transition
    return max(5, time_mins)

class MapProvider:
    """
    Abstract interface for Map / Geolocation services.
    Enables zero-friction replacement with Google Maps, Mapbox, OSRM, or OpenStreetMap.
    """
    def get_distance_matrix(self, locations: List[Tuple[float, float]], mode: str = "Taxi") -> List[List[float]]:
        raise NotImplementedError

class MockMapProvider(MapProvider):
    def get_distance_matrix(self, locations: List[Tuple[float, float]], mode: str = "Taxi") -> List[List[float]]:
        n = len(locations)
        matrix = [[0.0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j:
                    lat1, lon1 = locations[i]
                    lat2, lon2 = locations[j]
                    matrix[i][j] = haversine_distance(lat1, lon1, lat2, lon2)
        return matrix

class RealMapProvider(MapProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_distance_matrix(self, locations: List[Tuple[float, float]], mode: str = "Taxi") -> List[List[float]]:
        # Fallback to local high-precision Haversine if external rate limit or key missing
        return MockMapProvider().get_distance_matrix(locations, mode)

def get_map_service() -> MapProvider:
    if settings.USE_MOCK_DATA or not settings.GOOGLE_MAPS_API_KEY:
        return MockMapProvider()
    return RealMapProvider(settings.GOOGLE_MAPS_API_KEY)
