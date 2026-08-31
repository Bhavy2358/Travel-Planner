from typing import List, Dict, Any, Optional
from app.config import settings

class HotelProvider:
    def search_hotels(self, destination: str, checkin_date: str, checkout_date: str, guests: int = 2, max_price: Optional[float] = None) -> List[Dict[str, Any]]:
        raise NotImplementedError

class MockHotelProvider(HotelProvider):
    DEMO_HOTELS: Dict[str, List[Dict[str, Any]]] = {
        "ahmedabad": [
            {
                "id": "ahd-htl-1",
                "name": "The House of MG (Heritage Grand)",
                "destination": "Ahmedabad",
                "rating": 4.8,
                "price_per_night": 6200.0,
                "currency": "INR",
                "address": "Opp. Sidi Saiyyed Mosque, Gheekanta, Ahmedabad",
                "latitude": 23.0270,
                "longitude": 72.5815,
                "amenities": ["Heritage Architecture", "Agashiye Rooftop Restaurant", "Pool", "Free WiFi", "Spa"],
                "distance_from_center": "0.3 km",
                "is_demo_data": True,
                "photo_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"
            },
            {
                "id": "ahd-htl-2",
                "name": "Hyatt Regency Ahmedabad",
                "destination": "Ahmedabad",
                "rating": 4.7,
                "price_per_night": 5400.0,
                "currency": "INR",
                "address": "Ashram Road, Ahmedabad",
                "latitude": 23.0392,
                "longitude": 72.5714,
                "amenities": ["Sabarmati River View", "Swimming Pool", "Fitness Center", "Fine Dining", "Free Parking"],
                "distance_from_center": "1.8 km",
                "is_demo_data": True,
                "photo_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80"
            },
            {
                "id": "ahd-htl-3",
                "name": "Lemon Tree Premier, The Atrium",
                "destination": "Ahmedabad",
                "rating": 4.4,
                "price_per_night": 3800.0,
                "currency": "INR",
                "address": "Off Nehru Bridge, Sabarmati Riverfront, Ahmedabad",
                "latitude": 23.0285,
                "longitude": 72.5772,
                "amenities": ["Riverfront Access", "Free Breakfast", "Restaurant", "WiFi", "Business Center"],
                "distance_from_center": "1.0 km",
                "is_demo_data": True,
                "photo_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80"
            },
            {
                "id": "ahd-htl-4",
                "name": "Courtyard by Marriott Ahmedabad",
                "destination": "Ahmedabad",
                "rating": 4.6,
                "price_per_night": 4900.0,
                "currency": "INR",
                "address": "Ramdev Nagar Cross Road, Satellite, Ahmedabad",
                "latitude": 23.0298,
                "longitude": 72.5074,
                "amenities": ["Outdoor Pool", "24h Cafe", "Fitness Studio", "High Speed Internet"],
                "distance_from_center": "6.2 km",
                "is_demo_data": True,
                "photo_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80"
            }
        ],
        "jaipur": [
            {
                "id": "jpr-htl-1",
                "name": "ITC Rajputana, Luxury Collection",
                "destination": "Jaipur",
                "rating": 4.8,
                "price_per_night": 7500.0,
                "currency": "INR",
                "address": "Palace Road, Gopalbari, Jaipur",
                "latitude": 26.9196,
                "longitude": 75.7956,
                "amenities": ["Royal Architecture", "Peshawri Dining", "Spa", "Outdoor Pool"],
                "distance_from_center": "1.2 km",
                "is_demo_data": True,
                "photo_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"
            },
            {
                "id": "jpr-htl-2",
                "name": "Shahpura Haveli (Heritage)",
                "destination": "Jaipur",
                "rating": 4.5,
                "price_per_night": 4200.0,
                "currency": "INR",
                "address": "Devi Marg, Bani Park, Jaipur",
                "latitude": 26.9281,
                "longitude": 75.7925,
                "amenities": ["Fresco Art", "Courtyard Restaurant", "Free WiFi", "Cultural Music"],
                "distance_from_center": "2.0 km",
                "is_demo_data": True,
                "photo_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80"
            }
        ],
        "goa": [
            {
                "id": "goa-htl-1",
                "name": "Taj Fort Aguada Resort & Spa",
                "destination": "Goa",
                "rating": 4.9,
                "price_per_night": 11500.0,
                "currency": "INR",
                "address": "Sinquerim, Candolim, Goa",
                "latitude": 15.4926,
                "longitude": 73.7736,
                "amenities": ["Beachfront", "Infinity Pool", "Ayurvedic Spa", "Sea View Balcony"],
                "distance_from_center": "0.1 km to beach",
                "is_demo_data": True,
                "photo_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80"
            }
        ]
    }

    def search_hotels(self, destination: str, checkin_date: str, checkout_date: str, guests: int = 2, max_price: Optional[float] = None) -> List[Dict[str, Any]]:
        dest_key = destination.strip().lower()
        # Look up destination key or fallback to generic
        hotels = self.DEMO_HOTELS.get(dest_key, self.DEMO_HOTELS["ahmedabad"])
        if max_price:
            hotels = [h for h in hotels if h["price_per_night"] <= max_price]
        return hotels

class RealHotelProvider(HotelProvider):
    def search_hotels(self, destination: str, checkin_date: str, checkout_date: str, guests: int = 2, max_price: Optional[float] = None) -> List[Dict[str, Any]]:
        # Fallback to robust Mock Provider
        return MockHotelProvider().search_hotels(destination, checkin_date, checkout_date, guests, max_price)

def get_hotel_service() -> HotelProvider:
    return MockHotelProvider()
