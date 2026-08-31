from fastapi.testclient import TestClient

from main import app

from services import ai_reasoner


client = TestClient(app)


# =========================================================
# ALLOWED TRANSACTION
# =========================================================

def test_ai_reasoning_api_allowed_transaction(
    monkeypatch,
):
    """
    A normal retryable transaction should reach the
    explanation layer while keeping safety authority
    deterministic.
    """

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        True,
    )

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_PROVIDER",
        "groqcloud",
    )

    monkeypatch.setattr(
        ai_reasoner,
        "_call_ai_provider",
        lambda context: {
            "diagnosis": (
                "The payment was classified as a "
                "transient bank failure."
            ),

            "recovery_rationale": (
                "RecoverAI proposes a delayed retry "
                "after the configured delay."
            ),

            "confidence_narrative": (
                "The confidence score represents "
                "high confidence."
            ),

            "operator_summary": (
                "The deterministic guardrails permit "
                "the proposed recovery action."
            ),
        },
    )

    response = client.post(
        "/api/ai/reasoning",
        json={
            "transaction_id": "RX18492",
            "amount": 7499,
            "failure_code": "BANK_UNAVAILABLE",
            "retry_count": 0,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["transaction_id"]
        == "RX18492"
    )

    assert (
        data["source"]
        == "llm:groqcloud"
    )

    assert data["ai_used"] is True

    assert (
        data["fallback_used"]
        is False
    )

    assert (
        "deterministic guardrail engine allowed"
        in data["safety_explanation"].lower()
    )


# =========================================================
# BLOCKED TRANSACTION
# =========================================================

def test_ai_reasoning_api_preserves_blocked_guardrail(
    monkeypatch,
):
    """
    AI may explain a blocked recovery strategy but must
    never change or override the deterministic guardrail.
    """

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        True,
    )

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_PROVIDER",
        "groqcloud",
    )

    monkeypatch.setattr(
        ai_reasoner,
        "_call_ai_provider",
        lambda context: {
            "diagnosis": (
                "The payment was classified as a "
                "transient bank failure."
            ),

            "recovery_rationale": (
                "RecoverAI proposes a delayed retry. "
                "Automatic execution is blocked because "
                "the retry limit has been reached."
            ),

            "confidence_narrative": (
                "The deterministic confidence score "
                "represents high confidence."
            ),

            "operator_summary": (
                "Automatic execution is blocked. "
                "The delayed retry remains proposed."
            ),
        },
    )

    response = client.post(
        "/api/ai/reasoning",
        json={
            "transaction_id": "RX20117",
            "amount": 68000,
            "failure_code": "BANK_UNAVAILABLE",
            "retry_count": 2,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["transaction_id"]
        == "RX20117"
    )

    assert data["ai_used"] is True

    assert (
        data["fallback_used"]
        is False
    )

    assert (
        data["source"]
        == "llm:groqcloud"
    )

    safety = (
        data["safety_explanation"]
        .lower()
    )

    assert (
        "did not authorize automatic execution"
        in safety
    )

    assert (
        "maximum retry limit of 2"
        in safety
    )

    combined_text = " ".join(
        [
            data["diagnosis"],
            data["recovery_rationale"],
            data["operator_summary"],
        ]
    ).lower()

    assert (
        "automatic execution is blocked"
        in combined_text
    )

    assert (
        "will execute"
        not in combined_text
    )

    assert (
        "will retry"
        not in combined_text
    )


# =========================================================
# PROVIDER FAILURE
# =========================================================

def test_ai_reasoning_api_uses_fallback_when_provider_fails(
    monkeypatch,
):
    """
    GroqCloud failure must never cause the RecoverAI
    explanation endpoint to fail.

    RecoverAI must return its deterministic fallback.
    """

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_ENABLED",
        True,
    )

    monkeypatch.setattr(
        ai_reasoner.config,
        "AI_PROVIDER",
        "groqcloud",
    )

    def failing_provider(
        context,
    ):
        raise TimeoutError(
            "Provider timeout."
        )

    monkeypatch.setattr(
        ai_reasoner,
        "_call_ai_provider",
        failing_provider,
    )

    response = client.post(
        "/api/ai/reasoning",
        json={
            "transaction_id": "RX18492",
            "amount": 7499,
            "failure_code": "BANK_UNAVAILABLE",
            "retry_count": 0,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["source"]
        == "deterministic_fallback"
    )

    assert (
        data["ai_used"]
        is False
    )

    assert (
        data["fallback_used"]
        is True
    )

    assert (
        data["transaction_id"]
        == "RX18492"
    )


# =========================================================
# INPUT VALIDATION
# =========================================================

def test_ai_reasoning_api_rejects_invalid_failure_code():
    """
    Invalid transaction input must fail before reaching
    the AI provider.
    """

    response = client.post(
        "/api/ai/reasoning",
        json={
            "transaction_id": "INVALID001",
            "amount": 1000,
            "failure_code": "FAKE_FAILURE_CODE",
            "retry_count": 0,
        },
    )

    assert response.status_code == 422