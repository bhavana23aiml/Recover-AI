# RecoverAI — System Architecture

**Project:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent  
**Track:** AI Revenue Recovery  
**Document:** System Architecture  
**Status:** FINAL / ACTIVE  
**Last Updated:** 2026-08-23

---

# 1. Architecture Goal

RecoverAI is designed as a modular AI-powered revenue recovery platform that can:

- Detect failed or at-risk payments
- Classify payment failures
- Decide the safest recovery strategy
- Enforce deterministic recovery guardrails
- Execute or simulate recovery actions
- Verify recovery outcomes
- Maintain a complete audit trail
- Surface recovery metrics through an operational dashboard

The system must remain:

- Modular
- Explainable
- Safe
- Testable
- Scalable
- Easy to extend
- Suitable for Razorpay Test Mode
- Clear enough to explain during the Buildathon panel

The core flow is:

```text
Payment Failure
      ↓
Failure Classifier
      ↓
Recovery Engine
      ↓
Guardrail Engine
      ↓
Recovery Executor
      ↓
Verification
      ↓
Audit Trail
      ↓
Dashboard / Operator Experience
```

The architectural philosophy is:

> **Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.**

---

# 2. High-Level Architecture

```text
┌───────────────────────────────────────────────────────┐
│                     RecoverAI                         │
└───────────────────────────────────────────────────────┘

                        USER
                         │
                         ▼

┌───────────────────────────────────────────────────────┐
│                 FRONTEND — REACT                      │
│                                                       │
│  Command Center                                       │
│  Transactions                                         │
│  Recovery Agent                                       │
│  Decision Drawer                                      │
│  Agent Replay                                         │
│  Activity                                             │
│  Guardrails                                           │
│  Settings                                             │
└───────────────────────────────────────────────────────┘
                         │
                         │ REST API
                         │
                         │ Future P1: SSE
                         ▼

┌───────────────────────────────────────────────────────┐
│                BACKEND — FASTAPI                      │
│                                                       │
│  API Routes                                           │
│  Validation                                           │
│  Recovery Workflow                                    │
│  Business Logic                                       │
│  Error Handling                                       │
│                                                       │
│  Future:                                              │
│  Auth Middleware                                      │
│  Rate Limiting                                        │
│  Webhook Handler                                      │
└───────────────────────────────────────────────────────┘
                         │
             ┌───────────┴────────────┐
             ▼                        ▼

┌────────────────────────┐   ┌─────────────────────────┐
│  RECOVERY PIPELINE     │   │       DATA LAYER        │
│                        │   │                         │
│ Failure Classifier     │   │ Current:               │
│ Recovery Engine        │   │ In-memory stores       │
│ Guardrail Engine       │   │                         │
│ Recovery Executor      │   │ Target P1:             │
│ Verification           │   │ Supabase/PostgreSQL    │
│ AI Reasoner (P1)       │   │ Transactions           │
│                        │   │ Recovery Jobs          │
│                        │   │ Audit Events           │
│                        │   │ Metrics                │
└────────────────────────┘   └─────────────────────────┘
             │
             ▼

┌───────────────────────────────────────────────────────┐
│              PAYMENT INTEGRATION — P1                 │
│                                                       │
│             Razorpay Test Mode                        │
│            API calls + Webhooks                       │
└───────────────────────────────────────────────────────┘
```

---

# 3. Architectural Principles

## 3.1 Deterministic Core, AI-Assisted Intelligence

RecoverAI must not allow an LLM to directly control payment execution.

Safe architecture:

```text
Deterministic Failure Rules
          ↓
Deterministic Recovery Rules
          ↓
Deterministic Guardrails
          ↓
Approved / Blocked Decision
          ↓
AI Explanation / Additional Reasoning
          ↓
Execution when allowed
          ↓
Verification
```

AI may assist with:

- Human-readable explanations
- Failure summaries
- Recovery rationale
- Pattern interpretation
- Operator-facing insights

AI must not bypass:

- Retry limits
- Confidence thresholds
- Amount limits
- Stop conditions
- Duplicate protection
- Payment verification
- Manual-review requirements

---

## 3.2 Layered Dependency Direction

Dependencies must move downward.

```text
schemas
   ↓
failure_classifier
   ↓
recovery_engine
   ↓
guardrail_engine
   ↓
recovery_executor
   ↓
API routes / main
```

Reverse dependencies are prohibited.

Valid:

```text
guardrail_engine
      ↓
recovery_engine
```

Invalid:

```text
recovery_engine
      ↓
guardrail_engine
      ↓
recovery_engine
```

This prevents circular imports and keeps the recovery core understandable.

---

## 3.3 Backend Owns Financial Safety

Financial safety decisions belong to deterministic backend services.

The frontend may request execution.

The frontend may not determine whether execution is safe.

---

## 3.4 Explicit Execution

Displaying a transaction or opening a Decision Drawer must not automatically trigger financial execution.

Current UI execution requires an explicit:

```text
RUN RECOVERY
```

action.

---

# 4. Frontend Architecture

## Technology

```text
React
TypeScript
Vite
Motion for React
Recharts
Lucide React
```

The frontend is responsible for presentation and interaction.

It must not contain core recovery safety logic.

---

# 5. Frontend Folder Structure

Target structure:

