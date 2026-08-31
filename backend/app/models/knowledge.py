from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="guide") # guide, safety, food, transport, culture, weather
    content = Column(Text, nullable=False)
    tags = Column(String(255), default="")
    embedding_json = Column(Text, nullable=True) # Serialized vector embedding for semantic search
