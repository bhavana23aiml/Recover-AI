# RecoverAI — Project Memory

**Project:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent  

**Track:** AI Revenue Recovery  

**Document:** Implementation Memory / Resume State  

**Status:** ACTIVE  

**Last Updated:** 2026-09-04

---

# 1. Purpose

This file records the observed state of the RecoverAI repository.

It is intended to answer:

```text

What is actually implemented?

What has actually been tested?

What is currently broken?

What is the next task?

What should not be started yet?

```

This file is not the canonical owner of:

```text

Product requirements

Architecture rules

Design rules

Guardrail configuration

Build priorities

```

Those belong to the higher-authority documents.

---

# 2. QUICK RESUME

```text
Date of last verified implementation state:
2026-09-04

Current phase:
Documentation drift closure
→ then authenticated browser E2E
→ then deployment/demo freeze

Last confirmed working:

- Failure Classifier
- Recovery Engine
- Guardrail Engine
- Recovery Executor
- Deterministic simulation
- Verification
- Audit API / Agent Replay contract
- Supabase/PostgreSQL gateway/recovery persistence
- Persistent gateway-linked idempotency
- AI reasoning layer
- Deterministic AI fallback
- GroqCloud provider integration
- Razorpay Test Mode recovery-order flow
- Razorpay payment verification
- Razorpay payment reconciliation
- Signed Razorpay webhook
- payment.captured synchronization
- Supabase browser authentication
- Protected frontend routing
- Protected browser-facing backend APIs
- Frontend production build
- 47 backend tests passing / 0 failed

Current verification / release work:

- Finish memory.md drift alignment
- Re-run backend regression suite
- Re-run frontend production build
- Login through Supabase Auth
- Verify protected dashboard request succeeds
- Verify RX18492 allowed flow
- Verify AI explanation
- Verify Agent Replay reaches VERIFY
- Verify RX20117 stops at GUARDRAIL — BLOCKED
- Verify no EXECUTE / VERIFY for blocked attempt
- Verify logout + protected-route redirect
- Review production CORS / environment configuration
- Deploy and smoke-test
- Freeze demo/submission claims

Do NOT claim:

- Multi-merchant tenant isolation
- Merchant-level authorization
- Cross-merchant data isolation
- Production Razorpay processing
- Production merchant revenue recovered
- SSE-driven live activity
- Production multi-worker correctness
- Production readiness before deployment smoke testing
```

For canonical current phase state, read:

```text
docs/phases.md §34
docs/phases.md §35
```

---

# 3. Documentation Source of Truth

Use this authority order:

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

This file records repository observations.

If memory conflicts with a canonical requirement, the canonical document wins.

If memory contains newer repository observations than `phases.md`, update the current-position sections of `phases.md`.

---

# 4. Local Project Path

Current development machine:

```text
macOS
```

Observed project path:

```text
~/Recover-AI
```

Development tools observed:

```text
VS Code
zsh / macOS Terminal
Python virtual environment
npm / Vite
Git / GitHub CLI
```

Older Windows paths later in historical notes are not current resume commands.

---

# 5. Current Top-Level Project Structure

Observed/current project areas include:

```text
Recover-AI/
├── backend/
├── frontend/
├── docs/
├── ai/
├── database/
├── scripts/
├── README.md
└── project configuration / Git files
```

The documentation set is physically being aligned to the current implementation in this order:

```text
rules.md
architecture.md
PRD.md
design.md
project-overview.md
phases.md
memory.md
```

This memory update is the final document in that authority-order drift pass.

---

# 6. Backend Technology

Observed/current backend stack:

```text
Python 3.12.14
FastAPI
Pydantic
Uvicorn
pytest
Supabase Python client
Razorpay integration
GroqCloud-compatible AI provider integration
```

The current verified test baseline is recorded in Section 33.

Older Python/pytest version observations from the original Windows development checkpoint are historical, not the current environment.

---

# 7. Backend Path

```text
~/Recover-AI/backend
```

Virtual environment:

```text
backend/venv
```

Activation:

```bash
cd ~/Recover-AI/backend
source venv/bin/activate
```

Backend start:

```bash
python -m uvicorn main:app --reload
```

---

# 8. Backend Service Structure

Observed implemented backend service areas include:

```text
backend/services/

failure_classifier.py
recovery_engine.py
guardrail_engine.py
recovery_executor.py
ai_reasoner.py
razorpay_service.py
```

Observed current state:

```text
failure_classifier.py     implemented ✅
recovery_engine.py        implemented ✅
guardrail_engine.py       implemented ✅
recovery_executor.py      implemented ✅
ai_reasoner.py            implemented ✅
razorpay_service.py       implemented ✅
```

Additional implemented backend concerns include:

```text
Supabase persistence
Supabase user-token validation
AI provider dispatch / fallback
Razorpay verification / reconciliation
Razorpay webhook signature verification
persistent gateway/recovery idempotency
```

Do not infer completion from file existence alone; the status above reflects verified implementation/testing checkpoints.

---

# 9. Backend Dependency Direction

Observed working dependency chain:

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

main API

```

The previous circular import in `recovery_engine.py` was removed.

---

# 10. Previous Recovery Engine Blocker

Earlier error:

```text

ImportError:

cannot import name 'create_recovery_decision'

from partially initialized module

'services.recovery_engine'

```

Root cause:

```python

from services.recovery_engine import create_recovery_decision

```

was incorrectly present inside:

```text

services/recovery_engine.py

```

That self-import was removed.

Current import verification passes.

---

# 11. Failure Classifier

Observed state:

```text

IMPLEMENTED ✅

IMPORT VERIFIED ✅

```

Verification command:

```bat

python -c "from services.failure_classifier import classify_failure; print('1. Classifier OK')"

```

Observed output:

```text

1. Classifier OK

```

Canonical classifier behavior belongs to the PRD / architecture / implementation.

Do not duplicate the full rule table here.

---

# 12. Recovery Engine

Observed state:

```text

IMPLEMENTED ✅

IMPORT VERIFIED ✅

```

Verification command:

```bat

python -c "from services.recovery_engine import create_recovery_decision; print('2. Recovery Engine OK')"

```

Observed output:

```text

2. Recovery Engine OK

```

The Recovery Engine no longer imports itself or the Guardrail Engine.

---

# 13. Guardrail Engine

Observed state:

```text

IMPLEMENTED ✅

IMPORT VERIFIED ✅

CORE P0 TESTS PASS ✅

