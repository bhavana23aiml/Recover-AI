# RecoverAI — Project Overview

## Project Title

**RecoverAI — Intelligent AI-Powered Revenue Recovery Agent**

## Track

**AI Revenue Recovery**

## Project Overview

RecoverAI is an **AI-assisted payment recovery platform** designed to help businesses identify, analyze, and recover revenue lost because of failed digital payments.

Instead of treating every failed payment in the same way, RecoverAI analyzes the reason behind the failure, determines the safest recovery strategy, validates that strategy against predefined financial safety guardrails, executes or simulates the recovery action, verifies the result, and maintains a complete audit trail of every decision made.

The system is designed as a **controlled financial recovery agent**, where AI helps explain and understand payment failures, while deterministic rules remain responsible for safety-critical decisions.

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

Payment gateways already offer retry logic, and most merchants otherwise handle this manually in operations queues.

RecoverAI is not a replacement gateway feature.

It is a **decision, safety, explainability, and visibility layer** that sits above whatever executes the payment recovery action.

The distinction that matters:

```text
Gateway-native retry           RecoverAI
─────────────────────          ─────────────────────────────
Fixed retry schedule           Failure-aware strategy per cause

Limited explanation            Every decision explained + audited

One-size-fits-all              Confidence-gated, amount-gated

Gateway-level visibility       Recovery intelligence across failures

Retry focused                  Retry, reminder, review, or stop
```

In practice, RecoverAI could sit above a gateway's native retry capability as the decision layer, or operate independently for merchants that want greater visibility and control.

RecoverAI does **not** claim to automatically outperform gateway-native recovery on raw retry success rate.

Its differentiated value is:

```text
Explainability
+
Safety Control
+
Auditability
+
Recovery Intelligence
+
Operator Visibility
```

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

The core product philosophy is:

> **Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.**

---

# Example: A Recovery That Proceeds

Consider a failed payment:

```text
Transaction:
RX18492

Amount:
₹7,499

Failure:
BANK_UNAVAILABLE
```

RecoverAI analyzes it as:

```text
Failure Category:
TRANSIENT_BANK_FAILURE

Confidence:
94%

Recommended Action:
DELAYED_RETRY

Retry Delay:
30 minutes
```

Before executing the recovery, the Guardrail Engine verifies:

```text
Confidence               94%          ✓

Retry Count               0 / 2       ✓

Amount Threshold          ₹7,499      ✓

Stop Condition            False       ✓


GUARDRAIL STATUS

✓ ALLOWED
```

The recovery can then proceed:

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

In the current Buildathon implementation:

```text
EXECUTION MODE:
SIMULATION
```

If verification confirms the simulated recovery:

```text
₹7,499 RECOVERED
```

This amount may be reflected in simulated/demo recovery metrics.

It must not be represented as actual merchant revenue while execution remains simulated.

---

# Example: A Recovery Guardrails Stop

The safety story is only convincing if the guardrails actually stop something.

Consider:

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

RecoverAI evaluates:

```text
Retry Count               2 / 2       ✗
Maximum retry threshold reached

Amount Threshold          ₹68,000     ✗
Above automatic recovery amount threshold


GUARDRAIL STATUS

⛔ BLOCKED
```

RecoverAI does not perform a third silent retry.

The actual blocked execution flow is:

```text
DETECT
   ↓
CLASSIFY
   ↓
DECIDE
   ↓
GUARDRAIL
   ↓
BLOCKED
```

There must be no:

```text
EXECUTE
VERIFY
```

events for that blocked attempt.

The blocking reason is recorded in the audit trail.

This is an important part of the RecoverAI demo because it demonstrates:

```text
RecoverAI is not an AI
that simply keeps retrying.

RecoverAI is designed
to recover safely.
```

---

# Major Components

## 1. Failure Classifier

The Failure Classifier identifies the type of payment failure.

Supported failure codes include:

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
- Explanation

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
94% confidence
```

---

## 2. Recovery Engine

The Recovery Engine converts failure classification into a structured recovery strategy.

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
```

A recovery may also end in a safe stopped state when no appropriate automatic action exists.

The Recovery Engine determines:

```text
What should RecoverAI do?
```

It does not independently determine:

```text
Is it safe to execute?
```

That responsibility belongs to the Guardrail Engine.

---

## 3. Guardrail Engine

