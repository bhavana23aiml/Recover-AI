RecoverAI — System Architecture

Project: RecoverAI — Intelligent AI-Powered Revenue Recovery Agent

Track: AI Revenue Recovery

Document: System Architecture

Status: FINAL / ACTIVE

Last Updated: 2026-09-04

1. Architecture Goal

RecoverAI is designed as a modular AI-powered revenue recovery platform that can:

Detect failed or at-risk payments

Classify payment failures

Decide the safest recovery strategy

Enforce deterministic recovery guardrails

Execute or simulate recovery actions

Verify recovery outcomes

Maintain a complete audit trail

Surface recovery metrics through an operational dashboard

The system must remain:

Modular

Explainable

Safe

Testable

Scalable

Easy to extend

Suitable for Razorpay Test Mode

Clear enough to explain during the Buildathon panel

The core flow is:


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


The architectural philosophy is:

Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.

2. High-Level Architecture

┌───────────────────────────────────────────────────────┐
│                     RecoverAI                         │
└───────────────────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────┐
│                 FRONTEND — REACT                      │
│                                                       │
│  Dashboard / Command Center                           │
│  Transactions                                         │
│  Recovery Agent                                       │
│  Decision Drawer                                      │
│  Agent Replay                                         │
│  Activity / Guardrails / Settings                     │
│  Signup / Login                                       │
└───────────────────────────────────────────────────────┘
                         │
                         │ Supabase session
                         │ Authorization: Bearer <JWT>
                         ▼
┌───────────────────────────────────────────────────────┐
│                BACKEND — FASTAPI                      │
│                                                       │
│  API Routes                                           │
│  Supabase JWT Validation                              │
│  Validation                                           │
│  Recovery Workflow                                    │
│  Deterministic Safety Logic                           │
│  AI Explanation Layer                                 │
│  Razorpay Test Mode Integration                       │
│  Razorpay Webhook Handler                             │
│  Error Handling                                       │
└───────────────────────────────────────────────────────┘
                         │
             ┌───────────┼─────────────┐
             ▼           ▼             ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ RECOVERY PIPELINE│ │ DATA LAYER   │ │ PAYMENT / AI     │
│                  │ │              │ │                  │
│ Classifier       │ │ Supabase /   │ │ Razorpay Test    │
│ Recovery Engine  │ │ PostgreSQL   │ │ Mode             │
│ Guardrails       │ │              │ │                  │
│ Executor         │ │ Recovery     │ │ GroqCloud         │
│ Verification     │ │ state        │ │ explanation-only │
│ Audit            │ │ Idempotency  │ │ AI               │
└──────────────────┘ │ Audit/gateway │ └──────────────────┘
                     │ linkage       │
                     └───────────────┘

Razorpay webhook path:

Razorpay
   │
   │ X-Razorpay-Signature
   ▼
POST /api/razorpay/webhook
   │
   ▼
Signature verification
   │
   ▼
Trusted webhook processing

Current trust boundaries are deliberately separate:

Browser user
   → Supabase Auth
   → Bearer access token
   → protected RecoverAI API

Razorpay
   → signed webhook
   → Razorpay signature verification
   → webhook processing

Authentication is implemented for browser-facing protected APIs.

Multi-merchant tenant isolation is not currently implemented and must not be inferred from authentication alone.

Future live dashboard delivery such as SSE remains optional and is not required for the current verified core.

3. Architectural Principles

3.1 Deterministic Core, AI-Assisted Intelligence

RecoverAI must not allow an LLM to directly control payment execution.

Safe architecture:


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


AI may assist with:

Human-readable explanations

Failure summaries

Recovery rationale

Pattern interpretation

Operator-facing insights

AI must not bypass:

Retry limits

Confidence thresholds

Amount limits

Stop conditions

Duplicate protection

Payment verification

Manual-review requirements

3.2 Layered Dependency Direction

Dependencies must move downward.


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


Reverse dependencies are prohibited.

Valid:


guardrail_engine

      ↓

recovery_engine


Invalid:


recovery_engine

      ↓

guardrail_engine

      ↓

recovery_engine


This prevents circular imports and keeps the recovery core understandable.

3.3 Backend Owns Financial Safety

Financial safety decisions belong to deterministic backend services.

The frontend may request execution.

The frontend may not determine whether execution is safe.

3.4 Explicit Execution

Displaying a transaction or opening a Decision Drawer must not automatically trigger financial execution.

Current UI execution requires an explicit:


RUN RECOVERY


action.

4. Frontend Architecture

Technology


React

TypeScript

Vite

Motion for React

Recharts

Lucide React


The frontend is responsible for presentation and interaction.

It must not contain core recovery safety logic.

5. Frontend Folder Structure

Target structure:


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


The current implementation may be less decomposed than this target structure.

Do not restructure working P0 code solely to match this tree.

