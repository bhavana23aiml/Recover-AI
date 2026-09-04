from fastapi import (
    APIRouter,
    Depends,
)

from core.auth import (
    AuthenticatedUser,
    get_current_user,
)

from schemas.ai import (
    AIReasoningResult,
)

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
#
# AUTHENTICATED ENDPOINT
#
# Requires:
#
# Authorization: Bearer <Supabase access token>
#
# IMPORTANT:
#
# Authentication controls access to this endpoint.
#
# It does NOT change AI authority.
#
# AI remains explanation-only.
#
# =========================================================

@router.post(
    "/reasoning",
    response_model=AIReasoningResult,
)
def explain_recovery_decision(
    request: ClassificationRequest,

    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
) -> AIReasoningResult:
    """
    Generate an explanation for an existing deterministic
    RecoverAI recovery decision.

    Authentication:
        A valid Supabase authenticated user is required.

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
    - mark revenue recovered

    Flow:

        authenticated user
                ↓
        ClassificationRequest
                ↓
        deterministic recovery decision
                ↓
        deterministic guardrails
                ↓
        AI explanation
                ↓
        AIReasoningResult

    If the AI provider fails, RecoverAI returns the
    deterministic fallback explanation.
    """

    # =====================================================
    # 1. DETERMINISTIC RECOVERY DECISION
    # =====================================================

    recovery = create_recovery_decision(
        request
    )


    # =====================================================
    # 2. DETERMINISTIC GUARDRAILS
    # =====================================================

    guardrail = evaluate_guardrails(
        request=request,
        recovery=recovery,
    )


    # =====================================================
    # 3. EXPLANATION-ONLY AI
    # =====================================================

    reasoning = generate_reasoning(
        request=request,
        decision=recovery,
        guardrail=guardrail,
    )


    return reasoning