The Guardrail Engine protects customers and merchants from unsafe automated actions.

Guardrail categories include:

```text
Maximum retry limit

Minimum confidence threshold

Minimum confidence floor

Automatic recovery amount threshold

Manual-review conditions

Stop conditions

Duplicate / idempotency protection
```

Additional P1 safety controls include:

```text
Retry cooldown

Consecutive failure limits

Historical recovery state
```

Canonical runtime configuration lives in:

```text
backend/core/config.py
```

The recovery executor cannot proceed when:

```text
can_execute = false
```

Possible Guardrail outcomes:

```text
ALLOWED

BLOCKED

REVIEW_REQUIRED
```

---

## 4. Recovery Executor

The Recovery Executor coordinates one recovery attempt.

Responsibilities include:

```text
Resolve idempotency
      ↓
DETECT
      ↓
CLASSIFY
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
```

During the current Buildathon P0:

```text
Execution = SIMULATION
```

Future integration may connect allowed actions to:

```text
Razorpay Test Mode
```

The executor is responsible for:

- Creating audit events
- Respecting the Guardrail Decision
- Executing or simulating approved actions
- Verifying the resulting payment state
- Calculating recovered amount
- Preventing duplicate execution through idempotency
- Returning a structured execution result

---

## 5. Verification

RecoverAI deliberately separates:

```text
EXECUTION
```

from:

```text
VERIFICATION
```

A successful API or execution call does not automatically prove that payment recovery succeeded.

Required principle:

```text
EXECUTE
   ↓
VERIFY
   ↓
FINAL STATUS
```

Only a successfully verified recovery can become:

```text
RECOVERED
```

and contribute to:

```text
Revenue Recovered
```

---

## 6. Audit Trail

Every important recovery step is recorded.

Successful example:

```text
DETECT
Payment failure detected

CLASSIFY
Transient bank failure — 94% confidence

DECIDE
Delayed retry selected

GUARDRAIL
Action allowed

EXECUTE
Simulated recovery attempt started

VERIFY
Recovery successfully verified
```

Blocked example:

```text
DETECT
Payment failure detected

CLASSIFY
Failure classified

DECIDE
Recovery strategy considered

GUARDRAIL
BLOCKED
```

No fake execution events should be created when execution never occurred.

Audit events provide transparency into how RecoverAI reached and executed—or refused—a decision.

---

## 7. Idempotency

Financial recovery operations require duplicate-execution protection.

Conceptual flow:

```text
Recovery Request
      ↓
Resolve Idempotency Key
      ↓
Already processed?
   ↙             ↘
 YES             NO
 ↓                ↓
Return old       Reserve key
result           before execution
                    ↓
                 Execute once
                    ↓
                 Persist/finalize result
```

The current P0 implementation uses:

```text
in-memory idempotency
```

This demonstrates duplicate protection inside one backend process.

It is not crash-safe.

Before depending on true external financial execution, the idempotency state must become persistent.

---

## 8. AI Reasoning Layer

AI is intended to generate understandable explanations and operator-facing insights.

AI may:

- Explain why a payment failed
- Summarize transaction context
- Explain the selected recovery strategy
- Generate human-readable reasoning
- Help operators understand unusual failures

AI may **not**:

- Override guardrails
- Ignore retry limits
- Override idempotency
- Mark payments as successful
- Bypass verification
- Execute privileged payment actions independently

The AI reasoning layer is a P1 feature and is not part of the current verified deterministic recovery path.

---

# AI Safety Philosophy

RecoverAI follows:

> **Deterministic core + AI-assisted intelligence**

The architecture is:

```text
Failure Rules
      ↓
Recovery Rules
      ↓
Guardrails
      ↓
Approved / Blocked Decision
      ↓
AI Explanation
      ↓
Allowed Execution
      ↓
Verification
```

This ensures that AI enhances the product without becoming an uncontrolled authority over financial operations.

If AI is unavailable:

```text
AI unavailable
      ↓
Deterministic explanation
      ↓
Core recovery continues
```

---

# Agent Replay

One of RecoverAI's key differentiators is **Agent Replay**.

For a recovery transaction, operators can visually replay the actual backend decision process.

Successful example:

