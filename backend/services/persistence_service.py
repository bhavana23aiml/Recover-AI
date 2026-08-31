from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from postgrest.exceptions import APIError

from core.database import get_supabase
from schemas.transaction import ClassificationRequest


# =========================================================
# TIME
# =========================================================

def _utc_now_iso() -> str:
    return datetime.now(
        timezone.utc
    ).isoformat()


# =========================================================
# MONEY CONVERSION
# =========================================================

def rupees_to_paise(
    amount: int | float | Decimal,
) -> int:
    """
    Convert API/UI rupee values into integer paise
    for persistence.

    Example:
        7499 -> 749900
    """

    rupees = Decimal(
        str(amount)
    )

    paise = (
        rupees
        * Decimal("100")
    ).quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP,
    )

    return int(
        paise
    )


def paise_to_rupees(
    amount_paise: int,
) -> float:
    return float(
        (
            Decimal(amount_paise)
            / Decimal("100")
        ).quantize(
            Decimal("0.01")
        )
    )


# =========================================================
# TRANSACTIONS
# =========================================================

def save_transaction(
    request: ClassificationRequest,
    payment_status: str = "FAILED",
) -> dict[str, Any]:
    """
    Persist the failed transaction.

    transaction_id is the primary key, so repeated
    execution requests update the existing transaction
    instead of creating duplicate transactions.
    """

    client = get_supabase()

    payload = {
        "transaction_id":
            request.transaction_id,

        "amount_paise":
            rupees_to_paise(
                request.amount
            ),

        "currency":
            "INR",

        "failure_code":
            request.failure_code.value,

        "retry_count":
            request.retry_count,

        "payment_status":
            payment_status,

        "updated_at":
            _utc_now_iso(),
    }

    response = (
        client
        .table("transactions")
        .upsert(
            payload,
            on_conflict="transaction_id",
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to persist transaction "
            f"{request.transaction_id}."
        )

    return response.data[0]


def get_transaction(
    transaction_id: str,
) -> dict[str, Any] | None:
    client = get_supabase()

    response = (
        client
        .table("transactions")
        .select("*")
        .eq(
            "transaction_id",
            transaction_id,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# =========================================================
# RECOVERY JOBS / PERSISTENT IDEMPOTENCY
# =========================================================

def get_recovery_job_by_idempotency_key(
    idempotency_key: str,
) -> dict[str, Any] | None:
    client = get_supabase()

    response = (
        client
        .table("recovery_jobs")
        .select("*")
        .eq(
            "idempotency_key",
            idempotency_key,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_recovery_job(
    job_id: str,
) -> dict[str, Any] | None:
    """
    Fetch one recovery job by database UUID.
    """

    client = get_supabase()

    response = (
        client
        .table("recovery_jobs")
        .select("*")
        .eq(
            "id",
            job_id,
        )
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
) -> tuple[
    dict[str, Any],
    bool,
]:
    """
    Reserve one recovery execution attempt.

    Returns:
        (job, created)

    created=True:
        This call created the reservation.

    created=False:
        The idempotency key already existed and the
        existing job was returned.

    The UNIQUE constraint on
    recovery_jobs.idempotency_key is the final
    database-level duplicate protection.
    """

    client = get_supabase()

    payload = {
        "transaction_id":
            transaction_id,

        "idempotency_key":
            idempotency_key,

        "action":
            action,

        "guardrail_status":
            guardrail_status,

        "execution_status":
            "PENDING",

        "attempt_number":
            attempt_number,

        "recovered_amount_paise":
            0,

        "execution_mode":
            execution_mode,

        "idempotency_state":
            "IN_PROGRESS",
    }

    try:
        response = (
            client
            .table("recovery_jobs")
            .insert(
                payload
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to reserve recovery job "
                f"for {transaction_id}."
            )

        return (
            response.data[0],
            True,
        )

    except APIError:
        # A concurrent request may have inserted
        # the same unique idempotency key first.
        #
        # Read the existing row instead of
        # executing twice.

        existing = (
            get_recovery_job_by_idempotency_key(
                idempotency_key
            )
        )

        if existing is not None:
            return (
                existing,
                False,
            )

        raise


def complete_recovery_job(
    *,
    job_id: str,
    response_payload: dict[str, Any],
    execution_status: str,
    recovered_amount:
        int | float | Decimal,
    execution_mode: str = "SIMULATION",
) -> dict[str, Any]:
    client = get_supabase()

    payload = {
        "idempotency_state":
            "COMPLETED",

        "execution_status":
            execution_status,

        "recovered_amount_paise":
            rupees_to_paise(
                recovered_amount
            ),

        "execution_mode":
            execution_mode,

        "response_payload":
            response_payload,

        "error_message":
            None,

        "completed_at":
            _utc_now_iso(),

        "updated_at":
            _utc_now_iso(),
    }

    response = (
        client
        .table("recovery_jobs")
        .update(
            payload
        )
        .eq(
            "id",
            job_id,
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to complete recovery job "
            f"{job_id}."
        )

    return response.data[0]


def fail_recovery_job(
    *,
    job_id: str,
    error_message: str,
) -> dict[str, Any]:
    client = get_supabase()

    payload = {
        "idempotency_state":
            "ERROR",

        "execution_status":
            "FAILED",

        "error_message":
            error_message,

        "updated_at":
            _utc_now_iso(),
    }

    response = (
        client
        .table("recovery_jobs")
        .update(
            payload
        )
        .eq(
            "id",
            job_id,
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to mark recovery job "
            f"{job_id} as ERROR."
        )

    return response.data[0]


# =========================================================
# AUDIT EVENTS
# =========================================================

def append_audit_event(
    *,
    transaction_id: str,
    step: str,
    status: str,
    message: str,
    recovery_job_id:
        str | None = None,
    created_at:
        str | None = None,
) -> dict[str, Any]:
    """
    Append one immutable audit event.

    Backend has INSERT + SELECT access to
    audit_events, but intentionally no
    UPDATE or DELETE access.
    """

    client = get_supabase()

    payload: dict[str, Any] = {
        "transaction_id":
            transaction_id,

        "step":
            step,

        "status":
            status,

        "message":
            message,
    }

    if recovery_job_id is not None:
        payload[
            "recovery_job_id"
        ] = recovery_job_id

    if created_at is not None:
        payload[
            "created_at"
        ] = created_at

    response = (
        client
        .table("audit_events")
        .insert(
            payload
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to append audit event "
            f"for {transaction_id}."
        )

    return response.data[0]


def get_audit_events(
    transaction_id: str,
) -> list[dict[str, Any]]:
    """
    Return events in deterministic
    replay order.
    """

    client = get_supabase()

    response = (
        client
        .table("audit_events")
        .select("*")
        .eq(
            "transaction_id",
            transaction_id,
        )
        .order(
            "created_at"
        )
        .order(
            "id"
        )
        .execute()
    )

    return list(
        response.data
        or []
    )


# =========================================================
# RAZORPAY GATEWAY PERSISTENCE
# =========================================================

def get_recovery_job_by_razorpay_order_id(
    razorpay_order_id: str,
) -> dict[str, Any] | None:
    """
    Find the RecoverAI recovery job associated
    with a Razorpay order.

    Used by payment verification,
    reconciliation and webhook processing.
    """

    client = get_supabase()

    response = (
        client
        .table("recovery_jobs")
        .select("*")
        .eq(
            "razorpay_order_id",
            razorpay_order_id,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def save_razorpay_order(
    *,
    job_id: str,
    razorpay_order_id: str,
    order_status: str,
) -> dict[str, Any]:
    """
    Attach a Razorpay Test Mode order to an
    existing RecoverAI recovery job.
    """

    if not razorpay_order_id:
        raise ValueError(
            "razorpay_order_id is required."
        )

    client = get_supabase()

    payload = {
        "razorpay_order_id":
            razorpay_order_id,

        "razorpay_order_status":
            order_status,

        "updated_at":
            _utc_now_iso(),
    }

    response = (
        client
        .table("recovery_jobs")
        .update(
            payload
        )
        .eq(
            "id",
            job_id,
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to persist Razorpay order "
            f"for job {job_id}."
        )

    return response.data[0]


def save_verified_payment(
    *,
    job_id: str,
    razorpay_payment_id: str,
    payment_status: str,
) -> dict[str, Any]:
    """
    Persist a Razorpay payment only after
    backend-side gateway verification
    has succeeded.

    When the verified payment is captured,
    the associated Razorpay order is also
    considered paid.
    """

    if not razorpay_payment_id:
        raise ValueError(
            "razorpay_payment_id is required."
        )

    client = get_supabase()

    normalized_payment_status = (
        str(payment_status)
        .strip()
        .lower()
    )

    now = _utc_now_iso()

    payload = {
        "razorpay_payment_id":
            razorpay_payment_id,

        "razorpay_payment_status":
            normalized_payment_status,

        "gateway_verified_at":
            now,

        "updated_at":
            now,
    }

    # Razorpay order lifecycle:
    # created -> attempted -> paid
    #
    # A captured payment means the associated
    # order has successfully been paid.
    if normalized_payment_status == "captured":
        payload["razorpay_order_status"] = "paid"

    response = (
        client
        .table("recovery_jobs")
        .update(
            payload
        )
        .eq(
            "id",
            job_id,
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to persist verified "
            "Razorpay payment for job "
            f"{job_id}."
        )

    return response.data[0]


# =========================================================
# RAZORPAY WEBHOOK EVENTS
# =========================================================

def get_webhook_event(
    event_id: str,
) -> dict[str, Any] | None:
    """
    Fetch one previously received Razorpay
    webhook event by x-razorpay-event-id.

    event_id has a UNIQUE database constraint.
    """

    if not event_id:
        raise ValueError(
            "event_id is required."
        )

    client = get_supabase()

    response = (
        client
        .table(
            "razorpay_webhook_events"
        )
        .select("*")
        .eq(
            "event_id",
            event_id,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def reserve_webhook_event(
    *,
    event_id: str,
    event_type: str,
    payload: dict[str, Any],
    razorpay_order_id:
        str | None = None,
    razorpay_payment_id:
        str | None = None,
    recovery_job_id:
        str | None = None,
) -> tuple[
    dict[str, Any],
    bool,
]:
    """
    Persist a webhook before business processing.

    Returns:
        (event, created)

    created=True:
        This event ID was received for the first time.

    created=False:
        This event ID already exists.

    The UNIQUE event_id constraint is the final
    database-level duplicate-delivery protection.

    This is important because Razorpay may deliver
    the same webhook more than once.
    """

    if not event_id:
        raise ValueError(
            "event_id is required."
        )

    if not event_type:
        raise ValueError(
            "event_type is required."
        )

    if not isinstance(
        payload,
        dict,
    ):
        raise ValueError(
            "payload must be a dictionary."
        )

    client = get_supabase()

    insert_payload: dict[str, Any] = {
        "event_id":
            event_id,

        "event_type":
            event_type,

        "processing_status":
            "RECEIVED",

        "payload":
            payload,

        "error_message":
            None,
    }

    if razorpay_order_id is not None:
        insert_payload[
            "razorpay_order_id"
        ] = razorpay_order_id

    if razorpay_payment_id is not None:
        insert_payload[
            "razorpay_payment_id"
        ] = razorpay_payment_id

    if recovery_job_id is not None:
        insert_payload[
            "recovery_job_id"
        ] = recovery_job_id

    try:
        response = (
            client
            .table(
                "razorpay_webhook_events"
            )
            .insert(
                insert_payload
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to reserve Razorpay "
                f"webhook event {event_id}."
            )

        return (
            response.data[0],
            True,
        )

    except APIError:
        # Most importantly this handles the UNIQUE
        # event_id race:
        #
        # Request A inserts event
        # Request B inserts same event
        #        ↓
        # DB unique constraint rejects B
        #        ↓
        # B reads existing row
        #        ↓
        # no duplicate business processing

        existing = get_webhook_event(
            event_id
        )

        if existing is not None:
            return (
                existing,
                False,
            )

        # Not a duplicate event_id case.
        # Preserve the original database failure.

        raise


def complete_webhook_event(
    *,
    event_id: str,
    recovery_job_id:
        str | None = None,
    razorpay_order_id:
        str | None = None,
    razorpay_payment_id:
        str | None = None,
) -> dict[str, Any]:
    """
    Mark a webhook event as successfully processed.
    """

    if not event_id:
        raise ValueError(
            "event_id is required."
        )

    client = get_supabase()

    payload: dict[str, Any] = {
        "processing_status":
            "PROCESSED",

        "error_message":
            None,

        "processed_at":
            _utc_now_iso(),
    }

    if recovery_job_id is not None:
        payload[
            "recovery_job_id"
        ] = recovery_job_id

    if razorpay_order_id is not None:
        payload[
            "razorpay_order_id"
        ] = razorpay_order_id

    if razorpay_payment_id is not None:
        payload[
            "razorpay_payment_id"
        ] = razorpay_payment_id

    response = (
        client
        .table(
            "razorpay_webhook_events"
        )
        .update(
            payload
        )
        .eq(
            "event_id",
            event_id,
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to mark Razorpay webhook "
            f"event {event_id} as PROCESSED."
        )

    return response.data[0]


def ignore_webhook_event(
    *,
    event_id: str,
    reason: str | None = None,
    recovery_job_id:
        str | None = None,
    razorpay_order_id:
        str | None = None,
    razorpay_payment_id:
        str | None = None,
) -> dict[str, Any]:
    """
    Mark a valid webhook as intentionally ignored.

    Examples:
        unsupported event type
        event unrelated to RecoverAI
    """

    if not event_id:
        raise ValueError(
            "event_id is required."
        )

    client = get_supabase()

    payload: dict[str, Any] = {
        "processing_status":
            "IGNORED",

        "error_message":
            reason,

        "processed_at":
            _utc_now_iso(),
    }

    if recovery_job_id is not None:
        payload[
            "recovery_job_id"
        ] = recovery_job_id

    if razorpay_order_id is not None:
        payload[
            "razorpay_order_id"
        ] = razorpay_order_id

    if razorpay_payment_id is not None:
        payload[
            "razorpay_payment_id"
        ] = razorpay_payment_id

    response = (
        client
        .table(
            "razorpay_webhook_events"
        )
        .update(
            payload
        )
        .eq(
            "event_id",
            event_id,
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to mark Razorpay webhook "
            f"event {event_id} as IGNORED."
        )

    return response.data[0]


def fail_webhook_event(
    *,
    event_id: str,
    error_message: str,
    recovery_job_id:
        str | None = None,
    razorpay_order_id:
        str | None = None,
    razorpay_payment_id:
        str | None = None,
) -> dict[str, Any]:
    """
    Mark a reserved webhook event as ERROR.

    This preserves the failure for diagnosis
    rather than deleting the event.
    """

    if not event_id:
        raise ValueError(
            "event_id is required."
        )

    if not error_message:
        raise ValueError(
            "error_message is required."
        )

    client = get_supabase()

    payload: dict[str, Any] = {
        "processing_status":
            "ERROR",

        "error_message":
            error_message,

        "processed_at":
            _utc_now_iso(),
    }

    if recovery_job_id is not None:
        payload[
            "recovery_job_id"
        ] = recovery_job_id

    if razorpay_order_id is not None:
        payload[
            "razorpay_order_id"
        ] = razorpay_order_id

    if razorpay_payment_id is not None:
        payload[
            "razorpay_payment_id"
        ] = razorpay_payment_id

    response = (
        client
        .table(
            "razorpay_webhook_events"
        )
        .update(
            payload
        )
        .eq(
            "event_id",
            event_id,
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Failed to mark Razorpay webhook "
            f"event {event_id} as ERROR."
        )

    return response.data[0]