```

Verification:

```bat

python -c "from services.guardrail_engine import evaluate_guardrails; print('3. Guardrail OK')"

```

Observed:

```text

3. Guardrail OK

```

Guardrail configuration is not owned by this memory file.

Read:

```text

backend/core/config.py

docs/rules.md

```

for canonical values.

---

# 14. Configuration Authority

Observed implementation imports safety configuration from:

```text

backend/core/config.py

```

`core.config` was successfully imported during development.

Per project rules:

```text

backend/core/config.py

```

is the binding runtime source for configured safety thresholds.

If service code and config disagree, treat it as a bug unless an explicit documented exception exists.

---

# 15. Recovery Executor

Observed state:

```text

IMPLEMENTED ✅

IMPORT VERIFIED ✅

SERVICE TESTS PASS ✅

API TESTS PASS ✅

```

Current file:

```text

backend/services/recovery_executor.py

```

Observed file exists and contains:

```python

def execute_recovery(...)

```

---

# 16. Executor Workflow

Observed executor implements:

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

Guardrail evaluation is called once for the execution attempt.

The already-generated recovery decision is passed to the Guardrail Engine.

---

# 17. Current Execution Environments

RecoverAI currently demonstrates two non-production execution contexts:

```text
SIMULATION
RAZORPAY_TEST
```

`SIMULATION` is the deterministic recovery-demo execution path.

`RAZORPAY_TEST` is the integrated Razorpay Test Mode path.

Both must remain visibly labeled.

Neither may be represented as production merchant payment processing.

A simulation result is not real merchant revenue.

A verified Razorpay Test Mode payment proves the test gateway integration, not production revenue recovery.

---

# 18. Deterministic Simulation

Observed executor uses a deterministic hash-based approach.

Meaning:

```text

same transaction inputs

      ↓

same simulation calculation

      ↓

stable demo behavior

```

This avoids random Buildathon demos producing different outcomes unexpectedly.

Simulation assumptions are implementation/demo behavior and are not validated merchant recovery statistics.

---

# 19. Current Audit / Recovery Persistence

Current gateway/recovery-linked persistence uses:

```text
Supabase
PostgreSQL
```

The persistent path covers recovery/gateway state, idempotency, verification/reconciliation state, and audit-related persistence used around the Razorpay Test Mode integration.

The stable frontend audit endpoint remains:

```text
GET /api/recovery/audit/{transaction_id}
```

Controlled in-memory audit state may still exist in deterministic simulation/tests.

Do not describe process-local simulation storage as the durability mechanism for gateway-linked financial state.

---

# 20. Audit Behavior

Observed successful recovery audit:

```text

DETECT

CLASSIFY

DECIDE

GUARDRAIL

EXECUTE

VERIFY

```

Observed blocked recovery audit:

```text

DETECT

CLASSIFY

DECIDE

GUARDRAIL

```

For blocked workflows:

```text

EXECUTE absent ✅

VERIFY absent ✅

```

---

# 21. Idempotency

Observed current state:

```text
Deterministic duplicate protection              ✅
Automated regression coverage                   ✅
Persistent gateway/recovery idempotency path    ✅
Supabase/PostgreSQL durable state               ✅
```

For gateway-linked execution, the durable idempotency/recovery state is reserved before external execution.

Repeated verification/reconciliation or duplicate delivery must not create another payment attempt merely because the request is repeated.

Process-local idempotency may remain in deterministic tests/simulation.

---

# 22. Idempotency Limitation

Persistent idempotency materially improves crash/restart safety for the gateway-linked path.

However, RecoverAI must still **not** claim full production multi-worker financial correctness without dedicated concurrency/load testing.

Distinguish:

```text
persistent gateway-linked idempotency     implemented

full production distributed concurrency   not proven
```

---

# 23. Canonical Successful Demo Case

Observed and verified through service/API/UI work:

```text

Transaction:

RX18492

Amount:

₹7,499

Failure:

BANK_UNAVAILABLE

Retry Count:

0

```

Observed outcome:

```text

Guardrail:

ALLOWED

Execution:

RECOVERED

Recovered Amount:

₹7,499

Execution Mode:

SIMULATION

```

Observed audit:

```text

DETECT

CLASSIFY

DECIDE

GUARDRAIL

EXECUTE

VERIFY

```

---

# 24. Canonical Blocked Demo Case

Observed and verified through service/API tests:

```text

Transaction:

RX20117

Amount:

₹68,000

Failure:

BANK_UNAVAILABLE

Retry Count:

2

```

Observed outcome:

```text

Guardrail:

BLOCKED

can_execute:

false

Execution:

BLOCKED

Recovered Amount:

0

```

Observed audit:

```text

DETECT

CLASSIFY

DECIDE

GUARDRAIL

```

No execution or verification events were produced.

---

# 25. Historical Swagger Verification

The August 23 deterministic P0 checkpoint was manually verified through FastAPI Swagger before the later browser-authentication boundary was added.

Historical successful case:

```text
POST /api/recovery/execute
RX18492
GUARDRAIL → ALLOWED
SIMULATION → RECOVERED
```

Historical blocked case:

```text
POST /api/recovery/execute
RX20117
GUARDRAIL → BLOCKED
```

These observations remain useful history.

Current protected browser-facing endpoints now require authentication.

---

# 26. Historical Successful Audit API Verification

The earlier deterministic checkpoint manually verified:

```text
GET /api/recovery/audit/RX18492
```

and received the real backend audit sequence for the executed simulation.

Current audit access is now within the authenticated browser API boundary.

---

# 27. Historical Blocked Audit API Verification

The earlier deterministic checkpoint manually verified the blocked audit:

```text
RX20117

DETECT
CLASSIFY
DECIDE
GUARDRAIL — BLOCKED
```

No `EXECUTE` or `VERIFY` event was produced.

That safety property remains part of current regression coverage.

---

# 28. Backend API

Current public application/system endpoints:

```text
GET /
GET /health
```

Current protected browser-facing endpoints:

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

Protected browser requests use a Supabase access token:

```text
Authorization: Bearer <token>
```

The backend validates the authenticated user through `get_current_user`.

Razorpay webhook endpoint:

```text
POST /api/razorpay/webhook
```

The webhook uses Razorpay signature authentication and must not require a Supabase browser-user JWT.

---

# 29. Dashboard API

Current endpoint:

```text
GET /api/dashboard
```

Current security state:

```text
AUTHENTICATION REQUIRED ✅
```

The response still contains demo/sample dashboard data.

The UI must not present those values as measured merchant production performance.

Canonical current metric examples include:

```text
Revenue at Risk      ₹2,48,400
Revenue Recovered    ₹1,71,920
Recovery Rate        69.2%
Active Recoveries    47
Failed Payments      84
Recovered Today      ₹31,900
```

These are demo values unless/until replaced by calculated verified persisted metrics.

---

# 30. Current Dashboard Demo Transactions

Observed backend dashboard currently returns:

```text

