from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import RAGKnowledgeService

router = APIRouter(prefix="/rag", tags=["RAG Knowledge Base"])

@router.post("/query", response_model=RAGQueryResponse)
def query_destination_knowledge(request: RAGQueryRequest, db: Session = Depends(get_db)):
    return RAGKnowledgeService.query_knowledge_base(
        db=db,
        destination=request.destination,
        query=request.query,
        category=request.category
    )
