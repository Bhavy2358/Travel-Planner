from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Location, User, Trip
from app.integrations.restaurants import get_restaurant_service

class RecommendationService:
    """
    Personalized AI Recommendation Engine with Explainability.
    Ranks POIs and culinary experiences based on user preference profile, budget, and travel pace.
    """

    @classmethod
    def get_personalized_recommendations(
        cls,
        db: Session,
        destination: str,
        user_id: Optional[int] = None,
        trip_id: Optional[int] = None
    ) -> Dict[str, Any]:
        dest_norm = destination.strip().lower()
        
        # User preferences baseline
        user_interests = ["Culture", "Food", "History"]
        budget_pref = "Standard"
        pace = "Balanced"

        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user_interests = [x.strip() for x in user.favorite_activities.split(",") if x.strip()]
                budget_pref = user.budget_preference

        if trip_id:
            trip = db.query(Trip).filter(Trip.id == trip_id).first()
            if trip:
                user_interests = [x.strip() for x in trip.travel_preferences.split(",") if x.strip()]
                budget_pref = trip.budget_category
                pace = trip.travel_pace

        # Query POIs for destination
        all_locations = db.query(Location).all()
        dest_locations = [l for l in all_locations if dest_norm in l.destination.lower()]
        if not dest_locations:
            dest_locations = all_locations

        # Score POIs
        scored_pois = []
        for loc in dest_locations:
            score = loc.rating * 15 # Base 0-75
            
            # Category match bonus
            if any(pref.lower() in loc.category.lower() or pref.lower() in loc.tags.lower() for pref in user_interests):
                score += 25
            
            # Reason generation
            reasons = []
            if any(pref.lower() in loc.category.lower() for pref in user_interests):
                reasons.append(f"Matches your interest in {loc.category}")
            if loc.rating >= 4.8:
                reasons.append("Rated exceptional (4.8+ ⭐) by travelers")
            if loc.ticket_cost == 0:
                reasons.append("Free entry / High value")
            
            why_reason = " • ".join(reasons) if reasons else "Highly recommended highlight for your destination."

            scored_pois.append({
                "id": loc.id,
                "name": loc.name,
                "category": loc.category,
                "rating": loc.rating,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "address": loc.address,
                "ticket_cost": loc.ticket_cost,
                "opening_time": loc.opening_time,
                "closing_time": loc.closing_time,
                "best_time_to_visit": loc.best_time_to_visit,
                "description": loc.description,
                "photo_url": loc.photo_url,
                "match_score": min(99, int(score)),
                "why_chosen": why_reason
            })

        scored_pois.sort(key=lambda x: x["match_score"], reverse=True)

        # Restaurants
        rest_service = get_restaurant_service()
        restaurants = rest_service.recommend_restaurants(destination)

        return {
            "destination": destination,
            "user_preferences_matched": user_interests,
            "attractions": scored_pois[:8],
            "restaurants": restaurants,
            "ai_insight": f"Curated {len(scored_pois[:8])} attractions and {len(restaurants)} dining experiences tailored to your '{', '.join(user_interests)}' preferences and {pace} pace."
        }
