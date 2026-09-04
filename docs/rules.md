RecoverAI — Engineering Rules

Project: RecoverAI — Intelligent AI-Powered Revenue Recovery Agent

Track: AI Revenue Recovery

Document: Engineering Rules

Status: FINAL / BINDING

Last Updated: 2026-09-04

1. Purpose

This document defines the binding engineering rules for RecoverAI.

These rules exist to protect:

Payment safety

Correctness

Explainability

Auditability

Buildathon scope

Code quality

Documentation consistency

When another project document conflicts with this file, this file wins unless this file explicitly delegates authority elsewhere.

2. Source-of-Truth Order

Rule 1 — Documentation Authority

The source-of-truth order is:


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


Higher documents override lower documents.

Rule 2 — Implementation Does Not Rewrite Requirements

Existing code does not automatically become the requirement.

If implementation differs from canonical documentation:


documentation

     ↓

test expectation

     ↓

implementation correction


unless an intentional requirement change is explicitly approved and documented.

Rule 3 — memory.md Is Observational

memory.md records what currently exists.

It must not silently redefine:

Product behavior

Guardrail thresholds

Architecture

P0/P1/P2 priorities

Design rules

Rule 4 — phases.md Owns Implementation Order

phases.md determines what should be built next.

Do not skip a required phase because another feature looks more impressive.

Rule 5 — PRD Owns Product Requirements

Functional behavior must trace back to the PRD whenever possible.

3. Product Safety Philosophy

Rule 6 — Deterministic Safety Core

Safety-critical payment decisions must remain deterministic.

Primary principle:


Deterministic core

+

AI-assisted intelligence


Rule 7 — AI Is Not Financial Authority

The LLM must never independently decide whether a payment operation is safe to execute.

Rule 8 — AI Cannot Override Guardrails

AI may explain or summarize.

AI may not override:


retry limits

confidence thresholds

amount limits

stop conditions

manual-review requirements

duplicate protection

verification requirements


Rule 9 — AI Cannot Mark Payments Recovered

Only verified payment state can produce:


RECOVERED


An AI response cannot.

Rule 10 — AI Failure Must Not Break Core Recovery

If AI is unavailable:


AI unavailable

      ↓

deterministic fallback explanation

      ↓

core recovery continues


4. Dependency Rules

Rule 11 — Strict Downward Dependencies

Backend dependencies must follow:


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

routers / main


Rule 12 — No Reverse Dependency

A lower-level service may not import a higher-level service.

Rule 13 — No Self Import

A module must never import itself.

Example prohibited:


# inside recovery_engine.py

from services.recovery_engine import create_recovery_decision


Rule 14 — Recovery Engine Cannot Import Guardrails

recovery_engine.py must not import:


guardrail_engine

recovery_executor


Rule 15 — Guardrail Engine May Depend on Recovery Decision

The Guardrail Engine may evaluate a recovery decision, but Recovery Engine must remain unaware of Guardrail Engine.

Rule 16 — Executor Orchestrates Lower Layers

The Recovery Executor may coordinate:


classifier

recovery engine

guardrail engine

verification

audit

payment adapter


provided dependency direction remains valid.

5. Frontend Boundaries

Rule 17 — Frontend Is Presentation and Interaction

React is responsible for:

Display

Interaction

Loading states

Error states

Animation

Navigation

Calling backend APIs

Rule 18 — Frontend Does Not Decide Retry Policy

React must not decide whether a transaction should retry.

Rule 19 — Frontend Does Not Calculate Guardrail Safety

React must not independently calculate whether execution is safe.

Rule 20 — Frontend Does Not Infer Failure Codes

Do not implement mappings such as:


"Bank unavailable"

      ↓

BANK_UNAVAILABLE


inside React for financial decision purposes.

Backend must provide machine-readable values.

Rule 21 — Frontend Never Stores Payment Secrets

Never expose backend credentials in:


React source

Vite environment variables exposed to client

browser storage

network-visible frontend code


Rule 22 — Frontend Never Performs Privileged Razorpay Calls

Razorpay secret-authenticated calls belong on the backend.

Rule 23 — UI Opening Must Not Trigger Financial Execution

Opening:


Decision Drawer

Agent Replay

Transaction details


must not silently execute payment recovery.

Execution requires an explicit recovery action.

6. Recovery Pipeline

Rule 24 — Canonical Pipeline

The core recovery workflow is:


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


Rule 25 — Detection Validates Input

