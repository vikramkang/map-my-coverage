import json
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..schemas import (
    QuestionnaireOut,
    QuestionnaireAnswersUpdate,
    QuestionnaireWithAnswers,
)
from ..deps import get_current_user
from ..services import risk_engine

router = APIRouter(prefix="/questionnaires", tags=["questionnaires"])


@router.post("/", response_model=QuestionnaireOut)
def create_questionnaire(
        db: Session = Depends(get_db),
        current_user: models.user.User = Depends(get_current_user),
):
    """
    Create a new questionnaire for the logged-in user.
    """
    q = models.questionnaire.Questionnaire(
        user_id=current_user.id,
        status="in_progress",
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.put("/{questionnaire_id}/answers", response_model=QuestionnaireWithAnswers)
def update_questionnaire_answers(
        questionnaire_id: str,
        payload: QuestionnaireAnswersUpdate,
        db: Session = Depends(get_db),
        current_user: models.user.User = Depends(get_current_user),
):
    """
    Upsert answers for this questionnaire.
    """
    q = (
        db.query(models.questionnaire.Questionnaire)
        .filter(
            models.questionnaire.Questionnaire.id == questionnaire_id,
            models.questionnaire.Questionnaire.user_id == current_user.id,
        )
        .first()
    )
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Questionnaire not found")

    # Load existing answers into a dict
    existing: Dict[str, models.questionnaire.QuestionnaireAnswer] = {
        ans.question_key: ans for ans in q.answers
    }

    for key, value in payload.answers.items():
        value_str = json.dumps(value)  # store as JSON string for now

        if key in existing:
            existing[key].answer_json = value_str
        else:
            ans = models.questionnaire.QuestionnaireAnswer(
                questionnaire_id=q.id,
                question_key=key,
                answer_json=value_str,
            )
            db.add(ans)

    db.commit()
    db.refresh(q)

    # Build answers dict to return
    answers_dict: Dict[str, Any] = {}
    for ans in q.answers:
        try:
            answers_dict[ans.question_key] = json.loads(ans.answer_json)
        except json.JSONDecodeError:
            answers_dict[ans.question_key] = ans.answer_json

    return QuestionnaireWithAnswers(
        id=q.id,
        status=q.status,
        answers=answers_dict,
    )


@router.get("/{questionnaire_id}", response_model=QuestionnaireWithAnswers)
def get_questionnaire(
        questionnaire_id: str,
        db: Session = Depends(get_db),
        current_user: models.user.User = Depends(get_current_user),
):
    q = (
        db.query(models.questionnaire.Questionnaire)
        .filter(
            models.questionnaire.Questionnaire.id == questionnaire_id,
            models.questionnaire.Questionnaire.user_id == current_user.id,
        )
        .first()
    )
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Questionnaire not found")

    answers_dict: Dict[str, Any] = {}
    for ans in q.answers:
        try:
            answers_dict[ans.question_key] = json.loads(ans.answer_json)
        except json.JSONDecodeError:
            answers_dict[ans.question_key] = ans.answer_json

    return QuestionnaireWithAnswers(
        id=q.id,
        status=q.status,
        answers=answers_dict,
    )


@router.post("/{questionnaire_id}/complete")
def complete_questionnaire(
        questionnaire_id: str,
        db: Session = Depends(get_db),
        current_user: models.user.User = Depends(get_current_user),
):
    """
    Mark questionnaire as completed, run risk engine, and return a report.
    """
    q = (
        db.query(models.questionnaire.Questionnaire)
        .filter(
            models.questionnaire.Questionnaire.id == questionnaire_id,
            models.questionnaire.Questionnaire.user_id == current_user.id,
        )
        .first()
    )
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Questionnaire not found")

    # Build context from answers
    context: Dict[str, Any] = {}
    for ans in q.answers:
        try:
            value = json.loads(ans.answer_json)
        except json.JSONDecodeError:
            value = ans.answer_json
        context[ans.question_key] = value

    # Run risk engine
    result = risk_engine.evaluate(context)

    # Mark as completed
    q.status = "completed"
    db.commit()
    db.refresh(q)

    # Build simple report payload
    report = {
        "questionnaire_id": q.id,
        "status": q.status,
        "context": context,
        "assessment": result,
    }

    return report
