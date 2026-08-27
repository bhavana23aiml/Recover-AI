from __future__ import annotations

import json

from fastapi.testclient import TestClient

import routers.razorpay as razorpay_router
from main import app
from services.razorpay_service import (
    RazorpayVerificationError,
)


client = TestClient(app)


JOB_ID = "11111111-1111-1111-1111-111111111111"
TRANSACTION_ID = "RZP_WEBHOOK_UNIT"

ORDER_ID = "order_webhook_test"
PAYMENT_ID = "pay_webhook_test"


def allowed_job() -> dict:
    return {
        "id": JOB_ID,
        "transaction_id": TRANSACTION_ID,
        "guardrail_status": "ALLOWED",
        "razorpay_order_id": ORDER_ID,
        "razorpay_payment_id": None,
        "razorpay_payment_status": None,
    }


def transaction() -> dict:
    return {
        "transaction_id": TRANSACTION_ID,
        "amount_paise": 100,
        "currency": "INR",
    }


def captured_payload(
    *,
    amount: int = 100,
    currency: str = "INR",
    status: str = "captured",
) -> dict:
    return {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": PAYMENT_ID,
                    "order_id": ORDER_ID,
                    "amount": amount,
                    "currency": currency,
                    "status": status,
                }
            }
        },
    }


def webhook_headers(
    *,
    event_id: str,
    signature: str = "valid_signature",
) -> dict:
    return {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": signature,
        "X-Razorpay-Event-Id": event_id,
    }


def enable_razorpay(
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        razorpay_router,
        "razorpay_enabled",
        lambda: True,
    )


def accept_signature(
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        razorpay_router,
        "verify_webhook_signature",
        lambda **kwargs: True,
    )


# =========================================================
# 1. VALID CAPTURED WEBHOOK
# =========================================================

