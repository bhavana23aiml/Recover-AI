

import json

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
)

from core.auth import (
    AuthenticatedUser,
    get_current_user,
)

from schemas.razorpay import (
    RazorpayRecoveryOrderRequest,
    RazorpayRecoveryOrderResponse,
    RazorpayVerifyPaymentRequest,
    RazorpayVerifyPaymentResponse,
    RazorpayReconcilePaymentRequest,
    RazorpayReconcilePaymentResponse,
)

from services.persistence_service import (
    append_audit_event,
    complete_webhook_event,
    fail_webhook_event,
    get_recovery_job,
    get_recovery_job_by_razorpay_order_id,
    get_transaction,
    ignore_webhook_event,
    reserve_webhook_event,
    save_razorpay_order,
    save_verified_payment,
)

from services.razorpay_service import (
    RazorpayConfigurationError,
    RazorpayVerificationError,
    create_test_order,
    fetch_order_payments,
    fetch_payment,
    get_razorpay_key_id,
    razorpay_enabled,
    verify_payment_signature,
    verify_webhook_signature,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/razorpay",
    tags=["Razorpay Test Mode"],
)


# =========================================================
# CREATE RECOVERY ORDER
# =========================================================

@router.post(
    "/recovery-order",
    response_model=RazorpayRecoveryOrderResponse,
)
def create_recovery_order(
    request: RazorpayRecoveryOrderRequest,
    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
) -> RazorpayRecoveryOrderResponse:
    """
    Create or reuse a Razorpay Test Mode order for a
    guardrail-approved RecoverAI recovery job.

    The frontend supplies only recovery_job_id.

    Trusted amount and currency come from persistence.
    """

    # -----------------------------------------------------
    # Razorpay must be explicitly enabled
    # -----------------------------------------------------

    if not razorpay_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Razorpay Test Mode integration "
                "is currently disabled."
            ),
        )

    # -----------------------------------------------------
    # Load recovery job
    # -----------------------------------------------------

    job = get_recovery_job(
        request.recovery_job_id
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recovery job not found.",
        )

    # -----------------------------------------------------
    # Guardrail boundary
    # -----------------------------------------------------

    if job.get("guardrail_status") != "ALLOWED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay order creation blocked because "
                "this recovery job was not approved by "
                "RecoverAI guardrails."
            ),
        )

    # -----------------------------------------------------
    # Persistent execution state
    # -----------------------------------------------------

    idempotency_state = job.get(
        "idempotency_state"
    )

    if idempotency_state == "ERROR":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Recovery job is in an ambiguous ERROR "
                "state. Automatic gateway execution "
                "is blocked."
            ),
        )

    if idempotency_state == "IN_PROGRESS":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Recovery job is still in progress."
            ),
        )

    # -----------------------------------------------------
    # Load trusted transaction
    # -----------------------------------------------------

    transaction_id = job.get(
        "transaction_id"
    )

    transaction = get_transaction(
        transaction_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Persisted transaction for this "
                "recovery job could not be found."
            ),
        )

    amount_paise = int(
        transaction["amount_paise"]
    )

    currency = str(
        transaction.get(
            "currency",
            "INR",
        )
    )

    # -----------------------------------------------------
    # Order idempotency
    # -----------------------------------------------------

    existing_order_id = job.get(
        "razorpay_order_id"
    )

    if existing_order_id:
        return RazorpayRecoveryOrderResponse(
            recovery_job_id=str(
                job["id"]
            ),
            razorpay_order_id=str(
                existing_order_id
            ),
            amount_paise=amount_paise,
            currency=currency,
            status=str(
                job.get(
                    "razorpay_order_status"
                )
                or "created"
            ),
            key_id=get_razorpay_key_id(),
            execution_mode="RAZORPAY_TEST",
        )

    # -----------------------------------------------------
    # Deterministic receipt
    # -----------------------------------------------------

    compact_job_id = (
        str(job["id"])
        .replace("-", "")
    )

    receipt = (
        f"recoverai-{compact_job_id[:20]}"
    )

    # -----------------------------------------------------
    # Create Razorpay Test Mode order
    # -----------------------------------------------------

    try:
        order = create_test_order(
            amount_paise=amount_paise,
            receipt=receipt,
            currency=currency,
        )

    except RazorpayConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(
            "RAZORPAY ORDER CREATION ERROR:",
            type(exc).__name__,
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Razorpay Test Mode order "
                "creation failed."
            ),
        ) from exc

    razorpay_order_id = order.get(
        "id"
    )

    if not razorpay_order_id:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Razorpay returned an invalid "
                "order response."
            ),
        )

    order_status = str(
        order.get(
            "status",
            "created",
        )
    )

    # -----------------------------------------------------
    # Persist gateway order
    # -----------------------------------------------------

    save_razorpay_order(
        job_id=str(
            job["id"]
        ),
        razorpay_order_id=str(
            razorpay_order_id
        ),
        order_status=order_status,
    )

    return RazorpayRecoveryOrderResponse(
        recovery_job_id=str(
            job["id"]
        ),
        razorpay_order_id=str(
            razorpay_order_id
        ),
        amount_paise=amount_paise,
        currency=currency,
        status=order_status,
        key_id=get_razorpay_key_id(),
        execution_mode="RAZORPAY_TEST",
    )