```text
frontend/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── styles/
│   │   └── tokens.css
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── RecoveryChart.tsx
│   │   │   └── AgentActivity.tsx
│   │   │
│   │   ├── transactions/
│   │   │   ├── TransactionTable.tsx
│   │   │   ├── TransactionRow.tsx
│   │   │   └── DecisionDrawer.tsx
│   │   │
│   │   ├── agent/
│   │   │   ├── AgentReplay.tsx
│   │   │   ├── ReplayStep.tsx
│   │   │   └── ConfidenceMeter.tsx
│   │   │
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Skeleton.tsx
│   │       └── StatusIndicator.tsx
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── RecoveryAgent.tsx
│   │   ├── Activity.tsx
│   │   ├── Guardrails.tsx
│   │   └── Settings.tsx
│   │
│   ├── services/
│   │   ├── dashboardApi.ts
│   │   ├── transactionApi.ts
│   │   └── recoveryApi.ts
│   │
│   ├── hooks/
│   │   ├── useDashboard.ts
│   │   ├── useRecovery.ts
│   │   ├── useAgentReplay.ts
│   │   └── useLiveActivity.ts
│   │
│   ├── types/
│   │   ├── dashboard.ts
│   │   ├── transaction.ts
│   │   └── recovery.ts
│   │
│   ├── data/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
└── vite.config.ts
```

The current implementation may be less decomposed than this target structure.

Do not restructure working P0 code solely to match this tree.

---

# 6. Frontend Responsibilities

The frontend should:

- Display recovery metrics
- Fetch backend data
- Display transactions
- Show failure reasons
- Show agent decisions
- Open the Decision Drawer
- Animate Agent Replay
- Show guardrail outcomes
- Display audit trail events
- Display loading/error states
- Handle navigation
- Present Test Environment / Simulation labels

The frontend must not:

- Decide retry policies
- Calculate safety decisions
- Store payment secrets
- Perform payment verification
- Decide whether an action is safe
- Directly call secret-authenticated payment APIs
- Fabricate backend audit events

---

# 7. Backend Architecture

## Technology

```text
Python
FastAPI
Pydantic
Uvicorn
pytest
```

Planned integrations:

```text
Supabase / PostgreSQL
Razorpay Test Mode
LLM provider
```

---

# 8. Backend Folder Structure

Target structure:

```text
backend/
│
├── main.py
│
├── core/
│   ├── config.py
│   ├── logging.py
│   ├── security.py
│   ├── auth.py
│   └── resilience.py
│
├── models/
│   ├── transaction.py
│   ├── recovery_job.py
│   └── audit_event.py
│
├── schemas/
│   ├── __init__.py
│   ├── transaction.py
│   ├── recovery.py
│   ├── webhook.py
│   └── dashboard.py
│
├── services/
│   ├── __init__.py
│   ├── failure_classifier.py
│   ├── recovery_engine.py
│   ├── guardrail_engine.py
│   ├── recovery_executor.py
│   ├── ai_reasoner.py
│   └── razorpay_service.py
│
├── routers/
│   ├── dashboard.py
│   ├── transactions.py
│   ├── recovery.py
│   └── webhooks.py
│
├── tests/
│
├── venv/
│
└── requirements.txt
```

Current P0 code may still place routes in `main.py`.

Moving routes into routers is architectural cleanup, not a reason to destabilize working P0 behavior.

---

# 9. Backend Service Responsibilities

## 9.1 `failure_classifier.py`

Purpose:

Convert raw payment failure information into a structured failure classification.

Input:

```text
transaction_id
amount
failure_code
retry_count
```

Example:

```text
BANK_UNAVAILABLE
```

Structured output includes:

```text
category
retryable
severity
recommended_action
retry_delay_minutes
confidence
explanation
```

Example:

```text
Category:
TRANSIENT_BANK_FAILURE

Retryable:
Yes

Confidence:
94%

Recommended Action:
DELAYED_RETRY

Retry Delay:
30 minutes
```

---

# 10. Failure Classification Flow

```text
Raw Failure Code
      ↓
Failure Rule Lookup
      ↓
Category
      ↓
Retryability
      ↓
Severity
      ↓
Recommended Action
      ↓
Confidence
```

Example:

```text
BANK_UNAVAILABLE
      ↓
TRANSIENT_BANK_FAILURE
      ↓
Retryable
      ↓
DELAYED_RETRY
      ↓
30 minutes
      ↓
94% confidence
```

---

# 11. `recovery_engine.py`

Purpose:

Convert failure classification into a structured recovery strategy.

Input:

```text
ClassificationRequest
```

Dependency:

```text
Failure Classifier
```

Output:

```text
RecoveryDecision
```

Example:

```text
Failure:
BANK_UNAVAILABLE

        ↓

Recovery Engine

        ↓

Action:
DELAYED_RETRY

Status:
RETRY_SCHEDULED

Delay:
30 minutes

Confidence:
94%
```

`recovery_engine.py` must not import:

```text
guardrail_engine
recovery_executor
itself
```

---

# 12. Recovery Actions

Supported strategies include:

```text
DELAYED_RETRY
SHORT_RETRY
VERIFY_THEN_RETRY
CUSTOMER_REMINDER
SEND_CHECKOUT_REMINDER
REQUEST_NEW_PAYMENT_METHOD
ALTERNATIVE_PAYMENT_METHOD
MANUAL_REVIEW
```

A safe fallback may result in:

```text
STOPPED
```

Additional actions may be introduced later through the documented change process.

---

# 13. `guardrail_engine.py`

Purpose:

Protect customers and merchants from unsafe automated recovery actions.

