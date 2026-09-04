# RecoverAI — Project Overview

**Project:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent
**Track:** AI Revenue Recovery
**Document:** Project Overview
**Status:** ACTIVE
**Last Updated:** 2026-09-04


## Project Title

**RecoverAI — Intelligent AI-Powered Revenue Recovery Agent**

## Track

**AI Revenue Recovery**

## Project Overview

RecoverAI is an **AI-assisted payment recovery platform** designed to help businesses identify, analyze, and safely recover revenue lost because of failed digital payments.

Instead of treating every failed payment in the same way, RecoverAI:

```text
detects the failure
      ↓
classifies the cause
      ↓
selects a recovery strategy
      ↓
applies deterministic guardrails
      ↓
executes only when permitted
      ↓
verifies the payment outcome
      ↓
records the audit trail
```

The system is designed as a **controlled financial recovery agent**.

AI helps explain deterministic decisions and transaction context, while deterministic backend logic remains responsible for:

```text
classification authority
recovery strategy
confidence values
guardrails
execution permission
verification
payment success state
```

The current Buildathon implementation includes Supabase authentication, persistent Supabase/PostgreSQL recovery state, an explanation-only AI layer, and Razorpay **Test Mode** integration.

Razorpay Test Mode must not be presented as production payment processing.

Authentication is implemented, but merchant-level tenancy/data isolation is not.

---

## Problem Statement

Businesses process thousands of digital payments every day.

Some payments fail because of:

- Temporary bank outages
- Network errors
- Payment timeouts
- Insufficient funds
- Mandate failures
- Issuer declines
- Checkout abandonment
- Unknown technical failures

A failed payment does not always mean the customer is unwilling to pay.

Many failures are temporary and can potentially be recovered.

However, blindly retrying every failed transaction can create problems such as:

- Repeated customer charges
- Poor customer experience
- Increased payment failures
- Duplicate recovery attempts
- Unnecessary notifications
- Operational workload
- Unsafe automated behavior

RecoverAI solves this by deciding **when to retry, when to wait, when to contact the customer, when to request another payment method, when to escalate, and when to stop.**

---

## Why This, Not Existing Tools