RX18492

RX18493

RX18494

RX20117

```

Machine-readable fields were added so React does not infer financial logic from display strings.

Current transaction payload includes:

```text

id

amount

failure_reason

failure_code

retry_count

agent_action

status

```

---

# 31. Dashboard Business Logic Boundary

The frontend must not perform mappings such as:

```text

"Bank unavailable"

      ↓

BANK_UNAVAILABLE

```

for recovery safety logic.

Backend supplies the machine-readable:

```text

failure_code

retry_count

```

which React forwards to the recovery API.

---

# 32. Backend Automated Tests

Current test suite includes coverage across files such as:

```text
backend/tests/test_recovery_flow.py
backend/tests/test_recovery_api.py
backend/tests/test_ai_reasoner.py
backend/tests/test_ai_api.py
backend/tests/test_razorpay_api.py
backend/tests/test_auth_api.py
```

The suite includes deterministic recovery, AI, Razorpay, and authentication coverage.

---

# 33. Backend Test Result

Latest verified on 2026-09-04:

```text
47 passed
0 failed
2 non-blocking Supabase client deprecation warnings
```

Preferred command from the backend virtual environment:

```bash
python -m pytest -q
```

The two warnings are Supabase sync-client deprecation warnings and were non-blocking at the verified checkpoint.

---

# 34. Recovery / Integration Test Coverage

Current regression coverage includes:

```text
successful recovery
maximum-retry blocking
blocked flow stops before execution
duplicate/idempotent request behavior
high-value safety behavior
unknown-failure handling
execute API
audit API
input validation
AI reasoning and deterministic fallback
Razorpay recovery-order behavior
Razorpay payment verification
Razorpay reconciliation
webhook behavior
```

---

# 35. Authentication Test Coverage

Current authentication tests verify anonymous access is rejected from protected browser-facing APIs.

Protected areas tested include the recovery/dashboard/AI boundary and the three Razorpay browser APIs.

Razorpay business tests use a deterministic authenticated-user dependency override so gateway behavior can be tested without a live Supabase login.

The Razorpay webhook is different: it uses Razorpay signature authentication rather than browser-user authentication.

---

# 36. API Test Dependency

FastAPI/Starlette `TestClient` required an additional dependency in the current environment.

Observed earlier collection error:

```text

RuntimeError:

The starlette.testclient module requires

the httpx2 package to be installed.

```

After installing the required dependency, the API tests executed successfully.

---

# 37. Backend Import Chain

Latest verified commands:

```bat

python -c "from services.failure_classifier import classify_failure; print('1. Classifier OK')"

python -c "from services.recovery_engine import create_recovery_decision; print('2. Recovery Engine OK')"

python -c "from services.guardrail_engine import evaluate_guardrails; print('3. Guardrail OK')"

python -c "from services.recovery_executor import execute_recovery; print('4. Executor OK')"

python -c "import main; print('5. Main API OK')"

```

Observed output:

```text

1. Classifier OK

2. Recovery Engine OK

3. Guardrail OK

4. Executor OK

5. Main API OK

```

---

# 38. Backend Run Command

From:

```text
~/Recover-AI/backend
```

with the virtual environment active:

```bash
source venv/bin/activate
python -m uvicorn main:app --reload
```

Local API:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# 39. Backend Runtime Note

If frontend displays:

```text

RecoverAI connection error

Unable to connect to the RecoverAI backend.

```

first check whether Uvicorn is running.

Do not immediately modify frontend code.

---

# 40. Frontend Technology

Observed/current frontend stack:

```text
React
TypeScript
Vite
Motion for React
Lucide React
Recharts
React Router
Supabase JavaScript client
```

---

# 41. Frontend Path

```text
~/Recover-AI/frontend
```

Local development URL:

```text
http://localhost:5173
```

Start:

```bash
npm run dev
```

---

# 42. Frontend Source Structure

Current/representative implemented areas include:

```text
frontend/src/

components/
  Sidebar.tsx
  Header.tsx
  transactions/DecisionDrawer.tsx
  agent/AgentReplay.tsx
  ai/AIReasoningPanel.tsx
  auth/ProtectedRoute.tsx

pages/
  Dashboard.tsx
  Transactions.tsx
  RecoveryAgent.tsx
  Activity.tsx
  Guardrails.tsx
  Settings.tsx
  Login.tsx
  Signup.tsx

services/
  authFetch.ts
  dashboardApi.ts
  recoveryApi.ts
  aiApi.ts
  razorpayApi.ts

lib/
  supabase.ts
```

Exact filenames may evolve, but the authenticated-service boundary and separation of concerns are current product behavior.

---

# 43. Frontend Application

RecoverAI is no longer dashboard-only.

Working product routes include:

```text
/
transactions
/recovery-agent
/activity
/guardrails
/settings
/signup
/login
```

The application includes:

```text
premium dark application shell
path-aware sidebar navigation
dashboard / transaction / recovery pages
Decision Drawer
Agent Replay
AI explanation surface
Guardrails page
Settings page
Signup / Login
logout
protected frontend routing
```

`/signup` and `/login` are public.

Protected application pages require an authenticated Supabase session.

---

# 44. Demo Data Label

Observed frontend visibly displays:

```text

DEMO DATA · SIMULATION ENVIRONMENT

```

This is important because dashboard metrics are currently demo values.

---

# 45. Dashboard Metrics

Current dashboard displays demo metrics.

These must not be interpreted as measured merchant production results.

Canonical metric definitions belong to the PRD.

---

# 46. Dashboard Type File

Current file:

```text

frontend/src/types/dashboard.ts

```

It contains types for:

```text

DashboardMetrics

Transaction

AgentActivity

DashboardResponse

```

Transaction also contains machine-readable recovery fields supplied by the backend.

---

# 47. Recovery Type File

Current file:

```text

frontend/src/types/recovery.ts

