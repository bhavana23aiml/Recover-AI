from fastapi.testclient import TestClient
import pytest

from core.auth import get_current_user
from main import app


# =========================================================
# UNAUTHENTICATED TEST CLIENT
# =========================================================
#
# These tests intentionally do NOT override authentication.
#
# No Authorization header is sent.
#
# Therefore protected RecoverAI endpoints must return 401.
#
# =========================================================

@pytest.fixture
def anonymous_client():
    existing_overrides = (
        app.dependency_overrides.copy()
    )

    # Make absolutely sure another test module has not
    # left a test-user override active.
    app.dependency_overrides.pop(
        get_current_user,
        None,
    )

    try:
        with TestClient(app) as client:
            yield client

    finally:
        app.dependency_overrides.clear()

        app.dependency_overrides.update(
            existing_overrides
        )


# =========================================================
# PUBLIC HEALTH ENDPOINT
# =========================================================

def test_health_remains_public(
    anonymous_client: TestClient,
):
    response = anonymous_client.get(
        "/health"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "ok"


# =========================================================
# DASHBOARD REQUIRES AUTH
# =========================================================

def test_dashboard_requires_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.get(
        "/api/dashboard"
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# RECOVERY EXECUTION REQUIRES AUTH
# =========================================================

def test_recovery_execution_requires_authentication(
    anonymous_client: TestClient,
):
    payload = {
        "transaction_id":
            "RX-AUTH-EXECUTE-001",

        "amount":
            7499,

        "failure_code":
            "BANK_UNAVAILABLE",

        "retry_count":
            0,
    }

    response = anonymous_client.post(
        "/api/recovery/execute",
        json=payload,
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# AUDIT TRAIL REQUIRES AUTH
# =========================================================

def test_recovery_audit_requires_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.get(
        "/api/recovery/audit/RX18492"
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# AI REASONING REQUIRES AUTH
# =========================================================

def test_ai_reasoning_requires_authentication(
    anonymous_client: TestClient,
):
    payload = {
        "transaction_id":
            "RX-AUTH-AI-001",

        "amount":
            7499,

        "failure_code":
            "BANK_UNAVAILABLE",

        "retry_count":
            0,
    }

    response = anonymous_client.post(
        "/api/ai/reasoning",
        json=payload,
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# CLASSIFICATION REQUIRES AUTH
# =========================================================

def test_classification_requires_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.post(
        "/api/classify-failure",
        json={
            "transaction_id":
                "RX-AUTH-CLASSIFY-001",

            "amount":
                7499,

            "failure_code":
                "BANK_UNAVAILABLE",

            "retry_count":
                0,
        },
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# RECOVERY DECISION REQUIRES AUTH
# =========================================================

def test_recovery_decision_requires_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.post(
        "/api/recovery/decide",
        json={
            "transaction_id":
                "RX-AUTH-DECIDE-001",

            "amount":
                7499,

            "failure_code":
                "BANK_UNAVAILABLE",

            "retry_count":
                0,
        },
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# GUARDRAILS REQUIRE AUTH
# =========================================================

def test_guardrails_require_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.post(
        "/api/recovery/guardrails",
        json={
            "transaction_id":
                "RX-AUTH-GUARDRAIL-001",

            "amount":
                7499,

            "failure_code":
                "BANK_UNAVAILABLE",

            "retry_count":
                0,
        },
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# RAZORPAY RECOVERY ORDER REQUIRES AUTH
# =========================================================
#
# This endpoint is called by the RecoverAI browser.
#
# An anonymous user must not be able to create or reuse
# a Razorpay recovery order.
#
# =========================================================

def test_razorpay_recovery_order_requires_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.post(
        "/api/razorpay/recovery-order",
        json={
            "recovery_job_id":
                "11111111-1111-1111-1111-111111111111",
        },
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# RAZORPAY PAYMENT VERIFICATION REQUIRES AUTH
# =========================================================
#
# Checkout values alone must never authorize access to
# RecoverAI's verification endpoint.
#
# The RecoverAI user must also be authenticated.
#
# =========================================================

def test_razorpay_verify_payment_requires_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.post(
        "/api/razorpay/verify-payment",
        json={
            "recovery_job_id":
                "11111111-1111-1111-1111-111111111111",

            "razorpay_order_id":
                "order_auth_test",

            "razorpay_payment_id":
                "pay_auth_test",

            "razorpay_signature":
                "signature_auth_test",
        },
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }


# =========================================================
# RAZORPAY RECONCILIATION REQUIRES AUTH
# =========================================================
#
# The browser may request reconciliation using only a
# recovery_job_id, but the RecoverAI user must first have
# a valid authenticated Supabase session.
#
# =========================================================

def test_razorpay_reconcile_payment_requires_authentication(
    anonymous_client: TestClient,
):
    response = anonymous_client.post(
        "/api/razorpay/reconcile-payment",
        json={
            "recovery_job_id":
                "11111111-1111-1111-1111-111111111111",
        },
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail":
            "Authentication required."
    }