from schemas.transaction import (
    ClassificationRequest,
    ClassificationResult,
    FailureCode,
)


# =========================================================
# DETERMINISTIC FAILURE CLASSIFICATION RULES
# =========================================================

FAILURE_RULES = {

    # -----------------------------------------------------
    # BANK UNAVAILABLE
    # -----------------------------------------------------

    FailureCode.BANK_UNAVAILABLE: {
        "category": "TRANSIENT_BANK_FAILURE",
        "retryable": True,
        "severity": "medium",
        "recommended_action": "DELAYED_RETRY",
        "retry_delay_minutes": 30,
        "confidence": 0.94,
        "explanation": (
            "The customer's bank appears temporarily unavailable. "
            "RecoverAI recommends a delayed retry after the "
            "configured retry delay."
        ),
    },

    # -----------------------------------------------------
    # NETWORK ERROR
    # -----------------------------------------------------

    FailureCode.NETWORK_ERROR: {
        "category": "TRANSIENT_NETWORK_FAILURE",
        "retryable": True,
        "severity": "low",
        "recommended_action": "SHORT_RETRY",
        "retry_delay_minutes": 5,
        "confidence": 0.96,
        "explanation": (
            "The failure appears network-related and may resolve quickly. "
            "A short delayed retry is recommended."
        ),
    },

    # -----------------------------------------------------
    # PAYMENT TIMEOUT
    # -----------------------------------------------------

    FailureCode.PAYMENT_TIMEOUT: {
        "category": "TRANSIENT_TIMEOUT",
        "retryable": True,
        "severity": "medium",
        "recommended_action": "VERIFY_THEN_RETRY",
        "retry_delay_minutes": 10,
        "confidence": 0.91,
        "explanation": (
            "The payment timed out. The payment status should first be "
            "verified before attempting another charge."
        ),
    },

    # -----------------------------------------------------
    # INSUFFICIENT FUNDS
    # -----------------------------------------------------

    FailureCode.INSUFFICIENT_FUNDS: {
        "category": "CUSTOMER_FUNDS",
        "retryable": True,
        "severity": "medium",
        "recommended_action": "CUSTOMER_REMINDER",
        "retry_delay_minutes": 1440,
        "confidence": 0.97,
        "explanation": (
            "Immediate retries are unlikely to succeed because the account "
            "has insufficient funds. Notify the customer and retry later."
        ),
    },

    # -----------------------------------------------------
    # MANDATE FAILURE
    # -----------------------------------------------------

    FailureCode.MANDATE_FAILURE: {
        "category": "AUTHORIZATION_FAILURE",
        "retryable": False,
        "severity": "high",
        "recommended_action": "REQUEST_NEW_PAYMENT_METHOD",
        "retry_delay_minutes": None,
        "confidence": 0.95,
        "explanation": (
            "The payment mandate failed or is no longer usable. "
            "The customer should provide a valid payment method."
        ),
    },

    # -----------------------------------------------------
    # CUSTOMER ABANDONED
    # -----------------------------------------------------

    FailureCode.CUSTOMER_ABANDONED: {
        "category": "CHECKOUT_ABANDONMENT",
        "retryable": False,
        "severity": "low",
        "recommended_action": "SEND_CHECKOUT_REMINDER",
        "retry_delay_minutes": None,
        "confidence": 0.90,
        "explanation": (
            "The customer exited before completing payment. "
            "A checkout recovery reminder is more appropriate than "
            "automatically retrying."
        ),
    },

    # -----------------------------------------------------
    # ISSUER DECLINED
    # -----------------------------------------------------

    FailureCode.ISSUER_DECLINED: {
        "category": "HARD_DECLINE",
        "retryable": False,
        "severity": "high",
        "recommended_action": "ALTERNATIVE_PAYMENT_METHOD",
        "retry_delay_minutes": None,
        "confidence": 0.96,
        "explanation": (
            "The issuer declined the payment. Automatic repeated retries "
            "could be ineffective, so an alternative payment method "
            "should be requested."
        ),
    },

    # -----------------------------------------------------
    # UNKNOWN ERROR
    # -----------------------------------------------------

    FailureCode.UNKNOWN_ERROR: {
        "category": "UNKNOWN",
        "retryable": False,
        "severity": "high",
        "recommended_action": "MANUAL_REVIEW",
        "retry_delay_minutes": None,
        "confidence": 0.55,
        "explanation": (
            "The failure could not be classified confidently. "
            "The transaction should be escalated for manual review."
        ),
    },
}


# =========================================================
# CLASSIFIER
# =========================================================

def classify_failure(
    request: ClassificationRequest,
) -> ClassificationResult:
    """
    Deterministically classify a failed payment.

    No LLM or external AI provider is involved here.

    The classifier is the authoritative source for:

    - failure category
    - retryability
    - severity
    - proposed recovery action
    - retry delay
    - confidence
    - deterministic explanation
    """

    rule = FAILURE_RULES.get(
        request.failure_code,
        FAILURE_RULES[
            FailureCode.UNKNOWN_ERROR
        ],
    )

    return ClassificationResult(
        transaction_id=(
            request.transaction_id
        ),

        failure_code=(
            request.failure_code
        ),

        category=(
            rule["category"]
        ),

        retryable=(
            rule["retryable"]
        ),

        severity=(
            rule["severity"]
        ),

        recommended_action=(
            rule["recommended_action"]
        ),

        retry_delay_minutes=(
            rule["retry_delay_minutes"]
        ),

        confidence=(
            rule["confidence"]
        ),

        explanation=(
            rule["explanation"]
        ),
    )