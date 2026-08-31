import json
import math
import bcrypt
from sqlalchemy.orm import Session
from app.models import User, Trip, ItineraryDay, Activity, Booking, Location, KnowledgeDocument, Notification, TripChange

def compute_mock_embedding(text: str) -> list[float]:
    """Generate a deterministic 64-dimensional normalized vector for offline RAG search."""
    vec = [0.0] * 64
    words = text.lower().split()
    for word in words:
        val = sum(ord(c) for c in word)
        idx = val % 64
        vec[idx] += 1.0
    norm = math.sqrt(sum(x*x for x in vec)) or 1.0
    return [round(x / norm, 4) for x in vec]

AHMEDABAD_LOCATIONS = [
    {
        "name": "Sabarmati Ashram (Gandhi Ashram)",
        "destination": "Ahmedabad",
        "category": "Historical",
        "latitude": 23.0605,
        "longitude": 72.5800,
        "address": "Gandhi Smarak Sangrahalaya, Ashram Road, Ahmedabad",
        "rating": 4.9,
        "opening_time": "08:30",
        "closing_time": "18:30",
        "typical_duration_minutes": 90,
        "ticket_cost": 0.0,
        "best_time_to_visit": "Morning (09:00 AM)",
        "description": "The historic residence of Mahatma Gandhi and epicenter of India's non-violent freedom movement.",
        "tags": "History, Heritage, Peaceful, Gandhi, Museum",
        "photo_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Adalaj Stepwell (Rudabai Stepwell)",
        "destination": "Ahmedabad",
        "category": "Historical",
        "latitude": 23.1667,
        "longitude": 72.5801,
        "address": "Adalaj, Gandhinagar Highway, Ahmedabad",
        "rating": 4.8,
        "opening_time": "08:00",
        "closing_time": "18:00",
        "typical_duration_minutes": 75,
        "ticket_cost": 25.0,
        "best_time_to_visit": "Morning / Mid-day for natural light photography",
        "description": "A magnificent 5-story 15th-century subterranean stepwell featuring intricate Solanki-Islamic stone carvings.",
        "tags": "Architecture, Photography, Stepwell, Heritage",
        "photo_url": "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Sidi Saiyyed Mosque (Jali Screen)",
        "destination": "Ahmedabad",
        "category": "Culture",
        "latitude": 23.0271,
        "longitude": 72.5815,
        "address": "Opp. Electricity House, Gheekanta, Ahmedabad",
        "rating": 4.7,
        "opening_time": "07:00",
        "closing_time": "19:00",
        "typical_duration_minutes": 45,
        "ticket_cost": 0.0,
        "best_time_to_visit": "Afternoon light",
        "description": "Famed for its world-renowned 'Tree of Life' intricately carved marble filigree latticework.",
        "tags": "Culture, Architecture, Iconic, World Heritage",
        "photo_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Sabarmati Riverfront Promenade",
        "destination": "Ahmedabad",
        "category": "Relaxation",
        "latitude": 23.0338,
        "longitude": 72.5714,
        "address": "Sabarmati Riverfront, West Bank, Ahmedabad",
        "rating": 4.8,
        "opening_time": "06:00",
        "closing_time": "22:00",
        "typical_duration_minutes": 60,
        "ticket_cost": 10.0,
        "best_time_to_visit": "Sunset & Evening",
        "description": "Modern urban riverfront with landscaped gardens, pedal boating, walking tracks, and sunset river views.",
        "tags": "Nature, Sunset, Walking, Modern City",
        "photo_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Manek Chowk Heritage Night Market",
        "destination": "Ahmedabad",
        "category": "Food",
        "latitude": 23.0238,
        "longitude": 72.5873,
        "address": "Old City, Danapidth, Ahmedabad",
        "rating": 4.9,
        "opening_time": "19:30",
        "closing_time": "23:59",
        "typical_duration_minutes": 90,
        "ticket_cost": 0.0,
        "best_time_to_visit": "Night (08:30 PM - 11:00 PM)",
        "description": "A bustling jewelry market by day that transforms into a legendary street-food paradise by night.",
        "tags": "Food, Street Food, Nightlife, Gujarati Sweets, Local Vibe",
        "photo_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hutheesing Jain Temple",
        "destination": "Ahmedabad",
        "category": "Culture",
        "latitude": 23.0425,
        "longitude": 72.5936,
        "address": "Shahibaug Road, Bardolpura, Ahmedabad",
        "rating": 4.8,
        "opening_time": "08:00",
        "closing_time": "17:00",
        "typical_duration_minutes": 60,
        "ticket_cost": 0.0,
        "best_time_to_visit": "Morning (09:30 AM)",
        "description": "Exquisite white marble temple built in 1848 with 52 intricately carved shrines dedicated to Dharmanatha.",
        "tags": "Spiritual, Marble Architecture, Peace, Culture",
        "photo_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Calico Museum of Textiles",
        "destination": "Ahmedabad",
        "category": "Culture",
        "latitude": 23.0560,
        "longitude": 72.5925,
        "address": "The Retreat, Shahibaug, Ahmedabad",
        "rating": 4.9,
        "opening_time": "10:00",
        "closing_time": "15:00",
        "typical_duration_minutes": 120,
        "ticket_cost": 0.0,
        "best_time_to_visit": "Morning slot",
        "description": "World's premier museum for Indian textiles showcasing rare fabrics, royal tapestries, and hand-embroidered silks.",
        "tags": "Museum, Textiles, Art, Heritage",
        "photo_url": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Law Garden Traditional Night Market",
        "destination": "Ahmedabad",
        "category": "Shopping",
        "latitude": 23.0253,
        "longitude": 72.5593,
        "address": "Netaji Road, Ellisbridge, Ahmedabad",
        "rating": 4.7,
        "opening_time": "17:00",
        "closing_time": "23:00",
        "typical_duration_minutes": 90,
        "ticket_cost": 0.0,
        "best_time_to_visit": "Evening (06:30 PM)",
        "description": "Vibrant street market famous for authentic Gujarati handicrafts, mirror-work Chaniya Cholis, and brass artifacts.",
        "tags": "Shopping, Handicrafts, Garba Costumes, Souvenirs",
        "photo_url": "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Kankaria Lake & Zoo Promenade",
        "destination": "Ahmedabad",
        "category": "Nature",
        "latitude": 22.9978,
        "longitude": 72.6025,
        "address": "Kankaria, Maninagar, Ahmedabad",
        "rating": 4.6,
        "opening_time": "09:00",
        "closing_time": "21:00",
        "typical_duration_minutes": 100,
        "ticket_cost": 20.0,
        "best_time_to_visit": "Late Afternoon",
        "description": "Massive 15th-century circular lake with toy train, water rides, zoo, and illuminated evening musical fountain.",
        "tags": "Nature, Family, Lake, Entertainment",
        "photo_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Science City Ahmedabad",
        "destination": "Ahmedabad",
        "category": "Adventure",
        "latitude": 23.0782,
        "longitude": 72.4965,
        "address": "Science City Road, Sola, Ahmedabad",
        "rating": 4.8,
        "opening_time": "10:00",
        "closing_time": "20:00",
        "typical_duration_minutes": 150,
        "ticket_cost": 150.0,
        "best_time_to_visit": "Afternoon",
        "description": "High-tech science park with Aquatic Gallery, Robotic Gallery, 3D IMAX theater, and Nature Park.",
        "tags": "Science, Robotics, Family, Innovation",
        "photo_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80"
    }
]

