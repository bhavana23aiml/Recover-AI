from schemas.transaction import (
    ClassificationRequest,
    GuardrailDecision,
    GuardrailStatus,
    RecoveryDecision,
    RecoveryStatus,
)

from services.recovery_engine import create_recovery_decision

from core.config import (
    MAX_RETRIES,
    MIN_CONFIDENCE_AUTO_EXECUTE,
    MIN_CONFIDENCE_ANY_ACTION,
    MAX_RECOVERABLE_AMOUNT_AUTO,
)


# ---------------------------------------------------------
# RECOVERAI RETRY ACTIONS
# ---------------------------------------------------------
# Only these actions actually retry a payment.
# Therefore MAX_RETRIES applies specifically to them.
# ---------------------------------------------------------

RETRY_ACTIONS = {
    "DELAYED_RETRY",
    "SHORT_RETRY",
    "VERIFY_THEN_RETRY",
}


def evaluate_guardrails(
    request: ClassificationRequest,
    recovery: RecoveryDecision | None = None,
) -> GuardrailDecision:
    """
    Evaluate RecoverAI safety guardrails for one recovery attempt.

    Important:
    - The executor should pass its already-created RecoveryDecision.
    - This prevents the recovery decision from being generated twice.
    - Guardrails are evaluated exactly once per execution attempt.
    """

    if recovery is None:
        recovery = create_recovery_decision(request)

    blocking_violations: list[str] = []
    review_violations: list[str] = []

    # =====================================================
    # HARD BLOCK RULES
    # =====================================================

    # -----------------------------------------------------
    # RULE 1 — MINIMUM CONFIDENCE FLOOR
    # -----------------------------------------------------
    # Confidence below this value is too uncertain even
    # for automatic/manual recovery continuation.
    # -----------------------------------------------------

    if recovery.confidence < MIN_CONFIDENCE_ANY_ACTION:
        blocking_violations.append(
            (
                "Recovery confidence is below the minimum safe "
                "confidence required for any automated recovery action."
            )
        )

    # -----------------------------------------------------
    # RULE 2 — MAXIMUM RETRY LIMIT
    # -----------------------------------------------------
    # Retry limits apply only to actions that retry payment.
    # -----------------------------------------------------

    if (
        recovery.action in RETRY_ACTIONS
        and request.retry_count >= MAX_RETRIES
    ):
        blocking_violations.append(
            (
                f"Maximum retry limit of {MAX_RETRIES} "
                "has already been reached."
            )
        )

    # -----------------------------------------------------
    # RULE 3 — RECOVERY ENGINE STOPPED
    # -----------------------------------------------------

    if recovery.status == RecoveryStatus.STOPPED:
        blocking_violations.append(
            (
                "Recovery engine did not identify "
                "a safe recovery strategy."
            )
        )

    # -----------------------------------------------------
    # RETURN BLOCKED
    # -----------------------------------------------------
    # Hard blocking rules take priority over manual-review
    # conditions.
    # -----------------------------------------------------

    if blocking_violations:
        return GuardrailDecision(
            transaction_id=request.transaction_id,
            proposed_action=recovery.action,

            status=GuardrailStatus.BLOCKED,
            can_execute=False,

            retry_count=request.retry_count,
            max_retries=MAX_RETRIES,

            confidence=recovery.confidence,
            minimum_confidence=MIN_CONFIDENCE_AUTO_EXECUTE,

            violations=blocking_violations,

            reason=(
                "RecoverAI blocked this recovery attempt because: "
                + " ".join(blocking_violations)
            ),
        )

    # =====================================================
    # MANUAL REVIEW RULES
    # =====================================================

    # -----------------------------------------------------
    # RULE 4 — RECOVERY ENGINE REQUESTED MANUAL REVIEW
    # -----------------------------------------------------

    if recovery.status == RecoveryStatus.MANUAL_REVIEW:
        review_violations.append(
            "Recovery engine explicitly requested manual review."
        )

    # -----------------------------------------------------
    # RULE 5 — AUTO-EXECUTION CONFIDENCE THRESHOLD
    # -----------------------------------------------------
    # Confidence may be high enough for consideration,
    # but not high enough for automatic execution.
    # -----------------------------------------------------

    if recovery.confidence < MIN_CONFIDENCE_AUTO_EXECUTE:
        review_violations.append(
            (
                "Recovery confidence is below the "
                "automatic execution threshold."
            )
        )

    # -----------------------------------------------------
    # RULE 6 — HIGH VALUE TRANSACTION
    # -----------------------------------------------------

    if request.amount > MAX_RECOVERABLE_AMOUNT_AUTO:
        review_violations.append(
            (
                f"Transaction amount ₹{request.amount:,.2f} "
                "exceeds the automatic recovery amount threshold."
            )
        )

    # -----------------------------------------------------
    # RETURN REVIEW REQUIRED
    # -----------------------------------------------------

    if review_violations:
        return GuardrailDecision(
            transaction_id=request.transaction_id,
            proposed_action=recovery.action,

            status=GuardrailStatus.REVIEW_REQUIRED,
            can_execute=False,

            retry_count=request.retry_count,
            max_retries=MAX_RETRIES,

            confidence=recovery.confidence,
            minimum_confidence=MIN_CONFIDENCE_AUTO_EXECUTE,

            violations=review_violations,

            reason=(
                "RecoverAI requires manual review because: "
                + " ".join(review_violations)
            ),
        )

    # =====================================================
    # SAFE TO EXECUTE
    # =====================================================

    return GuardrailDecision(
        transaction_id=request.transaction_id,
        proposed_action=recovery.action,

        status=GuardrailStatus.ALLOWED,
        can_execute=True,

        retry_count=request.retry_count,
        max_retries=MAX_RETRIES,

        confidence=recovery.confidence,
        minimum_confidence=MIN_CONFIDENCE_AUTO_EXECUTE,

        violations=[],

        reason=(
            "The proposed recovery action satisfies "
            "all currently enforced RecoverAI safety guardrails."
        ),
    )