# =========================================================
# VERIFY CHECKOUT PAYMENT
# =========================================================

@router.post(
    "/verify-payment",
    response_model=RazorpayVerifyPaymentResponse,
)
def verify_recovery_payment(
    request: RazorpayVerifyPaymentRequest,
    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
) -> RazorpayVerifyPaymentResponse:
    """
    Verify Razorpay Checkout success.

    Verification requires:
    - RecoverAI recovery job
    - guardrail approval
    - persisted order match
    - cryptographic signature
    - independent Razorpay payment fetch
    - amount match
    - currency match
    - CAPTURED status
    """

    if not razorpay_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Razorpay Test Mode integration "
                "is currently disabled."
            ),
        )

    # -----------------------------------------------------
    # Load recovery job
    # -----------------------------------------------------

    job = get_recovery_job(
        request.recovery_job_id
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recovery job not found.",
        )

    # -----------------------------------------------------
    # Guardrail check
    # -----------------------------------------------------

    if job.get("guardrail_status") != "ALLOWED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Payment verification blocked because "
                "this recovery job was not approved by "
                "RecoverAI guardrails."
            ),
        )

    # -----------------------------------------------------
    # Trusted persisted order
    # -----------------------------------------------------

    persisted_order_id = job.get(
        "razorpay_order_id"
    )

    if not persisted_order_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "No Razorpay order is attached "
                "to this recovery job."
            ),
        )

    persisted_order_id = str(
        persisted_order_id
    )

    if (
        request.razorpay_order_id
        != persisted_order_id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay order ID does not match "
                "the persisted recovery order."
            ),
        )

    # -----------------------------------------------------
    # Payment-level idempotency
    # -----------------------------------------------------

    existing_payment_id = job.get(
        "razorpay_payment_id"
    )

    existing_payment_status = str(
        job.get(
            "razorpay_payment_status"
        )
        or ""
    ).lower()

    if existing_payment_id:
        existing_payment_id = str(
            existing_payment_id
        )

        if (
            existing_payment_id
            != request.razorpay_payment_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A different Razorpay payment "
                    "is already associated with "
                    "this recovery job."
                ),
            )

        if (
            existing_payment_status
            != "captured"
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Persisted Razorpay payment "
                    "is not in captured state."
                ),
            )

        return RazorpayVerifyPaymentResponse(
            recovery_job_id=str(
                job["id"]
            ),
            razorpay_order_id=(
                persisted_order_id
            ),
            razorpay_payment_id=(
                existing_payment_id
            ),
            payment_status="captured",
            verified=True,
            execution_mode="RAZORPAY_TEST",
        )

    # -----------------------------------------------------
    # Cryptographic Checkout signature verification
    # -----------------------------------------------------

    try:
        verify_payment_signature(
            razorpay_order_id=(
                persisted_order_id
            ),
            razorpay_payment_id=(
                request.razorpay_payment_id
            ),
            razorpay_signature=(
                request.razorpay_signature
            ),
        )

    except RazorpayVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Razorpay payment signature "
                "is invalid."
            ),
        ) from exc

    # -----------------------------------------------------
    # Independent payment fetch
    # -----------------------------------------------------

    try:
        payment = fetch_payment(
            request.razorpay_payment_id
        )

    except Exception as exc:
        print(
            "RAZORPAY PAYMENT FETCH ERROR:",
            type(exc).__name__,
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Unable to fetch payment state "
                "from Razorpay."
            ),
        ) from exc

    # -----------------------------------------------------
    # Order association
    # -----------------------------------------------------

    gateway_order_id = str(
        payment.get(
            "order_id",
            "",
        )
    )

    if (
        gateway_order_id
        != persisted_order_id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay payment belongs to "
                "a different order."
            ),
        )

    # -----------------------------------------------------
    # Trusted RecoverAI transaction
    # -----------------------------------------------------

    transaction = get_transaction(
        str(
            job["transaction_id"]
        )
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Persisted transaction could "
                "not be found."
            ),
        )

    expected_amount_paise = int(
        transaction["amount_paise"]
    )

    try:
        gateway_amount_paise = int(
            payment.get(
                "amount",
                0,
            )
        )

    except (
        TypeError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Razorpay returned an invalid "
                "payment amount."
            ),
        ) from exc

    if (
        gateway_amount_paise
        != expected_amount_paise
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay payment amount does "
                "not match RecoverAI transaction."
            ),
        )

    # -----------------------------------------------------
    # Currency
    # -----------------------------------------------------

    expected_currency = str(
        transaction.get(
            "currency",
            "INR",
        )
    )

    gateway_currency = str(
        payment.get(
            "currency",
            "",
        )
    )

    if (
        gateway_currency
        != expected_currency
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay payment currency does "
                "not match RecoverAI transaction."
            ),
        )

    # -----------------------------------------------------
    # Captured status
    # -----------------------------------------------------

    payment_status = str(
        payment.get(
            "status",
            "",
        )
    ).lower()

    if payment_status != "captured":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay payment is valid but "
                "has not been captured. "
                f"Current status: "
                f"{payment_status or 'unknown'}."
            ),
        )

    # -----------------------------------------------------
    # Persist verified payment
    # -----------------------------------------------------

    save_verified_payment(
        job_id=str(
            job["id"]
        ),
        razorpay_payment_id=(
            request.razorpay_payment_id
        ),
        payment_status=payment_status,
    )

    return RazorpayVerifyPaymentResponse(
        recovery_job_id=str(
            job["id"]
        ),
        razorpay_order_id=(
            persisted_order_id
        ),
        razorpay_payment_id=(
            request.razorpay_payment_id
        ),
        payment_status=payment_status,
        verified=True,
        execution_mode="RAZORPAY_TEST",
    )


