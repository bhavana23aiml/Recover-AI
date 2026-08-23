from schemas.transaction import (
    ClassificationRequest,
    FailureCode,
    GuardrailStatus,
    ExecutionStatus,
)

from services.recovery_executor import (
    execute_recovery,
    get_audit_trail,
    AUDIT_STORE,
    IDEMPOTENCY_RESULT_STORE,
    IDEMPOTENCY_STATE,
)


# =========================================================
# TEST ISOLATION
# =========================================================

def setup_function():
    """
    Clear temporary in-memory stores before every test.

    This ensures one test cannot affect another test.
    """

    AUDIT_STORE.clear()
    IDEMPOTENCY_RESULT_STORE.clear()
    IDEMPOTENCY_STATE.clear()


# =========================================================
# TEST 1 — SUCCESSFUL RECOVERY
# =========================================================

def test_successful_recovery():
    request = ClassificationRequest(
        transaction_id="RX18492",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    result = execute_recovery(request)

    assert result.guardrail_status == GuardrailStatus.ALLOWED
    assert result.can_execute is True

    assert result.execution_status == ExecutionStatus.RECOVERED
    assert result.recovered_amount == 7499

    assert result.execution_mode == "SIMULATION"

    steps = [
        event.step
        for event in result.audit_trail
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
        "EXECUTE",
        "VERIFY",
    ]


# =========================================================
# TEST 2 — MAX RETRY BLOCK
# =========================================================

def test_max_retry_is_blocked():
    request = ClassificationRequest(
        transaction_id="RX20117",
        amount=68000,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=2,
    )

    result = execute_recovery(request)

    assert result.guardrail_status == GuardrailStatus.BLOCKED
    assert result.can_execute is False

    assert result.execution_status == ExecutionStatus.BLOCKED
    assert result.recovered_amount == 0


# =========================================================
# TEST 3 — BLOCKED FLOW MUST NOT EXECUTE
# =========================================================

def test_blocked_recovery_stops_before_execution():
    request = ClassificationRequest(
        transaction_id="RX-BLOCK-001",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=2,
    )

    result = execute_recovery(request)

    steps = [
        event.step
        for event in result.audit_trail
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
    ]

    assert "EXECUTE" not in steps
    assert "VERIFY" not in steps


# =========================================================
# TEST 4 — IDEMPOTENCY
# =========================================================

def test_duplicate_request_is_idempotent():
    request = ClassificationRequest(
        transaction_id="RX-IDEMPOTENT-001",
        amount=7499,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    first_result = execute_recovery(request)
    second_result = execute_recovery(request)

    # Same stored result should be returned.
    assert (
        first_result.model_dump()
        == second_result.model_dump()
    )

    audit_events = get_audit_trail(
        "RX-IDEMPOTENT-001"
    )

    # The workflow must NOT execute twice.
    assert len(audit_events) == len(
        first_result.audit_trail
    )


# =========================================================
# TEST 5 — HIGH VALUE TRANSACTION
# =========================================================

def test_high_value_recovery_requires_review():
    request = ClassificationRequest(
        transaction_id="RX-HIGHVALUE-001",
        amount=68000,
        failure_code=FailureCode.BANK_UNAVAILABLE,
        retry_count=0,
    )

    result = execute_recovery(request)

    assert (
        result.guardrail_status
        == GuardrailStatus.REVIEW_REQUIRED
    )

    assert result.can_execute is False

    assert (
        result.execution_status
        == ExecutionStatus.REVIEW_REQUIRED
    )

    assert result.recovered_amount == 0

    steps = [
        event.step
        for event in result.audit_trail
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
    ]


# =========================================================
# TEST 6 — UNKNOWN FAILURE / MANUAL REVIEW
# =========================================================

def test_unknown_failure_requires_manual_review():
    request = ClassificationRequest(
        transaction_id="RX-UNKNOWN-001",
        amount=2500,
        failure_code=FailureCode.UNKNOWN_ERROR,
        retry_count=0,
    )

    result = execute_recovery(request)

    assert (
        result.guardrail_status
        == GuardrailStatus.REVIEW_REQUIRED
    )

    assert result.can_execute is False

    assert (
        result.execution_status
        == ExecutionStatus.REVIEW_REQUIRED
    )

    assert result.recovered_amount == 0

    steps = [
        event.step
        for event in result.audit_trail
    ]

    assert steps == [
        "DETECT",
        "CLASSIFY",
        "DECIDE",
        "GUARDRAIL",
    ]

    assert "EXECUTE" not in steps
    assert "VERIFY" not in steps