A recovery request must contain the fields required by the current schema.

Core fields:


transaction_id

amount

failure_code

retry_count


Rule 26 — Amount Must Be Valid

A non-positive transaction amount must be rejected during validation.

Rule 27 — Classification Must Be Structured

Failure classification must return structured output rather than only free text.

Rule 28 — Recovery Decision Must Be Structured

Recovery Engine must produce an explicit action/status decision.

Rule 29 — Unknown Failure Must Be Safe

Unknown or insufficiently understood failures must not be aggressively auto-executed.

Rule 30 — Safety Before Execution

No recovery execution occurs until the Guardrail Engine has approved the attempt.

7. Guardrail Rules

Rule 31 — Guardrails Are Deterministic

Guardrail outcomes must be reproducible from configured inputs and state.

Rule 32 — Guardrail Outcomes

Supported outcomes are:


ALLOWED

BLOCKED

REVIEW_REQUIRED


Rule 33 — Block Means Stop

If:


guardrail_status = BLOCKED


then:


can_execute = false


and execution must stop.

Rule 34 — Review Required Means No Automatic Execution

If:


guardrail_status = REVIEW_REQUIRED


then the automatic payment recovery action must not execute.

Rule 35 — Retry Limit Is Hard Safety

A retry action may not exceed configured maximum retry attempts.

Rule 36 — Buildathon Maximum Retry Baseline

The configured Buildathon baseline is:


MAX_RETRIES = 2


Runtime authority is defined by Rule 105.

Rule 37 — Auto-Execution Confidence Baseline

The Buildathon target is:


MIN_CONFIDENCE_AUTO_EXECUTE = 0.80


Below the automatic threshold, automation must not silently proceed.

Rule 38 — Minimum Any-Action Confidence

Target:


MIN_CONFIDENCE_ANY_ACTION = 0.50


Below the safety floor, the workflow should stop rather than attempt an automated recovery.

Rule 39 — High-Value Automation Limit

Buildathon baseline:


MAX_RECOVERABLE_AMOUNT_AUTO = ₹50,000


Above the automatic amount threshold, manual review is required unless future canonical policy explicitly changes the behavior.

Rule 40 — Cooldown Is P1

Target:


RETRY_COOLDOWN_MINUTES = 15


Cooldown enforcement is P1 and must not be falsely claimed as complete before implementation/tests exist.

Rule 41 — Consecutive Failure Stop Is P1

Target:


STOP_ON_CONSECUTIVE_FAILURES = 2


This is P1 until implemented and verified.

Rule 42 — Duplicate Window Target

Target:


DUPLICATE_WINDOW_SECONDS = 30


This must complement, not replace, execution idempotency.

Rule 43 — Stronger Safety Outcome Wins

When multiple safety conditions apply, the system must choose the outcome that prevents unsafe execution.

Example:


retry limit reached

+

high-value review threshold exceeded


must not result in automatic execution.

8. Recovery Execution Rules

Rule 44 — Executor Must Respect Recovery Decision

Executor must not silently substitute a different business strategy.

Rule 45 — Executor Must Respect Guardrail Decision

If Guardrail says no, Executor says no.

Rule 46 — Execution Mode Must Be Explicit

Buildathon execution may use:


SIMULATION
RAZORPAY_TEST


The active mode must be clearly identified.

RAZORPAY_TEST means Razorpay Test Mode only. It must never be presented as production payment execution.

Rule 47 — Simulation Must Be Deterministic

The same canonical input should produce stable demo behavior.

Avoid uncontrolled random recovery results.

Rule 48 — Simulation Is Not Real Revenue

A simulated success must never be described as real merchant recovery.

Rule 49 — Customer Action Is Not Recovered Revenue

If RecoverAI sends or simulates:


customer reminder

new payment method request

checkout reminder


the revenue remains unrecovered until later payment verification confirms otherwise.

Rule 50 — No Execution After Block

For a blocked workflow, there must be no:


EXECUTE

VERIFY


audit events.

9. Verification Rules

Rule 51 — Execute Is Not Verify

An execution call succeeding technically does not prove the payment succeeded.

Rule 52 — Verification Is Mandatory

Allowed payment recovery must follow:


EXECUTE

   ↓

VERIFY


before final financial success.

Rule 53 — Only Verified Recovery Counts

recovered_amount may contribute to revenue recovered only after successful verification.

Rule 54 — Ambiguous Payment State Is Not Success

If the external payment state is unclear:


