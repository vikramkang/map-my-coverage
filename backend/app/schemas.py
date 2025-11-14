from typing import Any, Dict

from pydantic import BaseModel, EmailStr


# --- existing auth stuff --- #

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr

    class Config:
        from_attributes = True  # pydantic v2


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- questionnaire schemas --- #

class QuestionnaireOut(BaseModel):
    id: str
    status: str

    class Config:
        from_attributes = True


class QuestionnaireAnswersUpdate(BaseModel):
    answers: Dict[str, Any]
    # e.g. { "age": 32, "income": 90000, "province": "ON" }


class QuestionnaireWithAnswers(BaseModel):
    id: str
    status: str
    answers: Dict[str, Any]

    class Config:
        from_attributes = True