6. Frontend Responsibilities

The frontend should:

Display recovery metrics

Fetch backend data

Display transactions

Show failure reasons

Show agent decisions

Open the Decision Drawer

Animate Agent Replay

Show guardrail outcomes

Display audit trail events

Display loading/error states

Handle navigation

Present Test Environment / Simulation labels

The frontend must not:

Decide retry policies

Calculate safety decisions

Store payment secrets

Perform payment verification

Decide whether an action is safe

Directly call secret-authenticated payment APIs

Fabricate backend audit events

7. Backend Architecture

Technology

Python
FastAPI
Pydantic
Uvicorn
pytest
Supabase / PostgreSQL
Razorpay Test Mode
GroqCloud-compatible AI provider integration

Current backend responsibilities include:

JWT-authenticated browser APIs
deterministic recovery logic
guardrail enforcement
persistent recovery/gateway state
persistent idempotency
Razorpay Test Mode order/payment handling
Razorpay webhook verification
AI explanation with deterministic fallback
audit and verification

The AI provider is not part of the financial safety authority.

Razorpay integration is Test Mode only for the Buildathon.

8. Backend Folder Structure

Target structure:


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


Current P0 code may still place routes in main.py.

Moving routes into routers is architectural cleanup, not a reason to destabilize working P0 behavior.

9. Backend Service Responsibilities

9.1 failure_classifier.py

Purpose:

Convert raw payment failure information into a structured failure classification.

Input:


transaction_id

amount

failure_code

retry_count


Example:


BANK_UNAVAILABLE


Structured output includes:


category

retryable

severity

recommended_action

retry_delay_minutes

confidence

explanation


Example:


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


10. Failure Classification Flow


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


Example:


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


11. recovery_engine.py

Purpose:

Convert failure classification into a structured recovery strategy.

Input:


ClassificationRequest


Dependency:


Failure Classifier


Output:


RecoveryDecision


Example:


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


recovery_engine.py must not import:


guardrail_engine

recovery_executor

itself


12. Recovery Actions

Supported strategies include:


DELAYED_RETRY

SHORT_RETRY

VERIFY_THEN_RETRY

CUSTOMER_REMINDER

SEND_CHECKOUT_REMINDER

REQUEST_NEW_PAYMENT_METHOD

ALTERNATIVE_PAYMENT_METHOD

MANUAL_REVIEW


A safe fallback may result in:


STOPPED


Additional actions may be introduced later through the documented change process.

13. guardrail_engine.py

Purpose:

Protect customers and merchants from unsafe automated recovery actions.

Guardrails are deterministic.

Core rule categories:


Maximum retries

Minimum confidence

Amount limit

Manual-review requirement

Stop conditions

Duplicate/idempotency protection


P1 extensions:


Cooldown enforcement

Consecutive failure protection

Historical/risk controls


13.1 Guardrail Configuration

Canonical runtime values live in:


backend/core/config.py


Current Buildathon configuration target:


Parameter                        Default

MAX_RETRIES                      2

MIN_CONFIDENCE_AUTO_EXECUTE      0.80

MIN_CONFIDENCE_ANY_ACTION        0.50

RETRY_COOLDOWN_MINUTES           15

DUPLICATE_WINDOW_SECONDS         30

MAX_RECOVERABLE_AMOUNT_AUTO      ₹50,000

STOP_ON_CONSECUTIVE_FAILURES     2


Priority:


MAX_RETRIES                     P0

MIN_CONFIDENCE_AUTO_EXECUTE     P0

MIN_CONFIDENCE_ANY_ACTION       P0

MAX_RECOVERABLE_AMOUNT_AUTO     P0

RETRY_COOLDOWN_MINUTES          P1

STOP_ON_CONSECUTIVE_FAILURES    P1


Idempotency itself is P0 and is defined separately in Section 44.

Any configuration change must update:


documentation

tests

core/config.py

affected implementation


14. Guardrail Flow

Conceptual target:


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


Example safe path:


Confidence: 94%       ✓

Retry Count: 0/2      ✓

Amount: ₹7,499        ✓

        ↓

ALLOWED


Example blocked path:


Retry Count: 2/2

        ↓

Maximum retries reached

        ↓

BLOCKED


15. Guardrail Status


ALLOWED

BLOCKED

REVIEW_REQUIRED


The executor must never continue when:


can_execute = false


A review-required attempt is not automatically executable.

16. recovery_executor.py

Purpose:

Orchestrate one safe recovery execution attempt.

Responsibilities:

Resolve idempotency

Produce Detect audit event

Classify failure

Create recovery decision

Evaluate Guardrail exactly once

Stop when blocked/review-required

Execute or simulate allowed actions

Verify outcome

Calculate recovered amount

Finalize audit trail

Finalize idempotency result

The deterministic recovery executor remains the financial workflow authority.

The current Buildathon supports two distinct execution contexts:

