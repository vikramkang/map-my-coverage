from datetime import datetime
import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..db import Base


class Questionnaire(Base):
    __tablename__ = "questionnaires"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="in_progress")  # in_progress / completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="questionnaires")
    answers = relationship("QuestionnaireAnswer", back_populates="questionnaire")


class QuestionnaireAnswer(Base):
    __tablename__ = "questionnaire_answers"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    questionnaire_id = Column(String, ForeignKey("questionnaires.id"), nullable=False)
    question_key = Column(String, nullable=False)  # e.g. "age", "income"
    answer_json = Column(String, nullable=False)   # later you can switch to JSON

    questionnaire = relationship("Questionnaire", back_populates="answers")