Guardrails are deterministic.

Core rule categories:

```text
Maximum retries
Minimum confidence
Amount limit
Manual-review requirement
Stop conditions
Duplicate/idempotency protection
```

P1 extensions:

```text
Cooldown enforcement
Consecutive failure protection
Historical/risk controls
```

---

## 13.1 Guardrail Configuration

Canonical runtime values live in:

```text
backend/core/config.py
```

Current Buildathon configuration target:

```text
Parameter                        Default

MAX_RETRIES                      2

MIN_CONFIDENCE_AUTO_EXECUTE      0.80

MIN_CONFIDENCE_ANY_ACTION        0.50

RETRY_COOLDOWN_MINUTES           15

DUPLICATE_WINDOW_SECONDS         30

MAX_RECOVERABLE_AMOUNT_AUTO      ₹50,000

STOP_ON_CONSECUTIVE_FAILURES     2
```

Priority:

```text
MAX_RETRIES                     P0
MIN_CONFIDENCE_AUTO_EXECUTE     P0
MIN_CONFIDENCE_ANY_ACTION       P0
MAX_RECOVERABLE_AMOUNT_AUTO     P0

RETRY_COOLDOWN_MINUTES          P1
STOP_ON_CONSECUTIVE_FAILURES    P1
```

Idempotency itself is P0 and is defined separately in Section 44.

Any configuration change must update:

```text
documentation
tests
core/config.py
affected implementation
```

---

# 14. Guardrail Flow

Conceptual target:

```text
Recovery Decision
      ↓
Confidence Check
      ↓
Retry Limit Check
      ↓
Amount Threshold Check
      ↓
Manual Review / Stop Check
      ↓
P1 historical checks if enabled
      ↓
ALLOW / BLOCK / REVIEW
```

Example safe path:

```text
Confidence: 94%       ✓
Retry Count: 0/2      ✓
Amount: ₹7,499        ✓

        ↓

ALLOWED
```

Example blocked path:

```text
Retry Count: 2/2

        ↓

Maximum retries reached

        ↓

BLOCKED
```

---

# 15. Guardrail Status

```text
ALLOWED
BLOCKED
REVIEW_REQUIRED
```

The executor must never continue when:

```text
can_execute = false
```

A review-required attempt is not automatically executable.

---

# 16. `recovery_executor.py`

Purpose:

Orchestrate one safe recovery execution attempt.

Responsibilities:

- Resolve idempotency
- Produce Detect audit event
- Classify failure
- Create recovery decision
- Evaluate Guardrail exactly once
- Stop when blocked/review-required
- Execute or simulate allowed actions
- Verify outcome
- Calculate recovered amount
- Finalize audit trail
- Finalize idempotency result

Current Buildathon execution mode:

```text
SIMULATION
```

Future P1 integration:

```text
Razorpay Test Mode
```

---

# 17. Recovery Executor Flow

Current architecture:

```text
Resolve / Reserve Idempotency
          ↓
DETECT
          ↓
CLASSIFY
          ↓
DECIDE
          ↓
GUARDRAIL
          ↓
       Allowed?
       ↙     ↘
     NO       YES
     ↓         ↓
 Stop/Audit   EXECUTE
               ↓
             VERIFY
               ↓
           Finalize result
               ↓
              AUDIT
```

Successful example:

```text
Payment RX18492
₹7,499

      ↓
DETECT
BANK_UNAVAILABLE

      ↓
CLASSIFY
TRANSIENT_BANK_FAILURE
94%

      ↓
DECIDE
DELAYED_RETRY

      ↓
GUARDRAIL
ALLOWED

      ↓
EXECUTE
Simulated delayed retry

      ↓
VERIFY
SUCCESS

      ↓
₹7,499 RECOVERED
```

Blocked example:

```text
Payment RX20117
₹68,000
Retry Count 2

      ↓
DETECT

      ↓
CLASSIFY

      ↓
DECIDE

      ↓
GUARDRAIL
BLOCKED

      ↓
STOP
```

No:

```text
EXECUTE
VERIFY
```

---

# 18. Recovery Job State Machine

Target persistent recovery-job architecture:

```text
                 ┌─────────────┐
                 │   CREATED   │
                 └──────┬──────┘
                        ▼
                 ┌─────────────┐
                 │ CLASSIFYING │
                 └──────┬──────┘
                        ▼
                 ┌─────────────┐
                 │  DECIDING   │
                 └──────┬──────┘
                        ▼
                 ┌─────────────┐
            ┌────┤ GUARDRAIL   ├────┐
            │    │  CHECKING   │    │
            │    └──────┬──────┘    │
            ▼           ▼           ▼

        BLOCKED      RECOVERING    REVIEW_REQUIRED
        terminal          │             │
                          ▼             │
                      VERIFYING         │
                         │              │
                    ┌────┴────┐         │
                    ▼         ▼         ▼
               RECOVERED    FAILED    human decision
```

Persistent implementation may add more explicit states.

No state transition may bypass Guardrail or Verification.

---

# 19. Audit Trail Architecture

Every recovery operation must produce traceable events.

Core event shape:

```json
{
  "step": "GUARDRAIL",
  "status": "ALLOWED",
  "message": "Recovery action satisfies configured safety guardrails.",
  "timestamp": "2026-08-23T10:32:17Z"
}
```

Core steps:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

Possible future steps:

```text
WEBHOOK_RECEIVED
ESCALATE
STOP
ERROR
```

