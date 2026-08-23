import hashlib

from datetime import datetime, timezone
from threading import Lock

from schemas.transaction import (
    ClassificationRequest,
    FailureCode,
    RecoveryStatus,
    GuardrailStatus,
    ExecutionStatus,
    AuditEvent,
    RecoveryExecutionResponse,
)

from services.failure_classifier import classify_failure
from services.recovery_engine import create_recovery_decision
from services.guardrail_engine import evaluate_guardrails


# =========================================================
# TEMPORARY IN-MEMORY STORAGE
# =========================================================
#
# Buildathon / simulation phase only.
#
# AUDIT_STORE:
#     Stores audit events for each transaction.
#
# IDEMPOTENCY_RESULT_STORE:
#     Stores completed results by idempotency key.
#
# IDEMPOTENCY_STATE:
#     Tracks whether an idempotency key is currently
#     executing, completed, or encountered an error.
#
# Later, the storage implementation can move to
# Supabase/PostgreSQL without changing frontend behavior.
# =========================================================

AUDIT_STORE: dict[str, list[AuditEvent]] = {}

IDEMPOTENCY_RESULT_STORE: dict[
    str,
    RecoveryExecutionResponse,
] = {}

IDEMPOTENCY_STATE: dict[str, str] = {}

STORE_LOCK = Lock()


# =========================================================
# SIMULATION CONFIGURATION
# =========================================================
#
# These are SIMULATION values only.
# They are not real merchant recovery rates.
# =========================================================

RETRY_SUCCESS_PROBABILITY = {
    FailureCode.BANK_UNAVAILABLE: 0.72,
    FailureCode.NETWORK_ERROR: 0.82,
    FailureCode.PAYMENT_TIMEOUT: 0.68,
}


RETRY_ACTIONS = {
    "DELAYED_RETRY",
    "SHORT_RETRY",
    "VERIFY_THEN_RETRY",
}


# =========================================================
# CUSTOM EXCEPTION
# =========================================================

class RecoveryAlreadyInProgressError(RuntimeError):
    """
    Raised when the same idempotent recovery attempt
    is already executing.
    """

    pass


# =========================================================
# AUDIT HELPERS
# =========================================================

def create_audit_event(
    step: str,
    status: str,
    message: str,
) -> AuditEvent:
    """
    Create one RecoverAI audit event.
    """

    return AuditEvent(
        step=step,
        status=status,
        message=message,
        timestamp=datetime.now(timezone.utc),
    )


def append_audit_events(
    transaction_id: str,
    events: list[AuditEvent],
) -> None:
    """
    Append audit events instead of replacing
    previous transaction history.
    """

    with STORE_LOCK:
        AUDIT_STORE.setdefault(
            transaction_id,
            [],
        ).extend(events)


# =========================================================
# IDEMPOTENCY HELPERS
# =========================================================

def generate_idempotency_key(
    request: ClassificationRequest,
) -> str:
    """
    Generate a deterministic idempotency key.

    Rule:

        transaction_id
        +
        failure_code
        +
        attempt_number

    retry_count represents attempts already made,
    therefore current attempt number is retry_count + 1.
    """

    attempt_number = request.retry_count + 1

    token = (
        f"{request.transaction_id}:"
        f"{request.failure_code.value}:"
        f"{attempt_number}"
    )

    return hashlib.sha256(
        token.encode()
    ).hexdigest()


def resolve_idempotency_key(
    request: ClassificationRequest,
) -> str:
    """
    Use caller-provided idempotency_key if the request
    schema contains one.

    Otherwise generate one deterministically.
    """

    provided_key = getattr(
        request,
        "idempotency_key",
        None,
    )

    if provided_key:
        return str(provided_key)

    return generate_idempotency_key(request)


def reserve_idempotency_key(
    idempotency_key: str,
) -> RecoveryExecutionResponse | None:
    """
    Reserve the idempotency key BEFORE execution.

    If execution already completed with this key,
    return the existing result.

    If the same recovery is currently executing,
    raise RecoveryAlreadyInProgressError.
    """

    with STORE_LOCK:

        existing_result = IDEMPOTENCY_RESULT_STORE.get(
            idempotency_key
        )

        if existing_result is not None:
            return existing_result

        existing_state = IDEMPOTENCY_STATE.get(
            idempotency_key
        )

        if existing_state == "IN_PROGRESS":
            raise RecoveryAlreadyInProgressError(
                (
                    "A recovery attempt with this "
                    "idempotency key is already in progress."
                )
            )

        if existing_state == "ERROR":
            raise RecoveryAlreadyInProgressError(
                (
                    "This recovery attempt previously entered "
                    "an ambiguous error state. "
                    "Automatic re-execution is blocked."
                )
            )

        IDEMPOTENCY_STATE[
            idempotency_key
        ] = "IN_PROGRESS"

    return None


def finalize_idempotency(
    idempotency_key: str,
    response: RecoveryExecutionResponse,
) -> None:
    """
    Store the completed recovery result.
    """

    with STORE_LOCK:

        IDEMPOTENCY_RESULT_STORE[
            idempotency_key
        ] = response

        IDEMPOTENCY_STATE[
            idempotency_key
        ] = "COMPLETED"


