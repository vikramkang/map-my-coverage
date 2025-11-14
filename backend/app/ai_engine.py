# backend/app/ai_engine.py
import os
from typing import Any, Dict, List

try:
    from openai import OpenAI  # type: ignore
except ImportError:
    OpenAI = None  # type: ignore


def _build_prompt(context: Dict[str, Any], assessment: Dict[str, Any]) -> str:
    """
    Turn questionnaire answers + rule-based assessment into a prompt
    for the AI model.
    """
    lines: List[str] = []

    lines.append(
        "You are an insurance assistant helping a Canadian consumer "
        "understand their insurance coverage situation. "
        "Be clear, neutral and educational. "
        "Do NOT give legal or tax advice, and do not recommend specific "
        "company products. Focus on concepts and what they should discuss "
        "with a licensed advisor."
    )

    lines.append("\nUser profile (raw answers):")
    for k, v in context.items():
        lines.append(f"- {k}: {v}")

    lines.append("\nRule-based assessment (JSON):")
    lines.append(str(assessment))

    lines.append(
        "\nBased on this, write:\n"
        "1) A short 3–5 sentence overview of their situation.\n"
        "2) 3–5 bullet points with concrete next steps or questions to ask "
        "an insurance advisor.\n"
        "Keep total length under 250 words."
    )

    return "\n".join(lines)


def generate_ai_advice(
    context: Dict[str, Any],
    assessment: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Call the AI model and return structured advice.

    If OPENAI_API_KEY is not set or the openai library is missing,
    we return a static fallback so the endpoint still works.
    """
    prompt = _build_prompt(context, assessment)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or OpenAI is None:
        # Safe fallback – no external call
        return {
            "summary": (
                "Based on your answers, review your life, home/tenant, auto, "
                "and travel insurance with a licensed advisor. Make sure your "
                "coverage limits match your income, debts, and family "
                "situation, and that your liability limits are high enough."
            ),
            "bullets": [
                "Confirm your life insurance is enough to cover debts and support dependants.",
                "Check your home or tenant policy limits for contents and liability.",
                "Verify your auto liability limit (often $2M is recommended in Ontario).",
                "If you travel outside Canada, review emergency medical coverage.",
            ],
        }

    # Real call to OpenAI
    client = OpenAI(api_key=api_key)

    completion = client.chat.completions.create(
        model="gpt-4o-mini",  # or gpt-5-mini etc, depending on your account
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful Canadian insurance explainer. "
                    "You ONLY provide general education and suggest topics "
                    "to discuss with a licensed advisor."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        max_tokens=400,
        temperature=0.4,
    )

    text = completion.choices[0].message.content or ""
    # Simple splitting: first paragraph vs bullets
    parts = [p.strip() for p in text.split("\n") if p.strip()]

    summary_lines: List[str] = []
    bullet_lines: List[str] = []

    in_bullets = False
    for line in parts:
        if line.startswith("-") or line.startswith("•"):
            in_bullets = True
        if in_bullets:
            bullet_lines.append(line.lstrip("-• ").strip())
        else:
            summary_lines.append(line)

    summary = " ".join(summary_lines).strip()
    if not summary:
        summary = text.strip()

    return {
        "summary": summary,
        "bullets": bullet_lines,
    }