SIMULATION

for deterministic recovery-flow demonstration, and:

RAZORPAY_TEST

for the isolated Razorpay Test Mode payment integration.

Razorpay Test Mode does not change the rule that execution must be guardrail-approved, idempotent, verified, and audited.

Neither mode may be presented as production payment execution.

17. Recovery Executor Flow

Current architecture:


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


Successful example:


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


Blocked example:


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


No:


EXECUTE

VERIFY


18. Recovery Job State Machine

Target persistent recovery-job architecture:


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


Persistent implementation may add more explicit states.

No state transition may bypass Guardrail or Verification.

19. Audit Trail Architecture

Every recovery operation must produce traceable events.

Core event shape:


{

  "step": "GUARDRAIL",

  "status": "ALLOWED",

  "message": "Recovery action satisfies configured safety guardrails.",

  "timestamp": "2026-08-23T10:32:17Z"

}


Core steps:


DETECT

CLASSIFY

DECIDE

GUARDRAIL

EXECUTE

VERIFY


Possible future steps:


WEBHOOK_RECEIVED

ESCALATE

STOP

ERROR


Audit events must reflect reality.

The system must not fabricate missing workflow stages.

20. Audit Trail Storage

RecoverAI now has a persistent Supabase/PostgreSQL path for recovery-linked state, idempotency, gateway linkage, and audit persistence.

Recovery workflow / gateway event
      ↓
Supabase persistence layer
      ↓
recovery state / idempotency / audit data

In-memory stores may still exist in deterministic tests, simulation paths, or local fallbacks, but they must not be described as the durable financial persistence mechanism.

Persistent financial state used around external Razorpay Test Mode execution must survive backend process restart.

The frontend-facing audit contract remains stable:

GET /api/recovery/audit/{transaction_id}

Agent Replay must consume backend audit events rather than inventing frontend-only steps.

21. ai_reasoner.py

Status:

IMPLEMENTED

Purpose:

Provide explanation-only AI assistance after deterministic RecoverAI services have already established the classification, recovery strategy, and guardrail state.

Current architecture includes:

deterministic context
      ↓
ai_reasoner.py
      ↓
provider dispatch
      ↓
GroqCloud-compatible provider
      ↓
grounded structured explanation

If the provider is unavailable or the response is unusable:

AI provider failure
      ↓
deterministic fallback explanation
      ↓
core recovery continues

AI may provide:

Human-readable diagnosis

Recovery rationale

Operator explanation

Safety explanation

Grounded contextual summary

AI may never directly override:

classification authority
recovery action authority
Guardrails
retry limits
verification
stop conditions
idempotency
execution permission
payment success state

The AI layer is explanatory assistance only.

22. AI Architecture


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


AI is an explanation/assistance layer.

It is not payment safety authority.

23. AI Failure Handling

If the AI provider is unavailable:


AI service unavailable

      ↓

Use deterministic template explanation

      ↓

Recovery core continues


Core payment recovery must not depend entirely on an LLM.

24. razorpay_service.py

Status:

IMPLEMENTED — RAZORPAY TEST MODE

Purpose:

Isolate Razorpay-specific gateway logic from RecoverAI's deterministic recovery core.

Current responsibilities include:

Create Razorpay Test Mode orders where required

Read Test Mode payment/order state

Verify payment signatures

Verify captured payment state server-side

Fetch order payments for reconciliation

Translate Razorpay failures into controlled backend errors

Support webhook signature verification

Keep Razorpay secrets backend-only

The rest of the backend should not contain ad-hoc privileged Razorpay calls.

Razorpay integration must remain behind the existing recovery, guardrail, idempotency, verification, and audit boundaries.

25. Razorpay Integration Architecture


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


Razorpay Test Mode remains the only intended gateway environment for the Buildathon.

26. Resilience Policy for External Calls

Target P1 resilience belongs in:


core/resilience.py


Target policy:


Dependency        Timeout   Retries   Backoff

Razorpay API      5s        2         exponential

                                      500ms, 1s

LLM provider      8s        1         fixed 1s


Target circuit-breaker behavior:


Razorpay:

open after repeated failures

half-open after recovery interval

LLM:

open after repeated failures

fall back to deterministic explanation


If Razorpay state becomes ambiguous:


do not assume success

do not assume confirmed failure

do not blindly execute again

verify state


A transport retry policy is not permission to duplicate a payment attempt.

27. Razorpay Safety Rules

Use Test Mode during the Buildathon.

Never expose secret keys to the frontend.

Secrets belong only in backend environment variables.

Never commit .env.

Verify payment state server-side.

Treat network errors separately from confirmed payment failures.

Never blindly retry an ambiguous financial state.

Use persistent idempotency before depending on external execution.

28. Webhook Architecture

Status:

IMPLEMENTED — RAZORPAY TEST MODE