def mark_idempotency_error(
    idempotency_key: str,
) -> None:
    """
    Preserve the idempotency reservation when an
    unexpected execution error occurs.

    This prevents a blind duplicate execution.
    """

    with STORE_LOCK:
        IDEMPOTENCY_STATE[
            idempotency_key
        ] = "ERROR"


# =========================================================
# DETERMINISTIC SIMULATION
# =========================================================

def simulate_retry_success(
    transaction_id: str,
    failure_code: FailureCode,
) -> tuple[bool, float]:
    """
    Simulate recovery deterministically.

    The same transaction ID + failure code always
    produces the same simulated result.
    """

    probability = RETRY_SUCCESS_PROBABILITY.get(
        failure_code,
        0.50,
    )

    token = (
        f"{transaction_id}:"
        f"{failure_code.value}"
    )

    digest = hashlib.sha256(
        token.encode()
    ).hexdigest()

    score = (
        int(digest[:8], 16) % 100
    ) / 100

    success = score < probability

    return success, probability


# =========================================================
# RESPONSE FINALIZATION
# =========================================================

def finalize_response(
    transaction_id: str,
    idempotency_key: str,
    response: RecoveryExecutionResponse,
    events: list[AuditEvent],
) -> RecoveryExecutionResponse:
    """
    Persist audit events and idempotency result
    before returning.
    """

    append_audit_events(
        transaction_id,
        events,
    )

    finalize_idempotency(
        idempotency_key,
        response,
    )

    return response


# =========================================================
# MAIN RECOVERY EXECUTOR
# =========================================================