Audit events must reflect reality.

The system must not fabricate missing workflow stages.

---

# 20. Audit Trail Storage

Current P0:

```text
In-memory Python store
```

Current implementation concept:

```python
AUDIT_STORE = {}
```

Target P1:

```text
Supabase / PostgreSQL
```

Persistent audit events must survive process restarts.

The frontend must not care whether the backend uses memory or PostgreSQL.

---

# 21. `ai_reasoner.py`

Priority:

```text
P1
```

Purpose:

Provide explainable AI assistance.

Potential outputs:

- Human-readable diagnosis
- Reasoning summary
- Operator explanation
- Suggested context
- Confidence narrative

AI may never directly override:

```text
Guardrails
Retry limits
Verification
Stop conditions
Idempotency
```

---

# 22. AI Architecture

```text
Transaction
     ↓
Failure Classifier
     ↓
Recovery Engine
     ↓
Guardrail Engine
     ↓
Deterministic Decision
     ↓
AI Reasoner
     ↓
Human-readable explanation
```

AI is an explanation/assistance layer.

It is not payment safety authority.

---

# 23. AI Failure Handling

If the AI provider is unavailable:

```text
AI service unavailable
      ↓
Use deterministic template explanation
      ↓
Recovery core continues
```

Core payment recovery must not depend entirely on an LLM.

---

# 24. `razorpay_service.py`

Priority:

```text
P1
```

Purpose:

Isolate Razorpay-specific logic.

Responsibilities may include:

- Create test orders where required
- Read test payment state
- Verify payment information
- Handle Test Mode responses
- Translate Razorpay errors into internal errors
- Provide gateway operations to Recovery Executor

The rest of the backend should not contain direct Razorpay API logic.

---

# 25. Razorpay Integration Architecture

```text
Recovery Executor
        ↓
Razorpay Service
        ↓
Razorpay Test API
        ↓
Payment Result / State
        ↓
Verification
        ↓
Audit Event
```

Razorpay Test Mode remains the only intended gateway environment for the Buildathon.

---

# 26. Resilience Policy for External Calls

Target P1 resilience belongs in:

```text
core/resilience.py
```

Target policy:

```text
Dependency        Timeout   Retries   Backoff

Razorpay API      5s        2         exponential
                                      500ms, 1s

LLM provider      8s        1         fixed 1s
```

Target circuit-breaker behavior:

```text
Razorpay:
open after repeated failures
half-open after recovery interval

LLM:
open after repeated failures
fall back to deterministic explanation
```

If Razorpay state becomes ambiguous:

```text
do not assume success
do not assume confirmed failure
do not blindly execute again
verify state
```

A transport retry policy is not permission to duplicate a payment attempt.

---

# 27. Razorpay Safety Rules

- Use Test Mode during the Buildathon.
- Never expose secret keys to the frontend.
- Secrets belong only in backend environment variables.
- Never commit `.env`.
- Verify payment state server-side.
- Treat network errors separately from confirmed payment failures.
- Never blindly retry an ambiguous financial state.
- Use persistent idempotency before depending on external execution.

---

# 28. Webhook Architecture

Priority:

```text
P1
```

Target:

```text
Razorpay
   ↓
POST /api/razorpay/webhook
   ↓
Verify Signature
   ↓
Invalid?
  YES → Reject
   ↓ NO
Check duplicate event
   ↓
Map event
   ↓
Trigger existing RecoverAI workflow
   ↓
Return safe acknowledgement
```

Target signature:

```text
X-Razorpay-Signature
HMAC-SHA256
RAZORPAY_WEBHOOK_SECRET
```

Possible event mappings:

```text
payment.failed
      ↓
DETECT / recovery entry

payment.authorized
      ↓
verification-related processing

payment.captured
      ↓
verify and persist final captured payment state; mark associated order paid

refund.processed
      ↓
audit/update as appropriate
```

Webhook integration must reuse:

```text
Failure Classifier
Recovery Engine
Guardrail Engine
Recovery Executor
Idempotency
Verification
Audit
```

It must not become a second recovery architecture.

Invalid signatures are rejected.

Duplicate events must not execute duplicate recovery actions.

---

# 29. Database Architecture

Target P1 storage:

```text
Supabase
PostgreSQL
```

Core tables:

```text
merchants
transactions
recovery_jobs
audit_events
recovery_metrics
```

---

# 30. Transactions Table

Target:

```text
Column                  Type

id                      uuid PK

merchant_id             uuid FK

external_payment_id     text

amount                   integer
                        stored in paise

currency                 text
                        default INR

status                   enum

failure_code             text nullable

failure_reason           text nullable

retry_count              integer

created_at               timestamptz

updated_at               timestamptz
```

Target transaction statuses may include:

```text
PENDING
FAILED
RECOVERING
RECOVERED
UNRECOVERABLE
```

Exact persistent enums must be synchronized with application schemas before migration.

---

# 31. Recovery Jobs Table

Target:

```text
Column                  Type

id                      uuid PK

transaction_id          uuid FK

recovery_action         enum/text

recovery_status         enum/text

confidence              numeric

retry_delay_minutes     integer nullable

guardrail_status        enum/text

execution_status        enum/text

recovered_amount        integer nullable
                        stored in paise

idempotency_key         text unique

created_at              timestamptz

updated_at              timestamptz
```

Target invariant:

```text
one active financial recovery attempt
per applicable transaction/attempt identity
```

