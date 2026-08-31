from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import ChatRequest, ChatResponse
from app.api.auth import get_current_user
from app.services.chat_service import ChatbotService

router = APIRouter(prefix="/chat", tags=["Chatbot Assistant"])

@router.post("", response_model=ChatResponse)
def chat_with_assistant(request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ChatbotService.handle_chat(
        db=db,
        request=request,
        current_user_id=current_user.id if current_user else None
    )