Payment gateways already offer retry logic (e.g. Razorpay Smart Collect, Stripe Billing's recovery flows), and most merchants otherwise handle this manually in ops queues. RecoverAI is not a replacement gateway feature — it's a **decision and explainability layer** that sits above whatever executes the retry. The distinction that matters:

```text
Gateway-native retry           RecoverAI
─────────────────────          ─────────────────────
Fixed retry schedule           Failure-aware strategy per cause
Opaque to the merchant         Every decision explained + audited
One-size-fits-all              Confidence-gated, amount-gated
No cross-failure visibility    Dashboard-level recovery intelligence
Retry only                     Retry, reminder, review, or stop

```

In practice, RecoverAI could sit in front of a gateway's native retry as the decision layer, or operate independently for merchants who want visibility and control the gateway doesn't expose. This overview does not claim to out-perform gateway-native recovery on raw success rate — the differentiated value is **explainability, safety control, and auditability**, not a better retry algorithm.

---

# Core Idea

RecoverAI follows the workflow:

```text
Payment Failure
      ↓
Detect
      ↓
Classify Failure
      ↓
Analyze Recovery Opportunity
      ↓
Choose Recovery Strategy
      ↓
Apply Safety Guardrails
      ↓
Execute / Simulate Action
      ↓
Verify Payment Result
      ↓
Record Audit Trail
      ↓
Measure Revenue Recovered

```

---

# Example: A Recovery That Proceeds

Consider the canonical allowed transaction:

```text
Transaction: RX18492
Amount: ₹7,499

Failure:
BANK_UNAVAILABLE

Retry Count:
0
```

RecoverAI deterministically classifies and evaluates it as:

```text
Failure Category:
TRANSIENT_BANK_FAILURE

Confidence:
94%

Recommended Action:
DELAYED_RETRY
```

Before execution, the Guardrail Engine verifies:

```text
Confidence               94%          ✓
Retry Count               0 / 2       ✓
Amount Threshold          ₹7,499      ✓

GUARDRAIL STATUS
✓ ALLOWED
```

The canonical workflow may then proceed:

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

For deterministic demo execution, the result must be labeled:

```text
SIMULATION
```

For the integrated payment path, the environment must be labeled:

```text
RAZORPAY TEST MODE
```

A recovery may be shown as successful only after the relevant verification path confirms success.

A simulated ₹7,499 recovery demonstrates RecoverAI logic.

A verified Razorpay Test Mode payment demonstrates the gateway integration in a test environment.

Neither is evidence of production merchant revenue recovery.

---

# Example: A Recovery Guardrails Stop

The canonical safety case is:

```text
Transaction: RX20117
Amount: ₹68,000

Failure:
BANK_UNAVAILABLE

Retry Count:
2
```

The deterministic guardrail result is:

```text
Retry Count               2 / 2       ✗
Amount                     ₹68,000     above automatic amount ceiling

GUARDRAIL STATUS
⛔ BLOCKED
```

Once the workflow is blocked:

```text
DETECT
  ↓
CLASSIFY
  ↓
DECIDE
  ↓
GUARDRAIL
  ↓
STOP
```

There must be no:

```text
EXECUTE
VERIFY
```

for that blocked attempt.

RecoverAI does not silently attempt another retry.

Agent Replay and the audit trail must stop at the actual guardrail event and show the blocking reason.

This safety case is a core part of the product story, not an edge case to hide.

---

# Major Components

## 1. Failure Classifier

Identifies the type of payment failure.

Examples:

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

It determines:

- Failure category
- Severity
- Retryability
- Recommended action
- Retry delay
- Confidence score

---

## 2. Recovery Engine

Converts the failure classification into a structured recovery strategy.

Possible actions include:

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

---

## 3. Guardrail Engine

Prevents unsafe automated actions.

Guardrails include:

- Maximum retry limit (2 retries)
- Minimum confidence threshold (80% auto-execute, 50% floor for any action)
- Recovery amount threshold (₹50,000 auto-approval ceiling)
- Retry cooldown (15 minutes between attempts)
- Duplicate request protection
- Manual-review conditions
- Stop conditions
- Consecutive failure limits

The recovery executor cannot proceed when:

```text
can_execute = false

```

---

## 4. Recovery Executor

The Recovery Executor orchestrates an approved recovery attempt.

Responsibilities include:

- Resolving idempotency
- Running the selected recovery strategy
- Respecting the Guardrail decision
- Supporting deterministic simulation
- Integrating with Razorpay Test Mode through the isolated gateway service
- Verifying recovery outcomes
- Persisting/finalizing recovery state
- Calculating recovered amount only from the applicable verified outcome
- Generating audit events

The executor must never continue automatically when:

```text
can_execute = false
```

or when the guardrail status is:

```text
BLOCKED
REVIEW_REQUIRED
```

Razorpay Test Mode execution remains non-production.

---

## 5. Audit Trail

Every important recovery step is recorded from backend workflow events.

Successful canonical sequence:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

Blocked canonical sequence:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
```

The UI must not add fictional `EXECUTE` or `VERIFY` stages merely for visual completeness.

RecoverAI now has a persistent Supabase/PostgreSQL path for gateway/recovery-linked state and audit-related persistence.

Controlled in-memory state may still exist in deterministic tests or simulation paths, but it must not be represented as the durable gateway-linked persistence mechanism.

This audit history powers Agent Replay.

---

## 6. AI Reasoning Layer

The AI explanation layer is implemented.

Its job is to explain deterministic RecoverAI decisions clearly to an operator.

AI may:

- Explain why a payment failed
- Summarize deterministic transaction context
- Explain the proposed recovery strategy
- Explain the supplied guardrail state
- Produce operator-facing reasoning grounded in the deterministic result

Current provider integration uses GroqCloud-compatible chat-completion infrastructure.

If the provider is unavailable or its response is unusable:

```text
AI unavailable
      ↓
deterministic fallback explanation
      ↓
core recovery continues
```

AI may **not**:

- Override guardrails
- Ignore retry limits
- Change deterministic classification
- Change the selected recovery action
- Change confidence values
- Mark payments as successful
- Bypass verification
- Execute privileged payment actions independently
- Claim revenue was recovered without verified payment state

---

# AI Safety Philosophy

RecoverAI follows:

> **Deterministic core + AI-assisted intelligence**

The authority flow is:

```text
Failure Rules
      ↓
Recovery Rules
      ↓
Guardrails
      ↓
Deterministic Decision
      ↓
AI Explanation
```

When execution is permitted:

```text
Guardrail = ALLOWED
      ↓
Execution / Test Integration
      ↓
Verification
      ↓
Audit
```

AI explains the decision; it does not authorize payment execution.

This keeps explanation quality separable from financial safety.

---

# Agent Replay

One of RecoverAI's key differentiators is **Agent Replay**.

Agent Replay uses the backend audit events that actually exist for a transaction.

Successful canonical replay:

```text
RX18492
₹7,499
BANK_UNAVAILABLE

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
✓ ALLOWED

        ↓
EXECUTE

        ↓
VERIFY
```

Blocked canonical replay:

```text
RX20117
₹68,000
retry_count = 2

        ↓
DETECT

        ↓
CLASSIFY

        ↓
DECIDE

        ↓
GUARDRAIL
⛔ BLOCKED

        ↓
STOP
```

The blocked replay must not create `EXECUTE` or `VERIFY`.

Motion progressively visualizes backend history; it does not create financial events or change their meaning.

---

# RecoverAI Command Center

The frontend provides a premium financial-operations dashboard showing recovery-oriented information such as:

```text
Revenue at Risk
Revenue Recovered
Recovery Rate
Active Recoveries
Failed Payments
Recovered Today
```

It also includes product surfaces for:

- Recovery queue / transactions
- Failure details
- Recovery Agent
- Decision Drawer
- Agent Replay
- Guardrail status
- Activity
- Audit history
- Settings
- Authentication

Current dashboard values include demo/sample data.

Any illustrative financial metric must be visibly labeled as:

```text
DEMO DATA
SIMULATION
TEST ENVIRONMENT
```

where appropriate.

Search or notification controls should only be presented as working features when actually wired to behavior.

Settings must not infer Razorpay or AI-provider availability solely from the generic backend health endpoint.

---

# Real-Time Experience

Server-Sent Events remain an optional/future enhancement.

Target architecture may support:

```text
FastAPI
   ↓
Server-Sent Events
   ↓
React Dashboard
```

The current product must not label ordinary API-refreshed activity as real-time server-push behavior unless SSE or an equivalent live channel is actually active.

The existing REST API and backend audit trail are sufficient for the current recovery and Agent Replay experience.

---

# Razorpay Integration

RecoverAI integrates with **Razorpay Test Mode**.

Current implemented browser-facing operations include:

```text
POST /api/razorpay/recovery-order
POST /api/razorpay/verify-payment
POST /api/razorpay/reconcile-payment
```

The integration supports:

- Creating/reusing a Test Mode recovery order from trusted backend recovery state
- Reading Razorpay Test Mode payment/order state
- Server-side payment verification
- Independent reconciliation
- Persisting gateway-linked state
- Receiving signed Razorpay webhooks
- Synchronizing trusted captured-payment state

Razorpay-specific logic remains isolated inside the backend gateway/integration layer.

Sensitive Razorpay credentials remain backend-only.

The browser-facing Razorpay APIs require RecoverAI user authentication.

Razorpay remains **Test Mode only** for the Buildathon.

---

# Webhook Flow

Razorpay webhook support is implemented in Test Mode.

Current trust boundary:

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
Reuse RecoverAI safety/idempotency/verification logic
```

The webhook does **not** require a Supabase browser-user JWT.

Browser authentication and Razorpay webhook signature authentication are separate trust boundaries.

Current verified webhook behavior includes trusted `payment.captured` synchronization and persistence/linkage of captured payment/order state.

Duplicate delivery must not create duplicate financial execution.

Unsupported or future event mappings must not be claimed as implemented until corresponding code/tests exist.

---

# Database

RecoverAI uses:

**Supabase + PostgreSQL**

for durable gateway/recovery-linked state.

The persistent path supports areas such as:

```text
recovery jobs
gateway order/payment linkage
verification/reconciliation state
persistent idempotency
audit-related persistence
```

Conceptual product entities may also include:

```text
transactions
audit_events
recovery_metrics
```

Future multi-merchant architecture may introduce or fully enforce:

```text
merchants
merchant_id
merchant-scoped authorization
tenant isolation
```

Authentication does not by itself prove merchant-level data isolation.

---

# Technology Stack

## Frontend

```text
React
TypeScript
Vite
Motion for React
Recharts
Lucide React
Supabase JavaScript client
React Router
```

## Backend

```text
Python
FastAPI
Pydantic
Uvicorn
pytest
```

## Database / Authentication

```text
Supabase
PostgreSQL
Supabase Auth
```

## Payments

```text
Razorpay Test Mode
Signed Razorpay Webhooks
```

## AI

```text
Deterministic recovery intelligence
+
GroqCloud-compatible explanation provider
+
Deterministic fallback
```

## Deployment Target

```text
Frontend → Vercel or equivalent
Backend  → Render / Railway or equivalent
Database → Supabase
```

Deployment remains a target until final deployed smoke testing is complete.

---

# Architecture

```text
                    USER
                      │
                      ▼
             React Frontend
                      │
              Supabase Session
                      │
         Authorization: Bearer <JWT>
                      │
                      ▼
              FastAPI Backend
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
Recovery Core    Supabase /      AI Explanation
                 PostgreSQL       Layer
       │
       ├── Failure Classifier
       ├── Recovery Engine
       ├── Guardrail Engine
       ├── Recovery Executor
       ├── Verification
       └── Audit
       │
       ▼
Razorpay Test Mode
```

Separate webhook trust boundary:

```text
Razorpay
   ↓
signed webhook
   ↓
/api/razorpay/webhook
   ↓
signature verification
```

Authentication is implemented for browser-facing protected APIs.

Tenant/merchant isolation is not currently implemented.

---

# Key Differentiators

RecoverAI is not simply:

> "Ask AI what to do with a failed payment."

Instead, it provides:

### Explainable Decisions

Every recovery decision includes reasoning and confidence.

### Deterministic Safety

Guardrails control whether an action can actually execute — and visibly stop it when it shouldn't (see the RX20117 example above).

### Measurable Business Impact

RecoverAI can report verified recovery outcomes and clearly labeled simulated/demo recovery impact. Production merchant revenue must not be inferred from simulation or Razorpay Test Mode.

### Complete Auditability

Every stage of the recovery workflow is recorded.

### Recovery Agent Replay

Users can visually inspect exactly how the system handled a failed payment, whether it succeeded or was blocked.

### Failure-Aware Recovery

Different failures receive different recovery strategies.

### Safe AI Architecture

The LLM assists but cannot override financial safety rules.

---

# Example Dashboard Metrics

Current canonical dashboard/demo values include:

```text
DEMO DATA

Revenue at Risk          ₹2,48,400
Revenue Recovered        ₹1,71,920
Recovery Rate               69.2%
Active Recoveries              47
Failed Payments                 84
Recovered Today            ₹31,900
```

These values support the current demo/operator experience.

They must not be presented as measured production merchant performance unless they are later calculated from persisted verified merchant transaction data.

---

# Buildathon Scope — What's Actually Built vs. Planned

As of **2026-09-04**, the verified product state is:

```text
Core Recovery

Failure Classifier                         ✅
Recovery Engine                            ✅
Guardrail Engine                           ✅
Recovery Executor                          ✅
Deterministic Simulation                   ✅
Verification                               ✅
Audit API / Agent Replay                   ✅


Frontend

Premium React/Vite application             ✅
Dashboard / Transactions                   ✅
Recovery Agent                             ✅
Activity / Guardrails / Settings           ✅
Signup / Login                             ✅
Protected frontend routing                 ✅
Authenticated API helper                   ✅
Frontend production build                  ✅


Persistence / AI

Supabase/PostgreSQL persistence            ✅
Persistent gateway/recovery state          ✅
Persistent idempotency path                ✅
AI explanation layer                       ✅
Deterministic AI fallback                  ✅
GroqCloud provider integration             ✅


Razorpay Test Mode

Recovery-order API                         ✅
Payment verification API                   ✅
Payment reconciliation API                 ✅
Signed webhook                             ✅
Webhook signature verification             ✅
Captured payment synchronization           ✅


Authentication

Supabase Auth                              ✅
Backend Bearer-token validation            ✅
Protected browser-facing APIs              ✅


Quality

Backend regression suite                   ✅
47 passed / 0 failed                       ✅
2 non-blocking Supabase client warnings    ⚠


Future / Not Implemented

Multi-merchant tenancy                     ❌
Merchant-level authorization               ❌
Cross-merchant data isolation              ❌
Production Razorpay processing             ❌
SSE live dashboard updates                 optional/future
Production multi-worker concurrency proof  future
Deployment/demo freeze                     remaining
```

Important product boundaries:

```text
Authentication
≠
Tenant isolation

Razorpay Test Mode
≠
Production payment processing

Simulation
≠
Real merchant revenue

AI explanation
≠
Financial authority
```

---

# Target Users

RecoverAI is designed for:

- Online merchants
- Subscription businesses
- Payment operations teams
- Finance teams
- Revenue operations teams
- Fintech platforms

---

# Business Value

RecoverAI is designed to help businesses:

- Reduce revenue loss caused by recoverable payment failures
- Avoid unnecessary or unsafe retries
- Reduce manual recovery operations
- Improve operator visibility
- Make recovery decisions explainable
- Maintain explicit safety controls
- Verify payment outcomes before counting recovery
- Maintain an auditable recovery history

## Illustrative Impact — Hypothetical, Not Measured

The arithmetic below is a hypothetical example only.

It is **not** based on measured RecoverAI merchant data and should not be described as an industry benchmark.

```text
Assume monthly transaction volume:           ₹1,00,00,000
Assume payment failure rate:                           7%
Illustrative revenue at risk:                   ₹7,00,000

Assume 40% of failures are recoverable:         ₹2,80,000
Assume 60% recovery of that hypothetical pool:  ₹1,68,000
```

These are intentionally simple assumptions showing how recovery economics can be modeled.

Actual recovery performance would depend on real failure-code mix, customer behavior, gateway behavior, merchant policy, and measured verified outcomes.

---

# Project Vision

RecoverAI should demonstrate how AI agents can participate in financial workflows **without sacrificing safety, explainability, verification, auditability, or control**.

The core philosophy is:

> **Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.**

The product should also remain explicit about what is and is not implemented:

```text
Supabase authentication             implemented
Persistent recovery state           implemented
AI explanation layer                implemented
Razorpay Test Mode                  implemented
Signed webhook path                 implemented

Multi-merchant isolation            not implemented
Production Razorpay processing      not implemented
```

RecoverAI turns failed payments from a static operational problem into a controlled, explainable recovery workflow while keeping financial safety deterministic.

---

# END OF PROJECT OVERVIEW