def execute_recovery(
    request: ClassificationRequest,
) -> RecoveryExecutionResponse:
    """
    Execute one RecoverAI recovery attempt.

    Flow:

        IDEMPOTENCY
            ↓
        DETECT
            ↓
        CLASSIFY
            ↓
        DECIDE
            ↓
        GUARDRAIL
            ↓
        EXECUTE
            ↓
        VERIFY
            ↓
        AUDIT

    Guardrails are evaluated exactly once
    for this execution attempt.
    """

    # =====================================================
    # IDEMPOTENCY
    # =====================================================

    idempotency_key = resolve_idempotency_key(
        request
    )

    existing_result = reserve_idempotency_key(
        idempotency_key
    )

    if existing_result is not None:
        return existing_result

    events: list[AuditEvent] = []

    try:

        # =================================================
        # STEP 1 — DETECT
        # =================================================

        events.append(
            create_audit_event(
                step="DETECT",
                status="SUCCESS",
                message=(
                    "Payment failure detected: "
                    f"{request.failure_code.value}"
                ),
            )
        )

        # =================================================
        # STEP 2 — CLASSIFY
        # =================================================

        classification = classify_failure(
            request
        )

        events.append(
            create_audit_event(
                step="CLASSIFY",
                status="SUCCESS",
                message=(
                    "Failure classified as "
                    f"{classification.category} "
                    "with "
                    f"{classification.confidence:.0%} "
                    "confidence."
                ),
            )
        )

        # =================================================
        # STEP 3 — DECIDE
        # =================================================

        recovery = create_recovery_decision(
            request
        )

        events.append(
            create_audit_event(
                step="DECIDE",
                status="SUCCESS",
                message=(
                    "Recovery action selected: "
                    f"{recovery.action}"
                ),
            )
        )

        # =================================================
        # STEP 4 — GUARDRAIL
        # =================================================
        #
        # IMPORTANT:
        # evaluate_guardrails() is called exactly once.
        #
        # The already-created recovery decision is passed
        # so recovery_engine is not called twice.
        # =================================================

        guardrail = evaluate_guardrails(
            request=request,
            recovery=recovery,
        )

        events.append(
            create_audit_event(
                step="GUARDRAIL",
                status=guardrail.status.value,
                message=guardrail.reason,
            )
        )

        # =================================================
        # BLOCKED / REVIEW REQUIRED
        # =================================================

        if not guardrail.can_execute:

            if (
                guardrail.status
                == GuardrailStatus.REVIEW_REQUIRED
            ):
                execution_status = (
                    ExecutionStatus.REVIEW_REQUIRED
                )
            else:
                execution_status = (
                    ExecutionStatus.BLOCKED
                )

            response = RecoveryExecutionResponse(
                transaction_id=request.transaction_id,
                amount=request.amount,

                failure_code=request.failure_code,
                category=classification.category,

                action=recovery.action,
                confidence=recovery.confidence,

                guardrail_status=guardrail.status,
                can_execute=False,

                execution_status=execution_status,

                recovered_amount=0,

                simulation_probability=None,

                execution_mode="SIMULATION",

                audit_trail=events,
            )

            # ------------------------------------------------
            # Important:
            #
            # No EXECUTE event
            # No VERIFY event
            #
            # because the workflow actually stopped
            # at GUARDRAIL.
            # ------------------------------------------------

            return finalize_response(
                transaction_id=request.transaction_id,
                idempotency_key=idempotency_key,
                response=response,
                events=events,
            )

        # =================================================
        # STEP 5 — EXECUTE RETRY ACTION
        # =================================================

        if recovery.action in RETRY_ACTIONS:

            events.append(
                create_audit_event(
                    step="EXECUTE",
                    status="RUNNING",
                    message=(
                        "Executing simulated "
                        f"{recovery.action.lower().replace('_', ' ')}."
                    ),
                )
            )

            success, probability = (
                simulate_retry_success(
                    transaction_id=request.transaction_id,
                    failure_code=request.failure_code,
                )
            )

            # =============================================
            # STEP 6 — VERIFY
            # =============================================

            if success:

                recovered_amount = request.amount

                execution_status = (
                    ExecutionStatus.RECOVERED
                )

                events.append(
                    create_audit_event(
                        step="VERIFY",
                        status="SUCCESS",
                        message=(
                            "Payment recovery verified. "
                            f"₹{request.amount:,.2f} "
                            "recovered."
                        ),
                    )
                )

            else:

                recovered_amount = 0

                execution_status = (
                    ExecutionStatus.FAILED
                )

                events.append(
                    create_audit_event(
                        step="VERIFY",
                        status="FAILED",
                        message=(
                            "The simulated retry did not "
                            "recover the payment."
                        ),
                    )
                )

        # =================================================
        # CUSTOMER ACTION WORKFLOW
        # =================================================

        elif (
            recovery.status
            == RecoveryStatus.CUSTOMER_ACTION_REQUIRED
        ):

            probability = None
            recovered_amount = 0

            execution_status = (
                ExecutionStatus.ACTION_COMPLETED
            )

            events.append(
                create_audit_event(
                    step="EXECUTE",
                    status="SUCCESS",
                    message=(
                        "Customer recovery action initiated: "
                        f"{recovery.action}"
                    ),
                )
            )

            events.append(
                create_audit_event(
                    step="VERIFY",
                    status="PENDING",
                    message=(
                        "Waiting for customer action "
                        "before revenue can be recovered."
                    ),
                )
            )

        # =================================================
        # SAFE FALLBACK
        # =================================================

        else:

            probability = None
            recovered_amount = 0

            execution_status = (
                ExecutionStatus.FAILED
            )

            events.append(
                create_audit_event(
                    step="EXECUTE",
                    status="FAILED",
                    message=(
                        "No executable recovery action "
                        "was available."
                    ),
                )
            )

            events.append(
                create_audit_event(
                    step="VERIFY",
                    status="FAILED",
                    message=(
                        "Recovery could not be verified "
                        "because no valid execution "
                        "action was completed."
                    ),
                )
            )

        # =================================================
        # FINAL RESPONSE
        # =================================================

        response = RecoveryExecutionResponse(
            transaction_id=request.transaction_id,
            amount=request.amount,

            failure_code=request.failure_code,
            category=classification.category,

            action=recovery.action,
            confidence=recovery.confidence,

            guardrail_status=guardrail.status,
            can_execute=guardrail.can_execute,

            execution_status=execution_status,

            recovered_amount=recovered_amount,

            simulation_probability=probability,

            execution_mode="SIMULATION",

            audit_trail=events,
        )

        return finalize_response(
            transaction_id=request.transaction_id,
            idempotency_key=idempotency_key,
            response=response,
            events=events,
        )

    except Exception as exc:

        # =================================================
        # ERROR HANDLING
        # =================================================
        #
        # Do not silently catch execution errors.
        #
        # Preserve idempotency state so an ambiguous
        # operation cannot simply execute again.
        # =================================================

        events.append(
            create_audit_event(
                step="ERROR",
                status="FAILED",
                message=(
                    "Recovery execution encountered "
                    "an internal error: "
                    f"{type(exc).__name__}"
                ),
            )
        )

        append_audit_events(
            transaction_id=request.transaction_id,
            events=events,
        )

        mark_idempotency_error(
            idempotency_key
        )

        raise


# =========================================================
# AUDIT READ
# =========================================================

def get_audit_trail(
    transaction_id: str,
) -> list[AuditEvent]:
    """
    Return a copy of the transaction's audit events.
    """

    with STORE_LOCK:

        events = AUDIT_STORE.get(
            transaction_id,
            [],
        )

        return list(events)


# =========================================================
# IDEMPOTENCY READ
# =========================================================

def get_idempotency_result(
    idempotency_key: str,
) -> RecoveryExecutionResponse | None:
    """
    Return previously completed idempotent result.
    Useful for testing and debugging.
    """

    with STORE_LOCK:

        return IDEMPOTENCY_RESULT_STORE.get(
            idempotency_key
        )


# =========================================================
# IDEMPOTENCY STATE READ
# =========================================================

def get_idempotency_state(
    idempotency_key: str,
) -> str | None:
    """
    Return the current state of an idempotency key.
    """

    with STORE_LOCK:

        return IDEMPOTENCY_STATE.get(
            idempotency_key
        )