```

It contains frontend types for the recovery request/response and audit data.

It also contains mapping used by the Decision Drawer.

---

# 48. Frontend API Service Boundary

Current frontend service responsibilities include:

```text
dashboardApi.ts
recoveryApi.ts
aiApi.ts
razorpayApi.ts
authFetch.ts
```

Protected browser API calls use the shared authenticated request helper.

The helper obtains the current Supabase session access token and attaches:

```text
Authorization: Bearer <token>
```

Razorpay browser API calls have also been migrated to this authenticated helper.

The frontend must never contain service-role credentials, Razorpay key secrets, webhook secrets, or private AI-provider keys.

---

# 49. Frontend Execution Boundary

Observed implementation uses an explicit:

```text

RUN RECOVERY

```

action.

Opening/displaying UI should not independently execute recovery.

Execution occurs only through the explicit recovery action.

---

# 50. Decision Drawer

Current file:

```text

frontend/src/components/transactions/DecisionDrawer.tsx

```

Observed state:

```text

IMPLEMENTED ✅

SUCCESSFUL CASE VISUALLY VERIFIED ✅

```

---

# 51. Decision Drawer Verified Successful Case

Observed screenshot verified:

```text

RX18492

₹7,499

Bank Unavailable

Transient Bank Failure

94%

Delayed Retry

Simulation Probability 72%

Guardrail ALLOWED

Execution RECOVERED

+₹7,499

```

This was generated from the actual backend recovery response.

---

# 52. Decision Drawer Simulation Label

Observed drawer visibly contains:

```text

SIMULATION

```

and a disclaimer that simulated results are not real recovered revenue.

---

# 53. Decision Drawer Backend Boundary

Decision Drawer displays recovery state returned by backend.

It does not own:

```text

Classification rules

Retry rules

Confidence safety

Amount safety

Guardrail decision

Payment verification

```

---

# 54. Agent Replay

Current file:

```text
frontend/src/components/agent/AgentReplay.tsx
```

Observed/current state:

```text
IMPLEMENTED ✅
INTEGRATED INTO DECISION DRAWER ✅
BACKEND AUDIT CONTRACT VERIFIED ✅
FINAL AUTHENTICATED BROWSER SUCCESS/BLOCKED E2E CHECK PENDING
```

The remaining browser verification is a release/demo-readiness check, not an unimplemented Agent Replay architecture component.

---

# 55. Agent Replay Data Source

Agent Replay calls:

```text

GET /api/recovery/audit/{transaction_id}

```

It does not fabricate a hardcoded six-stage timeline.

It animates the events returned by the backend.

---

# 56. Agent Replay Replay Control

Current component includes a replay action.

It resets the visible event count and animates existing audit events sequentially.

---

# 57. Agent Replay Successful Path — Final Browser Check

Final authenticated browser E2E should confirm:

```text
RX18492

DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

Replay should repeat only those backend audit events.

---

# 58. Agent Replay Blocked Path — Final Browser Check

Final authenticated browser E2E should confirm:

```text
RX20117

DETECT
CLASSIFY
DECIDE
GUARDRAIL — BLOCKED
```

Confirm absent:

```text
EXECUTE
VERIFY
```

This is part of the current release/demo verification sequence.

---

# 59. Frontend Build

Latest verified production build:

```text
Vite 8.2.2
2283 modules transformed
build successful
```

Observed output sizes at the verified checkpoint:

```text
CSS 32.91 kB
CSS gzip 7.22 kB

JS 665.74 kB
JS gzip 190.34 kB
```

The build completed successfully.

A Vite warning noted that a generated chunk exceeded 500 kB.

That warning is non-blocking and may be optimized later; it is not a current build failure.

---

# 60. Previous Frontend Type Error

Earlier build failure:

```text

Cannot find module '../types/dashboard'

```

Cause:

```text

frontend/src/types/dashboard.ts

```

did not exist.

The type file was created based on actual fields used by `Dashboard.tsx` and returned by `/api/dashboard`.

Resolved.

---

# 61. Previous Decision Drawer Path Error

Earlier `DecisionDrawer.tsx` was accidentally created at:

```text

src/transactions/DecisionDrawer.tsx

```

instead of:

```text

src/components/transactions/DecisionDrawer.tsx

```

This caused the `../../types/recovery` import to fail.

The file was moved to the correct component directory.

Resolved.

---

# 62. Current Frontend Build State

```text
PRODUCTION BUILD ✅
TYPECHECK / BUNDLE PASS ✅
NON-BLOCKING LARGE-CHUNK WARNING ⚠
```

Do not describe the frontend as broken based on historical path/type errors.

---

# 63. Dashboard ↔ Backend Connection

Current frontend obtains dashboard data through:

```text
GET /api/dashboard
```

through the authenticated frontend API layer.

The request requires a valid Supabase access token.

Observed dashboard response shape includes:

```text
metrics
transactions
agent_activity
```

Anonymous access is expected to be rejected.

---

# 64. Dashboard Recovery Integration

Current explicit flow:

```text

Recovery Queue row

      ↓

RUN RECOVERY

      ↓

POST /api/recovery/execute

      ↓

RecoveryExecutionResponse

      ↓

Decision Drawer

      ↓

Agent Replay

      ↓

GET /api/recovery/audit/{transaction_id}

```

---

# 65. Successful UI Execution

Observed successful frontend execution:

```text

RX18492

      ↓

RUN RECOVERY

      ↓

Drawer opened

      ↓

ALLOWED

      ↓

RECOVERED

```

This is visually verified.

---

# 66. Blocked Dashboard Row

Backend dashboard now contains:

```text

RX20117

```

with the machine-readable data required to trigger the canonical blocked flow.

The dashboard API response was confirmed through curl.

---

# 67. Current P0 Position

Canonical progress belongs to:

```text
docs/phases.md §32
```

Current P0 core checklist:

```text
14 / 14 core items complete
```

The remaining authenticated browser success/blocked replay check is treated as **demo-readiness / E2E verification**, not a missing P0 core architecture item.

---

# 68. What Is Not Implemented Yet

Current known incomplete/future areas include:

```text
Multi-merchant tenancy
Merchant-level authorization
Per-user merchant data scoping
Cross-merchant row isolation
Production Razorpay processing
Production multi-worker concurrency proof
SSE-driven live dashboard activity
Fully production-derived dashboard metrics
Deployment / production smoke testing
Final demo freeze
```

Do not move implemented authentication, Supabase persistence, AI reasoning, Razorpay Test Mode, or the signed webhook back into this list.