do not assume success

do not blindly retry

mark pending / investigate / safely retry verification


Rule 55 — Failed Verification Must Not Produce Recovery Revenue

If verification fails:


recovered_amount = 0


for that attempt.

10. Audit Rules

Rule 56 — Every Recovery Attempt Is Auditable

A recovery attempt must produce an audit trail.

Rule 57 — Audit Reflects Reality

Audit events must represent events that actually occurred.

Rule 58 — No Fictional Audit Steps

Frontend or backend must not add fake stages for visual completeness.

Rule 59 — Successful Audit Sequence

A normal successful recovery may contain:


DETECT

CLASSIFY

DECIDE

GUARDRAIL

EXECUTE

VERIFY


Rule 60 — Blocked Audit Sequence

A blocked attempt stops at the blocking point.

Example:


DETECT

CLASSIFY

DECIDE

GUARDRAIL


Rule 61 — Audit Events Need Core Fields

Audit events must contain at least:


step

status

message

timestamp


Rule 62 — Audit Should Become Append-Only

Persistent P1 audit storage should be append-oriented.

Historical audit events should not be silently rewritten.

Rule 63 — Audit Storage Can Be Swapped Behind API

The frontend-facing audit contract remains:


GET /api/recovery/audit/{transaction_id}


even when storage changes from memory to Supabase.

11. Agent Replay Rules

Rule 64 — Agent Replay Uses Real Audit Data

Agent Replay must use backend audit events.

Rule 65 — Replay Cannot Hardcode Full Pipeline

Do not always render:


DETECT

CLASSIFY

DECIDE

GUARDRAIL

EXECUTE

VERIFY


regardless of actual events.

Rule 66 — Blocked Replay Stops

A blocked recovery must visually stop at the actual blocked event.

Rule 67 — Replay Is Explainability, Not Authority

Replay displays history.

It does not make or change financial decisions.

Rule 68 — Replay Can Animate Existing Events

Motion may progressively display audit events, but animation must not alter their order or meaning.

12. Decision Drawer Rules

Rule 69 — Drawer Uses Backend Data

Decision Drawer should display backend-provided recovery results.

Rule 70 — Drawer Must Explain Safety Outcome

The operator should be able to see:


classification

confidence

recovery action

guardrail status

execution status

recovered amount


where available.

Rule 71 — Drawer Must Show Simulation Context

Simulation-mode recovery must be visibly labeled.

Rule 72 — Drawer Must Not Claim AI When AI Is Not Used

Do not show:


AI-generated diagnosis


as though an LLM produced it if the current result is deterministic.

Use accurate labels.

13. Razorpay Rules

Rule 73 — Razorpay Test Mode First

Buildathon payment integration must use:


Razorpay Test Mode


before any consideration of production payment execution.

Rule 74 — Razorpay Logic Is Isolated

Gateway-specific code belongs in:


services/razorpay_service.py


or an equivalent isolated integration layer.

Rule 75 — Razorpay Secrets Are Backend-Only

Never expose:


Razorpay secret

webhook secret

private credentials


to the frontend.

Rule 76 — Gateway Result Must Be Verified

Do not treat a request returning successfully as sufficient proof of payment recovery.

Rule 77 — Gateway Failure Must Be Safe

Timeouts or gateway errors must not create blind repeated financial actions.

14. Webhook Rules

Rule 78 — Webhook Signature Verification Required

Razorpay webhook requests must have valid signature verification before trusted processing.

Rule 79 — Invalid Signature Is Rejected

An unverifiable signature must not enter the recovery pipeline.

Rule 80 — Webhook Duplicate Protection Required

Repeated delivery of the same event must not cause duplicate recovery execution.

Rule 81 — Webhook Reuses Existing Recovery Pipeline

Webhook handling must map into:


classifier

recovery engine

guardrails

executor

verification

audit


rather than building a separate financial logic path.

Rule 82 — Webhook Does Not Bypass Idempotency

Webhook-triggered recovery uses the same execution idempotency rules as API-triggered recovery.

15. Persistence Rules

Rule 83 — In-Memory Financial State Is Not Durable

Any remaining in-memory:


AUDIT_STORE
idempotency stores


must be treated as development or fallback mechanisms, not durable financial state.

Gateway-linked persistent execution, verification, idempotency, and audit state should use the configured persistent storage path. In the current Buildathon implementation, that persistent path is Supabase/PostgreSQL.

