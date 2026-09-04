import os

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from core.auth import (
    AuthenticatedUser,
    get_current_user,
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
        "Intelligent AI-powered revenue recovery platform."
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================
#
# Local development origins remain enabled.
#
# Production frontend origins are supplied through:
#
# CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
#
# Multiple production origins may be comma-separated.
#
# Never use "*" for allow_origins while
# allow_credentials=True.
#
# =========================================================

LOCAL_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

configured_cors_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "",
    ).split(",")
    if origin.strip()
]

ALLOWED_CORS_ORIGINS = list(
    dict.fromkeys(
        [
            *LOCAL_CORS_ORIGINS,
            *configured_cors_origins,
        ]
    )
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=ALLOWED_CORS_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================
#
# AI router:
#
#   /api/ai/*
#
# Application-facing AI reasoning routes require a valid
# authenticated RecoverAI user.
#
#
# Razorpay router:
#
#   /api/razorpay/*
#
# Razorpay webhook security remains based on Razorpay
# signature verification rather than Supabase user auth.
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
#
# Lightweight service information endpoint.
#
# It does not expose payment, recovery, merchant, user,
# transaction, or AI reasoning data.
#
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
#
# PUBLIC ENDPOINT
#
# Used for:
#
# - local development
# - deployment health checks
# - infrastructure monitoring
#
# No private application data is returned.
#
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
# AUTHENTICATED ENDPOINT
#
# Requires:
#
# Authorization: Bearer <Supabase access token>
#
# NOTE:
#
# Current dashboard values are demo/buildathon data.
#
# =========================================================

@app.get(
    "/api/dashboard"
)
def get_dashboard(
    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
):
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
            # CANONICAL BLOCKED DEMO CASE
            # -------------------------------------------------
            #
            # retry_count = 2
            # MAX_RETRIES = 2
            #
            # Expected pipeline:
            #
            # DETECT
            # CLASSIFY
            # DECIDE
            # GUARDRAIL
            #
            # STOP
            #
            # No EXECUTE.
            # No VERIFY.
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
#
# AUTHENTICATED ENDPOINT
#
# Classification remains deterministic.
#
# Authentication only controls access.
#
# It does not affect:
#
# - classification category
# - classification confidence
# - failure interpretation
#
# =========================================================

@app.post(
    "/api/classify-failure",
    response_model=ClassificationResult,
)
def classify_payment_failure(
    request: ClassificationRequest,

    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
):
    return classify_failure(
        request
    )


# =========================================================
# RECOVERY DECISION
# =========================================================
#
# AUTHENTICATED ENDPOINT
#
# Recovery decisions remain deterministic.
#
# The AI explanation layer does not control this endpoint.
#
# =========================================================

@app.post(
    "/api/recovery/decide",
    response_model=RecoveryDecision,
)
def decide_recovery(
    request: ClassificationRequest,

    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
):
    return create_recovery_decision(
        request
    )


# =========================================================
# GUARDRAIL EVALUATION
# =========================================================
#
# AUTHENTICATED ENDPOINT
#
# Guardrails are authoritative.
#
# AI cannot:
#
# - override guardrail status
# - increase retry limits
# - bypass high-value restrictions
# - authorize blocked execution
#
# =========================================================

@app.post(
    "/api/recovery/guardrails",
    response_model=GuardrailDecision,
)
def check_recovery_guardrails(
    request: ClassificationRequest,

    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
):
    return evaluate_guardrails(
        request
    )


# =========================================================
# RECOVERY EXECUTION
# =========================================================
#
# AUTHENTICATED ENDPOINT
#
# This is the sensitive execution boundary.
#
# Flow:
#
# authenticated user
#       ↓
# failure classification
#       ↓
# recovery decision
#       ↓
# deterministic guardrail
#       ↓
# permitted?
#   ↓           ↓
#  NO          YES
#   ↓           ↓
# STOP       EXECUTE
#               ↓
#            VERIFY
#               ↓
#             AUDIT
#
#
# IMPORTANT:
#
# AI reasoning is not an authority in this execution path.
#
# =========================================================

@app.post(
    "/api/recovery/execute",
    response_model=RecoveryExecutionResponse,
)
def execute_payment_recovery(
    request: ClassificationRequest,

    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
):
    return execute_recovery(
        request
    )


# =========================================================
# AUDIT TRAIL
# =========================================================
#
# AUTHENTICATED ENDPOINT
#
# Agent Replay consumes this endpoint.
#
# Events originate from the actual recovery pipeline.
#
# Canonical successful sequence:
#
# DETECT
# CLASSIFY
# DECIDE
# GUARDRAIL
# EXECUTE
# VERIFY
#
#
# Canonical blocked sequence:
#
# DETECT
# CLASSIFY
# DECIDE
# GUARDRAIL
#
# =========================================================

@app.get(
    "/api/recovery/audit/{transaction_id}",
    response_model=list[AuditEvent],
)
def recovery_audit(
    transaction_id: str,

    _current_user: AuthenticatedUser = Depends(
        get_current_user,
    ),
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