Idempotency key uniqueness provides an additional execution guarantee.

---

# 32. Audit Events Table

Target:

```text
Column                  Type

id                      uuid PK

transaction_id          uuid FK / external-compatible id

recovery_job_id         uuid FK nullable

step                    text / enum

status                  text

message                 text

metadata                jsonb

created_at              timestamptz
```

Audit data should be append-only.

Do not provide normal application paths that rewrite historical audit meaning.

---

# 33. Dashboard Metrics

Metrics should eventually be calculated from transaction and recovery data.

Primary metrics:

```text
Revenue at Risk
Revenue Recovered
Recovery Rate
Active Recoveries
Failed Payments
Recovered Today
```

Target formulas:

```text
Revenue At Risk =
SUM(amount of recoverable failed payments)
```

```text
Revenue Recovered =
SUM(verified recovered_amount)
```

```text
Recovery Rate =
Revenue Recovered / Revenue At Risk × 100
```

Current dashboard metrics remain:

```text
DEMO DATA
```

until backed by persisted recovery data.

---

# 34. Dashboard Data Flow — Real-Time Target

## Current P0 Initial Load

```text
React
  ↓
GET /api/dashboard
  ↓
FastAPI
  ↓
Demo dashboard response
```

## Future Persistent Initial Load

```text
React
  ↓
GET /api/dashboard
  ↓
FastAPI
  ↓
Dashboard Service
  ↓
PostgreSQL
  ↓
Calculated metrics
```

## P1 Live Updates

Target:

```text
React
  ↓
GET /api/dashboard/stream
Server-Sent Events
  ↓
FastAPI
  ↓
New audit / recovery updates
  ↓
Client state update
```

SSE is suitable because the main live flow is server-to-client.

Fallback:

```text
poll GET /api/dashboard
approximately every 5–10 seconds
```

if SSE is unavailable.

---

# 35. API Architecture

## 35.1 Current P0 Endpoints

Currently implemented:

```text
GET  /
GET  /health

GET  /api/dashboard

POST /api/classify-failure

POST /api/recovery/decide

POST /api/recovery/guardrails

POST /api/recovery/execute

GET  /api/recovery/audit/{transaction_id}
```

Planned:

```text
GET  /api/dashboard/stream

POST /api/razorpay/webhook
```

---

## 35.2 Current Recovery Execute Contract

Current P0 request follows `ClassificationRequest`.

Example:

```json
{
  "transaction_id": "RX18492",
  "amount": 7499,
  "failure_code": "BANK_UNAVAILABLE",
  "retry_count": 0
}
```

Current backend resolves a deterministic idempotency key when one is not externally supplied by the current public schema.

Representative response:

```json
{
  "transaction_id": "RX18492",
  "amount": 7499,
  "failure_code": "BANK_UNAVAILABLE",
  "category": "TRANSIENT_BANK_FAILURE",
  "action": "DELAYED_RETRY",
  "confidence": 0.94,
  "guardrail_status": "ALLOWED",
  "can_execute": true,
  "execution_status": "RECOVERED",
  "recovered_amount": 7499,
  "simulation_probability": 0.72,
  "execution_mode": "SIMULATION",
  "audit_trail": []
}
```

The actual audit array contains generated events.

---

## 35.3 Current Audit Contract

Current endpoint:

```text
GET /api/recovery/audit/{transaction_id}
```

Current response shape:

```json
[
  {
    "step": "DETECT",
    "status": "SUCCESS",
    "message": "Payment failure detected: BANK_UNAVAILABLE",
    "timestamp": "..."
  }
]
```

The frontend must use this endpoint for Agent Replay.

---

## 35.4 Future Persistent Execution Contract

When persistence and external execution are introduced, the execution contract may evolve to include explicit:

```text
recovery_job_id
idempotency_key
merchant context
gateway identifiers
```

Any breaking change should be versioned or coordinated with frontend and tests.

---

# 36. Future API Structure

Potential future versioning:

```text
/api/v1/dashboard
/api/v1/transactions
/api/v1/recovery
/api/v1/guardrails
/api/v1/audit
/api/v1/webhooks
```

Do not migrate current working endpoints solely for aesthetics during P0.

---

# 37. End-to-End Recovery Flow

```text
1. Failed payment enters RecoverAI
   via current demo/manual request
   or future webhook

             ↓

2. Validate transaction data

             ↓

3. Resolve / reserve execution idempotency

             ↓

4. Failure Classifier identifies cause

             ↓

5. Recovery Engine chooses strategy

             ↓

6. Guardrail Engine checks safety
   exactly once for this attempt

             ↓

7A. BLOCKED
       ↓
    Stop + Audit

OR

7B. REVIEW_REQUIRED
       ↓
    Human Review / Stop automation

OR

7C. ALLOWED
       ↓
    Recovery Executor

             ↓

8. Execute / Simulate action

             ↓

9. Verify result independently

             ↓

10. Calculate verified recovered revenue

             ↓

11. Finalize audit + idempotency

             ↓

12. Update dashboard / persistence

             ↓

13. Future P1 live event delivery
```

---

# 38. Agent Replay Architecture

Agent Replay must not generate fake frontend-only steps.

It uses:

```text
GET /api/recovery/audit/{transaction_id}
```

Current architecture:

```text
Backend Audit Trail
        ↓
Recovery API Service
        ↓
AgentReplay.tsx
        ↓
Motion Animation
```