Current webhook trust flow:

Razorpay
   ↓
POST /api/razorpay/webhook
   ↓
Read raw request body
   ↓
Verify X-Razorpay-Signature
   ↓
Invalid?
  YES → Reject
   ↓ NO
Check duplicate event
   ↓
Map supported event
   ↓
Persist/link gateway state
   ↓
Reuse existing RecoverAI safety/idempotency rules
   ↓
Return safe acknowledgement

Webhook signature verification uses the Razorpay webhook secret on the backend.

X-Razorpay-Signature
HMAC-SHA256 verification
RAZORPAY_WEBHOOK_SECRET

The webhook is intentionally not protected by a Supabase browser-user JWT.

Its trust boundary is the Razorpay signature.

The current verified gateway event handling includes captured-payment synchronization:

payment.captured
      ↓
verify trusted webhook
      ↓
persist captured payment state
      ↓
link payment/order/recovery state
      ↓
audit

Other event mappings may be expanded only when backed by implementation and tests.

Webhook processing must continue to reuse:

deterministic safety rules
idempotency
verification
persistence
audit

It must not become a second recovery architecture.

Invalid signatures are rejected.

Duplicate webhook delivery must not create duplicate financial execution.

29. Database Architecture

Current persistent storage:

Supabase
PostgreSQL

The implemented persistence path is used for gateway-linked recovery state, persistent idempotency, verification/reconciliation state, and audit-related persistence.

Conceptual product entities include:

transactions
recovery_jobs
audit_events
gateway order/payment linkage
idempotency state

A future multi-merchant architecture may additionally introduce or fully enforce:

merchants
merchant_id
merchant-scoped authorization
tenant isolation

The existence of authentication or merchant-shaped schema fields must not be presented as proof that tenant isolation is currently implemented.

Exact table/column definitions must follow the actual migration/schema used by the repository.

30. Transactions Table

Target:


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


Target transaction statuses may include:


PENDING

FAILED

RECOVERING

RECOVERED

UNRECOVERABLE


Exact persistent enums must be synchronized with application schemas before migration.

31. Recovery Jobs Table

Target:


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


Target invariant:


one active financial recovery attempt

per applicable transaction/attempt identity


Idempotency key uniqueness provides an additional execution guarantee.

32. Audit Events Table

Target:


Column                  Type

id                      uuid PK

transaction_id          uuid FK / external-compatible id

recovery_job_id         uuid FK nullable

step                    text / enum

status                  text

message                 text

metadata                jsonb

created_at              timestamptz


Audit data should be append-only.

Do not provide normal application paths that rewrite historical audit meaning.

33. Dashboard Metrics

Metrics should eventually be calculated from transaction and recovery data.

Primary metrics:


Revenue at Risk

Revenue Recovered

Recovery Rate

Active Recoveries

Failed Payments

Recovered Today


Target formulas:


Revenue At Risk =

SUM(amount of recoverable failed payments)



Revenue Recovered =

SUM(verified recovered_amount)



Recovery Rate =

Revenue Recovered / Revenue At Risk × 100


Current dashboard metrics remain:


DEMO DATA


until backed by persisted recovery data.

34. Dashboard Data Flow — Real-Time Target

Current P0 Initial Load


React

  ↓

GET /api/dashboard

  ↓

FastAPI

  ↓

Demo dashboard response


Future Persistent Initial Load


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


P1 Live Updates

Target:


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


SSE is suitable because the main live flow is server-to-client.

Fallback:


poll GET /api/dashboard

approximately every 5–10 seconds


if SSE is unavailable.

35. API Architecture

35.1 Current Endpoints and Trust Boundary

Public application/system endpoints:

GET  /
GET  /health

Protected browser-facing endpoints:

GET  /api/dashboard
POST /api/classify-failure

POST /api/recovery/decide
POST /api/recovery/guardrails
POST /api/recovery/execute
GET  /api/recovery/audit/{transaction_id}

POST /api/ai/reasoning

POST /api/razorpay/recovery-order
POST /api/razorpay/verify-payment
POST /api/razorpay/reconcile-payment

These protected endpoints require a valid Supabase-authenticated browser session whose access token is sent as:

Authorization: Bearer <JWT>

The backend validates that token through get_current_user.

Razorpay webhook endpoint:

POST /api/razorpay/webhook

This endpoint does not use Supabase browser authentication. It requires Razorpay webhook signature verification instead.

Optional/future:

GET /api/dashboard/stream

35.2 Current Recovery Execute Contract

The recovery execute request follows the current classification/recovery request contract.

Example:

{
  "transaction_id": "RX18492",
  "amount": 7499,
  "failure_code": "BANK_UNAVAILABLE",
  "retry_count": 0
}

The backend resolves or reserves an idempotency identity for execution.

Representative deterministic simulation response fields may include:

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
  "execution_mode": "SIMULATION",
  "audit_trail": []
}

