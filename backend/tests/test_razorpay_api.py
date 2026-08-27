from __future__ import annotations

from fastapi.testclient import TestClient

import routers.razorpay as razorpay_router
from main import app
from services.razorpay_service import (
    RazorpayVerificationError,
)


client = TestClient(app)


# =========================================================
# TEST DATA
# =========================================================

JOB_ID = (
    "11111111-1111-1111-1111-111111111111"
)

TRANSACTION_ID = "RZP_TEST_UNIT"

ORDER_ID = "order_test_001"

PAYMENT_ID = "pay_test_001"

OTHER_PAYMENT_ID = "pay_test_other"


def allowed_job(
    *,
    order_id: str | None = None,
    payment_id: str | None = None,
    payment_status: str | None = None,
) -> dict:
    return {
        "id": JOB_ID,
        "transaction_id": TRANSACTION_ID,
        "guardrail_status": "ALLOWED",
        "idempotency_state": "COMPLETED",
        "razorpay_order_id": order_id,
        "razorpay_order_status": (
            "created"
            if order_id
            else None
        ),
        "razorpay_payment_id": payment_id,
        "razorpay_payment_status": (
            payment_status
        ),
    }


def blocked_job() -> dict:
    return {
        "id": JOB_ID,
        "transaction_id": TRANSACTION_ID,
        "guardrail_status": "BLOCKED",
        "idempotency_state": "COMPLETED",
        "razorpay_order_id": None,
        "razorpay_order_status": None,
        "razorpay_payment_id": None,
        "razorpay_payment_status": None,
    }


def transaction() -> dict:
    return {
        "transaction_id": TRANSACTION_ID,
        "amount_paise": 100,
        "currency": "INR",
    }


def captured_payment(
    *,
    payment_id: str = PAYMENT_ID,
    order_id: str = ORDER_ID,
    amount: int = 100,
    currency: str = "INR",
) -> dict:
    return {
        "id": payment_id,
        "order_id": order_id,
        "amount": amount,
        "currency": currency,
        "status": "captured",
        "captured": True,
    }


# =========================================================
# COMMON RAZORPAY ENABLED FIXTURE
# =========================================================

def enable_razorpay(
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        razorpay_router,
        "razorpay_enabled",
        lambda: True,
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_razorpay_key_id",
        lambda: "rzp_test_unit",
    )


# =========================================================
# 1. ALLOWED JOB CREATES ORDER
# =========================================================

