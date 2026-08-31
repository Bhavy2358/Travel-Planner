from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str

class ChatRequest(BaseModel):
    trip_id: Optional[int] = None
    messages: List[ChatMessage]
    context: Optional[Dict[str, Any]] = None

class ChatAction(BaseModel):
    action_type: str # "modify_itinerary", "show_map", "resolve_conflict", "explain_choice", "show_budget"
    payload: Dict[str, Any]

class ChatResponse(BaseModel):
    message: str
    suggested_actions: Optional[List[str]] = []
    executed_action: Optional[ChatAction] = None

class RAGQueryRequest(BaseModel):
    destination: str
    query: str
    category: Optional[str] = None

class RAGSourceDoc(BaseModel):
    title: str
    category: str
    snippet: str
    relevance_score: float

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    destination: str
    sources: List[RAGSourceDoc]