---

# 69. Supabase Status

Current status:

```text
IMPLEMENTED ✅
```

Observed current use includes:

```text
Supabase/PostgreSQL gateway/recovery persistence
persistent idempotency path
gateway order/payment linkage
verification/reconciliation state
audit-related persistence
Supabase Auth for browser users
```

Authentication does not imply tenant isolation.

---

# 70. Razorpay Status

Current status:

```text
RAZORPAY TEST MODE IMPLEMENTED ✅
PRODUCTION RAZORPAY NOT IMPLEMENTED ❌
```

Implemented browser-facing operations:

```text
POST /api/razorpay/recovery-order
POST /api/razorpay/verify-payment
POST /api/razorpay/reconcile-payment
```

Implemented webhook:

```text
POST /api/razorpay/webhook
```

A real signed `payment.captured` Test Mode webhook has been proven end-to-end and persisted/linked.

Do not describe Test Mode success as production merchant revenue.

---

# 71. Razorpay Service

Current observed file:

```text
backend/services/razorpay_service.py
```

Current status:

```text
IMPLEMENTED ✅
```

Observed responsibilities include Test Mode order/payment operations, server-side verification support, reconciliation support, and controlled gateway error handling.

Private Razorpay credentials remain backend-only.

---

# 72. AI Reasoner Status

Current observed file:

```text
backend/services/ai_reasoner.py
```

Current status:

```text
IMPLEMENTED ✅
```

Observed behavior includes:

```text
explanation-only reasoning
GroqCloud-compatible provider dispatch
grounded structured response handling
deterministic fallback
deterministic safety explanation
```

The AI layer does not own:

```text
classification authority
recovery action authority
guardrail authority
execution permission
payment success
```

---

# 73. Current Product Boundary

RecoverAI is not being built as a replacement payment gateway.

It is the recovery:

```text

decision

safety

explainability

verification

audit

visibility

```

layer around payment recovery execution.

Canonical positioning belongs to `project-overview.md` and PRD.

---

# 74. Current Safety Boundary

Observed architecture maintains:

```text

AI / frontend

     ≠

financial safety authority

```

Safety-critical decisions remain backend deterministic logic.

---

# 75. Current Money Claim Boundary

Current product surfaces may contain:

```text
SIMULATION
DEMO DATA
TEST ENVIRONMENT
RAZORPAY TEST MODE
```

These states must remain distinct from production merchant revenue.

A verified Razorpay Test Mode payment proves a test-environment gateway outcome.

It does not prove production merchant revenue recovery.

---

# 76. Current Verification Principle

A successful execution action is not automatically treated as successful payment recovery.

Current flow explicitly contains:

```text

EXECUTE

   ↓

VERIFY

```

before `RECOVERED`.

---

# 77. Blocked Safety Principle

If Guardrail returns:

```text

BLOCKED

```

the executor returns without creating:

```text

EXECUTE

VERIFY

```

This behavior is covered by automated tests and manual API verification.

---

# 78. Current Error Handling Observation

Frontend shows a clear backend connection error when `/api/dashboard` cannot be reached.

Observed error state:

```text

RecoverAI connection error

Unable to connect to the RecoverAI backend.

Make sure FastAPI is running on port 8000.

```

This successfully identified when Uvicorn had stopped.

---

# 79. Development Terminal Layout

Useful current workflow:

```text
Terminal 1:
backend Uvicorn

Terminal 2:
frontend Vite

Terminal 3:
tests / Git / curl as needed
```

---

# 80. Persistence Caveat

Gateway-linked recovery/idempotency state now has a persistent Supabase/PostgreSQL path.

Deterministic simulation/tests may still use process-local stores.

Therefore:

```text
process-local simulation state may reset on restart
```

does **not** mean:

```text
all current RecoverAI gateway state is in-memory
```

Do not confuse the two paths.

---

# 81. Idempotency Caveat

Persistent gateway-linked idempotency is implemented.

Remaining limitation:

```text
production distributed / multi-worker concurrency proof
```

has not been established through dedicated concurrency/load testing.

---

# 82. Current Test Discipline

Current workflow should continue to be:

```text

modify

  ↓

build/import

  ↓

test

  ↓

manual verify when needed

  ↓

document

```

Do not skip tests because a UI screenshot looks correct.

---

# 83. Current Backend Quality Gate

Before the next commit/release checkpoint, run:

```bash
cd ~/Recover-AI/backend
source venv/bin/activate
python -m pytest -q
```

Current verified baseline:

```text
47 passed
0 failed
2 non-blocking warnings
```

Any new change must preserve the safety/authentication/Razorpay regression suite.

---

# 84. Current Frontend Quality Gate

Before considering frontend work stable, rerun:

```bat

npm run build

```

Current baseline:

```text

build passes

```

New frontend changes should not reduce this.

---

# 85. Current Import Quality Gate

When changing backend dependencies, rerun:

```text

Classifier

Recovery Engine

Guardrail

Executor

Main API

```

imports in dependency order.

---

# 86. Current Dashboard Demo Data

Dashboard metrics still include demo/sample values.

Do not describe them as measured merchant production metrics merely because Supabase persistence exists.

Persistent storage and fully calculated dashboard metrics are separate concerns.

---

# 87. Current Agent Activity

The Activity/agent-activity experience exists.

SSE-driven live updates are not currently part of the verified product.

Do not use `LIVE` language unless a real live channel is active.

---

# 88. Current Search / Notification UI

Search or notification controls must not be treated as completed functionality merely because a visual control exists.

Final polish should either wire the behavior or remove/disable misleading controls.

---

# 89. Current Sidebar / Navigation

The sidebar is now part of a multi-page React Router workspace.

Current navigation covers:

```text
Overview
Transactions
Recovery Agent
Activity
Guardrails
Settings
```

The sidebar is path-aware and includes logout behavior.

Navigation does not imply multi-merchant tenancy.

---

# 90. Current Buildathon Focus

Engineering work remains focused on the Razorpay AI Buildathon recovery product.

Avoid scope drift into a generic financial platform.

---

# 91. Buildathon Core Demo Story

Current strongest narrative:

```text
User authenticates
      ↓
RecoverAI loads protected workspace
      ↓
A payment failure is selected
      ↓
DETECT
      ↓
CLASSIFY
      ↓
DECIDE
      ↓
GUARDRAIL
      ↓
allowed?
   ↙       ↘
 YES        NO
 ↓          ↓
EXECUTE     STOP
 ↓
VERIFY
 ↓
AUDIT / AGENT REPLAY
```

