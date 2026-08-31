from pydantic import BaseModel, Field


class AIReasoningResult(BaseModel):
    """
    Human-readable reasoning generated for operators.

    This model contains explanation only.
    It must never control payment execution,
    guardrails, verification, or recovery state.
    """

    transaction_id: str

    diagnosis: str

    recovery_rationale: str

    confidence_narrative: str

    safety_explanation: str

    operator_summary: str

    source: str = Field(
        description=(
            "Explanation source, for example "
            "'deterministic_fallback' or 'llm'."
        )
    )

    ai_used: bool

    fallback_used: bool