AHMEDABAD_KNOWLEDGE = [
    {
        "destination": "Ahmedabad",
        "title": "Ahmedabad Overview & UNESCO World Heritage Status",
        "category": "guide",
        "content": "Ahmedabad is India's first UNESCO World Heritage City, recognized for its historic Old City with intricate pols (neighborhoods), carved wooden facades, stepwells, and harmonious blend of Hindu, Jain, and Islamic architecture. It was founded in 1411 AD by Sultan Ahmad Shah on the banks of the Sabarmati River.",
        "tags": "heritage, history, unesco, culture, guide"
    },
    {
        "destination": "Ahmedabad",
        "title": "Family Travel & Kid-Friendly Suitability",
        "category": "guide",
        "content": "Ahmedabad is exceptionally safe, hospitable, and family-friendly. Top family attractions include Science City (featuring the world-class Aquatic Gallery with penguins and Robotics Gallery), Kankaria Lake (toy train and zoo), Sabarmati Riverfront promenade, and peaceful Gandhi Ashram. Street food and traditional restaurants offer rich vegetarian fare suitable for all ages.",
        "tags": "family, kids, safety, attractions"
    },
    {
        "destination": "Ahmedabad",
        "title": "Culinary Specialties & Vegetarian Dining Guide",
        "category": "food",
        "content": "Ahmedabad is a global paradise for vegetarian foodies. Must-try dishes include the traditional Gujarati Thali (Agashiye and Gordhan Thal), Khaman, Dhokla, Fafda-Jalebi for breakfast, Handvo, and late-night delicacies at Manek Chowk such as Gwalior Dosa and Chocolate Cheese Sandwiches. Ahmedabad is predominantly vegetarian.",
        "tags": "food, vegetarian, thali, street food, manek chowk"
    },
    {
        "destination": "Ahmedabad",
        "title": "Local Transportation & Navigating the City",
        "category": "transport",
        "content": "Ahmedabad is easily navigated via Auto-rickshaws (Ola/Uber Auto and meter autos), app-based Cabs (Uber, Ola), the Janmarg BRTS dedicated bus corridor, and the modern Ahmedabad Metro. In the Old City (Pols, Manek Chowk, Sidi Saiyyed), walking or auto-rickshaws are the fastest way to travel.",
        "tags": "transport, metro, auto, cabs, traffic"
    },
    {
        "destination": "Ahmedabad",
        "title": "Best Seasons & Weather Advice",
        "category": "weather",
        "content": "The best time to visit Ahmedabad is from October to March when the weather is pleasantly cool and breezy (15°C to 28°C). October features the 9-night Navratri Garba festival (world's largest dance festival), and January 14th hosts Uttarayan (International Kite Festival) with vibrant sky displays.",
        "tags": "weather, seasons, festivals, navratri, kite festival"
    }
]

