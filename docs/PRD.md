# RecoverAI — Product Requirements Document

## 1. Document Information

**Product:** RecoverAI  
**Full Name:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent  
**Track:** AI Revenue Recovery  
**Document Type:** Product Requirements Document  
**Status:** Active  
**Version:** 1.1  
**Last Updated:** 2026-08-23  
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

## BANK_UNAVAILABLE

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

## NETWORK_ERROR

```text
Category:
TRANSIENT_NETWORK_FAILURE

Retryable:
Yes

Recommended Action:
SHORT_RETRY
```

---

## PAYMENT_TIMEOUT

```text
Category:
TRANSIENT_TIMEOUT

Recommended Action:
VERIFY_THEN_RETRY
```

---

## INSUFFICIENT_FUNDS

```text
Category:
CUSTOMER_FUNDS

Recommended Action:
CUSTOMER_REMINDER
```

---

## MANDATE_FAILURE

```text
Category:
AUTHORIZATION_FAILURE

Recommended Action:
REQUEST_NEW_PAYMENT_METHOD
```

---

## CUSTOMER_ABANDONED

```text
Category:
CHECKOUT_ABANDONMENT

Recommended Action:
SEND_CHECKOUT_REMINDER
```

---

## ISSUER_DECLINED

```text
Category:
HARD_DECLINE

Recommended Action:
ALTERNATIVE_PAYMENT_METHOD
```

---

## UNKNOWN_ERROR

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

**FR-12 (P0)** — Initial execution mode:

```text
SIMULATION
```

The UI must visibly label simulation-mode results.

Example:

```text
SIMULATION MODE
```

or:

```text
TEST ENVIRONMENT
```

Simulated recovery outcomes must not be presented as real recovered merchant revenue.

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

**FR-17 (P1)** — AI should assist with:

- Human-readable failure explanation
- Recovery reasoning summary
- Operator-facing explanation
- Context summarization
- Confidence narrative

AI is not the financial authority.

AI may **not**:

- Override guardrails
- Ignore retry limits
- Bypass verification
- Mark a payment as successful
- Execute privileged payment operations independently

---

# 32. AI Fallback Requirement

**FR-18 (P1)** — If the AI provider is unavailable:

```text
AI unavailable
      ↓
Use deterministic explanation
      ↓
Continue core recovery workflow
```

The core recovery pipeline must remain usable without an LLM.

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

**FR-21 (P1)** — RecoverAI should integrate with:

```text
Razorpay Test Mode
```

The integration layer should support:

- Test payment operations
- Reading payment status
- Verifying payment result
- Handling test failures
- Receiving payment webhooks

Sensitive credentials must remain backend-only. **FR-56 (P0)**.

---

# 39. Razorpay Webhook Requirement

**FR-38 (P1)** — Target flow:

```text
Razorpay
   ↓
POST /api/webhooks/razorpay
   ↓
Verify signature
   ↓
Check duplicate event
   ↓
Map Razorpay event
   ↓
Trigger RecoverAI workflow
```

Relevant events may include:

```text
payment.failed
payment.authorized
payment.captured
refund.processed
```

The project overview defines payment-failure webhooks as the intended entry path into the recovery pipeline.

---

# 40. Duplicate Protection

**FR-39 (P0)** — RecoverAI must prevent duplicate recovery execution.

Target mechanism:

```text
Idempotency Key
```

Flow:

```text
Recovery Request
      ↓
Check idempotency key
      ↓
Already processed?
   ↙             ↘
 YES             NO
 ↓                ↓
Return old       Execute
result           once
```

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

**FR-22 (P1)** — Target storage:

```text
Supabase
PostgreSQL
```

Core entities:

```text
merchants
transactions
recovery_jobs
audit_events
recovery_metrics
```

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

Initial APIs:

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

Target APIs:

```text
GET  /api/dashboard/stream
POST /api/webhooks/razorpay
```

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
- Keep Supabase private credentials backend-only
- Keep AI provider keys backend-only
- Never commit `.env`
- Provide `.env.example`
- Verify webhook signatures
- Validate incoming API payloads
- Avoid logging secrets
- Avoid storing raw payment credentials

---

# 58. Secrets

Expected environment variables:

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

SUPABASE_URL=
SUPABASE_KEY=

AI_API_KEY=
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

Required test groups, each traced to the FR-IDs it verifies:

```text
Failure classifier     → FR-02
Recovery engine         → FR-03
Guardrails               → FR-04, FR-05, FR-06, FR-07, FR-08, FR-39
Recovery executor         → FR-11, FR-12, FR-13, FR-14
API                        → FR-46 (Section 46 endpoints)
Webhooks                    → FR-38
```

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

Webhook processing latency            < 2s
(Razorpay retry threshold, see architecture.md §28)

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
Failure Classifier          (FR-02)

Recovery Engine               (FR-03)

Guardrail Engine                (FR-04–FR-07, FR-39)

Recovery Executor                 (FR-11–FR-14)

Audit Trail                        (FR-15)

Dashboard                            (FR-32–FR-34)

Transaction Queue                      (FR-34)