Simulation output is not proof of production merchant revenue recovery.

35.3 Current Audit Contract

Current endpoint:

GET /api/recovery/audit/{transaction_id}

Representative response shape:

[
  {
    "step": "DETECT",
    "status": "SUCCESS",
    "message": "Payment failure detected: BANK_UNAVAILABLE",
    "timestamp": "..."
  }
]

The frontend uses backend audit events for Agent Replay.

Blocked recoveries must stop at the actual blocking event and must not fabricate EXECUTE or VERIFY.

35.4 Current Razorpay Browser API Boundary

Razorpay Test Mode browser integration is exposed through:

POST /api/razorpay/recovery-order
POST /api/razorpay/verify-payment
POST /api/razorpay/reconcile-payment

All three require RecoverAI browser-user authentication.

The frontend sends a Supabase access token through the shared authenticated API helper.

Gateway secrets remain backend-only.

Verification and reconciliation are server-side.

The webhook remains a separate signature-authenticated path.

35.5 Future Contract Evolution

Future contract evolution may add explicit merchant/tenant context only after merchant-level authorization and row/data scoping are actually implemented.

Do not equate the presence of merchant_id-shaped fields with proven tenant isolation.

Any breaking API change must be versioned or coordinated with frontend tests and documentation.

36. Future API Structure

Potential future versioning:


/api/v1/dashboard

/api/v1/transactions

/api/v1/recovery

/api/v1/guardrails

/api/v1/audit

/api/v1/webhooks


Do not migrate current working endpoints solely for aesthetics during P0.

37. End-to-End Recovery Flow


1. Failed payment enters RecoverAI

   via browser/manual recovery request

   or verified Razorpay webhook

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


38. Agent Replay Architecture

Agent Replay must not generate fake frontend-only steps.

It uses:


GET /api/recovery/audit/{transaction_id}


Current architecture:


Backend Audit Trail

        ↓

Recovery API Service

        ↓

AgentReplay.tsx

        ↓

Motion Animation


Successful backend events may be:


DETECT

CLASSIFY

DECIDE

GUARDRAIL

EXECUTE

VERIFY


Blocked backend events may be:


DETECT

CLASSIFY

DECIDE

GUARDRAIL


Agent Replay renders whichever events actually exist.

It does not create missing EXECUTE or VERIFY stages.

39. Authentication & Tenancy

Authentication and tenancy are separate concerns.

39.1 Authentication — Implemented

Current browser authentication architecture:

Signup / Login
      ↓
Supabase Auth
      ↓
Supabase access token
      ↓
Authorization: Bearer <JWT>
      ↓
FastAPI get_current_user
      ↓
Protected RecoverAI API

The frontend uses Supabase authentication for signup/login/session handling.

The backend validates the access token before allowing access to protected browser-facing endpoints.

Missing or invalid authentication is rejected.

The verified browser API protection boundary includes dashboard, classification, recovery, audit, AI reasoning, and Razorpay browser operations.

39.2 Razorpay Webhook Authentication — Separate

Razorpay
      ↓
signed webhook
      ↓
X-Razorpay-Signature verification
      ↓
RecoverAI webhook processing

The Razorpay webhook must not require a Supabase browser-user JWT.

39.3 Tenancy — Not Implemented

Authentication establishes identity.

It does not currently establish:

merchant-level authorization
tenant isolation
per-user merchant data scoping
cross-merchant row isolation
multi-merchant security

RecoverAI must not claim those properties until merchant-level authorization and data isolation are explicitly implemented and tested.

Future multi-merchant architecture may introduce:

merchants
merchant_id
merchant-scoped queries
authorization policy
database isolation / RLS where appropriate

Those remain future architecture, not verified current behavior.

40. Error Handling Architecture

Errors are classified by layer.

Validation Error

Example:


Invalid transaction amount


Response:


400 / 422


Current Pydantic validation may naturally return 422.

Business Rule Result

Example:


Maximum retry count reached


This is normally represented as a valid recovery result:


guardrail_status = BLOCKED


not as a server crash.

External API Error

Example:


Razorpay unavailable


Target behavior:


Log error

   ↓

Do not assume payment failure

   ↓

Do not mark recovered

   ↓

Verify / mark pending / escalate


Internal Server Error

Unexpected backend error:


500


Frontend receives a safe user-facing message.

Detailed stack traces remain server-side.

41. Logging & Observability Architecture

Important events should be logged.

Examples:


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


Never log:


API secrets

passwords

CVV

full card numbers

unredacted sensitive payment credentials


Future operational metrics may include:


guardrail_block_rate

webhook_processing_latency

razorpay_error_rate

ai_reasoner_fallback_rate

recovery_executor_error_rate

idempotency_replay_count


Buildathon implementation may use structured server logging before dedicated monitoring infrastructure exists.