def seed_database(db: Session):
    """Seed initial demo user, locations catalog, and knowledge documents."""
    # 1. Create Demo User
    demo_user = db.query(User).filter(User.email == "demo@travelplanner.com").first()
    if not demo_user:
        salt = bcrypt.gensalt()
        hashed_pwd = bcrypt.hashpw("demo123".encode("utf-8"), salt).decode("utf-8")
        demo_user = User(
            email="demo@travelplanner.com",
            hashed_password=hashed_pwd,
            full_name="Demo Explorer",
            role="admin",
            preferred_travel_style="Balanced",
            budget_preference="Standard",
            favorite_activities="Culture, Food, History"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # 2. Seed Locations
    for loc_data in AHMEDABAD_LOCATIONS:
        existing = db.query(Location).filter(Location.name == loc_data["name"]).first()
        if not existing:
            loc = Location(**loc_data)
            db.add(loc)
    db.commit()

    # 3. Seed Knowledge Base (RAG)
    for doc_data in AHMEDABAD_KNOWLEDGE:
        existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.title == doc_data["title"]).first()
        if not existing:
            emb = compute_mock_embedding(doc_data["title"] + " " + doc_data["content"] + " " + doc_data["tags"])
            doc = KnowledgeDocument(
                destination=doc_data["destination"],
                title=doc_data["title"],
                category=doc_data["category"],
                content=doc_data["content"],
                tags=doc_data["tags"],
                embedding_json=json.dumps(emb)
            )
            db.add(doc)
    db.commit()

    # 4. Seed Preconfigured Demo Trip ("Ahmedabad 3-Day Trip") if none exists
    demo_trip = db.query(Trip).filter(Trip.user_id == demo_user.id, Trip.destination == "Ahmedabad").first()
    if not demo_trip:
        create_ahmedabad_demo_trip(db, demo_user.id)