# =========================================================
# RECONCILE PAYMENT
# =========================================================

@router.post(
    "/reconcile-payment",
    response_model=RazorpayReconcilePaymentResponse,
)
def reconcile_recovery_payment(
    request: RazorpayReconcilePaymentRequest,
    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
) -> RazorpayReconcilePaymentResponse:
    """
    Recover gateway truth when browser verification
    fails after a Razorpay payment has already succeeded.

    Frontend supplies only recovery_job_id.
    """

    if not razorpay_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Razorpay Test Mode integration "
                "is currently disabled."
            ),
        )

    # -----------------------------------------------------
    # Recovery job
    # -----------------------------------------------------

    job = get_recovery_job(
        request.recovery_job_id
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recovery job not found.",
        )

    if job.get("guardrail_status") != "ALLOWED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Payment reconciliation blocked because "
                "this recovery job was not approved by "
                "RecoverAI guardrails."
            ),
        )

    # -----------------------------------------------------
    # Persisted order
    # -----------------------------------------------------

    order_id = job.get(
        "razorpay_order_id"
    )

    if not order_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "No Razorpay order is attached "
                "to this recovery job."
            ),
        )

    order_id = str(
        order_id
    )

    # -----------------------------------------------------
    # Trusted transaction
    # -----------------------------------------------------

    transaction_id = str(
        job["transaction_id"]
    )

    transaction = get_transaction(
        transaction_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Persisted transaction could "
                "not be found."
            ),
        )

    expected_amount_paise = int(
        transaction["amount_paise"]
    )

    expected_currency = str(
        transaction.get(
            "currency",
            "INR",
        )
    )

    # -----------------------------------------------------
    # Already reconciled / verified
    # -----------------------------------------------------

    existing_payment_id = job.get(
        "razorpay_payment_id"
    )

    existing_payment_status = str(
        job.get(
            "razorpay_payment_status"
        )
        or ""
    ).lower()

    if (
        existing_payment_id
        and existing_payment_status
        == "captured"
    ):
        return RazorpayReconcilePaymentResponse(
            recovery_job_id=str(
                job["id"]
            ),
            transaction_id=(
                transaction_id
            ),
            razorpay_order_id=(
                order_id
            ),
            razorpay_payment_id=str(
                existing_payment_id
            ),
            amount_paise=(
                expected_amount_paise
            ),
            currency=(
                expected_currency
            ),
            payment_status="captured",
            reconciled=True,
            execution_mode="RAZORPAY_TEST",
        )

    # -----------------------------------------------------
    # Fetch all payment attempts for this order
    # -----------------------------------------------------

    try:
        collection = fetch_order_payments(
            order_id
        )

    except Exception as exc:
        print(
            "RAZORPAY RECONCILIATION ERROR:",
            type(exc).__name__,
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Unable to reconcile payment "
                "state with Razorpay."
            ),
        ) from exc

    payments = collection.get(
        "items",
        [],
    )

    if not isinstance(
        payments,
        list,
    ):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Razorpay returned an invalid "
                "payment collection."
            ),
        )

    # -----------------------------------------------------
    # Find valid matching captured payment
    # -----------------------------------------------------

    matching_payments: list[dict] = []

    for payment in payments:
        if not isinstance(
            payment,
            dict,
        ):
            continue

        payment_status = str(
            payment.get(
                "status",
                "",
            )
        ).lower()

        if payment_status != "captured":
            continue

        if (
            str(
                payment.get(
                    "order_id",
                    "",
                )
            )
            != order_id
        ):
            continue

        try:
            gateway_amount_paise = int(
                payment.get(
                    "amount",
                    0,
                )
            )

        except (
            TypeError,
            ValueError,
        ):
            continue

        if (
            gateway_amount_paise
            != expected_amount_paise
        ):
            continue

        gateway_currency = str(
            payment.get(
                "currency",
                "",
            )
        )

        if (
            gateway_currency
            != expected_currency
        ):
            continue

        payment_id = payment.get(
            "id"
        )

        if not payment_id:
            continue

        matching_payments.append(
            payment
        )

    # -----------------------------------------------------
    # No safe match
    # -----------------------------------------------------

    if not matching_payments:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "No captured Razorpay payment "
                "matching the persisted order, "
                "amount and currency was found."
            ),
        )

    # -----------------------------------------------------
    # Multiple captures = ambiguous
    # -----------------------------------------------------

    if len(
        matching_payments
    ) > 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Multiple captured Razorpay payments "
                "match this recovery job. "
                "Automatic reconciliation is blocked."
            ),
        )

    matching_payment = (
        matching_payments[0]
    )

    payment_id = str(
        matching_payment["id"]
    )

    payment_status = str(
        matching_payment[
            "status"
        ]
    ).lower()

    # -----------------------------------------------------
    # Persist gateway truth
    # -----------------------------------------------------

    save_verified_payment(
        job_id=str(
            job["id"]
        ),
        razorpay_payment_id=(
            payment_id
        ),
        payment_status=(
            payment_status
        ),
    )

    return RazorpayReconcilePaymentResponse(
        recovery_job_id=str(
            job["id"]
        ),
        transaction_id=(
            transaction_id
        ),
        razorpay_order_id=(
            order_id
        ),
        razorpay_payment_id=(
            payment_id
        ),
        amount_paise=(
            expected_amount_paise
        ),
        currency=(
            expected_currency
        ),
        payment_status=(
            payment_status
        ),
        reconciled=True,
        execution_mode="RAZORPAY_TEST",
    )