```text
₹7,499 PAYMENT FAILED

        ↓

DETECT
Bank unavailable

        ↓

CLASSIFY
Transient bank failure
94% confidence

        ↓

DECIDE
Delayed retry
30 minutes

        ↓

GUARDRAIL
Retry 0 / 2
✓ ALLOWED

        ↓

EXECUTE
Simulated recovery attempt

        ↓

VERIFY
Recovery confirmed

        ↓

₹7,499 RECOVERED
```

Agent Replay must be driven by:

```text
GET /api/recovery/audit/{transaction_id}
```

The frontend animates the backend events.

It must not invent a fixed timeline.

For the blocked transaction:

```text
RX20117
```

the expected replay is:

```text
DETECT
   ↓
CLASSIFY
   ↓
DECIDE
   ↓
GUARDRAIL
⛔ BLOCKED
```

The timeline must terminate there.

No fake:

```text
EXECUTE
VERIFY
```

should appear.

This makes Agent Replay both:

```text
explainability
+
auditability
```

rather than simply decorative animation.

---

# RecoverAI Command Center

The frontend provides a premium financial operations dashboard showing:

```text
Revenue at Risk

Revenue Recovered

Recovery Rate

Active Recoveries

Failed Payments

Recovered Today
```

Potential secondary metrics include:

```text
Successful Retries

Manual Reviews

Guardrail Blocks

Average Recovery Time
```

The Command Center also includes or is planned to include:

- Recovery queue
- Failure details
- Recovery actions
- Decision Drawer
- Agent Replay
- Guardrail status
- Audit history
- Agent activity
- Recovery performance visualization

The current dashboard metrics are:

```text
DEMO DATA
```

and must be visibly labeled accordingly until calculated from persisted recovery data.

---

# Decision Drawer

The Decision Drawer explains one recovery decision.

It may display:

```text
Transaction ID

Amount

Failure Code

Failure Category

Confidence

Recommended Action

Retry Delay

Simulation Probability

Retry Count

Guardrail Status

Execution Status

Recovered Amount

Explanation

Agent Replay
```

The drawer consumes backend recovery data.

It does not own financial safety logic.

Opening the drawer itself must not trigger a recovery attempt.

Execution requires an explicit action.

---

# Real-Time Experience

RecoverAI is planned to support real-time dashboard updates.

Target:

```text
FastAPI
   ↓
Server-Sent Events
   ↓
React Dashboard
```

Potential live updates include:

```text
New audit event

Recovery status changed

Revenue recovered

Recovery blocked
```

If SSE is not available by demo time, polling may be used as the documented fallback.

Real-time SSE is P1 and is not currently part of the verified P0 architecture.

---

# Razorpay Integration

RecoverAI is planned to integrate with:

```text
Razorpay Test Mode
```

The payment integration layer will handle:

- Test payment operations
- Payment status verification
- Failure handling
- Payment webhooks
- Recovery verification

Razorpay-specific logic belongs inside:

```text
razorpay_service.py
```

or an equivalent isolated gateway service.

Sensitive Razorpay credentials remain backend-only.

RecoverAI does not use production customer money during the Buildathon.

---

# Webhook Flow

Payment events can eventually enter RecoverAI through Razorpay webhooks.

Target:

```text
Razorpay
     ↓
Webhook
     ↓
Verify Signature
     ↓
Invalid?
YES → REJECT
     ↓
Check Duplicate Event
     ↓
Map Payment Event
     ↓
Trigger Existing RecoverAI Pipeline
```

Example:

```text
payment.failed
       ↓
DETECT
       ↓
CLASSIFY
       ↓
DECIDE
       ↓
GUARDRAIL
       ↓
RECOVERY PIPELINE
```

Webhook handling must not create a separate recovery architecture.

It must reuse:

```text
Classifier
Recovery Engine
Guardrails
Idempotency
Executor
Verification
Audit
```

---

# Database

RecoverAI is planned to use:

**Supabase + PostgreSQL**

Core tables:

```text
merchants

transactions

recovery_jobs

audit_events

recovery_metrics
```

The database will store:

- Transaction information
- Recovery state
- Execution/idempotency state
- Audit events
- Calculated recovery results
- Dashboard metrics

Financial values should ultimately use integer smallest-currency units where appropriate.

For INR:

```text
paise
```

Current P0 storage remains in-memory where explicitly documented.

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
```

## Backend

```text
Python

FastAPI

Pydantic

Uvicorn
```

## Database

Target:

```text
Supabase