Successful backend events may be:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

Blocked backend events may be:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
```

Agent Replay renders whichever events actually exist.

It does not create missing `EXECUTE` or `VERIFY` stages.

---

# 39. Authentication & Tenancy

Priority:

```text
P2 / post-core Buildathon scope
```

Target model supports future multi-merchant operation.

Example:

```text
merchants
   id
   name
   razorpay_key_id reference
   created_at
```

Future persistent transaction and recovery data should contain:

```text
merchant_id
```

to prevent cross-merchant data access.

Potential auth architecture:

```text
Frontend
   ↓
Bearer token / JWT
   ↓
FastAPI auth middleware
```

Supabase Auth is a possible provider because Supabase is already planned.

Authentication is not currently part of the verified P0 recovery flow.

Do not claim it as implemented.

---

# 40. Error Handling Architecture

Errors are classified by layer.

## Validation Error

Example:

```text
Invalid transaction amount
```

Response:

```text
400 / 422
```

Current Pydantic validation may naturally return `422`.

---

## Business Rule Result

Example:

```text
Maximum retry count reached
```

This is normally represented as a valid recovery result:

```text
guardrail_status = BLOCKED
```

not as a server crash.

---

## External API Error

Example:

```text
Razorpay unavailable
```

Target behavior:

```text
Log error
   ↓
Do not assume payment failure
   ↓
Do not mark recovered
   ↓
Verify / mark pending / escalate
```

---

## Internal Server Error

Unexpected backend error:

```text
500
```

Frontend receives a safe user-facing message.

Detailed stack traces remain server-side.

---

# 41. Logging & Observability Architecture

Important events should be logged.

Examples:

```text
Transaction received
Failure classified
Recovery decision generated
Guardrail allowed
Guardrail blocked
Recovery executed
Verification succeeded
Verification failed
AI fallback activated
Razorpay unavailable
Database unavailable
Webhook received
Webhook rejected
Idempotency replay
```

Never log:

```text
API secrets
passwords
CVV
full card numbers
unredacted sensitive payment credentials
```

Future operational metrics may include:

```text
guardrail_block_rate
webhook_processing_latency
razorpay_error_rate
ai_reasoner_fallback_rate
recovery_executor_error_rate
idempotency_replay_count
```

Buildathon implementation may use structured server logging before dedicated monitoring infrastructure exists.

---

# 42. Security Architecture

## Secrets

Use backend environment variables.

Example:

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

SUPABASE_URL=
SUPABASE_KEY=

AI_API_KEY=
```

Never commit `.env`.

Commit:

```text
.env.example
```

with placeholder names only.

---

## Data Handling

RecoverAI should work primarily with payment metadata and gateway identifiers.

Do not store:

```text
full card numbers
CVV
raw secret credentials
```

in transaction or audit storage.

Sensitive metadata should be redacted before logs/persistence.

---

# 43. Git Ignore Requirements

Root `.gitignore` should include appropriate entries such as:

```text
backend/venv/
frontend/node_modules/

__pycache__/
*.pyc

.env
.env.*

!.env.example

dist/
build/

.DS_Store
```

Whether `.vscode/` is ignored is a repository choice.

Secrets must never be committed regardless.

---

# 44. Idempotency Architecture

Idempotency is:

```text
P0
MANDATORY
```

It is not merely a future enhancement.

Every workflow capable of financial execution must resolve an idempotency key.

Current deterministic generation uses the equivalent identity of:

```text
transaction_id
+
failure_code
+
attempt_number
```

Flow:

```text
Recovery Request
      ↓
Resolve Idempotency Key
      ↓
Existing completed result?
   ↙                    ↘
 YES                     NO
 ↓                       ↓
Return existing        Reserve key
result                 BEFORE execution
                          ↓
                       Execute once
                          ↓
                       Verify
                          ↓
                       Finalize result
```

Current P0:

```text
in-memory idempotency
```

This demonstrates duplicate prevention during one backend process.

Target persistent architecture:

```text
PostgreSQL unique idempotency key
+
reserved execution record
```

Persistence must occur before an external financial call if actual Razorpay execution can change payment state.

A process-local dictionary is not crash-safe.

Therefore:

```text
in-memory P0 idempotency
≠
production-grade payment idempotency
```

Webhook-triggered recovery must reuse the same mechanism.

---

# 45. Duplicate Recovery Protection

Target persistent data layer should prevent conflicting active recovery operations.

Possible database strategy:

```text
unique idempotency_key
```

plus a transaction/job uniqueness constraint appropriate to the final state machine.

Exact database constraints must match actual workflow semantics before migration.

Application-level checks alone are insufficient for concurrent persistent financial execution.

---

# 46. Concurrency Safety

Production-facing architecture must consider:

- Multiple workers
- Simultaneous API requests
- Duplicate webhooks
- Retry races
- Transaction isolation
- Worker crashes

Current P0 demonstrates duplicate protection in-process.

Target persistent P1 work must make execution claims atomic enough that two workers cannot both start the same financial action.

Potential protection:

```text
database uniqueness
transactional reservation
idempotency record
state transition validation
```

Distributed locks should only be introduced if database mechanisms are insufficient.

---

# 47. Payment Verification Principle

Never assume:

```text
API request returned successfully
```

means:

```text
payment succeeded
```

Correct:

```text
Execute
   ↓
Verify gateway/payment state
   ↓
Persist final status
```

Only verified recovery can contribute to:

```text
Revenue Recovered
```

If verification is ambiguous:

```text
PENDING / UNKNOWN
```

is safer than guessing.

---

# 48. Database Consistency

Target financial persistence workflow:

```text
External payment outcome established
      ↓
Persist transaction status
      ↓
Persist recovery result
      ↓
Persist audit event
```

Related database writes should be transactional where practical.

If external payment success occurs but database persistence fails:

```text
do not blindly execute payment again
```

Instead:

```text
record/reconstruct reconciliation state
verify external payment
escalate persistence inconsistency
```

---

# 49. Testing Architecture

Current observed P0 tests:

```text
tests/
├── test_recovery_flow.py
└── test_recovery_api.py
```

Target broader suite:

```text
tests/
├── test_failure_classifier.py
├── test_recovery_engine.py
├── test_guardrails.py
├── test_recovery_executor.py
├── test_recovery_api.py
├── test_webhooks.py
└── integration/
```

Do not reorganize existing passing tests solely to match this target.

---

# 50. Required Test Scenarios

## Classification

Target coverage:

```text
BANK_UNAVAILABLE
NETWORK_ERROR
PAYMENT_TIMEOUT
INSUFFICIENT_FUNDS
MANDATE_FAILURE
CUSTOMER_ABANDONED
ISSUER_DECLINED
UNKNOWN_ERROR
```

---

## Guardrails

Required/target scenarios include:

```text
Retry below limit → allowed when otherwise safe

Retry at maximum → blocked

High-confidence eligible action → allowed

Medium-confidence action → review

Very low confidence → stop

High-value transaction → review

Manual-review decision → no execution

Stopped decision → no execution

Duplicate execution → existing result

P1 cooldown violation → blocked

P1 consecutive-failure stop
```

---

## Execution

Required:

```text
Allowed retry

Successful simulated recovery

Failed simulated recovery

Customer-action workflow

Guardrail blocked workflow

Manual-review workflow

Duplicate/idempotent request

Verification outcome
```

---

## Webhooks

P1:

```text
Valid signature + new event

Invalid signature rejected

Duplicate event no duplicate execution

payment.failed maps to recovery

payment.captured verifies and persists captured payment state; associated order is recorded as paid
```

---

## Failure Handling

Target:

```text
Razorpay unavailable

AI unavailable with deterministic fallback

Database unavailable

Duplicate request

Invalid transaction

Network timeout

Ambiguous external payment state
```

---

# 51. Deployment & CI/CD Architecture

Target:

```text
Frontend
   ↓
Vercel

Backend
   ↓
Render / Railway

Database
   ↓
Supabase PostgreSQL

Payment
   ↓
Razorpay Test Mode
```

Potential CI pipeline:

```text
git push
   ↓
GitHub Actions
   ↓
Lint
   ↓
Type check
   ↓
pytest
   ↓
npm run build
   ↓
Deploy approved branch
```

Safety-critical regression tests must not be bypassed merely to make deployment pass.

---

# 52. Environment Architecture

## Local Development

```text
React:
http://localhost:5173

FastAPI:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs
```

---

## Demo / Deployment

Target:

```text
Frontend HTTPS domain
      ↓
Backend HTTPS domain
      ↓
Supabase
      ↓
Razorpay Test API
      ↑
Webhook callback
```

CORS must eventually allow only approved frontend origins.

Local webhook testing may require a secure public tunnel.

---

# 53. Current Architectural Implementation Snapshot

This section is a convenient architecture snapshot only.

Detailed current repository state belongs to:

```text
memory.md
```

and phase completion belongs to:

```text
phases.md
```

As of 2026-08-23, verified/implemented architecture includes:

```text
React/Vite frontend                   ✅

RecoverAI Command Center              ✅

Motion integration                    ✅

FastAPI backend                       ✅

Dashboard endpoint                    ✅

Frontend ↔ backend communication      ✅

Failure Classifier                    ✅

Recovery Engine                       ✅

Guardrail Engine                      ✅

Recovery Executor                     ✅

Deterministic simulation              ✅

Verification                          ✅

In-memory Audit Trail                 ✅

In-memory Idempotency                 ✅

Execute API                           ✅

Audit API                             ✅

Decision Drawer                       ✅

Agent Replay implementation           ✅

Backend automated tests               ✅
12 / 12 latest verified

Frontend production build             ✅
```

Current pending architecture areas:

```text
Final Agent Replay visual verification

Supabase persistence

Persistent idempotency

Persistent audit events

Calculated dashboard metrics

AI Reasoner

Razorpay Test Mode

Webhook handler

Real-time SSE

Auth / tenancy

Expanded observability

CI/CD

Deployment
```

Do not interpret target architecture as completed implementation.

---

# 54. Immediate Architecture Milestones

Implementation order is ultimately controlled by:

```text
phases.md
```

Current architecture milestone:

```text
Finish final Agent Replay P0 verification.
```

Then:

## Milestone A

```text
Freeze verified P0 behavior
+
documentation drift check
```

## Milestone B

```text
Supabase persistence
```

including:

```text
audit events
recovery records
persistent idempotency
transaction data
```

## Milestone C

```text
Calculated dashboard metrics
```

## Milestone D

```text
AI explanation layer
+
deterministic fallback
```

## Milestone E

```text
Razorpay Test Mode
+
server-side verification
```

## Milestone F

```text
Razorpay webhooks
+
signature verification
+
duplicate protection
```