AI may explain the already-determined decision.

Razorpay Test Mode may be shown as the gateway-integration proof point.

The safety story must remain equally visible:

```text
RX20117
GUARDRAIL → BLOCKED
NO EXECUTE
NO VERIFY
```

---

# 92. Successful Demo Narrative

Use:

```text

RX18492

```

for an allowed successful recovery.

Do not change the canonical demo ID casually because deterministic simulation depends on stable inputs.

---

# 93. Blocked Demo Narrative

Use:

```text

RX20117

```

for the safety story.

It demonstrates that RecoverAI can choose not to recover when constraints fail.

This is strategically important to the product's safety positioning.

---

# 94. Current UI Design Direction

Observed design:

```text

dark fintech command center

restrained accent colors

premium side drawer

subtle motion

clear guardrail states

simulation labeling

```

Detailed design tokens belong to `design.md`.

---

# 95. UI Work Rule

Core persistence, AI, Razorpay Test Mode, webhook, and authentication integrations are no longer pending.

Current UI work should focus on release truthfulness and usability:

```text
authenticated browser E2E
accurate demo/test labels
Settings status truthfulness
search/notification cleanup
forgot-password cleanup or implementation
autofill polish
final responsive/demo polish
```

Do not introduce a major dashboard redesign unless a verified usability defect requires it.

---

# 96. Current Main Backend File

Observed:

```text

backend/main.py

```

contains current dashboard demo data and recovery API routes.

It was cleaned to remove scattered imports and now includes the blocked demo transaction.

---

# 97. Current Regression Suite

The original 12 P0 tests remain important historical regression coverage, but the current verified suite has expanded.

Current baseline:

```text
47 passed
0 failed
```

It now protects P0 recovery behavior plus AI, Razorpay, and authentication boundaries.

Do not remove older core tests merely because newer integration tests exist.

---

# 98. Persistent Storage Transition State

The planned storage transition has occurred for gateway/recovery-linked state.

The frontend audit interface remains:

```text
GET /api/recovery/audit/{transaction_id}
```

Agent Replay should remain independent of whether a particular backend test/simulation path uses process-local state or the durable Supabase path.

---

# 99. Decision Drawer Transition Rule

Decision Drawer should continue consuming structured recovery data.

Do not move backend recovery decisions into the drawer for convenience.

---

# 100. Agent Replay Transition Rule

Agent Replay must remain backed by actual audit events.

Do not hardcode:

```text

DETECT

CLASSIFY

DECIDE

GUARDRAIL

EXECUTE

VERIFY

```

as unconditional frontend stages.

---

# 101. Current Documentation Alignment

The documentation set has now been reviewed in authority order during the current drift pass:

```text
rules.md              updated
architecture.md       updated
PRD.md                updated
design.md              updated
project-overview.md   updated
phases.md              updated
memory.md             current update
```

The purpose of this pass is to remove stale August 23 implementation claims such as:

```text
Supabase pending
AI pending
Razorpay pending
webhook pending
authentication pending
12 tests only
```

without inventing capabilities that are still future.

---

# 102. Documentation Reconstruction Rule

Do not describe reconstructed documents as byte-for-byte copies of missing files unless the original physical file is recovered.

Preserve finalized requirements and decisions.

Clearly distinguish:

```text

canonical requirement

observed implementation

planned target

```

---

# 103. Documentation Drift

Before committing changes that affect behavior:

```text

search documentation

      ↓

find old names / thresholds / endpoint behavior

      ↓

update stale references

      ↓

update tests

      ↓

update implementation

```

Binding drift rules belong to `rules.md`.

---

# 104. Current Release Gate

The P1 integration work described in the old August 23 checkpoint has already advanced substantially.

Current release gate:

```text
documentation drift closure
      ↓
backend regression re-run
      ↓
frontend production build
      ↓
authenticated browser E2E
      ↓
production CORS / environment review
      ↓
deployment smoke test
      ↓
demo freeze
```

Do not reopen completed backend work unless the final verification exposes a real defect.

---

# 105. Expected Next Direction

After documentation alignment, the next task is **not** another major feature phase.

The next direction is:

```text
authenticated browser E2E
deployment readiness
demo truthfulness
submission freeze
```

Optional SSE, deeper analytics, and extra visual polish remain secondary.

---

# 106. Current Known Good Backend Test Command

```bash
cd ~/Recover-AI/backend
source venv/bin/activate
python -m pytest -q
```

Latest verified:

```text
47 passed
0 failed
2 non-blocking warnings
```

---

# 107. Current Known Good Frontend Build Command

```bash
cd ~/Recover-AI/frontend
npm run build
```

Latest verified:

```text
successful production build
```

A non-blocking large-chunk warning remains.

---

# 108. Current Known Good Backend Start Command

```bash
cd ~/Recover-AI/backend
source venv/bin/activate
python -m uvicorn main:app --reload
```

---

# 109. Current Known Good Frontend Start Command

```bash
cd ~/Recover-AI/frontend
npm run dev
```

---

# 110. Current Health Check

```bat

curl http\://127.0.0.1:8000/health

```

Expected service:

```text

RecoverAI API

```

---

# 111. Current Dashboard Check

The dashboard endpoint is protected:

```text
GET /api/dashboard
```

Expected anonymous behavior:

```text
401
```

Expected authenticated browser behavior:

```text
200
```

Do not paste or log the bearer token while testing.

The authenticated response should contain the canonical success and blocked demo transactions.

---

# 112. Current Swagger Check

```text
http://127.0.0.1:8000/docs
```

Swagger remains useful for API inspection.

Remember that protected endpoints now require authentication and the Razorpay webhook uses its separate signature trust boundary.

---

# 113. Current Frontend Check

```text
http://localhost:5173
```

Expected when logged out:

```text
Login / public auth experience
```

Expected after successful Supabase login:

```text
Protected RecoverAI workspace
```

Direct access to protected routes while logged out should redirect to `/login`.

---

# 114. Current Critical Limitations

Current Buildathon limitations:

```text
Dashboard metrics still include demo/sample values.
SSE live activity is not implemented.
Merchant-level authorization is not implemented.
Tenant isolation is not implemented.
Cross-merchant data isolation is not implemented.
Production Razorpay processing is not implemented.
Production multi-worker correctness is not proven.
Deployment smoke testing is still pending.
```

