# RecoverAI — Product Requirements Document

## 1. Document Information

**Product:** RecoverAI
**Full Name:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent
**Track:** AI Revenue Recovery
**Document Type:** Product Requirements Document
**Status:** Active
**Version:** 1.2
**Last Updated:** 2026-09-04
**Owner:** Buildathon team (product/eng — see README for contact)
**Primary Environment:** Buildathon / Razorpay Test Environment

**Requirement ID convention:** Functional requirements are tagged `FR-XX`. Each carries a priority (`P0` / `P1` / `P2`, matching Section 68's scope tiers) so an individual requirement — not just a whole feature bucket — can be triaged under time pressure. Test cases in Sections 62–64 reference these IDs.

---

# 2. Product Summary

RecoverAI is an **AI-assisted payment recovery platform** that helps businesses identify, analyze, and recover revenue lost because of failed digital payments.

Instead of treating every failed payment with the same retry strategy, RecoverAI determines:

- Why the payment failed
- Whether the failure is recoverable
- Which recovery strategy is appropriate
- Whether that action is safe to execute
- Whether human review is required
- Whether the recovery succeeded
- How much revenue was recovered

Every decision is explainable and auditable.

RecoverAI is designed as a **controlled financial recovery agent**: AI assists with reasoning and explanations, while deterministic logic remains responsible for safety-critical payment decisions.

---

# 3. Problem Statement

Digital payments fail for many reasons, including:

- Temporary bank outages
- Network errors
- Payment timeouts
- Insufficient funds
- Mandate failures
- Issuer declines
- Checkout abandonment
- Unknown technical errors

A failed payment does not necessarily mean that the customer does not intend to pay. Many failures are temporary and potentially recoverable.

Blindly retrying every failed payment can create:

- Duplicate payment attempts
- Poor customer experience
- Unnecessary notifications
- Increased payment failures
- Unsafe automation
- Operational overhead
- Manual work for finance teams

RecoverAI must therefore determine **when to retry, when to wait, when to contact the customer, when to request a different payment method, when to escalate, and when to stop.**

---

# 4. Product Positioning

RecoverAI is **not intended to replace a payment gateway**.

It acts as a decision, safety, explainability, and visibility layer above payment execution.

```text
Gateway-native retry             RecoverAI
─────────────────────            ───────────────────────────
Fixed retry schedule             Failure-aware strategy
Limited explanation              Explainable decisions
One-size-fits-all                Confidence-gated decisions
Retry focused                    Retry / remind / review / stop
Gateway-level visibility         Cross-transaction intelligence

```

RecoverAI's differentiated value is:

- Explainability
- Safety control
- Auditability
- Recovery intelligence
- Operator visibility

It does not claim to automatically outperform gateway-native recovery on raw retry success rate.

---

# 5. Product Vision

RecoverAI should demonstrate how intelligent agents can participate in financial workflows **without sacrificing safety, explainability, verification, or control**.

The product philosophy is:

> **Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.**

---

# 6. Product Goals

RecoverAI should:

1. Identify failed payment events.
2. Classify the cause of each failure.
3. Determine whether the failure is recoverable.
4. Select an appropriate recovery strategy.
5. Prevent unsafe automated actions.
6. Execute or simulate approved recovery actions.
7. Verify the final payment result.
8. Maintain an audit trail of every decision.
9. Measure recovered revenue.
10. Explain recovery decisions clearly to operators.
11. Provide a premium financial operations dashboard.
12. Demonstrate safe AI usage in a payment environment.

---

# 7. Non-Goals

RecoverAI will not:

- Replace Razorpay or another payment gateway.
- Store raw card numbers.
- Store CVV information.
- Store sensitive payment credentials.
- Allow an LLM to directly execute privileged payment actions.
- Allow AI to override financial guardrails.
- Automatically retry indefinitely.
- Treat a successful API response as proof of successful payment.
- Present simulated recovery data as real financial performance.
- Operate against real customer money during the Buildathon.

---

# 8. Target Users

Primary users:

- Online merchants
- Subscription businesses
- Payment operations teams
- Finance teams
- Revenue operations teams
- Fintech platforms

---

# 9. User Pain Points

## Merchant / Finance Team

Users need to understand:

- How much revenue is currently at risk
- Why payments are failing
- Which failures can be recovered
- What RecoverAI is doing about them
- Whether recovery actions are safe
- How much revenue has been recovered

---

## Payment Operations Team

Users need:

- A recovery queue
- Failure classification
- Recovery recommendations
- Confidence information
- Retry counts
- Guardrail decisions
- Manual-review states
- Full audit history

---

## Engineering / Risk Team

Users need assurance that:

- Recovery logic is deterministic where safety matters
- Duplicate actions are prevented
- Retry limits exist
- External payment state is independently verified
- Every execution is auditable
- AI cannot bypass business rules

---

# 10. User Stories

Pain points above, restated as testable stories. Each maps to functional requirements in Sections 11–39; the mapping is noted so a requirement can be traced back to who it's actually for.

## Finance Lead

```text
US-01  As a finance lead, I want to see total revenue at risk and revenue
       recovered at a glance, so I can report recovery impact without
       digging through transaction logs.
       → FR-32, FR-33

US-02  As a finance lead, I want simulated figures clearly labeled as
       simulation, so I never mistake a demo number for real revenue.
       → FR-23, FR-52

```

## Payments Operations Analyst

```text
US-03  As an ops analyst, I want to click a failed transaction and see
       exactly why the system chose (or refused) a recovery action, so
       I can intervene confidently instead of guessing.
       → FR-29 (AI Decision Drawer)

US-04  As an ops analyst, I want to replay the full decision timeline for
       any transaction, including ones the system blocked, so I can
       audit the system's judgment after the fact.
       → FR-28 (Agent Replay)

US-05  As an ops analyst, I want a queue I can filter by status and
       confidence, so I can prioritize the manual-review cases that
       actually need my attention.
       → FR-34

```

## Engineering / Risk Reviewer

```text
US-06  As a risk reviewer, I want guardrail thresholds to be config values
       with test coverage, not scattered magic numbers, so a threshold
       change can't silently ship unverified.
       → FR-17, FR-63

US-07  As a risk reviewer, I want every recovery execution tied to an
       idempotency key, so a retried request can never double-charge
       or double-retry a customer.
       → FR-39

```

---

# 11. Core Product Workflow

```text
Payment Failure
      ↓
DETECT
      ↓
CLASSIFY
      ↓
ANALYZE
      ↓
DECIDE
      ↓
GUARDRAIL
      ↓
EXECUTE / SIMULATE
      ↓
VERIFY
      ↓
AUDIT
      ↓
MEASURE RECOVERED REVENUE

```

This is the central product journey.

---

# 12. Functional Requirement — Failure Detection

**FR-01 (P0)** — RecoverAI must be capable of receiving a failed transaction.

During development, failures may enter through:

- Manual API requests
- Simulated transaction data

Target integration:

- Razorpay `payment.failed` webhook — see **FR-38 (P1)**.

---

## Required Input

```text
transaction_id
amount
failure_code
retry_count

```

Optional future fields:

```text
merchant_id
external_payment_id
currency
payment_method
timestamp
metadata

```

---

# 13. Functional Requirement — Failure Classification

**FR-02 (P0)** — RecoverAI must classify each failure into a structured category.

Supported failure codes:

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

The classifier must produce:

```text
Failure Category
Retryability
Severity
Recommended Action
Retry Delay
Confidence Score
Explanation

```

---

# 14. Initial Classification Rules

## BANK\_UNAVAILABLE

```text
Category:
TRANSIENT_BANK_FAILURE

Retryable:
Yes

Recommended Action:
DELAYED_RETRY

Retry Delay:
30 minutes

```

---

## NETWORK\_ERROR

```text
Category:
TRANSIENT_NETWORK_FAILURE

Retryable:
Yes

Recommended Action:
SHORT_RETRY

```

---

## PAYMENT\_TIMEOUT

```text
Category:
TRANSIENT_TIMEOUT

Recommended Action:
VERIFY_THEN_RETRY

```

---

## INSUFFICIENT\_FUNDS

```text
Category:
CUSTOMER_FUNDS

Recommended Action:
CUSTOMER_REMINDER

```

---

## MANDATE\_FAILURE

```text
Category:
AUTHORIZATION_FAILURE

Recommended Action:
REQUEST_NEW_PAYMENT_METHOD

```

---

## CUSTOMER\_ABANDONED

```text
Category:
CHECKOUT_ABANDONMENT

Recommended Action:
SEND_CHECKOUT_REMINDER

```

---

## ISSUER\_DECLINED

```text
Category:
HARD_DECLINE

Recommended Action:
ALTERNATIVE_PAYMENT_METHOD

```

---

## UNKNOWN\_ERROR

```text
Category:
UNKNOWN

Recommended Action:
MANUAL_REVIEW

```

---

# 15. Functional Requirement — Recovery Engine

**FR-03 (P0)** — The Recovery Engine must convert the classifier result into a structured recovery decision.

Supported strategies:

```text
DELAYED_RETRY
SHORT_RETRY
VERIFY_THEN_RETRY
CUSTOMER_REMINDER
SEND_CHECKOUT_REMINDER
REQUEST_NEW_PAYMENT_METHOD
ALTERNATIVE_PAYMENT_METHOD
MANUAL_REVIEW
STOP

```

A recovery decision must contain:

```text
transaction_id
amount
failure_code
category
action
status
retryable
retry_delay_minutes
confidence
reason

```

---

# 16. Recovery Statuses

Initial recovery statuses:

```text
RETRY_SCHEDULED
CUSTOMER_ACTION_REQUIRED
MANUAL_REVIEW
STOPPED

```

Target recovery job states:

```text
CREATED
CLASSIFYING
DECIDING
GUARDRAIL_CHECKING
RECOVERING
VERIFYING
RECOVERED
FAILED
BLOCKED
REVIEW_REQUIRED
APPROVED
REJECTED

```

The exact state machine is defined in `architecture.md`.

---

# 17. Functional Requirement — Guardrail Engine

**FR-04 (P0)** — The Guardrail Engine is mandatory. No recovery action may execute without passing guardrail evaluation.

Primary guardrails:

- Maximum retry limit — **FR-05 (P0)**
- Minimum confidence — **FR-06 (P0)**
- Minimum confidence floor — **FR-06 (P0)**
- Amount threshold — **FR-07 (P0)**
- Retry cooldown — **FR-08 (P1)**
- Duplicate protection — **FR-39 (P0)**
- Manual-review conditions — **FR-06 (P0)**
- Consecutive failure limit — **FR-09 (P1)**
- Stop conditions — **FR-06 (P0)**

Note the priority split within what Section 68 buckets as a single P0 feature: confidence, retry-limit, and amount thresholds are non-negotiable for the demo's safety story (P0), while cooldown enforcement and consecutive-failure limits improve robustness but won't break the core narrative if partially stubbed under time pressure (P1).

---

# 18. Guardrail Configuration

The target configuration is:

```text
MAX_RETRIES                       = 2

MIN_CONFIDENCE_AUTO_EXECUTE       = 0.80

MIN_CONFIDENCE_ANY_ACTION         = 0.50

RETRY_COOLDOWN_MINUTES            = 15

DUPLICATE_WINDOW_SECONDS          = 30

MAX_RECOVERABLE_AMOUNT_AUTO       = ₹50,000

STOP_ON_CONSECUTIVE_FAILURES      = 2

```

These values must eventually live in configuration rather than being duplicated as magic constants throughout the application. See **RISK-03** in Section 73 — these are defaults, not validated business figures.

---

# 19. Guardrail Decision Rules

## Automatic Execution

Allow automation when:

```text
confidence >= 0.80
AND
retry_count < 2
AND
amount <= ₹50,000
AND
cooldown passed
AND
no duplicate recovery exists
AND
no stop condition exists

```

---

## Manual Review

Require manual review when:

```text
0.50 <= confidence < 0.80

```

or when:

```text
amount > ₹50,000

```

unless another stronger blocking condition exists.

---

## Stop

Stop automated recovery when:

```text
confidence < 0.50

```

or when no safe recovery strategy exists.

---

## Block

Block further retry when:

```text
retry_count >= 2

```

---

# 20. Guardrail Outputs

Possible statuses:

```text
ALLOWED
BLOCKED
REVIEW_REQUIRED

```

The executor must never proceed when:

```text
can_execute = false

```

---

# 21. Required Safe-Recovery Demo

Example:

```text
Transaction:
RX18492

Amount:
₹7,499

Failure:
BANK_UNAVAILABLE

Confidence:
94%

Retry Count:
0 / 2

```

Guardrail:

```text
Confidence             94%       ✓
Retry Count             0/2      ✓
Amount                   ₹7,499   ✓
Stop Condition          False     ✓

STATUS:
ALLOWED

```

The recovery workflow may continue.

---

# 22. Required Blocked-Recovery Demo

**FR-10 (P0)** — The product must deliberately demonstrate at least one blocked recovery.

Example:

```text
Transaction:
RX20117

Amount:
₹68,000

Failure:
BANK_UNAVAILABLE

Retry Count:
2 / 2

```

Expected result:

```text
Confidence               91%         ✓
Retry Count               2 / 2      ✗
Amount                    ₹68,000    ✗

GUARDRAIL STATUS:

BLOCKED

```

The system must not perform a third silent retry.

The decision and blocking reason must be recorded in the audit trail.

---

# 23. Functional Requirement — Recovery Executor

**FR-11 (P0)** — The Recovery Executor must:

1. Receive a recovery request.
2. Re-run or reference the approved decision.
3. Evaluate guardrails.
4. Refuse execution when guardrails fail.
5. Execute or simulate allowed recovery actions.
6. Verify the resulting payment state.
7. Determine recovered amount.
8. Produce audit events.
9. Return a structured execution response.

---

# 24. Buildathon Execution Mode

**FR-12 (P0)** — RecoverAI must make the active execution context explicit.

Current Buildathon execution contexts are:

```text
SIMULATION
RAZORPAY_TEST
```

`SIMULATION` is used for deterministic recovery-flow demonstration.

`RAZORPAY_TEST` is used for the isolated Razorpay Test Mode integration.

The UI must visibly label whichever non-production context is active.

Examples:

```text
SIMULATION MODE
RAZORPAY TEST MODE
TEST ENVIRONMENT
```

Neither simulation nor Razorpay Test Mode may be presented as production merchant payment processing.

Simulated recovery outcomes must not be presented as real recovered merchant revenue.

A successful Razorpay Test Mode payment proves the gateway integration in a test environment; it does not prove production merchant revenue recovery.

---

# 25. Recovery Simulation

**FR-13 (P0)** — For retryable failures, RecoverAI may use deterministic simulation during development.

A simulation should:

- Be repeatable for the same transaction
- Avoid random demo behavior changing unexpectedly
- Return a recovery result
- Return a simulation probability
- Generate audit events
- Clearly identify itself as simulated

---

# 26. Functional Requirement — Verification

**FR-14 (P0)** — Execution success must **not automatically mean payment success**.

Required flow:

```text
EXECUTE
   ↓
VERIFY
   ↓
FINAL STATUS

```

Verification must determine whether payment was truly recovered.

Possible outcomes:

```text
RECOVERED
FAILED
PENDING
ACTION_COMPLETED
BLOCKED
REVIEW_REQUIRED

```

---

# 27. Functional Requirement — Audit Trail

**FR-15 (P0)** — Every recovery workflow must produce an audit history.

Required steps:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY

```

Additional possible events:

```text
ESCALATE
STOP
WEBHOOK_RECEIVED

```

---

# 28. Audit Event Structure

Each audit event should contain:

```json
{
  "step": "GUARDRAIL",
  "status": "ALLOWED",
  "message": "All RecoverAI safety checks passed.",
  "timestamp": "2026-08-23T10:32:17Z"
}

```

Audit events should ultimately be append-only. **FR-16 (P1)**.

---

# 29. Functional Requirement — Agent Replay

**FR-28 (P0)** — Agent Replay is a key product differentiator.

The user must be able to select a transaction and visually replay:

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

```

For a blocked workflow, replay must stop at the appropriate step.

Example:

```text
DETECT
✓

CLASSIFY
✓

DECIDE
✓

GUARDRAIL
⛔ BLOCKED

```

No fake `EXECUTE` or `VERIFY` step should appear if they did not happen.

The replay must reflect backend audit data rather than frontend-generated fictional events.

Serves **US-04**.

---

# 30. Functional Requirement — AI Decision Drawer

**FR-29 (P0)** — Clicking a transaction should open a drawer showing:

```text
Transaction ID
Amount
Failure Code
Failure Category

AI Diagnosis
Confidence

Recommended Action
Retry Delay

Estimated Recovery Probability

Retry Count
Guardrail Status

Explanation / Reason
Audit Trail

```

The drawer should make the decision understandable to an operations user. Serves **US-03**.

---

# 31. Functional Requirement — AI Reasoning Layer

**FR-17 (P1)** — RecoverAI provides an implemented explanation-only AI layer.

The AI layer may assist with:

- Human-readable failure explanation
- Recovery reasoning summary
- Operator-facing explanation
- Context summarization
- Confidence narrative
- Deterministic safety explanation grounded in the current guardrail state

The current provider integration uses GroqCloud-compatible chat completion infrastructure.

The deterministic RecoverAI services remain authoritative for:

```text
failure classification
recovery action
confidence values
guardrail outcome
execution permission
verification
payment success state
```

AI is not the financial authority.

AI may **not**:

- Override guardrails
- Ignore retry limits
- Change deterministic classification
- Change the selected recovery action
- Bypass verification
- Mark a payment as successful
- Execute privileged payment operations independently
- Claim revenue was recovered without verified payment state

---

# 32. AI Fallback Requirement

**FR-18 (P1)** — If the AI provider is unavailable or its response is unusable:

```text
AI provider unavailable / invalid
      ↓
Use deterministic fallback explanation
      ↓
Continue core recovery workflow
```

The core recovery pipeline must remain usable without an LLM.

Provider failure must not weaken payment safety or change the deterministic decision.

---

# 33. Functional Requirement — Dashboard

**FR-32 (P0)** — RecoverAI must provide a Command Center.

Primary metrics:

```text
Revenue at Risk
Revenue Recovered
Recovery Rate
Active Recoveries
Failed Payments
Recovered Today

```

Secondary metrics may include:

```text
Successful Retries
Manual Reviews
Guardrail Blocks
Average Recovery Time

```

The Command Center requirements are consistent with the project overview.

---

# 34. Dashboard Metric Definitions

## Revenue at Risk

```text
SUM(amount of recoverable failed payments)

```

**FR-33 (P0)**

---

## Revenue Recovered

```text
SUM(recovered_amount)

```

**FR-33 (P0)**

---

## Recovery Rate

```text
Revenue Recovered
────────────────── × 100
Revenue at Risk

```

**FR-33 (P0)**

---

## Active Recoveries

Number of recovery jobs currently in a non-terminal state.

**FR-33 (P0)**

---

# 35. Recovery Queue

**FR-34 (P0)** — The dashboard must contain a recovery transaction queue.

Required columns:

```text
Transaction
Amount
Failure Reason
Agent Action
Confidence
Status

```

Users should be able to click a row to inspect the decision.

Future functionality (**FR-35, P2**):

- Search
- Filter by status
- Filter by failure type
- Filter by amount
- Sort by confidence
- Sort by amount
- Filter manual-review cases

Serves **US-05**.

---

# 36. Live Agent Activity

**FR-19 (P1)** — RecoverAI should display recent recovery activity.

Examples:

```text
Payment failure detected

Failure classified

Recovery strategy selected

Guardrail approved

Recovery blocked

Retry executed

Verification completed

Revenue recovered

```

---

# 37. Real-Time Requirements

**FR-20 (P1)** — Target architecture should support:

```text
FastAPI
   ↓
Server-Sent Events
   ↓
React Dashboard

```

The frontend should update when:

- New audit events arrive
- Recovery status changes
- Revenue is recovered
- Guardrails block an action

The project overview identifies SSE-based live dashboard updates as a planned capability. If SSE is not ready by demo time, a 5–10s polling fallback (already specified in `architecture.md` Section 34) satisfies this requirement — real-time is a UX target, not a hard demo blocker.

---

# 38. Functional Requirement — Razorpay Integration

**FR-21 (P1)** — RecoverAI integrates with:

```text
Razorpay Test Mode
```

Current implemented browser-facing Razorpay operations include:

```text
POST /api/razorpay/recovery-order
POST /api/razorpay/verify-payment
POST /api/razorpay/reconcile-payment
```

The integration supports:

- Creating or reusing Test Mode recovery orders from trusted backend state
- Reading Test Mode payment/order state
- Server-side payment verification
- Independent reconciliation when normal browser verification is incomplete
- Persisting gateway-linked recovery state
- Receiving signed Razorpay webhooks
- Synchronizing verified captured payment state

The frontend must not decide trusted amount, currency, guardrail status, or payment success.

The browser-facing Razorpay endpoints require RecoverAI user authentication.

Sensitive Razorpay credentials remain backend-only. **FR-56 (P0)**.

Razorpay remains Test Mode only for the Buildathon.

---

# 39. Razorpay Webhook Requirement

**FR-38 (P1)** — Implemented webhook trust flow:

```text
Razorpay
   ↓
POST /api/razorpay/webhook
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
Persist/link trusted gateway state
   ↓
Reuse RecoverAI safety/idempotency/verification rules
```

The webhook is authenticated by Razorpay signature verification.

It must **not** require a Supabase browser-user JWT.

Supabase user authentication and Razorpay webhook authentication are separate trust boundaries.

Current verified webhook behavior includes trusted `payment.captured` synchronization and persistence/linkage of the captured payment/order state.

Other event mappings may be expanded only when implementation and tests support them.

Invalid signatures must be rejected.

Duplicate webhook delivery must not create duplicate financial execution.

---

# 40. Duplicate Protection

**FR-39 (P0)** — RecoverAI must prevent duplicate recovery execution.

The required mechanism is durable idempotency for gateway-linked execution.

Conceptual flow:

```text
Recovery Request
      ↓
Resolve idempotency identity
      ↓
Look up persistent state/result
      ↓
Already completed?
   ↙             ↘
 YES              NO
 ↓                 ↓
Return existing   Reserve state
result            BEFORE execution
                     ↓
                  Execute once
                     ↓
                  Verify
                     ↓
                  Persist/finalize
```

The same duplicate-safety principle applies to repeated browser requests, reconciliation, and webhook redelivery.

Process-local stores may still be used in deterministic tests or simulation paths, but they must not be described as the durability mechanism for gateway-linked execution.

Serves **US-07**.

---

# 41. Retry Safety

**FR-05 (P0)** — A transaction must never receive unlimited retry attempts.

Initial maximum:

```text
2 retries

```

Retry count must be visible to operators.

Example:

```text
Retry Count
1 / 2

```

---

# 42. Data Persistence Requirements

**FR-22 (P1)** — RecoverAI uses:

```text
Supabase
PostgreSQL
```

for durable gateway/recovery-linked state.

The current persistent path supports recovery/gateway state, idempotency, verification/reconciliation state, and audit-related persistence required around Razorpay Test Mode integration.

Conceptual entities include:

```text
transactions
recovery_jobs
audit_events
gateway order/payment linkage
idempotency state
```

In-memory stores may remain in deterministic tests, simulation paths, or local fallback behavior, but must not be represented as crash-safe financial persistence.

Future multi-merchant storage may introduce or fully enforce:

```text
merchants
merchant_id
merchant-scoped authorization
tenant isolation
```

The presence of authentication or a `merchant_id` field alone does not prove tenant isolation.

---

# 43. Transaction Entity

Expected fields:

```text
id
merchant_id
external_payment_id
amount
currency
status
failure_code
failure_reason
retry_count
created_at
updated_at

```

Financial values should ultimately be stored in the gateway's smallest currency unit where appropriate.

---

# 44. Recovery Job Entity

Expected fields:

```text
id
transaction_id
recovery_action
recovery_status
confidence
retry_delay_minutes
guardrail_status
execution_status
recovered_amount
idempotency_key
created_at
updated_at

```

---

# 45. Audit Event Entity

Expected fields:

```text
id
transaction_id
recovery_job_id
step
status
message
metadata
created_at

```

Audit history should be append-only.

---

# 46. API Requirements

Current public application/system APIs:

```text
GET  /
GET  /health
```

Current protected browser-facing APIs:

```text
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
```

Protected browser requests use:

```text
Authorization: Bearer <Supabase access token>
```

and are validated by the backend authentication dependency.

Razorpay webhook API:

```text
POST /api/razorpay/webhook
```

The webhook uses Razorpay signature verification rather than a browser-user JWT.

Optional/future API:

```text
GET /api/dashboard/stream
```

Breaking API changes must be coordinated with frontend code, tests, and canonical documentation.

---

# 47. Frontend Technology Requirements

```text
React
TypeScript
Vite
Motion for React
Recharts
Lucide React

```

This stack is part of the established project architecture.

---

# 48. Backend Technology Requirements

```text
Python
FastAPI
Pydantic
Uvicorn

```

---

# 49. Database Requirements

```text
Supabase
PostgreSQL

```

---

# 50. Payment Technology

```text
Razorpay Test Mode
Razorpay Webhooks

```

---

# 51. Deployment Targets

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
Supabase

```

---

# 52. UX Requirements

RecoverAI must feel like a:

> **Premium AI-powered fintech command center**

The interface should communicate:

- Trust
- Intelligence
- Safety
- Financial clarity
- Real-time activity
- Professional engineering quality

Core screens:

```text
Command Center
Transactions
Recovery Agent
Agent Replay
Activity
Guardrails
Settings

```

---

# 53. Visual Safety Requirements

**FR-23 (P0)** — The interface must visibly distinguish:

```text
REAL DATA
DEMO DATA
AI EXPLANATION
SIMULATION
TEST ENVIRONMENT
GUARDRAIL DECISION

```

Simulated metrics must never visually imply actual merchant financial performance. Serves **US-02**.

---

# 54. Accessibility Requirements

**FR-24 (P1)** — The UI should support:

- Keyboard navigation
- Visible focus states
- Accessible contrast
- Semantic tables
- Labels for controls
- `aria-label` for icon-only buttons
- Status indicators that do not rely only on color
- Responsive layouts

---

# 55. Loading Requirements

**FR-25 (P1)** — Never show unexplained blank screens.

Use:

- Skeleton cards
- Skeleton table rows
- Loading indicators
- Loading text

Example:

```text
RecoverAI is analyzing transactions...

```

---

# 56. Error Requirements

**FR-26 (P0)** — User-facing errors must remain understandable.

Example:

```text
Unable to load recovery data.

The backend service is temporarily unavailable.

[ Retry ]

```

Stack traces must never appear in normal frontend UI.

---

# 57. Security Requirements

**FR-56 (P0)** — RecoverAI must:

- Keep Razorpay secrets backend-only
- Keep Supabase private/service-role credentials backend-only
- Keep AI provider keys backend-only
- Never commit secret-bearing `.env` files
- Provide `.env.example` with placeholders when useful
- Verify Razorpay webhook signatures
- Validate incoming API payloads
- Avoid logging secrets
- Avoid storing raw payment credentials
- Enforce authentication on protected browser-facing APIs
- Keep Razorpay webhook authentication separate from browser-user authentication

**FR-57 (P1 / implemented)** — Browser authentication uses:

```text
Supabase Auth
      ↓
Supabase access token
      ↓
Authorization: Bearer <JWT>
      ↓
FastAPI get_current_user
      ↓
Protected RecoverAI API
```

Missing or invalid browser authentication must be rejected for protected endpoints.

Authentication establishes user identity and blocks anonymous access.

It does **not** by itself provide:

```text
merchant-level authorization
tenant isolation
per-user merchant data scoping
cross-merchant row isolation
```

RecoverAI must not claim multi-merchant isolation until those controls are explicitly implemented and tested.

---

# 58. Secrets

Backend environment variables include values such as:

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

SUPABASE_URL=
SUPABASE_SECRET_KEY=

GROQ_API_KEY=
```

Frontend configuration may contain only browser-safe/public values intended for client use, such as:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
```

The frontend must never receive:

```text
Supabase service-role/private secret
Razorpay key secret
Razorpay webhook secret
private AI-provider API key
```

---

# 59. Performance Requirements

**FR-27 (P1)** — For the Buildathon MVP:

- Dashboard initial load should feel responsive.
- Classification should return near-instantly.
- Recovery decision generation should not visibly block the UI.
- Motion should never delay user interaction.
- External AI failures must not freeze the core recovery workflow.
- Loading states should appear for delayed operations.

See Section 66 for concrete target numbers backing "responsive" and "near-instantly."

---

# 60. Reliability Requirements

**FR-40 (P0)** — The system should handle:

- Network failures
- External API timeout
- AI provider unavailable
- Duplicate recovery request
- Duplicate webhook
- Invalid transaction
- Retry limit reached
- Unknown payment status
- Database failure

No ambiguous external payment state should trigger a blind retry.

---

# 61. Observability Requirements

**FR-41 (P1)** — Important events should be logged:

```text
Transaction received
Failure classified
Recovery decision created
Guardrail approved
Guardrail blocked
Recovery executed
Verification completed
Verification failed
AI fallback activated
Razorpay unavailable
Database unavailable

```

Never log:

```text
API secrets
Passwords
CVV
Full card numbers
Sensitive payment credentials

```

---

# 62. Testing Requirements

Required test groups remain traceable to the requirements they protect:

```text
Failure classifier     → FR-02
Recovery engine        → FR-03
Guardrails             → FR-04, FR-05, FR-06, FR-07, FR-08, FR-39
Recovery executor      → FR-11, FR-12, FR-13, FR-14
API                     → Section 46 endpoint behavior
AI reasoning            → FR-17, FR-18
Razorpay Test Mode      → FR-21
Webhooks                → FR-38
Authentication          → FR-56, FR-57
Persistence/idempotency → FR-22, FR-39
```

As of **2026-09-04**, the verified backend regression result is:

```text
47 passed
0 failed
2 non-blocking Supabase client deprecation warnings
```

Authentication tests must verify anonymous requests are rejected from protected browser-facing APIs.

Razorpay business tests may use a deterministic authenticated test-user dependency override so gateway/recovery behavior can be tested independently of live Supabase login.

The Razorpay webhook must be tested through its own signature-verification boundary rather than expecting browser-authentication `401` behavior.

---

# 63. Required Classification Tests

Test all supported codes (verifies **FR-02**):

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

# 64. Required Guardrail Tests

Verifies **FR-04 through FR-09, FR-39**. At minimum:

```text
Retry 0/2 → Allowed

Retry 1/2 → Allowed

Retry 2/2 → Blocked

Confidence 0.94 → Allowed

Confidence 0.65 → Review Required

Confidence 0.40 → Stop

Amount ₹75,000 → Manual Review

Duplicate execution → Prevented

Cooldown violation → Blocked

```

A change to any value in Section 18 must add or update a test here before merge — this is the enforcement mechanism for **US-06**.

---

# 65. Required Executor Tests

Verifies **FR-11 through FR-14, FR-39**.

```text
Allowed retry

Successful simulated recovery

Failed simulated recovery

Blocked recovery

Manual-review workflow

Customer-action workflow

Repeated idempotency key

```

---

# 66. Required Demo Story

The final demo should show at least two transactions.

## Demo A — Successful Recovery

```text
₹7,499 payment fails
        ↓
BANK_UNAVAILABLE
        ↓
94% confidence
        ↓
DELAYED_RETRY
        ↓
Guardrail ALLOWED
        ↓
Execute
        ↓
Verify
        ↓
₹7,499 RECOVERED

```

Dashboard Revenue Recovered should update.

---

## Demo B — Guardrail Protection

```text
₹68,000 payment fails
        ↓
BANK_UNAVAILABLE
        ↓
Retry Count 2/2
        ↓
Amount > ₹50,000
        ↓
Guardrail BLOCKED
        ↓
No execution
        ↓
Manual review / audit

```

This demonstrates that RecoverAI is designed to stop unsafe actions, not just maximize retries.

---

# 67. Success Metrics — With Targets

Listing a metric without a target makes it a display field, not a success criterion. Targets below are Buildathon-appropriate — not production SLAs.

## Product Metrics

```text
Metric                     Target (Buildathon demo)
Revenue at Risk             Displayed, no target — informational
Revenue Recovered            Displayed, no target — informational
Recovery Rate                  ≥ 60% across demo transaction set
Recovery Attempts               n/a — informational
Successful Recoveries            At least 1 shown live in demo (Demo A)
Guardrail Blocks                  At least 1 shown live in demo (Demo B)
Manual Reviews                     Displayed, no target — informational
Active Recoveries                   Displayed, no target — informational

```

## Technical Metrics

```text
Metric                          Target (Buildathon demo)
API error rate                    < 1% across demo run
Recovery execution error rate       0% unhandled exceptions during demo
AI fallback rate                     n/a — acceptable if AI unavailable, per FR-18
Webhook processing latency            < 2s (Razorpay retry threshold, see architecture.md §28)
Guardrail block rate                   No target — correctness matters, not rate
Dashboard initial load                  < 2s on demo hardware/network
Classification response time              < 500ms

```

---

# 68. Buildathon Success Criteria

The project will be considered demo-ready when:

- Failure classification works end-to-end.
- Recovery decisions are generated.
- Guardrails visibly allow and block transactions.
- Recovery execution/simulation works.
- Verification produces final status.
- Audit events are generated.
- Dashboard consumes backend data.
- Agent Replay shows real audit events.
- At least one recovery succeeds in demo.
- At least one recovery is intentionally blocked.
- Simulation mode is clearly labeled.
- Repository is public and clean.
- Secrets are excluded.
- README explains architecture and setup.
- Project is deployed or reproducibly runnable.
- Five-minute demonstration can explain the product without relying on hidden steps.

---

# 69. MVP Scope

## P0 — Must Have

```text
Failure Classifier             (FR-02)
Recovery Engine                (FR-03)
Guardrail Engine               (FR-04–FR-07, FR-39)
Recovery Executor              (FR-11–FR-14)
Audit Trail                    (FR-15)
Dashboard                      (FR-32–FR-34)
Transaction Queue              (FR-34)
Decision Details               (FR-29)
Agent Replay                   (FR-28)
Simulation Mode                (FR-12, FR-23)
Core Safety Tests              (FR-04–FR-14 coverage)
```

---

## P1 — Strong Buildathon Features

```text
Supabase persistence           (FR-22)          IMPLEMENTED
Razorpay Test Mode             (FR-21)          IMPLEMENTED
Razorpay webhook               (FR-38)          IMPLEMENTED
AI explanation layer           (FR-17, FR-18)   IMPLEMENTED
Authentication                 (FR-57)          IMPLEMENTED
Charts                                           IMPLEMENTED where used

Calculated dashboard metrics   (FR-33)          PARTIAL / DEMO DATA REMAINS
Real-time SSE updates          (FR-20)          OPTIONAL / FUTURE
Retry cooldown / consecutive-
failure extensions             (FR-08, FR-09)   verify before claiming complete
```

Authentication was originally treated as a stretch capability but is now implemented and therefore belongs in the current Buildathon product description.

---

## P2 — Stretch / Future Features

```text
Multi-merchant tenancy
Merchant-level authorization
Cross-merchant row isolation
Advanced alerting
Advanced observability
Recovery strategy analytics
Configurable merchant policies
Advanced replay controls
Queue search/filter/sort        (FR-35)
```

Authentication must not be conflated with these future tenancy capabilities.

---

# 70. Current Build Status

As of **2026-09-04**:

```text
Core Product

Failure Classifier                         ✅
Recovery Engine                            ✅
Guardrail Engine                           ✅
Recovery Executor                          ✅
Verification                               ✅
Audit API / Agent Replay                   ✅
Dashboard shell + Motion UI                ✅
Frontend ↔ Backend communication           ✅


Persistence / AI

Supabase/PostgreSQL persistence            ✅
Persistent gateway/recovery state          ✅
Persistent idempotency path                ✅
AI Reasoning Layer                         ✅
Deterministic AI fallback                  ✅
GroqCloud provider integration             ✅


Razorpay Test Mode

Razorpay recovery-order API                ✅
Payment verification API                   ✅
Payment reconciliation API                 ✅
Razorpay signed webhook                    ✅
Webhook signature verification             ✅
Captured payment synchronization           ✅


Authentication

Supabase signup/login/session              ✅
Protected frontend routing                 ✅
Bearer-token API helper                    ✅
FastAPI user-token validation              ✅
Protected browser-facing APIs              ✅


Quality

Backend regression suite                   ✅ 47 passed / 0 failed
Frontend production build                  ✅


Still Future / Incomplete

Multi-merchant tenancy                     ❌
Merchant-level authorization               ❌
Cross-merchant data isolation              ❌
Production Razorpay processing             ❌
SSE live updates                           optional/future
Production multi-worker concurrency proof  future
Deployment/demo freeze                     remaining
```

Razorpay remains **Test Mode only**.

Authentication is implemented, but tenant isolation is not.

Dashboard/demo values must not be represented as real merchant production metrics unless they are actually calculated from persisted verified transaction data.

---

# 71. Immediate Development Priority

The core recovery, persistence, AI, Razorpay Test Mode, webhook, and authentication milestones are implemented.

The current priority is:

```text
1. Finish documentation drift alignment

   rules.md
   architecture.md
   PRD.md
   design.md
   project-overview.md
   phases.md
   memory.md

2. Re-run backend regression suite

   expected current baseline:
   47 passed / 0 failed

3. Re-run frontend production build

4. Perform authenticated browser E2E

   login
      ↓
   dashboard
      ↓
   allowed RX18492 recovery
      ↓
   AI explanation
      ↓
   Agent Replay

5. Verify blocked RX20117 path

   GUARDRAIL = BLOCKED
      ↓
   no EXECUTE
   no VERIFY

6. Verify logout and protected-route behavior

7. Review production CORS / environment configuration

8. Deploy and smoke-test

9. Freeze demo / README / submission claims
```

Do not add decorative features at the cost of correctness, security boundaries, deployment readiness, or demo stability.

---

# 72. Product Decision Rule

When choosing between two features, prioritize in this order:

```text
Safety
  ↓
Correctness
  ↓
End-to-End Functionality
  ↓
Explainability
  ↓
Auditability
  ↓
UX
  ↓
Animation / Polish

```

A visually impressive feature must not weaken payment safety or delay completion of the end-to-end recovery pipeline.

---

# 73. Risks & Dependencies

Current risks and dependencies should reflect the implemented state rather than the original build plan.

```text
RISK-01  Webhook delivery requires a publicly reachable callback.
         Local signed Razorpay webhook testing has been proven through
         a secure tunnel, but the deployed demo still needs a stable
         callback configuration if webhook behavior is shown live.
         Mitigation: keep the verified manual/browser path available
         and configure the deployed callback before demo freeze.

RISK-02  AI provider rate limits, latency, or provider failure can
         affect explanation quality/timing.
         Mitigation: deterministic fallback is implemented and must
         remain usable without changing the recovery decision.

RISK-03  Guardrail threshold values are Buildathon defaults rather
         than empirically validated merchant-specific risk policy.
         Mitigation: describe them as explicit deterministic safety
         baselines, not data-derived universal thresholds.

RISK-04  Razorpay Test Mode cannot reproduce every real-world failure
         scenario in the same way as production.
         Mitigation: use Razorpay Test Mode for gateway integration
         proof and deterministic SIMULATION for controlled recovery
         scenarios that Test Mode cannot reproduce.

RISK-05  SSE remains optional and unproven under the final deployment
         target.
         Mitigation: do not make SSE a demo blocker; current REST
         requests and backend audit replay are sufficient.

RISK-06  Authentication can be mistaken for tenant isolation.
         Current authenticated users are protected from anonymous
         access, but merchant-level authorization/data isolation has
         not been implemented.
         Mitigation: make this limitation explicit in docs and demo
         claims; do not describe the product as multi-tenant secure.

RISK-07  Production deployment configuration can introduce CORS,
         environment-variable, callback-URL, or secret-management
         errors even when local tests pass.
         Mitigation: perform a deployment smoke test before demo
         freeze and never expose private keys in frontend variables.

DEP-01   Documentation drift must be closed before the next behavior-
         changing commit so the canonical docs match the verified
         implementation.

DEP-02   Browser E2E depends on a valid Supabase user session and the
         frontend sending the Supabase access token to protected APIs.

DEP-03   A live Razorpay webhook demo depends on the final backend
         being reachable from Razorpay over HTTPS.
```

---

# 74. Open Questions

Only genuinely unresolved product choices should remain open.

```text
Q1  Should MAX_RECOVERABLE_AMOUNT_AUTO (₹50,000) become merchant-
    configurable after the Buildathon, or remain a global baseline
    until merchant-level authorization/policy scoping exists?

Q2  Should the final five-minute demo show both:
      - deterministic SIMULATION for the full recovery story, and
      - one Razorpay Test Mode proof point,
    or use Razorpay Test Mode only where it adds clear judge value?

Q3  What is the right post-Buildathon design for multi-merchant
    isolation: merchant membership/roles plus database RLS, or another
    explicitly tested authorization model?

Q4  When dashboard metrics move fully from demo data to calculated
    persisted values, what evaluation dataset/window should define a
    meaningful Recovery Rate target?
```

Resolved:

```text
- Do not implement "partial tenancy" and then imply isolation.
- Authentication may exist without merchant-level tenancy.
- Razorpay Test Mode integration is already implemented and proven;
  the remaining choice is how much of it to show in the final demo.
```

---

# 75. Final Product Principle

RecoverAI is not an unrestricted autonomous payment agent.

It is a **controlled, explainable, auditable revenue recovery system**.

Every feature should preserve:

> **Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.**

Product claims must also preserve these distinctions:

```text
authentication implemented
≠
tenant isolation implemented

Razorpay Test Mode
≠
production payment processing

AI explanation
≠
financial authority

simulation result
≠
real merchant revenue
```
