from fastapi import APIRouter

from schemas.ai import AIReasoningResult
from schemas.transaction import (
    ClassificationRequest,
)

from services.recovery_engine import (
    create_recovery_decision,
)

from services.guardrail_engine import (
    evaluate_guardrails,
)

from services.ai_reasoner import (
    generate_reasoning,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Explanation"],
)


# =========================================================
# AI REASONING
# =========================================================

@router.post(
    "/reasoning",
    response_model=AIReasoningResult,
)
def explain_recovery_decision(
    request: ClassificationRequest,
) -> AIReasoningResult:
    """
    Generate an explanation for a RecoverAI recovery
    decision.

    IMPORTANT:

    This endpoint is explanation-only.

    It does NOT:
    - execute recovery
    - retry a payment
    - call Razorpay
    - create Razorpay orders
    - verify payments
    - modify guardrails
    - bypass retry limits
    - mark a payment successful

    Flow:

        ClassificationRequest
                ↓
        deterministic recovery decision
                ↓
        deterministic guardrails
                ↓
        AI explanation
                ↓
        AIReasoningResult

    If the AI provider fails, RecoverAI automatically
    returns its deterministic fallback explanation.
    """

    # -----------------------------------------------------
    # 1. DETERMINISTIC RECOVERY DECISION
    # -----------------------------------------------------

    recovery = create_recovery_decision(
        request
    )

    # -----------------------------------------------------
    # 2. DETERMINISTIC GUARDRAILS
    # -----------------------------------------------------

    guardrail = evaluate_guardrails(
        request=request,
        recovery=recovery,
    )

    # -----------------------------------------------------
    # 3. EXPLANATION-ONLY AI LAYER
    # -----------------------------------------------------

    reasoning = generate_reasoning(
        request=request,
        decision=recovery,
        guardrail=guardrail,
    )

    return reasoning