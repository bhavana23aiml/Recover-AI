# RecoverAI — Development Phases

**Project:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent  
**Track:** AI Revenue Recovery  
**Document:** Development Phases  
**Status:** ACTIVE  
**Last Updated:** 2026-08-23

---

# 1. Purpose

This document defines the implementation order for RecoverAI.

It exists to prevent:

- Random feature development
- Premature integrations
- UI work replacing core product work
- Safety-critical work being postponed
- Documentation drift
- Buildathon deadline slippage

RecoverAI should be developed in controlled phases.

The product principle is:

```text
Detect accurately
      ↓
Decide explainably
      ↓
Constrain deterministically
      ↓
Execute safely
      ↓
Verify independently
      ↓
Audit everything
```

---

# 2. Documentation Authority

When documents conflict, use this order:

```text
rules.md
    ↓
architecture.md
    ↓
PRD.md
    ↓
design.md
    ↓
project-overview.md
    ↓
phases.md
    ↓
memory.md
```

`rules.md` defines binding engineering rules.

`architecture.md` defines system structure.

`PRD.md` defines product requirements and priorities.

`design.md` defines the UI/design system.

`project-overview.md` defines product positioning.

`phases.md` defines implementation order.

`memory.md` records the observed current state.

---

# 3. Development Priority

When deciding what to build next, use:

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

A visually impressive feature must never weaken payment safety or delay the working recovery pipeline.

---

# 4. Priority Levels

RecoverAI uses three implementation priorities.

## P0 — Buildathon Critical

Must work before the project is considered demo-ready.

## P1 — Strong Buildathon Features

High-value integrations and product depth after P0 is stable.

## P2 — Stretch

Useful improvements that must not jeopardize P0 or P1.

---

# 5. Phase 0 — Foundation

## Goal

Create a stable frontend/backend project foundation.

## Required Work

```text
React + TypeScript + Vite frontend
FastAPI backend
Frontend ↔ backend communication
CORS
Project folder structure
Basic health endpoint
Dashboard API foundation
```

## Completion Gate

- Frontend runs locally.
- Backend runs locally.
- React can call FastAPI.
- `/health` responds correctly.
- Project structure is understandable.

## Current Status

```text
COMPLETE ✅
```

---

# 6. Phase 1 — Command Center Foundation

## Goal

Create the core RecoverAI dashboard shell.

## Required Work

```text
Sidebar
Header
Hero
Metric cards
Recovery Queue
Live Agent Activity
Dark fintech design system
Motion foundation
Responsive layout foundation
```

The dashboard must be visually positioned as a revenue recovery command center rather than a generic admin dashboard.

## Current Status

```text
COMPLETE ✅
```

Additional polish may happen later without blocking product development.

---

# 7. Phase 2 — Failure Classifier

## Goal

Convert payment failure codes into structured recovery intelligence.

## Inputs

```text
transaction_id
amount
failure_code
retry_count
```

## Supported Failure Codes

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

## Output

The classifier returns:

```text
category
retryable
severity
recommended_action
retry_delay_minutes
confidence
explanation
```

## Completion Gate

- Classifier imports successfully.
- Canonical demo failures classify correctly.
- Structured classification response is returned.

## Current Status

```text
COMPLETE ✅
```

---

# 8. Phase 3 — Recovery Engine

## Goal

Convert classification into a structured recovery decision.

## Recovery Outcomes

Possible recovery statuses include:

```text
RETRY_SCHEDULED
CUSTOMER_ACTION_REQUIRED
MANUAL_REVIEW
STOPPED
```

## Recovery Actions

Examples include:

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

## Dependency

```text
failure_classifier
        ↓
recovery_engine
```

The Recovery Engine must not import Guardrail Engine or Recovery Executor.

## Current Status

```text
COMPLETE ✅
```

---

# 9. Phase 4 — Guardrail Engine

## Goal

