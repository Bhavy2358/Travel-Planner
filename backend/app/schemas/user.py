from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    preferred_travel_style: Optional[str] = "Balanced"
    budget_preference: Optional[str] = "Standard"
    favorite_activities: Optional[str] = "Culture, Food, History"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    preferred_travel_style: Optional[str] = "Balanced"
    budget_preference: Optional[str] = "Standard"
    favorite_activities: Optional[str] = "Culture, Food, History"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_travel_style: Optional[str] = None
    budget_preference: Optional[str] = None
    favorite_activities: Optional[str] = None

class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