def create_ahmedabad_demo_trip(db: Session, user_id: int) -> Trip:
    """Create the turnkey 3-Day Ahmedabad Demo Trip ready for faculty presentation."""
    trip = Trip(
        user_id=user_id,
        title="Ahmedabad Heritage & Culinary Expedition",
        destination="Ahmedabad",
        starting_location="Sardar Vallabhbhai Patel International Airport (AMD)",
        start_date="2026-09-15",
        end_date="2026-09-17",
        duration_days=3,
        travelers_count=2,
        adults=2,
        children=0,
        budget_category="Standard",
        total_budget=25000.0,
        currency="INR",
        travel_preferences="Culture, Food, History",
        travel_pace="Balanced",
        transport_mode="Taxi / Auto",
        accommodation_type="Hotel",
        status="active",
        total_estimated_cost=21850.0,
        total_distance_km=27.4,
        total_travel_time_minutes=125,
        before_opt_distance_km=42.8,
        before_opt_time_minutes=200
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    # Add Bookings (Dependency chain: Flight -> Airport Transfer -> Hotel)
    flight = Booking(
        trip_id=trip.id,
        booking_type="flight",
        title="Flight DEL → AMD (IndiGo 6E-2415)",
        provider="IndiGo Airlines",
        confirmation_code="6E-AMD889",
        status="confirmed",
        start_datetime="2026-09-15 08:15",
        end_datetime="2026-09-15 09:45",
        cost=7700.0,
        currency="INR",
        details=json.dumps({"seat": "12A, 12B", "terminal": "T1", "baggage": "15kg"}),
        notes="Arrival at AMD Airport Terminal 1"
    )
    db.add(flight)
    db.commit()
    db.refresh(flight)

    transfer = Booking(
        trip_id=trip.id,
        booking_type="transport",
        title="Airport Transfer (AMD Airport → The House of MG)",
        provider="Travel Copilot Express Cabs",
        confirmation_code="TR-7712",
        status="confirmed",
        start_datetime="2026-09-15 10:00",
        end_datetime="2026-09-15 10:45",
        cost=650.0,
        currency="INR",
        parent_booking_id=flight.id,
        details=json.dumps({"vehicle": "Sedan AC", "pickup": "Terminal 1 Exit Gate 3"}),
        notes="Connected to Flight 6E-2415 arrival"
    )
    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    hotel = Booking(
        trip_id=trip.id,
        booking_type="hotel",
        title="The House of MG (Heritage Grand Hotel)",
        provider="The House of MG",
        confirmation_code="HMG-5501",
        status="confirmed",
        start_datetime="2026-09-15 11:00",
        end_datetime="2026-09-17 11:00",
        cost=12400.0,
        currency="INR",
        parent_booking_id=transfer.id,
        details=json.dumps({"room_type": "Heritage Grand Deluxe", "nights": 2, "breakfast_included": True}),
        notes="Early check-in requested at 11:00 AM"
    )
    db.add(hotel)
    db.commit()

    # Day 1: Gandhi Heritage & Sunset Riverfront
    day1 = ItineraryDay(
        trip_id=trip.id,
        day_number=1,
        date="2026-09-15",
        area_name="Sabarmati & Riverfront",
        theme="Freedom Movement & Scenic Riverfront",
        morning_summary="Arrive, check into heritage hotel, and visit the serene Sabarmati Gandhi Ashram.",
        afternoon_summary="Explore the world-famous carved marble screens of Sidi Saiyyed Mosque and savor a traditional lunch.",
        evening_summary="Stroll along the landscaped Sabarmati Riverfront promenade and enjoy dinner at Agashiye.",
        estimated_distance_km=9.2,
        estimated_travel_time_minutes=42,
        estimated_cost=2100.0,
        before_opt_distance_km=14.5,
        before_opt_time_minutes=70,
        is_optimized=True
    )
    db.add(day1)
    db.commit()
    db.refresh(day1)

    act1_1 = Activity(
        itinerary_day_id=day1.id,
        name="The House of MG (Hotel Check-in)",
        category="Hotel",
        latitude=23.0270,
        longitude=72.5815,
        address="Lal Darwaja, Ahmedabad",
        start_time="11:00",
        end_time="11:45",
        duration_minutes=45,
        travel_time_minutes=0,
        travel_distance_km=0.0,
        transport_mode="Walk",
        estimated_cost=0.0,
        order_index=0,
        rating=4.8,
        why_chosen="Central base in the historic heritage quarter.",
        photo_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"
    )
    act1_2 = Activity(
        itinerary_day_id=day1.id,
        name="Sabarmati Gandhi Ashram",
        category="Historical",
        latitude=23.0605,
        longitude=72.5800,
        address="Ashram Road, Ahmedabad",
        start_time="12:00",
        end_time="13:30",
        duration_minutes=90,
        travel_time_minutes=15,
        travel_distance_km=4.2,
        transport_mode="Taxi",
        estimated_cost=0.0,
        order_index=1,
        rating=4.9,
        why_chosen="Essential historical landmark matching your high interest in Indian heritage.",
        photo_url="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80"
    )
    act1_3 = Activity(
        itinerary_day_id=day1.id,
        name="Gordhan Thal Gujarati Lunch",
        category="Food",
        latitude=23.0416,
        longitude=72.5186,
        address="SG Highway, Ahmedabad",
        start_time="13:45",
        end_time="15:00",
        duration_minutes=75,
        travel_time_minutes=15,
        travel_distance_km=3.8,
        transport_mode="Auto",
        estimated_cost=900.0,
        order_index=2,
        rating=4.7,
        why_chosen="Acclaimed authentic unlimited Gujarati Thali experience.",
        photo_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80"
    )
    act1_4 = Activity(
        itinerary_day_id=day1.id,
        name="Sidi Saiyyed Mosque (Jali)",
        category="Culture",
        latitude=23.0271,
        longitude=72.5815,
        address="Gheekanta, Ahmedabad",
        start_time="15:30",
        end_time="16:30",
        duration_minutes=60,
        travel_time_minutes=12,
        travel_distance_km=2.8,
        transport_mode="Taxi",
        estimated_cost=0.0,
        order_index=3,
        rating=4.8,
        why_chosen="Architectural marvel of intricate stone filigree.",
        photo_url="https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80"
    )
    act1_5 = Activity(
        itinerary_day_id=day1.id,
        name="Sabarmati Riverfront Promenade",
        category="Relaxation",
        latitude=23.0338,
        longitude=72.5714,
        address="Sabarmati Riverfront, Ahmedabad",
        start_time="17:00",
        end_time="18:30",
        duration_minutes=90,
        travel_time_minutes=8,
        travel_distance_km=1.2,
        transport_mode="Walk",
        estimated_cost=20.0,
        order_index=4,
        rating=4.8,
        why_chosen="Breezy sunset stroll alongside the illuminated Sabarmati river.",
        photo_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
    )
    db.add_all([act1_1, act1_2, act1_3, act1_4, act1_5])

    # Day 2: Subterranean Architecture & Night Street Food
    day2 = ItineraryDay(
        trip_id=trip.id,
        day_number=2,
        date="2026-09-16",
        area_name="Adalaj & Old City Pols",
        theme="Stepwells, Marble Shrines & Manek Chowk",
        morning_summary="Visit the 5-story Adalaj Stepwell and Hutheesing Jain Temple.",
        afternoon_summary="Explore the Calico Museum of Textiles and shop at Law Garden.",
        evening_summary="Feast on late-night culinary sensations at Manek Chowk night market.",
        estimated_distance_km=11.5,
        estimated_travel_time_minutes=53,
        estimated_cost=1500.0,
        before_opt_distance_km=18.2,
        before_opt_time_minutes=85,
        is_optimized=True
    )
    db.add(day2)
    db.commit()
    db.refresh(day2)

    act2_1 = Activity(
        itinerary_day_id=day2.id,
        name="Adalaj Stepwell",
        category="Historical",
        latitude=23.1667,
        longitude=72.5801,
        address="Gandhinagar Highway, Adalaj",
        start_time="09:00",
        end_time="10:30",
        duration_minutes=90,
        travel_time_minutes=20,
        travel_distance_km=8.5,
        transport_mode="Taxi",
        estimated_cost=50.0,
        order_index=0,
        rating=4.9,
        why_chosen="15th century underground architectural wonder with stunning photo light.",
        photo_url="https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop&q=80"
    )
    act2_2 = Activity(
        itinerary_day_id=day2.id,
        name="Hutheesing Jain Temple",
        category="Culture",
        latitude=23.0425,
        longitude=72.5936,
        address="Shahibaug Road, Ahmedabad",
        start_time="11:00",
        end_time="12:15",
        duration_minutes=75,
        travel_time_minutes=15,
        travel_distance_km=6.0,
        transport_mode="Taxi",
        estimated_cost=0.0,
        order_index=1,
        rating=4.8,
        why_chosen="Peaceful spiritual setting with intricate white marble craftsmanship.",
        photo_url="https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80"
    )
    act2_3 = Activity(
        itinerary_day_id=day2.id,
        name="Law Garden Traditional Market",
        category="Shopping",
        latitude=23.0253,
        longitude=72.5593,
        address="Ellisbridge, Ahmedabad",
        start_time="17:00",
        end_time="18:30",
        duration_minutes=90,
        travel_time_minutes=12,
        travel_distance_km=3.2,
        transport_mode="Auto",
        estimated_cost=800.0,
        order_index=2,
        rating=4.7,
        why_chosen="Authentic Gujarati handicrafts, brass souvenirs, and mirror work.",
        photo_url="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80"
    )
    act2_4 = Activity(
        itinerary_day_id=day2.id,
        name="Manek Chowk Night Food Market",
        category="Food",
        latitude=23.0238,
        longitude=72.5873,
        address="Old City, Ahmedabad",
        start_time="20:00",
        end_time="21:45",
        duration_minutes=105,
        travel_time_minutes=10,
        travel_distance_km=2.4,
        transport_mode="Auto",
        estimated_cost=650.0,
        order_index=3,
        rating=4.9,
        why_chosen="Iconic culinary landmark with Gwalior dosa, rabdi kulfi, and lively street ambiance.",
        photo_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
    )
    db.add_all([act2_1, act2_2, act2_3, act2_4])

    # Day 3: Science, Lakeside & Farewell
    day3 = ItineraryDay(
        trip_id=trip.id,
        day_number=3,
        date="2026-09-17",
        area_name="Kankaria & Departure",
        theme="Leisure, Lakeside & Return Journey",
        morning_summary="Visit the scenic Kankaria Lake and enjoy lakeside tea.",
        afternoon_summary="Souvenir shopping, hotel check-out, and transit to the airport.",
        evening_summary="Board return flight with unforgettable memories.",
        estimated_distance_km=6.7,
        estimated_travel_time_minutes=30,
        estimated_cost=650.0,
        before_opt_distance_km=10.1,
        before_opt_time_minutes=45,
        is_optimized=True
    )
    db.add(day3)
    db.commit()
    db.refresh(day3)

    act3_1 = Activity(
        itinerary_day_id=day3.id,
        name="Kankaria Lake Promenade",
        category="Nature",
        latitude=22.9978,
        longitude=72.6025,
        address="Kankaria, Ahmedabad",
        start_time="09:00",
        end_time="10:30",
        duration_minutes=90,
        travel_time_minutes=12,
        travel_distance_km=3.1,
        transport_mode="Taxi",
        estimated_cost=40.0,
        order_index=0,
        rating=4.6,
        why_chosen="Relaxed lakeside morning with pleasant views.",
        photo_url="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80"
    )
    act3_2 = Activity(
        itinerary_day_id=day3.id,
        name="Hotel Check-out & Airport Transit",
        category="Transport",
        latitude=23.0725,
        longitude=72.6288,
        address="AMD Airport, Ahmedabad",
        start_time="11:30",
        end_time="12:30",
        duration_minutes=60,
        travel_time_minutes=25,
        travel_distance_km=9.8,
        transport_mode="Taxi",
        estimated_cost=600.0,
        order_index=1,
        rating=4.5,
        why_chosen="Scheduled departure with sufficient security transit buffer.",
        photo_url="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80"
    )
    db.add_all([act3_1, act3_2])

    # Add Welcome Notification
    notif = Notification(
        user_id=user_id,
        trip_id=trip.id,
        title="Ready for Departure! Ahmedabad Trip Initialized",
        message="Your 3-day itinerary has been structured with Google OR-Tools route optimization and booking synchronization.",
        notification_type="tip",
        severity="info"
    )
    db.add(notif)
    db.commit()

    return trip
