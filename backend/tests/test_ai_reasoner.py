from schemas.transaction import (
    ClassificationRequest,
    FailureCode,
    GuardrailDecision,
    GuardrailStatus,
)

from services.recovery_engine import (
    create_recovery_decision,
)

from services import ai_reasoner


# =========================================================
# DETERMINISTIC FALLBACK
# =========================================================

def test_ai_reasoner_returns_deterministic_fallback(
    monkeypatch,
):
    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        False,
    )

    request = ClassificationRequest(
        transaction_id="RX18492",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    decision = create_recovery_decision(
        request
    )

    result = ai_reasoner.generate_reasoning(
        request=request,
        decision=decision,
    )

    assert result.transaction_id == "RX18492"

    assert (
        result.source
        == "deterministic_fallback"
    )

    assert result.ai_used is False
    assert result.fallback_used is True

    assert (
        "bank unavailable"
        in result.diagnosis.lower()
    )

    assert (
        "94%"
        in result.confidence_narrative
    )


# =========================================================
# ALLOWED GUARDRAIL
# =========================================================

def test_ai_reasoner_respects_allowed_guardrail(
    monkeypatch,
):
    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        False,
    )

    request = ClassificationRequest(
        transaction_id="RX18492",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    decision = create_recovery_decision(
        request
    )

    guardrail = GuardrailDecision(
        transaction_id="RX18492",

        proposed_action=(
            decision.action
        ),

        status=(
            GuardrailStatus.ALLOWED
        ),

        can_execute=True,

        retry_count=0,

        max_retries=2,

        confidence=(
            decision.confidence
        ),

        minimum_confidence=0.80,

        violations=[],

        reason=(
            "All deterministic "
            "safety checks passed."
        ),
    )

    result = ai_reasoner.generate_reasoning(
        request=request,
        decision=decision,
        guardrail=guardrail,
    )

    assert (
        "allowed"
        in result.safety_explanation.lower()
    )

    assert (
        "override"
        in result.safety_explanation.lower()
    )


# =========================================================
# BLOCKED GUARDRAIL
# =========================================================

def test_ai_reasoner_does_not_override_blocked_guardrail(
    monkeypatch,
):
    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        False,
    )

    request = ClassificationRequest(
        transaction_id="RX20117",
        amount=68000,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=2,
    )

    decision = create_recovery_decision(
        request
    )

    guardrail = GuardrailDecision(
        transaction_id="RX20117",

        proposed_action=(
            decision.action
        ),

        status=(
            GuardrailStatus.BLOCKED
        ),

        can_execute=False,

        retry_count=2,

        max_retries=2,

        confidence=(
            decision.confidence
        ),

        minimum_confidence=0.80,

        violations=[
            "Maximum retry limit reached.",
        ],

        reason=(
            "Automatic execution blocked."
        ),
    )

    result = ai_reasoner.generate_reasoning(
        request=request,
        decision=decision,
        guardrail=guardrail,
    )

    assert result.ai_used is False

    assert result.fallback_used is True

    assert (
        "did not authorize"
        in result.safety_explanation.lower()
    )

    assert (
        "maximum retry limit reached"
        in result.safety_explanation.lower()
    )


# =========================================================
# VALID AI PROVIDER RESPONSE
# =========================================================

def test_ai_reasoner_uses_valid_provider_response(
    monkeypatch,
):
    request = ClassificationRequest(
        transaction_id="RX18492",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    decision = create_recovery_decision(
        request
    )

    guardrail = GuardrailDecision(
        transaction_id="RX18492",

        proposed_action=(
            decision.action
        ),

        status=(
            GuardrailStatus.ALLOWED
        ),

        can_execute=True,

        retry_count=0,

        max_retries=2,

        confidence=(
            decision.confidence
        ),

        minimum_confidence=0.80,

        violations=[],

        reason="Allowed.",
    )

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        True,
    )

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_PROVIDER",
        "test_provider",
    )

    monkeypatch.setattr(
        ai_reasoner,
        "_call_ai_provider",
        lambda context: {
            "diagnosis": (
                "Temporary issuer-side "
                "availability issue."
            ),

            "recovery_rationale": (
                "A delayed retry "
                "is appropriate."
            ),

            "confidence_narrative": (
                "The classification "
                "confidence is high."
            ),

            "operator_summary": (
                "Retry after the "
                "configured delay."
            ),
        },
    )

    result = (
        ai_reasoner.generate_reasoning(
            request=request,
            decision=decision,
            guardrail=guardrail,
        )
    )

    assert result.ai_used is True

    assert (
        result.fallback_used
        is False
    )

    assert (
        result.source
        == "llm:test_provider"
    )

    assert (
        result.diagnosis
        == (
            "Temporary issuer-side "
            "availability issue."
        )
    )

    # Safety remains deterministic,
    # even when explanation comes from AI.
    assert (
        "deterministic guardrail engine allowed"
        in result.safety_explanation.lower()
    )


# =========================================================
# PROVIDER FAILURE FALLBACK
# =========================================================

def test_ai_provider_failure_uses_fallback(
    monkeypatch,
):
    request = ClassificationRequest(
        transaction_id="RX18492",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    decision = create_recovery_decision(
        request
    )

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        True,
    )

    def failing_provider(context):
        raise TimeoutError(
            "AI provider timed out."
        )

    monkeypatch.setattr(
        ai_reasoner,
        "_call_ai_provider",
        failing_provider,
    )

    result = (
        ai_reasoner.generate_reasoning(
            request=request,
            decision=decision,
        )
    )

    assert result.ai_used is False

    assert (
        result.fallback_used
        is True
    )

    assert (
        result.source
        == "deterministic_fallback"
    )


# =========================================================
# INVALID PROVIDER RESPONSE FALLBACK
# =========================================================

def test_invalid_ai_response_uses_fallback(
    monkeypatch,
):
    request = ClassificationRequest(
        transaction_id="RX18492",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    decision = create_recovery_decision(
        request
    )

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        True,
    )

    monkeypatch.setattr(
        ai_reasoner,
        "_call_ai_provider",
        lambda context: {
            "diagnosis": (
                "Temporary bank issue."
            ),
        },
    )

    result = (
        ai_reasoner.generate_reasoning(
            request=request,
            decision=decision,
        )
    )

    assert result.ai_used is False

    assert (
        result.fallback_used
        is True
    )

    assert (
        result.source
        == "deterministic_fallback"
    )