42. Security Architecture

Authentication Boundary

Browser-facing protected APIs use:

Supabase Auth
      ↓
Bearer access token
      ↓
FastAPI get_current_user

Authentication blocks anonymous access but does not by itself provide tenant isolation.

Razorpay Webhook Boundary

Razorpay
      ↓
X-Razorpay-Signature
      ↓
backend signature verification

Browser JWT authentication and webhook signature authentication are intentionally separate.

Secrets

Backend-only environment variables include values such as:

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

SUPABASE_URL=
SUPABASE_SECRET_KEY=

GROQ_API_KEY=

Frontend client configuration may use only public/client-side values intended for browser exposure, for example:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=

The frontend must never receive:

Supabase service-role/private secret
Razorpay key secret
Razorpay webhook secret
Groq/private AI provider secret

Never commit secret-bearing .env files.

Commit .env.example with placeholder names only when useful.

Data Handling

RecoverAI should work primarily with payment metadata and gateway identifiers.

Do not store:

full card numbers
CVV
raw secret credentials

in transaction or audit storage.

Sensitive metadata must be redacted before logs or persistence.

43. Git Ignore Requirements

Root .gitignore should include appropriate entries such as:


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


Whether .vscode/ is ignored is a repository choice.

Secrets must never be committed regardless.

44. Idempotency Architecture

Idempotency is:

P0
MANDATORY

Every workflow capable of financial execution must resolve an idempotency identity before execution.

Conceptually:

transaction_id
+
failure_code
+
attempt identity

Execution flow:

Recovery Request
      ↓
Resolve Idempotency Key
      ↓
Look up persisted state
      ↓
Existing completed result?
   ↙                    ↘
 YES                     NO
 ↓                       ↓
Return existing        Reserve key/state
result                 BEFORE external execution
                          ↓
                       Execute once
                          ↓
                       Verify
                          ↓
                       Persist/finalize result

The current Razorpay Test Mode integration uses persistent idempotency/recovery state before external gateway execution.

Process-local idempotency may still exist in deterministic simulation/tests, but it must not be treated as the durability mechanism for gateway-linked execution.

Persistent idempotency is required because:

process-local dictionary
≠
crash-safe financial idempotency

Webhook-triggered processing must reuse the same duplicate/idempotency safety principles.

45. Duplicate Recovery Protection

RecoverAI currently prevents repeated gateway-linked work through persisted recovery/idempotency state and explicit duplicate handling.

The architecture must continue to ensure that the same logical execution does not create multiple financial attempts merely because:

browser request is repeated
verification is retried
reconciliation is repeated
webhook is redelivered

Database uniqueness/reservation should remain the primary durable protection where supported by the persistent schema.

Application-level checks are useful but are not a substitute for durable concurrency-safe state.

46. Concurrency Safety

Current persistent idempotency materially improves safety over the earlier process-local-only design.

Production-facing architecture must still account for:

Multiple workers

Simultaneous API requests

Duplicate webhooks

Retry races

Transaction isolation

Worker crashes

The Buildathon implementation must not claim full production multi-worker correctness unless that behavior has been explicitly load/concurrency tested.

Preferred protection remains:

database uniqueness
transactional reservation
persistent idempotency record
state transition validation

Distributed locks should be introduced only if database mechanisms are insufficient.

47. Payment Verification Principle

Never assume:


API request returned successfully


means:


payment succeeded


Correct:


Execute

   ↓

Verify gateway/payment state

   ↓

Persist final status


Only verified recovery can contribute to:


Revenue Recovered


If verification is ambiguous:


PENDING / UNKNOWN


is safer than guessing.

48. Database Consistency

Target financial persistence workflow:


External payment outcome established

      ↓

Persist transaction status

      ↓

Persist recovery result

      ↓

Persist audit event


Related database writes should be transactional where practical.

If external payment success occurs but database persistence fails:


do not blindly execute payment again


Instead:


record/reconstruct reconciliation state

verify external payment

escalate persistence inconsistency


49. Testing Architecture

As of 2026-09-04, the verified backend regression suite is:

47 passed
2 non-blocking Supabase client deprecation warnings
0 failed

The suite covers the deterministic recovery flow and includes dedicated coverage for areas such as:

recovery API behavior
recovery flow
AI reasoning / fallback behavior
authentication boundaries
Razorpay Test Mode browser APIs
verification / reconciliation behavior

The Razorpay business tests run with a deterministic authenticated test-user dependency override so they test gateway/recovery behavior without requiring a live Supabase login.

Separate authentication tests intentionally make anonymous requests and verify that protected browser-facing endpoints return 401.

The Razorpay webhook is not expected to return 401 because it uses Razorpay signature authentication instead of a browser-user JWT.

Safety-critical regression tests must remain green after architecture changes.

50. Required Test Scenarios

Classification

Target coverage:


BANK_UNAVAILABLE

NETWORK_ERROR

PAYMENT_TIMEOUT

INSUFFICIENT_FUNDS

MANDATE_FAILURE

CUSTOMER_ABANDONED

ISSUER_DECLINED

UNKNOWN_ERROR


Guardrails

Required/target scenarios include:


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


Execution

Required:


Allowed retry

Successful simulated recovery

Failed simulated recovery

Customer-action workflow

Guardrail blocked workflow

Manual-review workflow

Duplicate/idempotent request

Verification outcome


Webhooks

Current required/verified behavior includes:


Valid signature + new event

Invalid signature rejected

Duplicate event no duplicate execution

payment.failed maps to recovery

payment.captured verifies and persists captured payment state; associated order is recorded as paid


Failure Handling

Target:


Razorpay unavailable

AI unavailable with deterministic fallback

Database unavailable

Duplicate request

Invalid transaction

Network timeout

Ambiguous external payment state


51. Deployment & CI/CD Architecture

Target:


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


Potential CI pipeline:


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


Safety-critical regression tests must not be bypassed merely to make deployment pass.

52. Environment Architecture

Local Development


React:

http\://localhost:5173

FastAPI:

http\://127.0.0.1:8000

Swagger:

http\://127.0.0.1:8000/docs


Demo / Deployment

Target:


Frontend HTTPS domain

      ↓

Backend HTTPS domain

      ↓

Supabase

      ↓

Razorpay Test API

      ↑

Webhook callback


CORS must eventually allow only approved frontend origins.

Local webhook testing may require a secure public tunnel.

53. Current Architectural Implementation Snapshot

This section is a convenient architecture snapshot only.

Detailed repository observations may also be recorded in memory.md, while implementation sequencing belongs to phases.md.

As of 2026-09-04, verified/implemented architecture includes:

React/Vite frontend                         ✅
Premium RecoverAI application shell         ✅
Signup / Login UI                           ✅
Supabase frontend authentication            ✅
Protected frontend routing                  ✅
Shared authenticated API helper             ✅

FastAPI backend                             ✅
Supabase JWT validation                     ✅
Protected dashboard API                     ✅
Protected classification API                ✅
Protected recovery APIs                     ✅
Protected audit API                         ✅
Protected AI reasoning API                  ✅

Failure Classifier                          ✅
Recovery Engine                             ✅
Guardrail Engine                            ✅
Recovery Executor                           ✅
Deterministic simulation                    ✅
Verification                                ✅
Agent Replay using backend audit events     ✅

Supabase/PostgreSQL persistence             ✅
Persistent gateway/recovery state           ✅
Persistent idempotency path                 ✅

AI explanation layer                       ✅
Deterministic AI fallback                   ✅
GroqCloud provider integration              ✅

Razorpay Test Mode service                  ✅
Recovery-order API                          ✅
Payment verification API                    ✅
Payment reconciliation API                  ✅
Signed Razorpay webhook                     ✅
Webhook signature verification              ✅
Captured payment synchronization            ✅

Backend regression suite                    ✅
47 passed / 0 failed                        ✅
Frontend production build                   ✅

Current architecture areas that remain incomplete or intentionally future:

merchant-level authorization / tenancy
cross-merchant data isolation
fully calculated production-like dashboard metrics
SSE live dashboard updates
production Razorpay execution
production multi-worker concurrency proof
expanded observability
CI/CD hardening
deployment / demo freeze

Razorpay remains Test Mode only.

Authentication is implemented, but tenant isolation is not.

Dashboard/demo metrics must not be presented as measured merchant production performance unless they are actually calculated from persisted verified data.

54. Immediate Architecture Milestones

Implementation order is ultimately controlled by phases.md.

The core recovery, persistence, AI, Razorpay Test Mode, webhook, and authentication milestones are now implemented and regression-tested.

Current architecture sequence:

Milestone A — Documentation Drift Closure

rules.md
architecture.md
PRD.md
design.md
project-overview.md
phases.md
memory.md

Update stale implementation claims so documentation matches verified behavior.

Milestone B — Authenticated Browser E2E

Verify in the browser:

login
      ↓
protected dashboard request with Bearer token
      ↓
allowed recovery path
      ↓
AI explanation
      ↓
Agent Replay

and

blocked recovery path
      ↓
GUARDRAIL
      ↓
STOP

Also verify logout/direct-route protection.

Milestone C — Final Product Truthfulness Pass

Confirm:

Razorpay is labeled Test Mode
simulation is labeled simulation
demo metrics are labeled honestly
tenant isolation is not claimed
AI is explanation-only

Milestone D — Deployment Readiness

production CORS configuration
environment-variable review
frontend API base URL
backend/frontend deploy smoke test
secret review

Milestone E — Demo Freeze

final regression suite
frontend build
demo data sanity
README / submission consistency
screenshots / pitch flow