Prevent unsafe or inappropriate recovery actions.

The Guardrail Engine is deterministic.

AI cannot override it.

## Core P0 Checks

Guardrails must enforce the canonical values owned by:

```text
backend/core/config.py
```

P0 checks include:

```text
Minimum confidence floor
Automatic execution confidence threshold
Maximum retry count
Maximum automatic recovery amount
Manual-review conditions
STOP conditions
```

P1 checks include:

```text
Retry cooldown
Consecutive-failure protection
Additional historical controls
```

## Possible Results

```text
ALLOWED
BLOCKED
REVIEW_REQUIRED
```

## Required Behavior

A blocked transaction must never proceed to `EXECUTE`.

## Current Status

```text
COMPLETE ✅
```

---

# 10. Phase 5 — Recovery Executor

## Goal

Execute one complete recovery attempt safely.

## Required Flow

```text
IDEMPOTENCY
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

## Critical Rules

- Guardrails are evaluated exactly once per execution attempt.
- Guardrails run immediately before execution.
- Blocked attempts must not create fake execution events.
- Payment execution success must not automatically mean payment recovery.
- Recovery must be independently verified.
- Recovered revenue is counted only after successful verification.

## Current Status

```text
COMPLETE ✅
```

---

# 11. Phase 5A — Idempotency

Idempotency is P0.

Each financial execution attempt must use an idempotency key.

Current deterministic key generation:

```text
transaction_id
+
failure_code
+
attempt_number
```

The key must be reserved before execution.

A duplicate completed request must return the existing result instead of executing again.

## Current Implementation

```text
In-memory idempotency store ✅
Duplicate execution prevention ✅
Automated test coverage ✅
```

## Limitation

Current in-memory idempotency does not survive backend restarts.

Persistent crash-safe idempotency will be required before relying on external financial execution.

---

# 12. Phase 6 — Verification

## Goal

Determine the actual outcome after execution.

Required:

```text
EXECUTE
   ↓
VERIFY
   ↓
FINAL STATUS
```

Possible results:

```text
RECOVERED
FAILED
PENDING
ACTION_COMPLETED
BLOCKED
REVIEW_REQUIRED
```

## Current Status

```text
COMPLETE ✅
```

for the current deterministic simulation workflow.

---

# 13. Phase 7 — Audit Trail

## Goal

Make every recovery decision auditable.

Core steps:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

Blocked flows contain only events that really occurred.

Example:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL — BLOCKED
```

No fake:

```text
EXECUTE
VERIFY
```

## Current Storage

```text
In-memory AUDIT_STORE
```

## Target Storage

```text
Supabase / PostgreSQL
```

## Current Status

```text
CORE COMPLETE ✅
PERSISTENCE PENDING
```

---

# 14. Phase 8 — Execute API

## Endpoint

```text
POST /api/recovery/execute
```

## Requirements

The endpoint must:

- Accept a valid recovery request.
- Execute the deterministic pipeline.
- Enforce guardrails.
- Return execution result.
- Return recovered amount.
- Identify simulation mode.
- Return audit events.

## Current Status

```text
COMPLETE ✅
```

Verified through Swagger and automated API tests.

---

# 15. Phase 9 — Audit API

## Endpoint

```text
GET /api/recovery/audit/{transaction_id}
```

## Purpose

Expose actual backend audit events to the frontend.

The frontend should not fabricate the recovery timeline.

This endpoint is the single frontend audit interface regardless of whether storage is in-memory or Supabase.

## Current Status

```text
COMPLETE ✅
```

with in-memory storage.

---

# 16. Phase 10 — Decision Drawer

## Goal

Allow an operator to understand why RecoverAI took or refused an action.

The drawer must display real backend information including:

```text
Transaction ID
Amount
Failure
Classification
Confidence
Selected Action
Simulation Probability
Guardrail Status
Execution Status
Recovered Amount
Decision / Audit information
```

## Rules