def test_payment_captured_webhook_is_processed(
    monkeypatch,
):
    enable_razorpay(monkeypatch)
    accept_signature(monkeypatch)

    saved_payment = {}
    completed_event = {}
    audit_event = {}

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job_by_razorpay_order_id",
        lambda order_id: allowed_job(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "reserve_webhook_event",
        lambda **kwargs: (
            {
                "event_id": kwargs["event_id"],
                "processing_status": "RECEIVED",
            },
            True,
        ),
    )

    def fake_save_verified_payment(
        *,
        job_id,
        razorpay_payment_id,
        payment_status,
    ):
        saved_payment.update(
            {
                "job_id": job_id,
                "payment_id": razorpay_payment_id,
                "status": payment_status,
            }
        )

        return saved_payment

    monkeypatch.setattr(
        razorpay_router,
        "save_verified_payment",
        fake_save_verified_payment,
    )

    def fake_append_audit_event(
        **kwargs,
    ):
        audit_event.update(kwargs)
        return kwargs

    monkeypatch.setattr(
        razorpay_router,
        "append_audit_event",
        fake_append_audit_event,
    )

    def fake_complete_webhook_event(
        **kwargs,
    ):
        completed_event.update(kwargs)
        return kwargs

    monkeypatch.setattr(
        razorpay_router,
        "complete_webhook_event",
        fake_complete_webhook_event,
    )

    body = json.dumps(
        captured_payload(),
        separators=(",", ":"),
    )

    response = client.post(
        "/api/razorpay/webhook",
        content=body,
        headers=webhook_headers(
            event_id="evt_webhook_001",
        ),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["received"] is True
    assert data["duplicate"] is False
    assert data["event_type"] == "payment.captured"
    assert data["processing_status"] == "PROCESSED"
    assert data["payment_status"] == "captured"

    assert saved_payment["job_id"] == JOB_ID
    assert saved_payment["payment_id"] == PAYMENT_ID
    assert saved_payment["status"] == "captured"

    assert (
        completed_event["event_id"]
        == "evt_webhook_001"
    )

    assert audit_event["step"] == "GATEWAY_WEBHOOK"
    assert audit_event["status"] == "SUCCESS"


# =========================================================
# 2. DUPLICATE WEBHOOK
# =========================================================

def test_duplicate_webhook_is_not_reprocessed(
    monkeypatch,
):
    enable_razorpay(monkeypatch)
    accept_signature(monkeypatch)

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job_by_razorpay_order_id",
        lambda order_id: allowed_job(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "reserve_webhook_event",
        lambda **kwargs: (
            {
                "event_id": kwargs["event_id"],
                "processing_status": "PROCESSED",
            },
            False,
        ),
    )

    save_calls = {
        "count": 0,
    }

    def should_not_save(
        **kwargs,
    ):
        save_calls["count"] += 1

    monkeypatch.setattr(
        razorpay_router,
        "save_verified_payment",
        should_not_save,
    )

    body = json.dumps(
        captured_payload(),
        separators=(",", ":"),
    )

    response = client.post(
        "/api/razorpay/webhook",
        content=body,
        headers=webhook_headers(
            event_id="evt_duplicate_001",
        ),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["received"] is True
    assert data["duplicate"] is True
    assert data["processing_status"] == "PROCESSED"

    assert save_calls["count"] == 0


# =========================================================
# 3. INVALID SIGNATURE
# =========================================================

def test_invalid_webhook_signature_is_rejected_before_persistence(
    monkeypatch,
):
    enable_razorpay(monkeypatch)

    def invalid_signature(
        **kwargs,
    ):
        raise RazorpayVerificationError(
            "invalid webhook signature"
        )

    monkeypatch.setattr(
        razorpay_router,
        "verify_webhook_signature",
        invalid_signature,
    )

    reserve_calls = {
        "count": 0,
    }

    def should_not_reserve(
        **kwargs,
    ):
        reserve_calls["count"] += 1
        return ({}, True)

    monkeypatch.setattr(
        razorpay_router,
        "reserve_webhook_event",
        should_not_reserve,
    )

    body = json.dumps(
        {
            "event": "payment.failed",
            "payload": {},
        },
        separators=(",", ":"),
    )

    response = client.post(
        "/api/razorpay/webhook",
        content=body,
        headers=webhook_headers(
            event_id="evt_invalid_001",
            signature="invalid_signature",
        ),
    )

    assert response.status_code == 400

    assert (
        "signature"
        in response.json()["detail"].lower()
    )

    assert reserve_calls["count"] == 0


# =========================================================
# 4. UNSUPPORTED VALID EVENT IS IGNORED
# =========================================================

def test_unsupported_webhook_event_is_ignored(
    monkeypatch,
):
    enable_razorpay(monkeypatch)
    accept_signature(monkeypatch)

    ignored = {}

    monkeypatch.setattr(
        razorpay_router,
        "reserve_webhook_event",
        lambda **kwargs: (
            {
                "event_id": kwargs["event_id"],
                "processing_status": "RECEIVED",
            },
            True,
        ),
    )

    def fake_ignore_webhook_event(
        **kwargs,
    ):
        ignored.update(kwargs)
        return kwargs

    monkeypatch.setattr(
        razorpay_router,
        "ignore_webhook_event",
        fake_ignore_webhook_event,
    )

    body = json.dumps(
        {
            "event": "payment.failed",
            "payload": {},
        },
        separators=(",", ":"),
    )

    response = client.post(
        "/api/razorpay/webhook",
        content=body,
        headers=webhook_headers(
            event_id="evt_ignored_001",
        ),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["duplicate"] is False
    assert data["event_type"] == "payment.failed"
    assert data["processing_status"] == "IGNORED"

    assert (
        ignored["event_id"]
        == "evt_ignored_001"
    )


# =========================================================
# 5. WRONG AMOUNT FAILS CLOSED
# =========================================================

def test_webhook_wrong_amount_is_rejected(
    monkeypatch,
):
    enable_razorpay(monkeypatch)
    accept_signature(monkeypatch)

    failed = {}

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job_by_razorpay_order_id",
        lambda order_id: allowed_job(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "get_transaction",
        lambda transaction_id: transaction(),
    )

    monkeypatch.setattr(
        razorpay_router,
        "reserve_webhook_event",
        lambda **kwargs: (
            {
                "event_id": kwargs["event_id"],
                "processing_status": "RECEIVED",
            },
            True,
        ),
    )

    def fake_fail_webhook_event(
        **kwargs,
    ):
        failed.update(kwargs)
        return kwargs

    monkeypatch.setattr(
        razorpay_router,
        "fail_webhook_event",
        fake_fail_webhook_event,
    )

    body = json.dumps(
        captured_payload(
            amount=999,
        ),
        separators=(",", ":"),
    )

    response = client.post(
        "/api/razorpay/webhook",
        content=body,
        headers=webhook_headers(
            event_id="evt_wrong_amount_001",
        ),
    )

    assert response.status_code == 409

    assert (
        "amount"
        in response.json()["detail"].lower()
    )

    assert (
        failed["event_id"]
        == "evt_wrong_amount_001"
    )


# =========================================================
# 6. UNKNOWN ORDER IS SAFELY IGNORED
# =========================================================

def test_unknown_recoverai_order_is_ignored(
    monkeypatch,
):
    enable_razorpay(monkeypatch)
    accept_signature(monkeypatch)

    ignored = {}

    monkeypatch.setattr(
        razorpay_router,
        "get_recovery_job_by_razorpay_order_id",
        lambda order_id: None,
    )

    monkeypatch.setattr(
        razorpay_router,
        "reserve_webhook_event",
        lambda **kwargs: (
            {
                "event_id": kwargs["event_id"],
                "processing_status": "RECEIVED",
            },
            True,
        ),
    )

    def fake_ignore_webhook_event(
        **kwargs,
    ):
        ignored.update(kwargs)
        return kwargs

    monkeypatch.setattr(
        razorpay_router,
        "ignore_webhook_event",
        fake_ignore_webhook_event,
    )

    body = json.dumps(
        captured_payload(),
        separators=(",", ":"),
    )

    response = client.post(
        "/api/razorpay/webhook",
        content=body,
        headers=webhook_headers(
            event_id="evt_unknown_order_001",
        ),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["processing_status"] == "IGNORED"

    assert (
        ignored["razorpay_order_id"]
        == ORDER_ID
    )