Optional polish must not displace safety, correctness, testing, or documentation truthfulness.

55. Architecture Boundaries

Frontend May


Display

Animate

Search

Filter

Request backend actions

Show explanations

Show audit events


Frontend May Not


Store Razorpay secrets

Decide retry safety

Verify payment success

Bypass guardrails

Invent audit steps

Directly execute privileged secret-authenticated payments


AI May


Explain

Summarize

Recommend context

Generate operator-facing reasoning


AI May Not


Override deterministic guardrails

Ignore retry limits

Override idempotency

Directly mark payment successful

Invent payment results

Expose secrets


Recovery Executor May


Coordinate recovery pipeline

Execute allowed actions

Simulate recovery

Call Razorpay service

Verify results

Generate audit events

Finalize execution results


It may not execute when:


can_execute = false


56. Final Architecture Principle

RecoverAI should behave as a:


controlled recovery system


not an unrestricted autonomous payment agent.

Every new feature should preserve:


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


If a proposed feature requires bypassing:

Guardrails

Idempotency

Verification

Auditability

Backend/frontend separation

Payment safety

it should not be added in that form.

57. Single Guardrail Evaluation Rule

For each execution attempt:


DECIDE

   ↓

GUARDRAIL

   ↓

EXECUTE


Guardrails are evaluated:


exactly once


for that attempt.

The decision must occur immediately before execution.

The same attempt must not repeatedly recalculate its Guardrail Decision midway through execution.

Concurrency changes are handled through:


idempotency

persistent reservation

database concurrency protection


not by repeatedly changing the Guardrail result.

58. Guardrail / Execution Invariant

Once an attempt receives:


BLOCKED


that attempt must not execute.

If an external system ever reports that payment execution succeeded for the same attempt despite:


GUARDRAIL = BLOCKED


this is a critical safety inconsistency.

Required response:


audit ERROR

      ↓

do not hide or reinterpret

      ↓

escalate / reconcile

      ↓

investigate as critical defect


59. Configuration Authority

Runtime safety configuration authority is:


backend/core/config.py


Services should import configured thresholds rather than maintain conflicting local literals.

If:


service behavior

≠

core/config.py


treat the difference as a bug unless there is:


documented exception

+

test coverage


Any intentional threshold change requires:


rules

architecture / PRD where referenced

config.py

tests

implementation


to remain synchronized.

60. Documentation Drift Architecture Rule

When an architectural behavior changes, search documentation before commit for old:


endpoint names

status names

config values

workflow stages

table names

field names

priority labels

implementation claims


At minimum review:


rules.md

architecture.md

PRD.md

design.md

project-overview.md

phases.md

memory.md

tests


Do not knowingly maintain two contradictory descriptions of a safety-critical workflow.

61. Stable Audit Contract Across Persistence

The frontend audit contract remains:

GET /api/recovery/audit/{transaction_id}

Agent Replay should remain independent of the backend storage implementation.

Current persistent architecture uses Supabase/PostgreSQL for durable recovery-linked state.

Conceptually:

Recovery / gateway processing
      ↓
persistent audit/recovery state
      ↓
GET /api/recovery/audit/{transaction_id}
      ↓
Agent Replay

Tests or deterministic simulation paths may use controlled in-memory state where appropriate, but production-like persistence claims must refer to the durable Supabase path.

The frontend must not need a different audit UI contract merely because storage is persistent.

62. Execution-Mode Transparency

RecoverAI currently demonstrates two non-production execution contexts:

SIMULATION
RAZORPAY_TEST

SIMULATION represents deterministic RecoverAI recovery-flow behavior.

RAZORPAY_TEST represents real interaction with Razorpay's Test Mode environment.

Neither must be presented as production merchant payment processing.

Visible labels should distinguish, where applicable:

SIMULATION
DEMO DATA
TEST ENVIRONMENT
RAZORPAY TEST MODE

A successful simulation demonstrates RecoverAI logic.

A successful Razorpay Test Mode payment demonstrates the gateway integration in a test environment.

Neither alone proves production merchant revenue was recovered.

63. Canonical Successful Architecture Demo


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


64. Canonical Safety Architecture Demo


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


Expected audit:


DETECT

CLASSIFY

DECIDE

GUARDRAIL


Forbidden for the same blocked attempt:


EXECUTE

VERIFY


This demonstrates that RecoverAI optimizes for:


safe recovery


not:


maximum number of retries


65. Architecture Completion Principle

Architecture is not considered successfully implemented merely because every target component exists.

Success means the system preserves:


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


through the complete recovery flow.

Completion also requires truthful security claims:

authentication implemented
≠
tenant isolation implemented

Razorpay browser API authentication
≠
Razorpay webhook authentication

These trust boundaries must remain explicit in code, tests, and documentation.

END OF ARCHITECTURE DOCUMENT