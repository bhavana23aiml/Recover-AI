from fastapi import (
    FastAPI,
    HTTPException,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from routers.razorpay import (
    router as razorpay_router,
)

from routers.ai import (
    router as ai_router,
)

from schemas.transaction import (
    AuditEvent,
    ClassificationRequest,
    ClassificationResult,
    FailureCode,
    GuardrailDecision,
    RecoveryDecision,
    RecoveryExecutionResponse,
)

from services.failure_classifier import (
    classify_failure,
)

from services.recovery_engine import (
    create_recovery_decision,
)

from services.guardrail_engine import (
    evaluate_guardrails,
)

from services.recovery_executor import (
    execute_recovery,
    get_audit_trail,
)


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="RecoverAI API",
    description=(
        "AI-powered revenue recovery platform"
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================
#
# Allow the local Vite frontend to communicate
# with the FastAPI backend during development.
#
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# =========================================================
# ROUTERS
# =========================================================
#
# AI and Razorpay intentionally remain separate.
#
# /api/ai/*
#     explanation only
#
# /api/razorpay/*
#     Razorpay Test Mode gateway operations
#
# =========================================================

app.include_router(
    ai_router
)

app.include_router(
    razorpay_router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message":
            "RecoverAI backend is running",

        "status":
            "healthy",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():
    return {
        "status":
            "ok",

        "service":
            "RecoverAI API",
    }


# =========================================================
# DASHBOARD
# =========================================================
#
# Current dashboard data is DEMO DATA.
#
# Machine-readable recovery fields are included so the
# frontend does not need to infer business logic from
# human-readable failure descriptions.
#
# =========================================================

@app.get("/api/dashboard")
def get_dashboard():
    return {
        "metrics": {
            "revenue_at_risk":
                248400,

            "revenue_recovered":
                171920,

            "recovery_rate":
                69.2,

            "active_recoveries":
                47,

            "failed_payments":
                84,

            "recovered_today":
                31900,
        },

        "transactions": [
            {
                "id":
                    "RX18492",

                "amount":
                    7499,

                "failure_reason":
                    "Bank unavailable",

                "failure_code":
                    FailureCode.BANK_UNAVAILABLE.value,

                "retry_count":
                    0,

                "agent_action":
                    "Retry scheduled",

                "status":
                    "Recovering",
            },

            {
                "id":
                    "RX18493",

                "amount":
                    4999,

                "failure_reason":
                    "Payment timeout",

                "failure_code":
                    FailureCode.PAYMENT_TIMEOUT.value,

                "retry_count":
                    0,

                "agent_action":
                    "Retry completed",

                "status":
                    "Recovered",
            },

            {
                "id":
                    "RX18494",

                "amount":
                    12000,

                "failure_reason":
                    "Insufficient funds",

                "failure_code":
                    FailureCode.INSUFFICIENT_FUNDS.value,

                "retry_count":
                    0,

                "agent_action":
                    "Customer reminder",

                "status":
                    "Waiting",
            },

            # -------------------------------------------------
            # DOCUMENTED BLOCKED DEMO CASE
            # -------------------------------------------------
            #
            # retry_count = 2
            # MAX_RETRIES = 2
            #
            # Expected flow:
            #
            # DETECT
            # CLASSIFY
            # DECIDE
            # GUARDRAIL - BLOCKED
            #
            # No EXECUTE
            # No VERIFY
            #
            # -------------------------------------------------

            {
                "id":
                    "RX20117",

                "amount":
                    68000,

                "failure_reason":
                    "Bank unavailable",

                "failure_code":
                    FailureCode.BANK_UNAVAILABLE.value,

                "retry_count":
                    2,

                "agent_action":
                    "Recovery blocked",

                "status":
                    "Blocked",
            },
        ],

        "agent_activity": [
            {
                "time":
                    "10:41:02",

                "title":
                    "Failure detected",

                "detail": (
                    "Issuer degradation affecting "
                    "18 payments"
                ),
            },

            {
                "time":
                    "10:41:05",

                "title":
                    "Transactions clustered",

                "detail": (
                    "₹38,420 identified as "
                    "recoverable revenue"
                ),
            },

            {
                "time":
                    "10:41:08",

                "title":
                    "Recovery strategy selected",

                "detail": (
                    "30-minute delayed retry approved"
                ),
            },

            {
                "time":
                    "11:11:32",

                "title":
                    "Recovery successful",

                "detail": (
                    "₹31,900 successfully recovered"
                ),
            },
        ],
    }


# =========================================================
# FAILURE CLASSIFICATION
# =========================================================

@app.post(
    "/api/classify-failure",
    response_model=ClassificationResult,
)
def classify_payment_failure(
    request: ClassificationRequest,
):
    return classify_failure(
        request
    )


# =========================================================
# RECOVERY DECISION
# =========================================================

@app.post(
    "/api/recovery/decide",
    response_model=RecoveryDecision,
)
def decide_recovery(
    request: ClassificationRequest,
):
    return create_recovery_decision(
        request
    )


# =========================================================
# GUARDRAIL EVALUATION
# =========================================================

@app.post(
    "/api/recovery/guardrails",
    response_model=GuardrailDecision,
)
def check_recovery_guardrails(
    request: ClassificationRequest,
):
    return evaluate_guardrails(
        request
    )


# =========================================================
# RECOVERY EXECUTION
# =========================================================
#
# IMPORTANT:
#
# AI reasoning is NOT called from this endpoint.
#
# Financial execution continues to depend only on
# deterministic RecoverAI services and guardrails.
#
# =========================================================

@app.post(
    "/api/recovery/execute",
    response_model=RecoveryExecutionResponse,
)
def execute_payment_recovery(
    request: ClassificationRequest,
):
    return execute_recovery(
        request
    )


# =========================================================
# AUDIT TRAIL
# =========================================================

@app.get(
    "/api/recovery/audit/{transaction_id}",
    response_model=list[AuditEvent],
)
def recovery_audit(
    transaction_id: str,
):
    events = get_audit_trail(
        transaction_id
    )

    if not events:
        raise HTTPException(
            status_code=404,

            detail=(
                "No audit trail found "
                "for this transaction."
            ),
        )

    return events