- Opening UI must not silently trigger financial execution.
- Execution must happen only after an explicit recovery action.
- Simulation must be clearly labeled.
- The frontend must not recreate payment safety logic.

## Current Status

```text
IMPLEMENTED ✅
VISUALLY VERIFIED ✅
```

Canonical successful case `RX18492` was verified in the drawer.

---

# 17. Phase 11 — Agent Replay

## Goal

Make RecoverAI's decision process visually explainable.

Agent Replay uses:

```text
GET /api/recovery/audit/{transaction_id}
```

and animates only real backend audit events.

Successful path:

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

Blocked path:

```text
DETECT
   ↓
CLASSIFY
   ↓
DECIDE
   ↓
GUARDRAIL — BLOCKED
```

No fake `EXECUTE` or `VERIFY` events are permitted.

## Current Status

```text
IMPLEMENTED ✅
FINAL SUCCESS/BLOCKED UI REPLAY VERIFICATION PENDING
```

---

# 18. Phase 12 — Dashboard Workflow Integration

## Goal

Connect dashboard transactions to the actual recovery workflow.

The dashboard must receive machine-readable values from the backend.

Example:

```text
failure_code
retry_count
```

React must not derive `failure_code` from human-readable descriptions.

## Current Demo Transactions

```text
RX18492
RX18493
RX18494
RX20117
```

`RX20117` is the canonical blocked demo case.

## Current Status

```text
CORE INTEGRATION COMPLETE ✅
```

---

# 19. Phase 13 — Supabase Persistence

## Priority

```text
P1
```

## Goal

Replace temporary in-memory persistence with durable storage.

Target core tables:

```text
transactions
recovery_jobs
audit_events
recovery_metrics
merchants
```

Money should ultimately be stored using integer minor units where appropriate.

## Required Work

- Supabase project configuration
- Database schema
- Transaction persistence
- Recovery-job persistence
- Audit-event persistence
- Persistent idempotency
- Query interfaces
- Error handling

## Important

Decision Drawer and Agent Replay must remain demoable even if Supabase is unavailable.

The frontend continues using:

```text
GET /api/recovery/audit/{transaction_id}
```

The storage implementation changes behind the API.

## Current Status

```text
PENDING
```

---

# 20. Phase 14 — Dashboard Metrics Persistence

## Priority

```text
P1
```

Current dashboard numbers are demo data and must remain clearly labeled as such.

Target metrics should eventually be derived from stored recovery data.

Examples:

```text
Revenue at Risk
Revenue Recovered
Recovery Rate
Active Recoveries
Failed Payments
Recovered Today
```

## Current Status

```text
PENDING
```

---

# 21. Phase 15 — AI Reasoning Layer

## Priority

```text
P1
```

## Purpose

AI assists explainability.

AI may support:

```text
Failure explanation
Decision reasoning summary
Operator-facing explanation
Context summarization
Confidence narrative
```

AI must not:

```text
Override guardrails
Ignore retry limits
Bypass verification
Mark payment as recovered
Independently execute privileged payment operations
```

## Fallback

```text
AI unavailable
      ↓
Use deterministic explanation
      ↓
Continue recovery workflow
```

## Current Status

```text
PENDING
```

---

# 22. Phase 16 — Real-Time Activity

## Priority

```text
P1
```

Preferred architecture:

```text
FastAPI
   ↓
Server-Sent Events
   ↓
React Dashboard
```

Possible updates:

```text
Audit events
Recovery status changes
Revenue recovery events
Guardrail blocks
```

If SSE is not ready, polling every approximately 5–10 seconds is an acceptable fallback.

## Current Status

```text
PENDING
```

---

# 23. Phase 17 — Recovery Analytics / Charts

## Priority

```text
P1
```

Charts may visualize:

```text
Revenue recovered over time
Failure distribution
Recovery outcomes
Guardrail blocks
Retry effectiveness
```