def test_allowed_job_creates_order(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    saved: dict = {}

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "create_test_order",
        lambda **kwargs: {
            "id": ORDER_ID,
            "status": "created",
        },
    )

    def fake_save_order(
        *,
        job_id: str,
        razorpay_order_id: str,
        order_status: str,
    ):
        saved.update(
            {
                "job_id": job_id,
                "order_id": razorpay_order_id,
                "status": order_status,
            }
        )

    monkeypatch.setattr(
        razorpay_router,
        "save_razorpay_order",
        fake_save_order,
    )

    response = client.post(
        "/api/razorpay/recovery-order",
        json={
            "recovery_job_id": JOB_ID,
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert (
        body["razorpay_order_id"]
        == ORDER_ID
    )

    assert (
        body["amount_paise"]
        == 100
    )

    assert (
        body["currency"]
        == "INR"
    )

    assert (
        body["execution_mode"]
        == "RAZORPAY_TEST"
    )

    assert (
        saved["job_id"]
        == JOB_ID
    )

    assert (
        saved["order_id"]
        == ORDER_ID
    )


# =========================================================
# 2. BLOCKED JOB CANNOT CREATE ORDER
# =========================================================

def test_blocked_job_cannot_create_order(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: blocked_job(),
    )

    response = client.post(
        "/api/razorpay/recovery-order",
        json={
            "recovery_job_id": JOB_ID,
        },
    )

    assert response.status_code == 409

    assert (
        "guardrails"
        in response.json()["detail"]
    )


# =========================================================
# 3. DUPLICATE ORDER REQUEST IS IDEMPOTENT
# =========================================================

def test_duplicate_order_returns_existing_order(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(
            order_id=ORDER_ID,
        ),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    create_calls = {
        "count": 0,
    }

    def should_not_create(
        **kwargs,
    ):
        create_calls["count"] += 1

        return {
            "id": "order_unexpected",
            "status": "created",
        }

    monkeypatch.setattr(
        razorpay_router,
        "create_test_order",
        should_not_create,
    )

    response = client.post(
        "/api/razorpay/recovery-order",
        json={
            "recovery_job_id": JOB_ID,
        },
    )

    assert response.status_code == 200

    assert (
        response.json()[
            "razorpay_order_id"
        ]
        == ORDER_ID
    )

    assert (
        create_calls["count"]
        == 0
    )


# =========================================================
# 4. VALID CAPTURED PAYMENT VERIFIES
# =========================================================

def test_valid_captured_payment_verifies(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    saved: dict = {}

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(
            order_id=ORDER_ID,
        ),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "verify_payment_signature",
        lambda **kwargs: True,
    )

    monkeypatch.setattr(
        razorpay_router,
        "fetch_payment",
        lambda payment_id: captured_payment(),
    )

    def fake_save_payment(
        *,
        job_id: str,
        razorpay_payment_id: str,
        payment_status: str,
    ):
        saved.update(
            {
                "job_id": job_id,
                "payment_id":
                    razorpay_payment_id,
                "status":
                    payment_status,
            }
        )

    monkeypatch.setattr(
        razorpay_router,
        "save_verified_payment",
        fake_save_payment,
    )

    response = client.post(
        "/api/razorpay/verify-payment",
        json={
            "recovery_job_id":
                JOB_ID,
            "razorpay_order_id":
                ORDER_ID,
            "razorpay_payment_id":
                PAYMENT_ID,
            "razorpay_signature":
                "valid_signature",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert (
        body["verified"]
        is True
    )

    assert (
        body["payment_status"]
        == "captured"
    )

    assert (
        body["razorpay_payment_id"]
        == PAYMENT_ID
    )

    assert (
        saved["payment_id"]
        == PAYMENT_ID
    )

    assert (
        saved["status"]
        == "captured"
    )


# =========================================================
# 5. INVALID SIGNATURE IS REJECTED
# =========================================================

def test_invalid_signature_is_rejected(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(
            order_id=ORDER_ID,
        ),
    )

    def invalid_signature(
        **kwargs,
    ):
        raise RazorpayVerificationError(
            "invalid signature"
        )

    monkeypatch.setattr(
        razorpay_router,
        "verify_payment_signature",
        invalid_signature,
    )

    response = client.post(
        "/api/razorpay/verify-payment",
        json={
            "recovery_job_id":
                JOB_ID,
            "razorpay_order_id":
                ORDER_ID,
            "razorpay_payment_id":
                PAYMENT_ID,
            "razorpay_signature":
                "bad_signature",
        },
    )

    assert response.status_code == 400

    assert (
        "signature"
        in response.json()["detail"].lower()
    )


# =========================================================
# 6. WRONG PAYMENT AMOUNT IS REJECTED
# =========================================================

def test_wrong_payment_amount_is_rejected(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(
            order_id=ORDER_ID,
        ),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "verify_payment_signature",
        lambda **kwargs: True,
    )

    monkeypatch.setattr(
        razorpay_router,
        "fetch_payment",
        lambda payment_id:
            captured_payment(
                amount=999,
            ),
    )

    response = client.post(
        "/api/razorpay/verify-payment",
        json={
            "recovery_job_id":
                JOB_ID,
            "razorpay_order_id":
                ORDER_ID,
            "razorpay_payment_id":
                PAYMENT_ID,
            "razorpay_signature":
                "valid_signature",
        },
    )

    assert response.status_code == 409

    assert (
        "amount"
        in response.json()["detail"].lower()
    )


# =========================================================
# 7. RECONCILIATION FINDS CAPTURED PAYMENT
# =========================================================

def test_reconciliation_finds_captured_payment(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    saved: dict = {}

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(
            order_id=ORDER_ID,
        ),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "fetch_order_payments",
        lambda order_id: {
            "entity": "collection",
            "count": 2,
            "items": [
                {
                    "id":
                        "pay_failed",
                    "order_id":
                        ORDER_ID,
                    "amount":
                        100,
                    "currency":
                        "INR",
                    "status":
                        "failed",
                },
                captured_payment(),
            ],
        },
    )

    def fake_save_payment(
        *,
        job_id: str,
        razorpay_payment_id: str,
        payment_status: str,
    ):
        saved.update(
            {
                "job_id":
                    job_id,
                "payment_id":
                    razorpay_payment_id,
                "status":
                    payment_status,
            }
        )

    monkeypatch.setattr(
        razorpay_router,
        "save_verified_payment",
        fake_save_payment,
    )

    response = client.post(
        "/api/razorpay/reconcile-payment",
        json={
            "recovery_job_id":
                JOB_ID,
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert (
        body["reconciled"]
        is True
    )

    assert (
        body["razorpay_payment_id"]
        == PAYMENT_ID
    )

    assert (
        body["payment_status"]
        == "captured"
    )

    assert (
        body["amount_paise"]
        == 100
    )

    assert (
        saved["payment_id"]
        == PAYMENT_ID
    )


# =========================================================
# 8. RECONCILIATION IS IDEMPOTENT
# =========================================================

def test_reconciliation_is_idempotent(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(
            order_id=ORDER_ID,
            payment_id=PAYMENT_ID,
            payment_status="captured",
        ),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    gateway_calls = {
        "count": 0,
    }

    def should_not_fetch(
        order_id: str,
    ):
        gateway_calls[
            "count"
        ] += 1

        return {
            "items": [],
        }

    monkeypatch.setattr(
        razorpay_router,
        "fetch_order_payments",
        should_not_fetch,
    )

    response = client.post(
        "/api/razorpay/reconcile-payment",
        json={
            "recovery_job_id":
                JOB_ID,
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert (
        body["razorpay_payment_id"]
        == PAYMENT_ID
    )

    assert (
        body["payment_status"]
        == "captured"
    )

    assert (
        body["reconciled"]
        is True
    )

    assert (
        gateway_calls["count"]
        == 0
    )


# =========================================================
# 9. FAILED-ONLY PAYMENTS ARE NOT RECONCILED
# =========================================================

def test_failed_only_payments_are_not_reconciled(
    monkeypatch,
):
    enable_razorpay(
        monkeypatch
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job",
        lambda job_id: allowed_job(
            order_id=ORDER_ID,
        ),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "fetch_order_payments",
        lambda order_id: {
            "entity": "collection",
            "count": 2,
            "items": [
                {
                    "id":
                        "pay_failed_1",
                    "order_id":
                        ORDER_ID,
                    "amount":
                        100,
                    "currency":
                        "INR",
                    "status":
                        "failed",
                },
                {
                    "id":
                        "pay_failed_2",
                    "order_id":
                        ORDER_ID,
                    "amount":
                        100,
                    "currency":
                        "INR",
                    "status":
                        "failed",
                },
            ],
        },
    )

    response = client.post(
        "/api/razorpay/reconcile-payment",
        json={
            "recovery_job_id":
                JOB_ID,
        },
    )

    assert response.status_code == 409

    assert (
        "no captured"
        in response.json()[
            "detail"
        ].lower()
    )