PostgreSQL
```

## Payments

Target:

```text
Razorpay Test Mode

Razorpay Webhooks
```

## AI

Target:

```text
LLM-assisted reasoning
+
Deterministic recovery intelligence
```

## Deployment

Target:

```text
Frontend → Vercel

Backend → Render / Railway

Database → Supabase
```

---

# Architecture

```text
                    USER
                      │
                      ▼

              React Frontend
                      │
                   REST API
                      │
                      ▼

               FastAPI Backend
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼

Recovery Intelligence         Data Layer
        │                           │
        ├── Failure Classifier      ├── Current: memory
        ├── Recovery Engine         │
        ├── Guardrail Engine        └── Target: PostgreSQL
        ├── Recovery Executor
        ├── Verification
        └── AI Reasoner (P1)
        │
        ▼

          Razorpay Test Mode
                 P1
```

Future live experience:

```text
FastAPI
   ↓
SSE
   ↓
React
```

---

# Key Differentiators

RecoverAI is not simply:

> "Ask AI what to do with a failed payment."

Instead, it provides:

### Explainable Decisions

Every recovery decision contains structured reasoning and confidence.

### Deterministic Safety

Guardrails control whether an action can execute.

### Safe Blocking

RecoverAI deliberately demonstrates when a payment recovery should **not** execute.

### Independent Verification

An execution request does not automatically become financial success.

### Idempotent Execution

Duplicate recovery requests are prevented from blindly executing the same attempt again.

### Measurable Business Impact

RecoverAI measures verified or simulated recovery outcomes while clearly distinguishing simulation from actual revenue.

### Complete Auditability

Every stage that actually occurred is recorded.

### Recovery Agent Replay

Users can visually inspect how the system handled a failed payment, including blocked decisions.

### Failure-Aware Recovery

Different failures receive different recovery strategies.

### Safe AI Architecture

AI assists with reasoning and explanation but cannot override deterministic financial safety rules.

---

# Example Dashboard Metrics

Current demo dashboard values include:

```text
Revenue at Risk          ₹2,48,400

Revenue Recovered        ₹1,71,920

Recovery Rate               69.2%

Active Recoveries              47

Failed Payments                84

Recovered Today            ₹31,900
```

These values are:

```text
DEMO DATA
SIMULATION ENVIRONMENT
```

They are not current merchant production metrics.

Future persisted metrics should be calculated from actual stored transaction/recovery data.

---

# Buildathon Scope — What's Actually Built vs. Planned

Everything above describes the full product vision.

To avoid overstating the demo, the current verified build status as of **2026-08-23** is:

```text
IMPLEMENTED / VERIFIED

React + TypeScript + Vite frontend          ✅

FastAPI backend                             ✅

Dashboard shell + Motion UI                 ✅

Frontend ↔ Backend communication            ✅

Failure Classifier                          ✅

Recovery Engine                             ✅

Guardrail Engine                            ✅

Recovery Executor                           ✅

Deterministic recovery simulation           ✅

Verification                               ✅

In-memory Audit Trail                       ✅

In-process Idempotency                      ✅

Execute API                                 ✅

Audit API                                   ✅

Successful recovery backend flow            ✅

Blocked recovery backend flow               ✅

Decision Drawer                             ✅

Simulation / Demo labels                    ✅

Backend automated tests                     ✅
12 / 12 passed

Backend import chain                        ✅
5 / 5 verified

Frontend production build                   ✅
```

Current Agent Replay state:

```text
Implementation                              ✅

Decision Drawer integration                 ✅

Production compilation                      ✅

Final successful visual replay verification  PENDING

Final blocked visual replay verification     PENDING
```

Therefore the strict P0 state remains:

```text
13 / 14 verified
```

until both Agent Replay browser scenarios are explicitly confirmed.

Planned, not yet implemented or verified:

```text
Supabase persistence

Persistent audit storage

Persistent idempotency

Calculated database-backed dashboard metrics

AI Reasoning Layer

Razorpay Test Mode integration

Razorpay Webhooks

Webhook signature verification

Real-time SSE updates

Authentication

Multi-merchant tenancy

Production deployment
```

The current recovery demo runs against:

```text
SIMULATION
```

not live Razorpay financial execution.

This is a deliberate Buildathon architecture choice.

The system first demonstrates that it can correctly determine:

```text
whether
+
why
+
how safely
```

a recovery action should occur.

Gateway integration is added only after that safety core is stable.

---

# P0 Demo Cases

## Demo A — Successful Recovery

```text
Transaction:
RX18492