# =========================================================
# RAZORPAY WEBHOOK
# =========================================================

@router.post(
    "/webhook",
)
async def razorpay_webhook(
    request: Request,
):
    """
    Receive Razorpay webhook events.

    Current supported processing event:
        payment.captured

    Security order:

        raw HTTP body
             ↓
        signature verification
             ↓
        JSON parsing
             ↓
        x-razorpay-event-id reservation
             ↓
        duplicate protection
             ↓
        persisted order lookup
             ↓
        amount / currency / status checks
             ↓
        payment persistence
             ↓
        RecoverAI audit event
    """

    # -----------------------------------------------------
    # Razorpay integration enabled
    # -----------------------------------------------------

    if not razorpay_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Razorpay Test Mode integration "
                "is currently disabled."
            ),
        )

    # -----------------------------------------------------
    # Required Razorpay headers
    # -----------------------------------------------------

    signature = request.headers.get(
        "x-razorpay-signature"
    )

    event_id = request.headers.get(
        "x-razorpay-event-id"
    )

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Missing X-Razorpay-Signature header."
            ),
        )

    if not event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Missing X-Razorpay-Event-Id header."
            ),
        )

    # -----------------------------------------------------
    # RAW BODY
    # -----------------------------------------------------
    #
    # Do not JSON-parse first.
    #
    # The exact raw request body is required for
    # webhook signature verification.
    # -----------------------------------------------------

    raw_body_bytes = await request.body()

    if not raw_body_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook body is empty.",
        )

    try:
        raw_body = raw_body_bytes.decode(
            "utf-8"
        )

    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Webhook body is not valid UTF-8."
            ),
        ) from exc

    # -----------------------------------------------------
    # WEBHOOK SIGNATURE VERIFICATION
    # -----------------------------------------------------

    try:
        verify_webhook_signature(
            raw_body=raw_body,
            signature=signature,
        )

    except RazorpayConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    except RazorpayVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid Razorpay webhook signature."
            ),
        ) from exc

    # -----------------------------------------------------
    # JSON parsing only after signature verification
    # -----------------------------------------------------

    try:
        payload = json.loads(
            raw_body
        )

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Webhook payload is not valid JSON."
            ),
        ) from exc

    if not isinstance(
        payload,
        dict,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Webhook payload must be "
                "a JSON object."
            ),
        )

    # -----------------------------------------------------
    # Event type
    # -----------------------------------------------------

    event_type = str(
        payload.get(
            "event",
            "",
        )
    )

    if not event_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Webhook event type is missing."
            ),
        )

    # -----------------------------------------------------
    # Extract payment payload
    # -----------------------------------------------------

    payload_data = payload.get(
        "payload",
        {},
    )

    if not isinstance(
        payload_data,
        dict,
    ):
        payload_data = {}

    payment_wrapper = payload_data.get(
        "payment",
        {},
    )

    if not isinstance(
        payment_wrapper,
        dict,
    ):
        payment_wrapper = {}

    payment_entity = payment_wrapper.get(
        "entity",
        {},
    )

    if not isinstance(
        payment_entity,
        dict,
    ):
        payment_entity = {}

    razorpay_payment_id = (
        payment_entity.get(
            "id"
        )
    )

    razorpay_order_id = (
        payment_entity.get(
            "order_id"
        )
    )

    # -----------------------------------------------------
    # Find RecoverAI job from persisted order
    # -----------------------------------------------------

    recovery_job = None

    if razorpay_order_id:
        recovery_job = (
            get_recovery_job_by_razorpay_order_id(
                str(
                    razorpay_order_id
                )
            )
        )

    recovery_job_id = (
        str(
            recovery_job["id"]
        )
        if recovery_job
        else None
    )

    # -----------------------------------------------------
    # RESERVE EVENT
    # -----------------------------------------------------
    #
    # Database UNIQUE(event_id) is the final
    # duplicate-delivery protection.
    # -----------------------------------------------------

    webhook_event, created = (
        reserve_webhook_event(
            event_id=event_id,
            event_type=event_type,
            payload=payload,
            razorpay_order_id=(
                str(
                    razorpay_order_id
                )
                if razorpay_order_id
                else None
            ),
            razorpay_payment_id=(
                str(
                    razorpay_payment_id
                )
                if razorpay_payment_id
                else None
            ),
            recovery_job_id=(
                recovery_job_id
            ),
        )
    )

    # -----------------------------------------------------
    # Duplicate event
    # -----------------------------------------------------

    if not created:
        return {
            "received": True,
            "duplicate": True,
            "event_id": event_id,
            "event_type": event_type,
            "processing_status": (
                webhook_event.get(
                    "processing_status"
                )
            ),
        }

    # -----------------------------------------------------
    # Unsupported event
    # -----------------------------------------------------

    if (
        event_type
        != "payment.captured"
    ):
        ignore_webhook_event(
            event_id=event_id,
            reason=(
                "Webhook event type is not "
                "currently processed by RecoverAI."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                str(
                    razorpay_order_id
                )
                if razorpay_order_id
                else None
            ),
            razorpay_payment_id=(
                str(
                    razorpay_payment_id
                )
                if razorpay_payment_id
                else None
            ),
        )

        return {
            "received": True,
            "duplicate": False,
            "event_id": event_id,
            "event_type": event_type,
            "processing_status": "IGNORED",
        }

    # -----------------------------------------------------
    # payment.captured requires identifiers
    # -----------------------------------------------------

    if (
        not razorpay_payment_id
        or not razorpay_order_id
    ):
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "payment.captured payload is missing "
                "payment ID or order ID."
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid payment.captured payload."
            ),
        )

    razorpay_payment_id = str(
        razorpay_payment_id
    )

    razorpay_order_id = str(
        razorpay_order_id
    )

    # -----------------------------------------------------
    # Unknown RecoverAI order
    # -----------------------------------------------------

    if recovery_job is None:
        ignore_webhook_event(
            event_id=event_id,
            reason=(
                "Razorpay order is not associated "
                "with a RecoverAI recovery job."
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        return {
            "received": True,
            "duplicate": False,
            "event_id": event_id,
            "event_type": event_type,
            "processing_status": "IGNORED",
        }

    # -----------------------------------------------------
    # Guardrail validation
    # -----------------------------------------------------

    if (
        recovery_job.get(
            "guardrail_status"
        )
        != "ALLOWED"
    ):
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "Webhook payment belongs to a recovery "
                "job that was not guardrail-approved."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Recovery job was not "
                "guardrail-approved."
            ),
        )

    # -----------------------------------------------------
    # Trusted transaction
    # -----------------------------------------------------

    transaction_id = str(
        recovery_job[
            "transaction_id"
        ]
    )

    transaction = get_transaction(
        transaction_id
    )

    if transaction is None:
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "Persisted RecoverAI transaction "
                "could not be found."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Persisted transaction "
                "could not be found."
            ),
        )

    # -----------------------------------------------------
    # Trusted financial values
    # -----------------------------------------------------

    expected_amount_paise = int(
        transaction[
            "amount_paise"
        ]
    )

    expected_currency = str(
        transaction.get(
            "currency",
            "INR",
        )
    )

    # -----------------------------------------------------
    # Gateway amount
    # -----------------------------------------------------

    try:
        gateway_amount_paise = int(
            payment_entity.get(
                "amount",
                0,
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        gateway_amount_paise = 0

    gateway_currency = str(
        payment_entity.get(
            "currency",
            "",
        )
    )

    gateway_status = str(
        payment_entity.get(
            "status",
            "",
        )
    ).lower()

    # -----------------------------------------------------
    # Persisted order ID must match webhook
    # -----------------------------------------------------

    persisted_order_id = str(
        recovery_job.get(
            "razorpay_order_id"
        )
        or ""
    )

    if (
        razorpay_order_id
        != persisted_order_id
    ):
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "Webhook Razorpay order ID does "
                "not match persisted recovery order."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Webhook order ID mismatch."
            ),
        )

    # -----------------------------------------------------
    # Amount must match
    # -----------------------------------------------------

    if (
        gateway_amount_paise
        != expected_amount_paise
    ):
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "Webhook payment amount does not "
                "match RecoverAI transaction."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Webhook payment amount mismatch."
            ),
        )

    # -----------------------------------------------------
    # Currency must match
    # -----------------------------------------------------

    if (
        gateway_currency
        != expected_currency
    ):
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "Webhook payment currency does "
                "not match RecoverAI transaction."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Webhook payment currency mismatch."
            ),
        )

    # -----------------------------------------------------
    # payment.captured must actually contain CAPTURED
    # -----------------------------------------------------

    if (
        gateway_status
        != "captured"
    ):
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "payment.captured webhook payload "
                "does not contain captured status."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Webhook payment is not captured."
            ),
        )

    # -----------------------------------------------------
    # Payment-level conflict protection
    # -----------------------------------------------------

    existing_payment_id = (
        recovery_job.get(
            "razorpay_payment_id"
        )
    )

    if (
        existing_payment_id
        and str(
            existing_payment_id
        )
        != razorpay_payment_id
    ):
        fail_webhook_event(
            event_id=event_id,
            error_message=(
                "A different Razorpay payment "
                "is already associated with this "
                "recovery job."
            ),
            recovery_job_id=(
                recovery_job_id
            ),
            razorpay_order_id=(
                razorpay_order_id
            ),
            razorpay_payment_id=(
                razorpay_payment_id
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Different payment already "
                "verified for recovery job."
            ),
        )

    # -----------------------------------------------------
    # Persist captured payment
    # -----------------------------------------------------

    save_verified_payment(
        job_id=(
            recovery_job_id
        ),
        razorpay_payment_id=(
            razorpay_payment_id
        ),
        payment_status="captured",
    )

    # -----------------------------------------------------
    # RecoverAI audit event
    # -----------------------------------------------------

    append_audit_event(
        transaction_id=(
            transaction_id
        ),
        recovery_job_id=(
            recovery_job_id
        ),
        step="GATEWAY_WEBHOOK",
        status="SUCCESS",
        message=(
            "Razorpay payment.captured webhook "
            "verified and persisted."
        ),
    )

    # -----------------------------------------------------
    # Mark webhook processed
    # -----------------------------------------------------

    complete_webhook_event(
        event_id=event_id,
        recovery_job_id=(
            recovery_job_id
        ),
        razorpay_order_id=(
            razorpay_order_id
        ),
        razorpay_payment_id=(
            razorpay_payment_id
        ),
    )

    return {
        "received": True,
        "duplicate": False,
        "event_id": event_id,
        "event_type": event_type,
        "processing_status": "PROCESSED",
        "payment_status": "captured",
    }