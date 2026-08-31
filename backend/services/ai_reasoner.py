from typing import Any

from core import config

from schemas.ai import AIReasoningResult
from schemas.transaction import (
    ClassificationRequest,
    GuardrailDecision,
    RecoveryDecision,
)

from services.groq_provider import (
    generate_groq_reasoning,
)


# =========================================================
# HUMAN-READABLE HELPERS
# =========================================================

def _humanize(value: object) -> str:
    """
    Convert enum/string identifiers such as
    BANK_UNAVAILABLE or DELAYED_RETRY into
    human-readable text.
    """

    raw = getattr(
        value,
        "value",
        value,
    )

    return (
        str(raw)
        .replace("_", " ")
        .strip()
        .lower()
    )


# =========================================================
# DETERMINISTIC DIAGNOSIS
# =========================================================

def _build_diagnosis(
    request: ClassificationRequest,
    decision: RecoveryDecision,
) -> str:
    """
    Build a guaranteed local diagnosis.

    No external AI provider is required.
    """

    failure = _humanize(
        request.failure_code
    )

    category = _humanize(
        decision.category
    )

    return (
        f"The payment failed because of {failure}. "
        f"RecoverAI classified the failure as {category}."
    )


# =========================================================
# DETERMINISTIC RECOVERY RATIONALE
# =========================================================

def _build_recovery_rationale(
    decision: RecoveryDecision,
) -> str:
    """
    Explain the deterministic recovery decision.
    """

    action = _humanize(
        decision.action
    )

    if (
        decision.retry_delay_minutes
        is not None
    ):
        return (
            f"RecoverAI selected {action} with a "
            f"{decision.retry_delay_minutes}-minute delay. "
            f"{decision.reason}"
        )

    return (
        f"RecoverAI selected {action}. "
        f"{decision.reason}"
    )


# =========================================================
# DETERMINISTIC CONFIDENCE NARRATIVE
# =========================================================

def _build_confidence_narrative(
    decision: RecoveryDecision,
) -> str:
    """
    Explain the deterministic classifier confidence.
    """

    percentage = round(
        decision.confidence * 100
    )

    if decision.confidence >= 0.80:
        level = "high"

    elif decision.confidence >= 0.50:
        level = "moderate"

    else:
        level = "low"

    return (
        "The deterministic classifier produced "
        f"{percentage}% confidence, which RecoverAI "
        f"treats as {level} confidence."
    )


# =========================================================
# DETERMINISTIC SAFETY EXPLANATION
# =========================================================

def _build_safety_explanation(
    guardrail: GuardrailDecision | None,
) -> str:
    """
    Explain the real deterministic guardrail state.

    This information never comes from the AI provider.

    AI cannot:
    - authorize execution
    - override a block
    - change retry limits
    - bypass manual review
    - mark a payment successful
    """

    if guardrail is None:
        return (
            "No execution authority is granted by this "
            "explanation. The recovery action must still "
            "pass RecoverAI's deterministic guardrails "
            "before execution."
        )

    if guardrail.can_execute:
        return (
            "The deterministic guardrail engine allowed "
            "the proposed action. This explanation does "
            "not override that decision or authorize any "
            "additional payment action."
        )

    violations = " ".join(
    violation
    .strip()
    .rstrip(".")
    for violation in guardrail.violations
    if violation
    and violation.strip()
)

    if violations:
        return (
            "The deterministic guardrail engine did not "
            "authorize automatic execution. "
            f"Recorded safety conditions: {violations}."
        )

    return (
        "The deterministic guardrail engine did not "
        "authorize automatic execution. AI reasoning "
        "cannot override this result."
    )


# =========================================================
# DETERMINISTIC OPERATOR SUMMARY
# =========================================================

def _build_operator_summary(
    request: ClassificationRequest,
    decision: RecoveryDecision,
    guardrail: GuardrailDecision | None,
) -> str:
    """
    Build a concise local summary for operators.
    """

    failure = _humanize(
        request.failure_code
    )

    action = _humanize(
        decision.action
    )

    if guardrail is None:
        safety_state = (
            "pending guardrail evaluation"
        )

    else:
        safety_state = _humanize(
            guardrail.status
        )

    return (
        f"Transaction {request.transaction_id}: "
        f"{failure}; recommended action is {action}; "
        f"safety state is {safety_state}."
    )


# =========================================================
# DETERMINISTIC FALLBACK
# =========================================================

def generate_deterministic_reasoning(
    request: ClassificationRequest,
    decision: RecoveryDecision,
    guardrail: GuardrailDecision | None = None,
) -> AIReasoningResult:
    """
    Guaranteed RecoverAI explanation fallback.

    This function performs:
    - no external AI call
    - no Razorpay call
    - no database mutation
    - no payment execution

    It remains available even if GroqCloud:
    - is disabled
    - times out
    - is unavailable
    - returns invalid output
    - is misconfigured
    """

    return AIReasoningResult(
        transaction_id=(
            request.transaction_id
        ),

        diagnosis=(
            _build_diagnosis(
                request,
                decision,
            )
        ),

        recovery_rationale=(
            _build_recovery_rationale(
                decision
            )
        ),

        confidence_narrative=(
            _build_confidence_narrative(
                decision
            )
        ),

        safety_explanation=(
            _build_safety_explanation(
                guardrail
            )
        ),

        operator_summary=(
            _build_operator_summary(
                request,
                decision,
                guardrail,
            )
        ),

        source=(
            "deterministic_fallback"
        ),

        ai_used=False,

        fallback_used=True,
    )


