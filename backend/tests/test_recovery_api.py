from fastapi.testclient import TestClient

from main import app

from services.recovery_executor import (
    AUDIT_STORE,
    IDEMPOTENCY_RESULT_STORE,
    IDEMPOTENCY_STATE,
)


client = TestClient(app)


# =========================================================
# TEST ISOLATION
# =========================================================

def setup_function():
    """
    Reset temporary in-memory state before each API test.
    """

    AUDIT_STORE.clear()
    IDEMPOTENCY_RESULT_STORE.clear()
    IDEMPOTENCY_STATE.clear()


# =========================================================
# TEST 1 — SUCCESSFUL EXECUTION API
# =========================================================

def test_execute_successful_recovery():
    payload = {
        "transaction_id": "RX18492",
        "amount": 7499,
        "failure_code": "BANK_UNAVAILABLE",
        "retry_count": 0,
    }

    response = client.post(
        "/api/recovery/execute",
        json=payload,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["transaction_id"] == "RX18492"
    assert data["guardrail_status"] == "ALLOWED"
    assert data["can_execute"] is True

    assert data["execution_status"] == "RECOVERED"
    assert data["recovered_amount"] == 7499

    assert data["execution_mode"] == "SIMULATION"

    steps = [
        event["step"]
        for event in data["audit_trail"]
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
        "EXECUTE",
        "VERIFY",
    ]


# =========================================================
# TEST 2 — AUDIT API
# =========================================================

def test_audit_api_returns_real_execution_events():
    payload = {
        "transaction_id": "RX-AUDIT-001",
        "amount": 7499,
        "failure_code": "BANK_UNAVAILABLE",
        "retry_count": 0,
    }

    execute_response = client.post(
        "/api/recovery/execute",
        json=payload,
    )

    assert execute_response.status_code == 200

    audit_response = client.get(
        "/api/recovery/audit/RX-AUDIT-001"
    )

    assert audit_response.status_code == 200

    audit = audit_response.json()

    steps = [
        event["step"]
        for event in audit
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
        "EXECUTE",
        "VERIFY",
    ]


# =========================================================
# TEST 3 — BLOCKED EXECUTION API
# =========================================================

def test_blocked_recovery_never_executes():
    payload = {
        "transaction_id": "RX20117",
        "amount": 68000,
        "failure_code": "BANK_UNAVAILABLE",
        "retry_count": 2,
    }

    response = client.post(
        "/api/recovery/execute",
        json=payload,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["guardrail_status"] == "BLOCKED"
    assert data["can_execute"] is False

    assert data["execution_status"] == "BLOCKED"
    assert data["recovered_amount"] == 0

    steps = [
        event["step"]
        for event in data["audit_trail"]
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
    ]

    assert "EXECUTE" not in steps
    assert "VERIFY" not in steps


# =========================================================
# TEST 4 — API IDEMPOTENCY
# =========================================================

def test_duplicate_api_request_is_idempotent():
    payload = {
        "transaction_id": "RX-API-IDEMPOTENT-001",
        "amount": 7499,
        "failure_code": "BANK_UNAVAILABLE",
        "retry_count": 0,
    }

    first = client.post(
        "/api/recovery/execute",
        json=payload,
    )

    second = client.post(
        "/api/recovery/execute",
        json=payload,
    )

    assert first.status_code == 200
    assert second.status_code == 200

    assert first.json() == second.json()

    audit_response = client.get(
        "/api/recovery/audit/RX-API-IDEMPOTENT-001"
    )

    assert audit_response.status_code == 200

    audit = audit_response.json()

    # The second identical request must not create
    # another recovery workflow.
    assert len(audit) == 6

    assert [
        event["step"]
        for event in audit
    ] == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
        "EXECUTE",
        "VERIFY",
    ]


# =========================================================
# TEST 5 — HIGH VALUE REVIEW
# =========================================================

def test_high_value_transaction_requires_review():
    payload = {
        "transaction_id": "RX-API-HIGHVALUE-001",
        "amount": 68000,
        "failure_code": "BANK_UNAVAILABLE",
        "retry_count": 0,
    }

    response = client.post(
        "/api/recovery/execute",
        json=payload,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["guardrail_status"] == "REVIEW_REQUIRED"
    assert data["can_execute"] is False

    assert data["execution_status"] == "REVIEW_REQUIRED"
    assert data["recovered_amount"] == 0

    steps = [
        event["step"]
        for event in data["audit_trail"]
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
    ]


# =========================================================
# TEST 6 — INPUT VALIDATION
# =========================================================

def test_invalid_amount_is_rejected():
    payload = {
        "transaction_id": "RX-INVALID-001",
        "amount": 0,
        "failure_code": "BANK_UNAVAILABLE",
        "retry_count": 0,
    }

    response = client.post(
        "/api/recovery/execute",
        json=payload,
    )

    # ClassificationRequest requires amount > 0.
    assert response.status_code == 422