Rule 84 — Persistent Financial State Before Real Execution

Before relying on real external payment execution, critical execution/idempotency state must survive process restart.

Rule 85 — Money Should Use Minor Units in Persistent Financial Storage

Persistent gateway-linked financial values should use integer smallest currency units where appropriate.

For INR:


paise


Rule 86 — Merchant Scope Must Be Preserved in Persistent Architecture

Future multi-merchant storage must avoid cross-merchant data leakage.

16. Security Rules

Rule 87 — Secrets Must Not Be Committed

Use environment variables / secret management.

Rule 88 — .env Must Be Ignored

Secret-bearing .env files must not be committed to public source control.

Rule 89 — Never Log Sensitive Payment Credentials

Never log:


API secrets

passwords

CVV

full card numbers

sensitive payment credentials


Rule 90 — Safe User Errors

Frontend users should receive clear safe messages, not backend stack traces.

Security Boundary Clarification — Authentication and Authorization

This clarification records the currently implemented RecoverAI authentication boundary.

Browser Authentication

RecoverAI browser-facing protected APIs use:


Supabase Auth
      ↓
Supabase access token
      ↓
Authorization: Bearer <JWT>
      ↓
FastAPI get_current_user
      ↓
Protected API


The backend is responsible for validating the authenticated user. A frontend session alone is not sufficient authorization for a protected backend endpoint.

Protected Browser APIs

The current protected browser-facing API boundary includes:


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


Requests to these endpoints without valid authentication must be rejected.

Public Application Endpoints

The following application/system endpoints remain public:


GET /
GET /health


Public endpoints must not expose private credentials or sensitive financial state.

Razorpay Webhook Trust Boundary

The Razorpay webhook is not authenticated with a RecoverAI browser-user JWT.


Razorpay
      ↓
POST /api/razorpay/webhook
      ↓
X-Razorpay-Signature
      ↓
Razorpay webhook signature verification
      ↓
Trusted webhook processing


Supabase user authentication and Razorpay webhook authentication are separate trust boundaries.

Do not require a Supabase browser-user JWT for the Razorpay webhook.

Do not weaken Razorpay signature verification because browser authentication exists.

Authentication Does Not Equal Tenant Isolation

The current authentication implementation establishes user identity and prevents anonymous access to protected browser APIs.

It does not by itself establish:


merchant-level authorization
tenant isolation
per-user merchant data scoping
cross-merchant row isolation
multi-merchant security


Until those controls are explicitly implemented and tested, RecoverAI must not claim that authenticated users are isolated into separate merchant tenants.

Rule 86 remains the requirement for future multi-merchant architecture.

Credential Boundary

Frontend code may contain only credentials explicitly intended for public/client-side use, such as the Supabase public/anon or publishable key.

The frontend must never contain:


Supabase service-role/private credentials
Razorpay key secret
Razorpay webhook secret
private AI-provider API keys


Private credentials remain backend-only.

17. Testing Rules

Rule 91 — Safety Behavior Requires Tests

Changes to:


retry limits
confidence thresholds
amount limits
duplicate protection
verification
execution
authentication
authorization boundaries
webhook trust boundaries


require tests.

Rule 92 — Successful Path Must Be Tested

Tests must include at least one allowed successful recovery.

Rule 93 — Blocked Path Must Be Tested

Tests must prove a blocked attempt does not execute.

Rule 94 — Idempotency Must Be Tested

Duplicate execution requests must have regression coverage.

Rule 95 — Input Validation Must Be Tested

Invalid recovery input must be rejected.

Rule 96 — Run Full Regression Tests After Core Changes

Current baseline command:


python -m pytest tests -v


New work must preserve existing P0 behavior.

18. Build and Scope Rules

Rule 97 — P0 Before P1

Do not sacrifice unfinished P0 behavior for:


Supabase

AI

charts

SSE

extra UI polish

advanced analytics


Rule 98 — No Premature Microservices

RecoverAI should remain a clear modular application for the Buildathon.

Do not introduce distributed architecture without a real need.

Rule 99 — Buildathon Claims Must Be Honest

Clearly distinguish:


implemented

simulated

demo data

planned

test environment

production capability


Never present planned functionality as working.

Rule 100 — Build → Run → Test → Fix → Document → Commit

Every meaningful implementation checkpoint follows:


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


A feature is not complete merely because code exists.

19. Final Addendum — Rules 101–105

These rules are binding additions to Rules 1–100.