## Milestone G

```text
Integration testing
Security review
Deployment
Demo freeze
```

Optional P1/P2 features must not displace safety/testing work.

---

# 55. Architecture Boundaries

## Frontend May

```text
Display
Animate
Search
Filter
Request backend actions
Show explanations
Show audit events
```

## Frontend May Not

```text
Store Razorpay secrets
Decide retry safety
Verify payment success
Bypass guardrails
Invent audit steps
Directly execute privileged secret-authenticated payments
```

---

## AI May

```text
Explain
Summarize
Recommend context
Generate operator-facing reasoning
```

## AI May Not

```text
Override deterministic guardrails
Ignore retry limits
Override idempotency
Directly mark payment successful
Invent payment results
Expose secrets
```

---

## Recovery Executor May

```text
Coordinate recovery pipeline
Execute allowed actions
Simulate recovery
Call Razorpay service
Verify results
Generate audit events
Finalize execution results
```

It may not execute when:

```text
can_execute = false
```

---

# 56. Final Architecture Principle

RecoverAI should behave as a:

```text
controlled recovery system
```

not an unrestricted autonomous payment agent.

Every new feature should preserve:

```text
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
```

If a proposed feature requires bypassing:

- Guardrails
- Idempotency
- Verification
- Auditability
- Backend/frontend separation
- Payment safety

it should not be added in that form.

---

# 57. Single Guardrail Evaluation Rule

For each execution attempt:

```text
DECIDE
   ↓
GUARDRAIL
   ↓
EXECUTE
```

Guardrails are evaluated:

```text
exactly once
```

for that attempt.

The decision must occur immediately before execution.

The same attempt must not repeatedly recalculate its Guardrail Decision midway through execution.

Concurrency changes are handled through:

```text
idempotency
persistent reservation
database concurrency protection
```

not by repeatedly changing the Guardrail result.

---

# 58. Guardrail / Execution Invariant

Once an attempt receives:

```text
BLOCKED
```

that attempt must not execute.

If an external system ever reports that payment execution succeeded for the same attempt despite:

```text
GUARDRAIL = BLOCKED
```

this is a critical safety inconsistency.

Required response:

```text
audit ERROR
      ↓
do not hide or reinterpret
      ↓
escalate / reconcile
      ↓
investigate as critical defect
```

---

# 59. Configuration Authority

Runtime safety configuration authority is:

```text
backend/core/config.py
```

Services should import configured thresholds rather than maintain conflicting local literals.

If:

```text
service behavior
≠
core/config.py
```

treat the difference as a bug unless there is:

```text
documented exception
+
test coverage
```

Any intentional threshold change requires:

```text
rules
architecture / PRD where referenced
config.py
tests
implementation
```

to remain synchronized.

---

# 60. Documentation Drift Architecture Rule

When an architectural behavior changes, search documentation before commit for old:

```text
endpoint names
status names
config values
workflow stages
table names
field names
priority labels
implementation claims
```

At minimum review:

```text
rules.md
architecture.md
PRD.md
design.md
project-overview.md
phases.md
memory.md
tests
```

Do not knowingly maintain two contradictory descriptions of a safety-critical workflow.

---

# 61. Current P0 Architecture Independence

P0 Decision Drawer and Agent Replay must work without Supabase.

Current:

```text
Recovery Executor
      ↓
AUDIT_STORE
      ↓
GET /api/recovery/audit/{transaction_id}
      ↓
Agent Replay
```

Future:

```text
Recovery Executor
      ↓
Supabase audit_events
      ↓
same GET /api/recovery/audit/{transaction_id}
      ↓
same Agent Replay
```

The frontend contract remains stable.

---

# 62. Simulation Transparency

Current Buildathon flow is simulation.

Required visible labels include, where applicable:

```text
SIMULATION
SIMULATION ENVIRONMENT
DEMO DATA
TEST ENVIRONMENT
```

A successful simulation demonstrates system behavior.

It does not prove actual merchant revenue was recovered.

---

# 63. Canonical Successful Architecture Demo

```text
RX18492
₹7,499
BANK_UNAVAILABLE
retry_count = 0

      ↓

DETECT

      ↓

CLASSIFY
TRANSIENT_BANK_FAILURE
94%

      ↓

DECIDE
DELAYED_RETRY

      ↓

GUARDRAIL
ALLOWED

      ↓

EXECUTE
SIMULATION

      ↓

VERIFY
SUCCESS

      ↓

RECOVERED
₹7,499

      ↓

AUDIT / AGENT REPLAY
```

---

# 64. Canonical Safety Architecture Demo

```text
RX20117
₹68,000
BANK_UNAVAILABLE
retry_count = 2

      ↓

DETECT

      ↓

CLASSIFY

      ↓

DECIDE

      ↓

GUARDRAIL
BLOCKED

      ↓

STOP
```

Expected audit:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
```

Forbidden for the same blocked attempt:

```text
EXECUTE
VERIFY
```

This demonstrates that RecoverAI optimizes for:

```text
safe recovery
```

not:

```text
maximum number of retries
```

---

# 65. Architecture Completion Principle

Architecture is not considered successfully implemented merely because every target component exists.

Success means the system preserves:

```text
correct dependency direction
+
deterministic safety
+
idempotent execution
+
verified outcomes
+
real audit history
+
honest simulation labeling
+
test coverage
```

through the complete recovery flow.

---

# END OF ARCHITECTURE DOCUMENT