Amount:
₹7,499

Failure:
BANK_UNAVAILABLE

Retry Count:
0

        ↓

CLASSIFY

        ↓

TRANSIENT_BANK_FAILURE
94%

        ↓

DELAYED_RETRY

        ↓

GUARDRAIL
ALLOWED

        ↓

EXECUTE
SIMULATION

        ↓

VERIFY

        ↓

RECOVERED
₹7,499
```

Expected Agent Replay:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

---

## Demo B — Guardrail Protection

```text
Transaction:
RX20117

Amount:
₹68,000

Failure:
BANK_UNAVAILABLE

Retry Count:
2 / 2

        ↓

CLASSIFY

        ↓

DECIDE

        ↓

GUARDRAIL

        ↓

BLOCKED
```

Expected Agent Replay:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
```

Forbidden:

```text
EXECUTE
VERIFY
```

This demonstrates that RecoverAI is designed to stop unsafe recovery attempts rather than maximize retries at any cost.

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

RecoverAI aims to help businesses:

- Reduce revenue loss caused by recoverable payment failures
- Improve payment recovery workflows
- Reduce unnecessary payment retries
- Reduce manual recovery operations
- Improve customer experience
- Make recovery decisions explainable
- Maintain clear safety controls
- Measure how much revenue recovery strategies generate

---

## Illustrative Impact — Directional, Not Measured

The following is an illustrative example only.

It is **not a result produced by the current RecoverAI build**.

```text
Assume:

₹1,00,00,000 monthly transaction volume

~7% payment failure rate

        ↓

₹7,00,000 revenue at risk


Assume ~40% of failures are recoverable

        ↓

₹2,80,000 recoverable pool


Assume 60% of that recoverable pool is recovered

        ↓

₹1,68,000 illustrative recovered value
```

This example exists only to demonstrate the shape of the business opportunity.

Actual recovery performance depends on factors such as:

```text
failure-code distribution

merchant risk policy

retry rules

customer behavior

gateway behavior

payment method

timing

verification outcomes
```

RecoverAI should not present this illustrative number as a measured prediction for a merchant.

---

# Current Limitations

The current Buildathon prototype has explicit limitations.

```text
Recovery execution is simulated.

Audit storage is currently in memory.

Idempotency is currently in memory.

Audit/idempotency state does not survive backend restart.

Dashboard financial values are demo data.

AI Reasoner is not implemented.

Supabase persistence is not implemented.

Razorpay Test Mode execution is not implemented.

Razorpay webhooks are not implemented.

Real-time SSE is not implemented.

Authentication / tenancy are not implemented.
```

These limitations should be stated rather than hidden.

---

# What RecoverAI Must Never Claim in the Current State

Until those capabilities are genuinely implemented and verified, do not claim:

```text
RecoverAI recovered real merchant revenue.

RecoverAI processed production payments.

RecoverAI automatically outperforms gateway-native retry systems.

The LLM currently controls recovery decisions.

Razorpay webhooks are active.

Supabase persistence is complete.

Idempotency survives process crashes.

Dashboard metrics come from real merchant transactions.

RecoverAI is production-ready.
```

---

# Buildathon Product Story

The clearest product story is:

```text
A payment fails.

        ↓

RecoverAI identifies why it failed.

        ↓

RecoverAI selects an appropriate recovery strategy.

        ↓

Deterministic guardrails decide whether that action is safe.

        ↓

Allowed actions can execute/simulate.

Unsafe actions stop.

        ↓

RecoverAI independently verifies the outcome.

        ↓

Every real step is recorded.

        ↓

Operators can inspect and replay the decision.

        ↓

Recovered value becomes measurable.
```

This demonstrates:

```text
AI-assisted intelligence
+
deterministic financial safety
+
explainability
+
auditability
+
measurable revenue recovery
```

---

# Project Vision

RecoverAI should demonstrate how AI agents can participate in financial workflows **without sacrificing safety, explainability, verification, or control**.

The core philosophy is:

> **Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.**

RecoverAI turns failed payments from a static operational problem into an intelligent, measurable, and controlled revenue recovery workflow.

---

# END OF PROJECT OVERVIEW