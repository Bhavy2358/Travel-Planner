import json
import math
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import KnowledgeDocument
from app.schemas.chat import RAGQueryResponse, RAGSourceDoc
from app.services.seed_service import compute_mock_embedding

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return round(dot / (mag1 * mag2), 4)

class RAGKnowledgeService:
    """
    RAG Vector Knowledge Base Service.
    Answers tourist queries on culture, safety, best seasons, food, and local transit.
    """

    @classmethod
    def query_knowledge_base(cls, db: Session, destination: str, query: str, category: Optional[str] = None) -> RAGQueryResponse:
        dest_norm = destination.strip().lower()
        
        # Query docs matching destination
        docs = db.query(KnowledgeDocument).all()
        # Match destination loosely or retrieve all if few
        matched_docs = [d for d in docs if dest_norm in d.destination.lower()]
        if not matched_docs:
            matched_docs = docs

        query_emb = compute_mock_embedding(query)
        
        scored_docs = []
        for doc in matched_docs:
            doc_emb = json.loads(doc.embedding_json) if doc.embedding_json else compute_mock_embedding(doc.title + " " + doc.content)
            sim = cosine_similarity(query_emb, doc_emb)
            
            # Boost keyword matches in title/tags
            q_words = query.lower().split()
            for w in q_words:
                if len(w) > 3 and (w in doc.title.lower() or w in doc.tags.lower()):
                    sim = min(1.0, sim + 0.25)

            scored_docs.append((sim, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_docs[:3]

        sources: List[RAGSourceDoc] = []
        context_texts = []
        for score, doc in top_matches:
            snippet = doc.content if len(doc.content) < 220 else doc.content[:220] + "..."
            sources.append(RAGSourceDoc(
                title=doc.title,
                category=doc.category,
                snippet=snippet,
                relevance_score=score
            ))
            context_texts.append(doc.content)

        # Synthesize answer
        if top_matches and top_matches[0][0] > 0.15:
            best_doc = top_matches[0][1]
            answer = f"Based on curated travel insights for {destination}:\n\n{best_doc.content}"
            if len(top_matches) > 1 and top_matches[1][0] > 0.2:
                answer += f"\n\nAdditional Tip: {top_matches[1][1].content[:160]}..."
        else:
            answer = f"{destination} is a magnificent destination known for its vibrant heritage and warm hospitality. Key recommendations include exploring historic monuments in the morning, savoring local cuisine during dinner, and using app-based cabs or auto-rickshaws for convenient transit."

        return RAGQueryResponse(
            query=query,
            answer=answer,
            destination=destination,
            sources=sources
        )