# =========================================================
# READ-ONLY PROVIDER CONTEXT
# =========================================================

def _build_provider_context(
    request: ClassificationRequest,
    decision: RecoveryDecision,
    guardrail: GuardrailDecision | None,
) -> dict[str, Any]:
    """
    Build read-only facts for the AI provider.

    All recovery and safety decisions have already
    been made by deterministic RecoverAI services.

    GroqCloud receives these values for explanation only.
    """

    return {
        "transaction_id":
            request.transaction_id,

        "amount":
    request.amount,

"currency":
    "INR",

"amount_unit":
    "rupees",

"amount_display":
    f"₹{request.amount:,.2f}",

        "failure_code":
            request.failure_code.value,

        "retry_count":
            request.retry_count,

        "category":
            decision.category,

        "recommended_action":
            decision.action,

        "recovery_status":
            decision.status.value,

        "retryable":
            decision.retryable,

        "retry_delay_minutes":
            decision.retry_delay_minutes,

        "confidence":
            decision.confidence,

        "deterministic_reason":
            decision.reason,

        "guardrail_status": (
            guardrail.status.value
            if guardrail
            else None
        ),

        "can_execute": (
            guardrail.can_execute
            if guardrail
            else None
        ),

        "guardrail_violations": (
            guardrail.violations
            if guardrail
            else []
        ),
    }


# =========================================================
# PROVIDER DISPATCH
# =========================================================

def _call_ai_provider(
    context: dict[str, Any],
) -> dict[str, str]:
    """
    Dispatch explanation generation to the
    configured AI provider.

    Providers return explanation text only.
    """

    provider = (
        config.AI_PROVIDER
        .strip()
        .lower()
    )

    if provider == "groqcloud":
        return generate_groq_reasoning(
            context
        )

    raise RuntimeError(
        f"Unsupported AI provider: {provider}"
    )


# =========================================================
# PROVIDER OUTPUT VALIDATION
# =========================================================

def _validate_provider_response(
    result: dict[str, str],
) -> None:
    """
    Validate AI provider explanation output.

    Safety or execution fields are intentionally
    not accepted.
    """

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI provider response must "
            "be a dictionary."
        )

    required_fields = {
        "diagnosis",
        "recovery_rationale",
        "confidence_narrative",
        "operator_summary",
    }

    missing = (
        required_fields
        - result.keys()
    )

    if missing:
        raise ValueError(
            "AI provider response is missing: "
            + ", ".join(
                sorted(missing)
            )
        )

    for field in required_fields:

        value = result[
            field
        ]

        if (
            not isinstance(value, str)
            or not value.strip()
        ):
            raise ValueError(
                "AI provider returned an invalid "
                f"value for {field}."
            )


# =========================================================
# PUBLIC AI REASONING INTERFACE
# =========================================================

def generate_reasoning(
    request: ClassificationRequest,
    decision: RecoveryDecision,
    guardrail: GuardrailDecision | None = None,
) -> AIReasoningResult:
    """
    Public RecoverAI explanation interface.

    Flow:

        Deterministic decision
                ↓
        Build safe fallback
                ↓
           AI enabled?
           ↓        ↓
          NO       YES
           ↓        ↓
        fallback  GroqCloud
                    ↓
              valid response?
                ↓       ↓
               NO      YES
                ↓       ↓
             fallback  AI explanation

    Financial execution never depends on this
    function succeeding.
    """

    # -----------------------------------------------------
    # ALWAYS PREPARE SAFE FALLBACK FIRST
    # -----------------------------------------------------

    fallback = (
        generate_deterministic_reasoning(
            request=request,
            decision=decision,
            guardrail=guardrail,
        )
    )

    # -----------------------------------------------------
    # AI DISABLED
    # -----------------------------------------------------

    if not config.AI_ENABLED:
        return fallback

    # -----------------------------------------------------
    # OPTIONAL AI EXPLANATION
    # -----------------------------------------------------

    try:

        context = (
            _build_provider_context(
                request,
                decision,
                guardrail,
            )
        )

        provider_result = (
            _call_ai_provider(
                context
            )
        )

        _validate_provider_response(
            provider_result
        )

        # -------------------------------------------------
        # AI-ENHANCED EXPLANATION
        # -------------------------------------------------

        return AIReasoningResult(
            transaction_id=(
                request.transaction_id
            ),

            diagnosis=(
                provider_result[
                    "diagnosis"
                ].strip()
            ),

            recovery_rationale=(
                provider_result[
                    "recovery_rationale"
                ].strip()
            ),

            confidence_narrative=(
                provider_result[
                    "confidence_narrative"
                ].strip()
            ),

            # ---------------------------------------------
            # SAFETY ALWAYS COMES FROM DETERMINISTIC CORE
            # ---------------------------------------------

            safety_explanation=(
                _build_safety_explanation(
                    guardrail
                )
            ),

            operator_summary=(
                provider_result[
                    "operator_summary"
                ].strip()
            ),

            source=(
                f"llm:{config.AI_PROVIDER}"
            ),

            ai_used=True,

            fallback_used=False,
        )

    # -----------------------------------------------------
    # PROVIDER FAILURE → SAFE FALLBACK
    # -----------------------------------------------------

    except Exception:
        return fallback