They exist specifically to eliminate ambiguity discovered during executor implementation.

Rule 101 — Idempotency Enforcement

Idempotency is mandatory for any endpoint or workflow that can trigger financial execution.

It is not an optional future hardening task.

For every execution attempt:


Recovery request

      ↓

Resolve idempotency key

      ↓

Look up existing state/result

      ↓

Existing completed result?

   ↙                   ↘

 YES                    NO

 ↓                      ↓

Return existing       Reserve key

result                BEFORE execution

                         ↓

                     Execute once

                         ↓

                     Persist/finalize

                     result


The caller may provide:


idempotency_key


or the backend must deterministically generate one from:


transaction_id

+

failure_code

+

attempt_number


For current request schemas, the attempt number may be derived consistently from retry state.

The key must be reserved before an external payment call begins.

If a completed result already exists for that key:


return the existing result


Do not execute another financial attempt.

For the current Buildathon simulation, in-memory idempotency is acceptable for demonstrating the mechanism.

However:


in-memory idempotency

≠

crash-safe idempotency


Before true external financial execution is considered durable, the idempotency reservation/result must use persistent storage.

Webhook-triggered recovery must reuse this same idempotency mechanism.

P0 completion requires idempotency behavior.

Rule 102 — Guardrail Calibration

Guardrail confidence thresholds are fixed for the Buildathon unless intentionally changed through the documented configuration process.

Do not dynamically:


self-tune confidence thresholds

auto-calibrate thresholds

change them based on demo outcomes

change them based on LLM output


during the Buildathon flow.

Any threshold change requires:


1. Documentation update

2. Test update

3. Configuration update

4. Implementation verification


The system should favor predictable, explainable safety behavior over dynamic calibration during the Buildathon.

Rule 103 — Mid-Flight Guardrail Rule

Guardrails must be evaluated exactly once per execution attempt.

Evaluation occurs at:


DECIDE

   ↓

GUARDRAIL

   ↓

EXECUTE


immediately before execution.

The returned Guardrail Decision governs that entire attempt.

Do not re-run guardrails midway through the same attempt.

Reason:


one attempt

+

one safety decision

+

one auditable result


prevents contradictory state transitions.

Concurrency and duplicate-start protection belong to the idempotency/concurrency mechanism, not repeated guardrail evaluation.

After execution:


VERIFY


checks the actual payment/gateway state.

If the system ever observes:


GUARDRAIL = BLOCKED


but the same attempt nevertheless succeeds externally, this is not a normal business outcome.

It must be:


audit status = ERROR

critical safety defect

escalate / investigate


Do not silently reinterpret the blocked guardrail as allowed.

Rule 104 — Documentation Drift Check

Before committing a change that modifies documented behavior, search the canonical documentation for stale references.

At minimum check:


rules.md

architecture.md

PRD.md

design.md


and when relevant:


project-overview.md

phases.md

memory.md

README

tests


Search for old:


threshold values

endpoint names

status names

workflow stages

field names

priority classifications

demo claims


Example:


Change MAX_RETRIES

      ↓

Search docs/tests/config/code

      ↓

Update every stale reference

      ↓

Run tests

      ↓

Commit


Do not knowingly leave contradictory canonical documentation behind.

Rule 105 — Configuration Deviation Rule

For runtime safety configuration:


backend/core/config.py


is the binding implementation configuration source.

If code behavior disagrees with core/config.py:


that is a bug


unless there is:


1. An explicit documented exception

2. A clear reason

3. Dedicated test coverage


Services must not silently introduce local magic numbers that override configured safety behavior.

Example prohibited:


# guardrail_engine.py

MAX_RETRIES = 5


when:


# core/config.py

MAX_RETRIES = 2


Correct architecture:


core/config.py

      ↓

guardrail_engine.py

      ↓

recovery_executor.py


When a canonical threshold is intentionally changed:


documentation

+

config.py

+

tests

+

implementation


must move together.

20. Final Engineering Principle

RecoverAI prioritizes:


Safety

  ↓

Correctness

  ↓

Idempotency

  ↓

Verification

  ↓

Auditability

  ↓

Explainability

  ↓

UX

  ↓

Polish


The core product principle remains:

Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.

No feature, AI capability, UI improvement, integration, authentication change, or demo shortcut may weaken that sequence.

Authentication must protect browser-facing APIs without being misrepresented as tenant isolation, and webhook trust must remain independently enforced by Razorpay signature verification.

END OF RULES DOCUMENT