Charts must not delay P0 completion, testing, security, or payment integration.

## Current Status

```text
PENDING
```

---

# 24. Phase 18 — Razorpay Test Mode

## Priority

```text
P1
```

RecoverAI is not a replacement payment gateway.

It sits above gateway execution as a recovery decision, safety, explainability, and audit layer.

## Required Work

```text
Razorpay Test Mode credentials
Backend-only secret handling
Test payment integration
Payment-status verification
Failure handling
Recovery execution adapter
```

Real credentials must never be exposed to React.

## Current Status

```text
PENDING
```

---

# 25. Phase 19 — Razorpay Webhooks

## Priority

```text
P1
```

Target endpoint:

```text
POST /api/razorpay/webhook
```

Target events include:

```text
payment.failed
payment.authorized
payment.captured
refund.processed
```

Webhook flow:

```text
Webhook received
      ↓
Verify signature
      ↓
Reject invalid signature
      ↓
Check duplicate event
      ↓
Map event
      ↓
Trigger existing recovery workflow
```

Webhook-triggered recovery must reuse the same idempotency mechanism as API-triggered recovery.

## Current Status

```text
PENDING
```

---

# 26. Phase 20 — Reliability

## Priority

```text
P1
```

Target external-service resilience:

```text
Razorpay
Timeout: 5 seconds
Retries: 2

LLM
Timeout: 8 seconds
Retries: 1
```

Circuit breaking and safe failure behavior may be added where appropriate.

Ambiguous financial states must never be converted into fake success.

## Current Status

```text
PENDING
```

---

# 27. Phase 21 — Security Review

Security review must not be compressed to recover schedule time.

Required checks include:

```text
No secrets in frontend
No committed credentials
Webhook signature verification
Input validation
CORS review
Safe error responses
Idempotency enforcement
Payment verification
Dependency review
```

## Current Status

```text
PARTIAL / FINAL REVIEW PENDING
```

---

# 28. Phase 22 — Automated Testing

Automated testing must not be compressed to recover schedule time.

Current verified tests:

```text
tests/test_recovery_flow.py
tests/test_recovery_api.py
```

Verified on 2026-08-23:

```text
12 passed
```

Coverage currently includes:

```text
Successful recovery
Maximum-retry blocking
Blocked flow stops before execution
Idempotent duplicate request
High-value manual review
Unknown-failure manual review
Successful execute API
Audit API
Blocked execute API
API idempotency
High-value API review
Input validation
```

## Current Status

```text
CORE P0 TESTS COMPLETE ✅
P1 integration tests pending
```

---

# 29. Phase 23 — Deployment & Demo Readiness

Required before submission:

```text
Clean public repository
README
Setup instructions
Environment-variable documentation
No secrets
Backend reproducible
Frontend reproducible
Production build
Demo script
Successful case
Blocked case
Simulation labels
Known limitations documented
```

Target demo duration:

```text
Approximately 5 minutes
```

---

# 30. Buildathon Timeline

## August 23

```text
Recovery Executor
Guardrail synchronization
Idempotency
Import chain
Core execution verification
```

Status:

```text
COMPLETE ✅
```

---

## August 24

```text
Execute API
Audit API
Swagger verification
Automated backend tests
Decision Drawer foundation
```

Status:

```text
COMPLETE / ADVANCED EARLY ✅
```

---

## August 25

Target:

```text
P0 guardrail verification
Successful recovery case
Blocked recovery case
Idempotency tests
Final core backend stability
```

Much of this work was completed early on August 23.

---

## August 26

Target:

```text
Decision Drawer
Frontend/backend recovery integration
```

This work was completed early.

---

## August 27

Target:

```text
Agent Replay
Successful replay
Blocked replay
```

Implementation was completed early.

Final visual replay verification remains.

---

## August 28

```text
FLEX DAY
```

Default use if no P0 overrun:

```text
Dashboard integration / Decision Drawer refinement
```

If P0 work remains, this day absorbs the overflow first.

---

## August 29

Target:

```text
Supabase persistence
```

May shift according to the flex-day rule.

---

## August 30

Target:

```text
Persistent audit data
Calculated metrics
Storage integration
```

---

## August 31

Target:

```text
AI explanation layer
Deterministic fallback
```

---

## September 1

Target:

```text
Razorpay Test Mode
Payment verification
```

---

## September 2

Target:

```text
Razorpay webhooks
Signature verification
Duplicate-event handling
Existing recovery workflow integration
Integration tests
```

---

## September 3

Target:

```text
Final tests
README
GitHub cleanup
Deployment
Reproducibility check
```

---

## September 4

```text
DEMO FREEZE
```

No architecture changes unless required to fix a critical defect.

Focus on:

```text
Demo flow
Pitch
Video
Submission assets
Final safety/security verification
```

---

## September 5

```text
FINAL SUBMISSION
```

Do not rely on an unknown last-minute cutoff.

---

# 31. P0 Definition

P0 represents the minimum complete RecoverAI Buildathon product.

P0 must demonstrate that RecoverAI can:

```text
Receive a failure
Classify it
Choose a strategy
Apply deterministic safety controls
Execute or simulate an allowed recovery
Verify outcome
Stop unsafe recovery
Produce audit events
Explain the result visually
Prevent duplicate execution
```

---

# 32. P0 Completion Checklist

The P0 completion checklist contains exactly 14 items.

```text
[✅] 1. Failure Classifier

[✅] 2. Recovery Engine

[✅] 3. Guardrail Engine

[✅] 4. Recovery Executor

[✅] 5. Verification

[✅] 6. Audit Trail

[✅] 7. Execute API

[✅] 8. Audit API

[✅] 9. Decision Drawer

[✅] 10. Agent Replay

[✅] 11. Successful Demo

[✅] 12. Blocked Demo

[✅] 13. Simulation Labels

[✅] 14. Core Tests

# 33. Canonical Demo Cases

## Successful Recovery

```text
Transaction ID:
RX18492

Amount:
₹7,499

Failure:
BANK_UNAVAILABLE

Retry Count:
0
```

Expected:

```text
TRANSIENT_BANK_FAILURE
DELAYED_RETRY
GUARDRAIL → ALLOWED
EXECUTION → SIMULATION
VERIFY → SUCCESS
RECOVERED
```

Expected audit:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

---

## Blocked Recovery

```text
Transaction ID:
RX20117

Amount:
₹68,000

Failure:
BANK_UNAVAILABLE

Retry Count:
2
```

Expected:

```text
GUARDRAIL → BLOCKED
can_execute → false
recovered_amount → 0
```

Expected audit:

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

---

# 34. Current Position

**Last Updated:** 2026-08-23

## Completed and Verified

```text
Foundation                         ✅
Command Center foundation          ✅
Failure Classifier                 ✅
Recovery Engine                    ✅
Guardrail Engine                   ✅
Recovery Executor                  ✅
Verification                       ✅
Audit generation                   ✅
Execute API                        ✅
Audit API                          ✅
In-memory idempotency              ✅
Decision Drawer                    ✅
Dashboard recovery integration     ✅
Simulation/demo labeling           ✅
Core backend automated tests       ✅
Frontend production build          ✅
```

## Backend Verification

```text
12 / 12 automated backend tests passed

Failure Classifier import      ✅
Recovery Engine import         ✅
Guardrail Engine import        ✅
Recovery Executor import       ✅
Main FastAPI import            ✅
```

## Frontend Verification

```text
TypeScript compile             ✅
Vite production build          ✅
Decision Drawer successful UI  ✅
Agent Replay implementation    ✅
```

## Current P0 Verification Pending

Agent Replay must still be explicitly verified visually for:

```text
RX18492
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

and:

