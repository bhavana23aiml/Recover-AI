from schemas.transaction import (
    ClassificationRequest,
    RecoveryDecision,
    RecoveryStatus,
)

from services.failure_classifier import classify_failure


RETRY_ACTIONS = {
    "DELAYED_RETRY",
    "SHORT_RETRY",
    "VERIFY_THEN_RETRY",
}


CUSTOMER_ACTIONS = {
    "CUSTOMER_REMINDER",
    "SEND_CHECKOUT_REMINDER",
    "REQUEST_NEW_PAYMENT_METHOD",
    "ALTERNATIVE_PAYMENT_METHOD",
}


def create_recovery_decision(
    request: ClassificationRequest,
) -> RecoveryDecision:
    """
    Convert a classified payment failure into a structured
    RecoverAI recovery decision.

    Dependency direction:

        failure_classifier
              ↓
        recovery_engine

    This service must not import guardrail_engine
    or recovery_executor.
    """

    classification = classify_failure(request)

    action = classification.recommended_action

    # -----------------------------------------------------
    # RETRY-BASED RECOVERY
    # -----------------------------------------------------

    if action in RETRY_ACTIONS:

        status = RecoveryStatus.RETRY_SCHEDULED

        reason = (
            f"{classification.explanation} "
            "RecoverAI recommends "
            f"{action.lower().replace('_', ' ')}."
        )

    # -----------------------------------------------------
    # CUSTOMER ACTION REQUIRED
    # -----------------------------------------------------

    elif action in CUSTOMER_ACTIONS:

        status = RecoveryStatus.CUSTOMER_ACTION_REQUIRED

        reason = (
            f"{classification.explanation} "
            "Customer intervention is required "
            "before recovery can continue."
        )

    # -----------------------------------------------------
    # MANUAL REVIEW
    # -----------------------------------------------------

    elif action == "MANUAL_REVIEW":

        status = RecoveryStatus.MANUAL_REVIEW

        reason = (
            f"{classification.explanation} "
            "RecoverAI will not automatically act "
            "on this transaction."
        )

    # -----------------------------------------------------
    # SAFE FALLBACK
    # -----------------------------------------------------

    else:

        status = RecoveryStatus.STOPPED

        reason = (
            "RecoverAI could not determine a safe "
            "automated recovery action. "
            "The workflow has been stopped."
        )

    return RecoveryDecision(
        transaction_id=request.transaction_id,
        amount=request.amount,
        failure_code=request.failure_code,
        category=classification.category,
        action=action,
        status=status,
        retryable=classification.retryable,
        retry_delay_minutes=classification.retry_delay_minutes,
        confidence=classification.confidence,
        reason=reason,
    )