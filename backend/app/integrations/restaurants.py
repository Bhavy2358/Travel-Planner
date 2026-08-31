from typing import List, Dict, Any, Optional

class RestaurantProvider:
    def recommend_restaurants(self, destination: str, meal_type: str = "Lunch", lat: float = 0.0, lng: float = 0.0) -> List[Dict[str, Any]]:
        raise NotImplementedError

class MockRestaurantProvider(RestaurantProvider):
    DEMO_RESTAURANTS: Dict[str, List[Dict[str, Any]]] = {
        "ahmedabad": [
            {
                "id": "ahd-rest-1",
                "name": "Agashiye (The House of MG)",
                "cuisine": "Authentic Gujarati Heritage Thali",
                "rating": 4.9,
                "price_range": "₹₹₹",
                "estimated_cost_per_person": 950.0,
                "address": "Lal Darwaja, Ahmedabad",
                "latitude": 23.0270,
                "longitude": 72.5815,
                "best_for": "Dinner / Special Experience",
                "specialties": ["Rasawala Dhokla", "Kaju Draksh Khichdi", "Fresh Shrikhand", "Wood-fired Rotlas"],
                "photo_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"
            },
            {
                "id": "ahd-rest-2",
                "name": "Vishalla Village Restaurant",
                "cuisine": "Traditional Gujarati & Kathiyawadi",
                "rating": 4.6,
                "price_range": "₹₹",
                "estimated_cost_per_person": 750.0,
                "address": "Vasna Road, Ahmedabad",
                "latitude": 22.9984,
                "longitude": 72.5369,
                "best_for": "Dinner / Cultural Evening",
                "specialties": ["Baingan Bharta", "Bajra Roti", "Garlic Chutney", "Mud-pot Chaas"],
                "photo_url": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80"
            },
            {
                "id": "ahd-rest-3",
                "name": "Gordhan Thal",
                "cuisine": "Unlimited Gujarati & Rajasthani Thali",
                "rating": 4.7,
                "price_range": "₹₹",
                "estimated_cost_per_person": 450.0,
                "address": "SG Highway, Bodakdev, Ahmedabad",
                "latitude": 23.0416,
                "longitude": 72.5186,
                "best_for": "Lunch",
                "specialties": ["Dal Baati Churma", "Khaman", "Gujarati Kadhi", "Moong Dal Halwa"],
                "photo_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80"
            },
            {
                "id": "ahd-rest-4",
                "name": "Manek Chowk Night Food Market",
                "cuisine": "Iconic Street Food & Fusion Snacks",
                "rating": 4.8,
                "price_range": "₹",
                "estimated_cost_per_person": 250.0,
                "address": "Old City, Danapidth, Ahmedabad",
                "latitude": 23.0238,
                "longitude": 72.5873,
                "best_for": "Late Night Dinner / Snacks",
                "specialties": ["Gwalior Dosa", "Chocolate Cheese Sandwich", "Asharfi Kulfi", "Pav Bhaji"],
                "photo_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"
            }
        ]
    }

    def recommend_restaurants(self, destination: str, meal_type: str = "Lunch", lat: float = 0.0, lng: float = 0.0) -> List[Dict[str, Any]]:
        dest_key = destination.strip().lower()
        return self.DEMO_RESTAURANTS.get(dest_key, self.DEMO_RESTAURANTS["ahmedabad"])

def get_restaurant_service() -> RestaurantProvider:
    return MockRestaurantProvider()