Important implemented distinctions:

```text
Supabase persistence          implemented
AI explanation               implemented
Razorpay Test Mode           implemented
signed webhook               implemented
browser authentication       implemented
```

---

# 115. Things That Must Not Be Claimed Yet

Do not claim:

```text
Real production merchant revenue was recovered.
RecoverAI processed production Razorpay payments.
Authenticated users are isolated into merchant tenants.
The product is production-ready.
SSE-driven live activity is implemented.
All dashboard metrics are production-derived.
Production multi-worker concurrency is proven.
AI makes or overrides financial safety decisions.
```

Accurate claims include:

```text
Razorpay Test Mode integration is implemented.
A signed Test Mode payment.captured webhook was proven.
Supabase persistence/idempotency is implemented for gateway/recovery state.
Supabase browser authentication is implemented.
AI explanation with deterministic fallback is implemented.
```

---

# 116. Current Product Strength

The current product combines:

```text
deterministic recovery core
      +
guardrail safety
      +
persistent recovery/gateway state
      +
server-side payment verification
      +
Razorpay Test Mode integration
      +
signed webhook processing
      +
explanation-only AI
      +
authenticated browser workspace
      +
audit / Agent Replay
```

The deterministic safety core remains the center of the product.

---

# 117. Current Safety Demo Strength

The blocked transaction demonstrates:

```text
RecoverAI's goal is not to retry everything.

RecoverAI's goal is to recover safely.
```

`RX20117` must stop at `GUARDRAIL — BLOCKED` with no `EXECUTE` or `VERIFY`.

This behavior is covered by backend regression tests.

---

# 118. Current Demo Engineering Evidence

Current evidence includes:

```text
working recovery APIs
deterministic safety checks
persistent gateway/recovery state
persistent idempotency
AI explanation + fallback
Razorpay Test Mode order/payment integration
server-side verification
payment reconciliation
signed webhook verification
captured-payment synchronization
Supabase authentication
protected browser APIs
47 backend tests passing
frontend production build
Decision Drawer
Agent Replay contract
simulation/Test Mode transparency
```

The remaining release evidence should come from the final authenticated browser E2E and deployed smoke test.

---

# 119. Current Repository / Submission Cleanup Pending

Before final submission, verify:

```text
git status
README consistency
.gitignore
secret exclusion
requirements / dependency metadata
frontend package metadata
setup instructions
environment documentation
production API base URL
production CORS
deployment instructions
test commands
known limitations
demo video / media size
submission claims
```

Do not commit until documentation, regression tests, frontend build, and final browser E2E are aligned.

---

# 120. Current Commit Discipline

When a stable checkpoint is reached:

```text

build

test

verify

documentation drift check

commit

```

Avoid combining large unrelated refactors with payment safety changes.

---

# 121. Session Resume Rule

At the beginning of a new working session:

1. Read `QUICK RESUME`.

2. Read the latest session entry.

3. Check `phases.md §34`.

4. Check `phases.md §35`.

5. Run only the minimum commands needed to verify current state.

6. Continue from the recorded immediate task.

Do not restart development from memory or assumptions.

---

# 122. Current Session Goal

Current task:

```text
Finish documentation drift alignment.
```

Then:

```text
1. Re-run backend tests.
2. Re-run frontend build.
3. Start backend + frontend.
4. Login through Supabase Auth.
5. Verify protected dashboard.
6. Verify RX18492 allowed flow.
7. Verify AI explanation.
8. Verify successful Agent Replay.
9. Verify RX20117 blocked flow.
10. Verify no EXECUTE / VERIFY after block.
11. Verify logout / protected-route redirect.
12. Review production CORS/env.
13. Deploy / smoke-test.
14. Freeze demo/submission claims.
```

---

# 123. Current Session Snapshot

**Date:** 2026-09-04

## Work Confirmed by the Current Documentation / Verification Pass

```text
Core deterministic recovery pipeline remains implemented.

Supabase/PostgreSQL gateway/recovery persistence implemented.

Persistent gateway-linked idempotency implemented.

AI reasoning layer implemented.

GroqCloud provider integration implemented.

Deterministic AI fallback implemented.

Razorpay Test Mode recovery-order flow implemented.

Razorpay payment verification implemented.

Razorpay reconciliation implemented.

Signed Razorpay webhook implemented.

Invalid-signature rejection verified.

payment.captured synchronization proven in Test Mode.

Supabase browser authentication implemented.

Protected frontend routing implemented.

Protected backend browser APIs implemented.

Razorpay browser APIs protected with user authentication.

Razorpay webhook remains signature-authenticated separately.

Frontend Razorpay API service migrated to authenticated fetch.

Frontend production build verified.

Backend regression suite verified:
47 passed / 0 failed / 2 non-blocking warnings.
```

## Current Known Limitations

```text
Tenant isolation not implemented.

Merchant-level authorization not implemented.

Cross-merchant data isolation not implemented.

Production Razorpay processing not implemented.

SSE live dashboard not implemented.

Dashboard demo metrics still exist.

Production multi-worker concurrency not proven.

Deployment / demo freeze still pending.
```

## Immediate Next Work

```text
Complete memory.md drift update.

Then:

backend regression re-run
frontend build re-run
authenticated browser E2E
deployment configuration review
deployment smoke test
demo freeze
```

## Historical Snapshot Preserved

The previous August 23 Section 123 snapshot is preserved below because this memory file treats session history as append-only.

<details>
<summary>Previous Section 123 — 2026-08-23</summary>

## Historical Section 123 Snapshot — 2026-08-23

**Date:** 2026-08-23

## Work Completed During This Session

```text

Fixed Recovery Engine self-import.

Verified Recovery Engine import.

Verified Guardrail import.

Created Recovery Executor.

Added deterministic execution simulation.

Added in-memory audit storage.

Added in-memory idempotency.

Verified successful executor case.

Verified blocked executor case.

Verified duplicate request idempotency.

Verified successful Execute API in Swagger.

Verified Audit API in Swagger.

Verified blocked Execute API.

Verified blocked Audit API.

Created 6 recovery flow tests.

Created 6 FastAPI API tests.

Reached 12/12 backend test pass.

Verified complete backend import chain.

Created frontend recovery types.

Created recoveryApi service.

Restored dashboard types.

Created Decision Drawer.

Integrated dashboard recovery action.

Added machine-readable dashboard fields.

Added visible demo/simulation label.

Verified Decision Drawer successful result.

Created Agent Replay.

Integrated Agent Replay into Decision Drawer.

Added RX20117 blocked demo row.

Verified production frontend build.

Began physical /docs reconstruction.

```