```text
RX20117
DETECT
CLASSIFY
DECIDE
GUARDRAIL — BLOCKED

No EXECUTE
No VERIFY
```

---

# 35. Immediate Next Task

## Current Task

Complete final Agent Replay P0 UI verification.

Required:

```text
1. Run RX18492.
2. Confirm Agent Replay reaches VERIFY.
3. Press REPLAY and confirm the same real audit events replay.

4. Run RX20117.
5. Confirm Agent Replay stops at GUARDRAIL — BLOCKED.
6. Confirm EXECUTE is absent.
7. Confirm VERIFY is absent.
```

After verification:

```text
P0 = 14 / 14
```

Then:

```text
1. Freeze P0 behavior.
2. Run documentation drift check.
3. Update memory.md.
4. Begin the next P1 phase.
```

Do not start Supabase, Razorpay, AI Reasoner, or additional dashboard polish until this checkpoint is closed.

---

# 36. Final Phase Rule

Every phase follows:

```text
BUILD
  ↓
RUN
  ↓
TEST
  ↓
FIX
  ↓
VERIFY
  ↓
DOCUMENT
  ↓
COMMIT
```

A phase is not complete because code exists.

It is complete only after its required behavior is verified.

---

# 37. Schedule Slack

**August 28 is the FLEX DAY.**

Default use:

```text
Dashboard integration / remaining P0 refinement
```

If Recovery Executor or Audit work had not been fully complete by the end of August 25:

```text
August 28 absorbs P0 overflow
        ↓
Dashboard work moves to August 29
        ↓
Supabase moves to August 30
        ↓
Later P1 work compresses first
```

If there is no P0 overflow, the flex day may be used for early Decision Drawer or integration work.

The P0 gate must be re-evaluated by the end of August 28.

---

# 38. P0 Without P1 Dependency

Decision Drawer and Agent Replay are P0.

They must remain demoable using:

```text
in-memory AUDIT_STORE
```

alone.

They must not depend on Supabase being complete.

Frontend audit access must use exactly one interface:

```text
GET /api/recovery/audit/{transaction_id}
```

Current:

```text
Frontend
   ↓
Audit API
   ↓
AUDIT_STORE
```

Later:

```text
Frontend
   ↓
Same Audit API
   ↓
Supabase/PostgreSQL
```

No frontend change should be required solely because the audit storage backend changes.

---

# 39. Overrun Absorption Order

If the schedule slips, reduce or delay work in this order:

```text
1. August 28 flex capacity

2. Phase 17 — Charts / analytics

3. Phase 16 — Real-time SSE
   Use polling fallback if required.

4. Reduce optional P1/P2 scope
```

Never compress:

```text
Automated Testing
Security Review
Payment Verification
Guardrail Safety
Idempotency
```

to recover schedule time.

---

# 40. Webhook Day Rule

September 2 webhook work should include:

```text
Signature verification
Duplicate webhook detection
Existing idempotency reuse
Mapping into the existing recovery pipeline
Webhook tests
```

An invalid or unverifiable webhook signature must be rejected.

Duplicate webhook events must not create duplicate recovery execution.

Webhook integration must not bypass:

```text
Recovery Engine
Guardrail Engine
Idempotency
Verification
Audit
```

The webhook is an input mechanism, not a separate recovery architecture.

---

# 41. phases.md Currency Rule

Sections:

```text
34. Current Position
35. Immediate Next Task
```

must be updated at the end of sessions that materially advance or complete P0 work.

Detailed observed implementation history belongs in:

```text
memory.md
```

If `memory.md` becomes more current than `phases.md`, the corresponding current-position sections in this file should be corrected during the same documentation update.

Canonical product rules and configuration values must not be redefined here when they already belong to:

```text
rules.md
architecture.md
PRD.md
backend/core/config.py
```

This file owns implementation sequence and current phase state.

---

# END OF PHASES DOCUMENT