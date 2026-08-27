from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from schemas.razorpay import (
    RazorpayRecoveryOrderRequest,
    RazorpayRecoveryOrderResponse,
    RazorpayVerifyPaymentRequest,
    RazorpayVerifyPaymentResponse,
    RazorpayReconcilePaymentRequest,
    RazorpayReconcilePaymentResponse,
)

from services.persistence_service import (
    get_recovery_job,
    get_transaction,
    save_razorpay_order,
    save_verified_payment,
)

from services.razorpay_service import (
    RazorpayConfigurationError,
    RazorpayVerificationError,
    create_test_order,
    fetch_payment,
    fetch_order_payments,
    get_razorpay_key_id,
    razorpay_enabled,
    verify_payment_signature,
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
) -> RazorpayRecoveryOrderResponse:

    # -----------------------------------------------------
    # Razorpay integration must be explicitly enabled
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
    # Load trusted recovery job
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
    # RecoverAI guardrail boundary
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
    # Persistent execution safety
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

    # -----------------------------------------------------
    # Amount is loaded from backend persistence.
    #
    # Frontend never decides the amount.
    # -----------------------------------------------------

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
    # Razorpay order idempotency
    # -----------------------------------------------------
    #
    # If this RecoverAI recovery job already owns a
    # Razorpay order, return it instead of creating
    # another order.
    # -----------------------------------------------------

    existing_order_id = job.get(
        "razorpay_order_id"
    )

    if existing_order_id:
        return RazorpayRecoveryOrderResponse(
            recovery_job_id=str(job["id"]),
            razorpay_order_id=existing_order_id,
            amount_paise=amount_paise,
            currency=currency,
            status=(
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

    # -----------------------------------------------------
    # Validate Razorpay response
    # -----------------------------------------------------

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
    # Persist Razorpay order
    # -----------------------------------------------------

    save_razorpay_order(
        job_id=str(job["id"]),
        razorpay_order_id=razorpay_order_id,
        order_status=order_status,
    )

    return RazorpayRecoveryOrderResponse(
        recovery_job_id=str(job["id"]),
        razorpay_order_id=razorpay_order_id,
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
) -> RazorpayVerifyPaymentResponse:

    # -----------------------------------------------------
    # Razorpay must be enabled
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
    # Load trusted recovery job
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
                "Payment verification blocked because "
                "this recovery job was not approved by "
                "RecoverAI guardrails."
            ),
        )

    # -----------------------------------------------------
    # Persisted order is authoritative
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

    # -----------------------------------------------------
    # Browser order ID must match persisted order
    # -----------------------------------------------------

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

        if existing_payment_status != "captured":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Persisted Razorpay payment "
                    "is not in captured state."
                ),
            )

        return RazorpayVerifyPaymentResponse(
            recovery_job_id=str(job["id"]),
            razorpay_order_id=persisted_order_id,
            razorpay_payment_id=existing_payment_id,
            payment_status="captured",
            verified=True,
            execution_mode="RAZORPAY_TEST",
        )

    # -----------------------------------------------------
    # Verify Razorpay checkout signature
    # -----------------------------------------------------
    #
    # IMPORTANT:
    #
    # We use persisted_order_id instead of trusting
    # the order ID provided by the browser.
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
    # Independently fetch payment from Razorpay
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
    # Verify payment → order relationship
    # -----------------------------------------------------

    gateway_order_id = payment.get(
        "order_id"
    )

    if gateway_order_id != persisted_order_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay payment belongs to "
                "a different order."
            ),
        )

    # -----------------------------------------------------
    # Load trusted transaction
    # -----------------------------------------------------

    transaction = get_transaction(
        job["transaction_id"]
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Persisted transaction could "
                "not be found."
            ),
        )

    # -----------------------------------------------------
    # Verify amount
    # -----------------------------------------------------

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
    # Verify currency
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

    if gateway_currency != expected_currency:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Razorpay payment currency does "
                "not match RecoverAI transaction."
            ),
        )

    # -----------------------------------------------------
    # Verify captured status
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
    # Persist verified gateway payment
    # -----------------------------------------------------

    save_verified_payment(
        job_id=str(job["id"]),
        razorpay_payment_id=(
            request.razorpay_payment_id
        ),
        payment_status=payment_status,
    )

    # -----------------------------------------------------
    # Return verified result
    # -----------------------------------------------------

    return RazorpayVerifyPaymentResponse(
        recovery_job_id=str(job["id"]),
        razorpay_order_id=persisted_order_id,
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
#
# This endpoint handles an important real-world case:
#
# Razorpay payment succeeds
#        ↓
# browser callback / verification call fails
#        ↓
# RecoverAI independently asks Razorpay for payments
# belonging to the persisted order
#        ↓
# captured payment discovered
#        ↓
# amount + currency + order verified
#        ↓
# verified payment persisted
#
# Frontend supplies ONLY recovery_job_id.
# =========================================================

@router.post(
    "/reconcile-payment",
    response_model=RazorpayReconcilePaymentResponse,
)
def reconcile_recovery_payment(
    request: RazorpayReconcilePaymentRequest,
) -> RazorpayReconcilePaymentResponse:

    # -----------------------------------------------------
    # Razorpay must be enabled
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
    # Load trusted recovery job
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
    # RecoverAI guardrail boundary
    # -----------------------------------------------------

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
    # Persisted order is authoritative
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

    # -----------------------------------------------------
    # Load trusted RecoverAI transaction
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
    # Reconciliation idempotency
    # -----------------------------------------------------
    #
    # If the job already has a captured payment,
    # simply return the trusted persisted result.
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
        and existing_payment_status == "captured"
    ):
        return RazorpayReconcilePaymentResponse(
            recovery_job_id=str(job["id"]),
            transaction_id=transaction_id,
            razorpay_order_id=order_id,
            razorpay_payment_id=(
                existing_payment_id
            ),
            amount_paise=(
                expected_amount_paise
            ),
            currency=expected_currency,
            payment_status="captured",
            reconciled=True,
            execution_mode="RAZORPAY_TEST",
        )

    # -----------------------------------------------------
    # Fetch all payment attempts directly from Razorpay
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
    # Find captured payments that match every trusted field
    # -----------------------------------------------------

    matching_payments: list[dict] = []

    for payment in payments:

        if not isinstance(
            payment,
            dict,
        ):
            continue

        # -----------------------------------------------
        # Payment must be captured
        # -----------------------------------------------

        payment_status = str(
            payment.get(
                "status",
                "",
            )
        ).lower()

        if payment_status != "captured":
            continue

        # -----------------------------------------------
        # Payment must belong to our persisted order
        # -----------------------------------------------

        if (
            payment.get("order_id")
            != order_id
        ):
            continue

        # -----------------------------------------------
        # Amount must match trusted transaction
        # -----------------------------------------------

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

        # -----------------------------------------------
        # Currency must match trusted transaction
        # -----------------------------------------------

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

        # -----------------------------------------------
        # Payment must have an ID
        # -----------------------------------------------

        payment_id = payment.get(
            "id"
        )

        if not payment_id:
            continue

        matching_payments.append(
            payment
        )

    # -----------------------------------------------------
    # No safely matching payment found
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
    # Fail closed on ambiguous multiple captures
    # -----------------------------------------------------

    if len(matching_payments) > 1:
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
        matching_payment["status"]
    ).lower()

    # -----------------------------------------------------
    # Persist independently verified gateway state
    # -----------------------------------------------------

    save_verified_payment(
        job_id=str(job["id"]),
        razorpay_payment_id=payment_id,
        payment_status=payment_status,
    )

    # -----------------------------------------------------
    # Return reconciliation result
    # -----------------------------------------------------

    return RazorpayReconcilePaymentResponse(
        recovery_job_id=str(job["id"]),
        transaction_id=transaction_id,
        razorpay_order_id=order_id,
        razorpay_payment_id=payment_id,
        amount_paise=expected_amount_paise,
        currency=expected_currency,
        payment_status=payment_status,
        reconciled=True,
        execution_mode="RAZORPAY_TEST",
    )