## Latest Verified Backend

```text

12 / 12 tests passing

5 / 5 import checks passing

```

## Latest Verified Frontend

```text

Production build passing

Decision Drawer successful case visible

```

## Still Pending

```text

Agent Replay successful UI verification

Agent Replay blocked UI verification

```

---

</details>

---

# 124. Session History Rule

When a session materially advances or completes P0:

- Replace Section 123 with the new current snapshot.

- Move the previous snapshot unchanged into:

```text

docs/SESSION_LOG.md

```

or an append-only `Session History` section at the bottom of this document.

Do not silently delete old snapshots if they are needed for project history.

---

# 125. Reference-Not-Duplicate Rule

`memory.md` must not become a second copy of canonical documentation.

Future memory updates should not re-store canonical values that are owned by:

```text

rules.md

architecture.md

PRD.md

design.md

phases.md

backend/core/config.py

```

Instead write:

```text

Target:

See rules.md / config.py.

Observed current state:

\<what the repository actually does>

Drift:

\<difference if any>

```

Existing repeated values in historical memory may remain as history, but new updates should reference the owning document.

`memory.md` owns observations, not target policy.

---

# 126. QUICK RESUME Placement Rule

`QUICK RESUME` belongs physically near the top of the document immediately after Purpose.

It should always state:

```text

date

current phase

last confirmed working

current blocker/pending verification

immediate file/task

what not to start yet

```

The current QUICK RESUME is Section 2.

---

# 127. Session Log Rotation

At the end of a meaningful session:

```text

current Section 123 snapshot

      ↓

append unchanged to SESSION_LOG.md

      ↓

write a new Section 123 snapshot

```

Session history is append-only.

The new snapshot should describe observations, not rewrite canonical requirements.

---

# 128. Progress Estimate Rule

Do not report arbitrary completion percentages.

Canonical P0 progress belongs to:

```text
phases.md §32
```

Current phase document records:

```text
14 total P0 core items
14 / 14 core items complete
```

The authenticated browser E2E is still required for final demo/release confidence.

Overall project completion must remain separate from P0-core completion and must not be guessed.

---

# 129. Path Portability Rule

Current development environment:

```text
macOS
~/Recover-AI
```

Older Windows paths in preserved historical notes refer to the earlier development machine/checkpoint.

If development moves to another machine, CI, Linux, or another developer workstation, adapt path-specific commands.

No portability refactor is required solely for the Buildathon demo.

---

# 130. Immediate Resume Commands

## Terminal 1 — Backend

```bash
cd ~/Recover-AI/backend
source venv/bin/activate
python -m uvicorn main:app --reload
```

## Terminal 2 — Frontend

```bash
cd ~/Recover-AI/frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

Expected initial state when logged out:

```text
/login
```

Login with a valid Supabase user session.

Then verify the protected workspace.

---

# 131. Immediate Success Criteria

For the authenticated allowed case:

```text
RX18492

DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

Also confirm the AI explanation endpoint/surface succeeds without changing the deterministic decision.

For the blocked case:

```text
RX20117

DETECT
CLASSIFY
DECIDE
GUARDRAIL — BLOCKED
```

Forbidden:

```text
EXECUTE
VERIFY
```

Also confirm:

```text
logout ends the session
direct protected route while logged out → /login
```

After successful E2E:

```text
review production CORS/env
deploy
smoke-test
freeze demo claims
```

---

# 132. Frontend AI Decision Analysis — Current Status

The GroqCloud-backed AI explanation layer is connected to the existing RecoverAI Decision Drawer.

Current frontend areas include:

```text
frontend/src/components/ai/AIReasoningPanel.tsx
frontend/src/services/aiApi.ts
frontend/src/types/ai.ts
frontend/src/components/transactions/DecisionDrawer.tsx
```

The AI surface receives deterministic context.

It does not own or override the financial decision.

If the provider fails, deterministic fallback remains available.

---

# 133. Multi-Page Product Workspace — Current Status

RecoverAI is no longer dashboard-only.

React Router provides navigation for:

```text
Overview
Transactions
Recovery Agent
Activity
Guardrails
Settings
```

Public auth routes include:

```text
/login
/signup
```

Protected routes require a Supabase-authenticated session.

---

# 134. Authentication — Current Status

Current browser trust flow:

```text
Supabase Auth
      ↓
Supabase access token
      ↓
Authorization: Bearer <token>
      ↓
FastAPI get_current_user
      ↓
Protected RecoverAI API
```

Missing or invalid authentication is expected to return `401` for protected browser-facing endpoints.

Authentication establishes identity and blocks anonymous access.

It does **not** provide:

```text
merchant-level authorization
tenant isolation
per-user merchant data scoping
cross-merchant isolation
```

---

# 135. Razorpay Authentication Boundaries — Current Status

Razorpay browser APIs require RecoverAI user authentication:

```text
POST /api/razorpay/recovery-order
POST /api/razorpay/verify-payment
POST /api/razorpay/reconcile-payment
```

The Razorpay webhook is different:

```text
Razorpay
      ↓
POST /api/razorpay/webhook
      ↓
X-Razorpay-Signature verification
```

Do not require a Supabase browser-user JWT for the webhook.

Do not weaken Razorpay signature verification because browser authentication exists.

---

# 136. Current Documentation Drift State

The current documentation authority chain has been aligned through:

```text
rules.md
architecture.md
PRD.md
design.md
project-overview.md
phases.md
memory.md
```

The major stale August 23 claims removed from current-state sections include:

```text
Supabase pending
AI pending
Razorpay pending
webhook pending
authentication pending
12 tests only
Windows-only resume commands
simulation-only product state
```

Historical August 23 observations remain preserved where useful as history.

---

# 137. Current Release Gate

The current release sequence is:

```text
DOCUMENTATION ALIGNED
      ↓
RE-RUN BACKEND TESTS
      ↓
RE-RUN FRONTEND BUILD
      ↓
AUTHENTICATED BROWSER E2E
      ↓
CORS / ENV REVIEW
      ↓
DEPLOY
      ↓
SMOKE TEST
      ↓
DEMO FREEZE
```

Do not add another major feature phase before this gate unless a critical defect requires it.

---

# END OF MEMORY DOCUMENT
