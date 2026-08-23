from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from postgrest.exceptions import APIError

from core.database import get_supabase
from schemas.transaction import ClassificationRequest


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def rupees_to_paise(amount: int | float | Decimal) -> int:
    """
    Convert API/UI rupee values into integer paise for persistence.

    Example:
        7499 -> 749900
    """
    rupees = Decimal(str(amount))
    paise = (rupees * Decimal("100")).quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP,
    )
    return int(paise)


def paise_to_rupees(amount_paise: int) -> float:
    return float(
        (Decimal(amount_paise) / Decimal("100")).quantize(
            Decimal("0.01")
        )
    )


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------


def save_transaction(
    request: ClassificationRequest,
    payment_status: str = "FAILED",
) -> dict[str, Any]:
    """
    Persist the failed transaction.

    transaction_id is the primary key, so repeated execution requests update
    the existing transaction instead of creating duplicate transactions.
    """
    client = get_supabase()

    payload = {
        "transaction_id": request.transaction_id,
        "amount_paise": rupees_to_paise(request.amount),
        "currency": "INR",
        "failure_code": request.failure_code.value,
        "retry_count": request.retry_count,
        "payment_status": payment_status,
        "updated_at": _utc_now_iso(),
    }

    response = (
        client.table("transactions")
        .upsert(
            payload,
            on_conflict="transaction_id",
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            f"Failed to persist transaction {request.transaction_id}."
        )

    return response.data[0]


def get_transaction(
    transaction_id: str,
) -> dict[str, Any] | None:
    client = get_supabase()

    response = (
        client.table("transactions")
        .select("*")
        .eq("transaction_id", transaction_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# ---------------------------------------------------------------------------
# Recovery jobs / persistent idempotency
# ---------------------------------------------------------------------------


def get_recovery_job_by_idempotency_key(
    idempotency_key: str,
) -> dict[str, Any] | None:
    client = get_supabase()

    response = (
        client.table("recovery_jobs")
        .select("*")
        .eq("idempotency_key", idempotency_key)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def reserve_recovery_job(
    *,
    transaction_id: str,
    idempotency_key: str,
    action: str,
    guardrail_status: str,
    attempt_number: int,
    execution_mode: str = "SIMULATION",
) -> tuple[dict[str, Any], bool]:
    """
    Reserve one recovery execution attempt.

    Returns:
        (job, created)

    created=True:
        This call created the reservation.

    created=False:
        The idempotency key already existed and the existing job was returned.

    The UNIQUE constraint on recovery_jobs.idempotency_key is the final
    database-level protection against duplicate reservations.
    """
    client = get_supabase()

    payload = {
        "transaction_id": transaction_id,
        "idempotency_key": idempotency_key,
        "action": action,
        "guardrail_status": guardrail_status,
        "execution_status": "PENDING",
        "attempt_number": attempt_number,
        "recovered_amount_paise": 0,
        "execution_mode": execution_mode,
        "idempotency_state": "IN_PROGRESS",
    }

    try:
        response = (
            client.table("recovery_jobs")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                f"Failed to reserve recovery job for {transaction_id}."
            )

        return response.data[0], True

    except APIError:
        # A concurrent request may have inserted the same unique
        # idempotency key first. Read that row rather than executing twice.
        existing = get_recovery_job_by_idempotency_key(
            idempotency_key
        )

        if existing is not None:
            return existing, False

        raise


def complete_recovery_job(
    *,
    job_id: str,
    response_payload: dict[str, Any],
    execution_status: str,
    recovered_amount: int | float | Decimal,
    execution_mode: str = "SIMULATION",
) -> dict[str, Any]:
    client = get_supabase()

    payload = {
        "idempotency_state": "COMPLETED",
        "execution_status": execution_status,
        "recovered_amount_paise": rupees_to_paise(
            recovered_amount
        ),
        "execution_mode": execution_mode,
        "response_payload": response_payload,
        "error_message": None,
        "completed_at": _utc_now_iso(),
        "updated_at": _utc_now_iso(),
    }

    response = (
        client.table("recovery_jobs")
        .update(payload)
        .eq("id", job_id)
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            f"Failed to complete recovery job {job_id}."
        )

    return response.data[0]


def fail_recovery_job(
    *,
    job_id: str,
    error_message: str,
) -> dict[str, Any]:
    client = get_supabase()

    payload = {
        "idempotency_state": "ERROR",
        "execution_status": "FAILED",
        "error_message": error_message,
        "updated_at": _utc_now_iso(),
    }

    response = (
        client.table("recovery_jobs")
        .update(payload)
        .eq("id", job_id)
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            f"Failed to mark recovery job {job_id} as ERROR."
        )

    return response.data[0]


# ---------------------------------------------------------------------------
# Audit events
# ---------------------------------------------------------------------------


def append_audit_event(
    *,
    transaction_id: str,
    step: str,
    status: str,
    message: str,
    recovery_job_id: str | None = None,
    created_at: str | None = None,
) -> dict[str, Any]:
    """
    Append one immutable audit event.

    The backend application is intentionally granted INSERT + SELECT on
    audit_events, but not UPDATE/DELETE.
    """
    client = get_supabase()

    payload: dict[str, Any] = {
        "transaction_id": transaction_id,
        "step": step,
        "status": status,
        "message": message,
    }

    if recovery_job_id is not None:
        payload["recovery_job_id"] = recovery_job_id

    if created_at is not None:
        payload["created_at"] = created_at

    response = (
        client.table("audit_events")
        .insert(payload)
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            f"Failed to append audit event for {transaction_id}."
        )

    return response.data[0]

def get_audit_events(
    transaction_id: str,
) -> list[dict[str, Any]]:
    """
    Return events in deterministic replay order.
    """
    client = get_supabase()

    response = (
        client.table("audit_events")
        .select("*")
        .eq("transaction_id", transaction_id)
        .order("created_at")
        .order("id")
        .execute()
    )

    return list(response.data or [])