Decision Details                         (FR-29)

Agent Replay                               (FR-28)

Simulation Mode                              (FR-12, FR-23)

Core Tests                                     (FR-04–FR-14 coverage)
```

---

## P1 — Strong Buildathon Features

```text
Supabase persistence      (FR-22)

Razorpay Test Mode          (FR-21)

Razorpay webhook              (FR-38)

AI explanation layer            (FR-17, FR-18)

Calculated dashboard metrics      (FR-33)

Charts

Real-time updates                    (FR-20)

Retry cooldown / consecutive-failure   (FR-08, FR-09)
```

---

## P2 — Stretch Features

```text
Authentication

Multi-merchant tenancy

Advanced alerting

Advanced observability

Recovery strategy analytics

Configurable merchant policies

Advanced replay controls

Queue search/filter/sort            (FR-35)
```

---

# 70. Current Build Status

Current state from the established project overview:

```text
Working:

Failure Classifier               ✅

Recovery Engine                  ✅

Guardrail Engine                 ✅

Dashboard shell + Motion UI      ✅

Frontend ↔ Backend communication ✅


In Progress:

Recovery Executor                IN PROGRESS

Audit Trail                      IN PROGRESS


Planned:

AI Reasoning Layer               PENDING

Razorpay Test Mode + Webhooks    PENDING

Supabase Persistence             PENDING

Real-time SSE                    PENDING

Auth / Multi-merchant            PENDING
```

---

# 71. Immediate Development Priority

The implementation order must remain:

```text
1. Finish Recovery Executor

2. Verify:
   DETECT
   CLASSIFY
   DECIDE
   GUARDRAIL
   EXECUTE
   VERIFY

3. Complete Audit Trail

4. Build Agent Replay from audit data

5. Connect real dashboard workflow

6. Add Supabase persistence

7. Add AI explanation layer

8. Add Razorpay Test Mode

9. Add webhooks

10. Test and deploy
```

Do not pause core recovery development solely to add decorative UI features.

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

Named explicitly so they're tracked, not just implied by other sections.

```text
RISK-01  Webhook testing requires a public callback URL.
         Local dev needs a tunnel (e.g. ngrok) to receive Razorpay
         test webhooks — this is a setup dependency the team can
         easily lose time to right before the demo.

         Mitigation: set up the tunnel early, not on demo day;
         keep the manual-API-request path (FR-01) as a fallback
         demo trigger if the tunnel is flaky.


RISK-02  AI provider rate limits or latency could stall the
         AI Decision Drawer's explanation text mid-demo.

         Mitigation: FR-18 fallback (deterministic explanation)
         must actually be exercised in rehearsal, not just exist
         in code.


RISK-03  Guardrail threshold values (Section 18) are reasonable
         defaults, not validated against real transaction data
         or merchant risk tolerance.

         Mitigation: state this explicitly if asked by a panel —
         don't defend ₹50,000 or 0.80 as empirically derived.


RISK-04  Razorpay Test Mode has its own quirks in how it simulates
         failures (not all failure codes are freely triggerable
         via test API).

         Mitigation: confirm which FR-02 failure codes are
         actually reproducible in Razorpay Test Mode before
         building the demo script around them; fall back to
         SIMULATION mode (FR-12) for codes that aren't.


RISK-05  SSE (FR-20) is unproven under the team's deployment
         target (Render/Railway free tiers can behave
         inconsistently with long-lived connections).

         Mitigation: polling fallback is already the documented
         behavior in architecture.md §34 — treat SSE as P1, not
         a blocker, per FR-20's note in Section 37.


DEP-01   Supabase persistence (FR-22) blocks real dashboard
         metrics (FR-33) becoming calculated rather than demo
         data — sequence accordingly (see Section 71, step 6).


DEP-02   Recovery Executor (FR-11) blocks Agent Replay (FR-28)
         showing real data, since replay reads from audit events
         the executor produces — this is why Section 71 orders
         executor before replay.
```

---

# 74. Open Questions

Unresolved items — flagged rather than silently decided, so the team knows what's still a choice.

```text
Q1  Should MAX_RECOVERABLE_AMOUNT_AUTO (₹50,000) be merchant-
    configurable even in the P0 build, or is a single global
    default acceptable for the Buildathon?


Q2  If Razorpay Test Mode can't reproduce a given failure code
    (see RISK-04), is it acceptable for the demo to run entirely
    in SIMULATION mode, or does the panel expect at least one
    live Razorpay Test Mode call?


Q3  Is multi-merchant tenancy (P2) worth a partial implementation
    (e.g. a merchant_id column with no real isolation) to make a
    future P1 push easier, or should it stay fully out of scope
    until after the Buildathon?


Q4  What counts as "success" for Recovery Rate in Section 67 —
    is 60% a real target the classifier/guardrail combination
    should hit on the demo transaction set, or a placeholder that
    needs revisiting once real classification rules are tuned?
```

---

# 75. Final Product Principle

RecoverAI is not an unrestricted autonomous payment agent.

It is a **controlled, explainable, auditable revenue recovery system**.

Every feature should preserve:

> **Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.**