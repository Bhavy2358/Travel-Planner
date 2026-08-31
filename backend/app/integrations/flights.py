from typing import List, Dict, Any
from app.config import settings

class FlightProvider:
    def search_flights(self, origin: str, destination: str, date: str, passengers: int = 1) -> List[Dict[str, Any]]:
        raise NotImplementedError

class MockFlightProvider(FlightProvider):
    def search_flights(self, origin: str, destination: str, date: str, passengers: int = 1) -> List[Dict[str, Any]]:
        return [
            {
                "id": "fl-indigo-601",
                "airline": "IndiGo",
                "flight_number": "6E-2415",
                "origin": origin or "Delhi (DEL)",
                "destination": destination or "Ahmedabad (AMD)",
                "departure_time": "08:15",
                "arrival_time": "09:45",
                "duration": "1h 30m",
                "stops": "Non-stop",
                "price": 3850.0,
                "currency": "INR",
                "badge": "Best Value",
                "is_demo_data": True,
                "note": "Demo Flight Schedule"
            },
            {
                "id": "fl-airindia-302",
                "airline": "Air India",
                "flight_number": "AI-817",
                "origin": origin or "Delhi (DEL)",
                "destination": destination or "Ahmedabad (AMD)",
                "departure_time": "10:30",
                "arrival_time": "12:05",
                "duration": "1h 35m",
                "stops": "Non-stop",
                "price": 4450.0,
                "currency": "INR",
                "badge": "Flexible",
                "is_demo_data": True,
                "note": "Demo Flight Schedule"
            },
            {
                "id": "fl-spicejet-104",
                "airline": "SpiceJet",
                "flight_number": "SG-921",
                "origin": origin or "Delhi (DEL)",
                "destination": destination or "Ahmedabad (AMD)",
                "departure_time": "14:20",
                "arrival_time": "15:55",
                "duration": "1h 35m",
                "stops": "Non-stop",
                "price": 3490.0,
                "currency": "INR",
                "badge": "Cheapest",
                "is_demo_data": True,
                "note": "Demo Flight Schedule"
            },
            {
                "id": "fl-vistara-505",
                "airline": "Vistara",
                "flight_number": "UK-952",
                "origin": origin or "Delhi (DEL)",
                "destination": destination or "Ahmedabad (AMD)",
                "departure_time": "18:00",
                "arrival_time": "19:35",
                "duration": "1h 35m",
                "stops": "Non-stop",
                "price": 5200.0,
                "currency": "INR",
                "badge": "Premium Economy",
                "is_demo_data": True,
                "note": "Demo Flight Schedule"
            }
        ]

class RealFlightProvider(FlightProvider):
    def search_flights(self, origin: str, destination: str, date: str, passengers: int = 1) -> List[Dict[str, Any]]:
        return MockFlightProvider().search_flights(origin, destination, date, passengers)

def get_flight_service() -> FlightProvider:
    return MockFlightProvider()
