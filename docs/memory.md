# RecoverAI — Project Memory

**Project:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent  
**Track:** AI Revenue Recovery  
**Document:** Implementation Memory / Resume State  
**Status:** ACTIVE  
**Last Updated:** 2026-08-23

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
Date of last session:
2026-08-23

Current phase:
Final P0 verification — Agent Replay

Last confirmed working:
- Failure Classifier
- Recovery Engine
- Guardrail Engine
- Recovery Executor
- Verification
- In-memory Audit Trail
- In-process Idempotency
- Execute API
- Audit API
- Decision Drawer
- Agent Replay implementation
- Dashboard ↔ recovery execution integration
- Simulation/demo labels
- Frontend production build
- 12/12 backend automated tests

Current verification pending:
- Successful Agent Replay UI reaches VERIFY
- Blocked Agent Replay UI stops at GUARDRAIL

Immediate goal:
Verify RX18492 and RX20117 in the frontend.
Then mark P0 complete.

Do NOT start yet:
- Supabase
- Razorpay Test Mode
- Razorpay Webhooks
- AI Reasoner
- Extra dashboard polish
```

For canonical P0 progress, read:

```text
docs/phases.md §32
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

Current development machine path:

```text
C:\Users\DELL\recoverai
```

Current platform:

```text
Windows
```

Development tools observed:

```text
VS Code
Command Prompt / VS Code terminal
```

Path portability rule appears later in this file.

---

# 5. Current Top-Level Project Structure

Observed project areas:

```text
recoverai/
├── backend/
├── frontend/
├── docs/
├── node_modules/
├── routers/
├── services/
├── package.json
└── package-lock.json
```

The `/docs` directory is currently being reconstructed because the finalized documentation existed in conversation history but was not physically present in the repository.

---

# 6. Backend Technology

Observed backend stack:

```text
Python
FastAPI
Pydantic
Uvicorn
pytest
```

Observed Python version during tests:

```text
Python 3.14.3
```

Observed pytest version:

```text
pytest 9.1.1
```

---

# 7. Backend Path

```text
C:\Users\DELL\recoverai\backend
```

Virtual environment:

```text
backend\venv
```

Activation command:

```bat
venv\Scripts\activate
```

---

# 8. Backend Service Structure

Observed service files include:

```text
backend/services/
├── __init__.py
├── failure_classifier.py
├── recovery_engine.py
├── guardrail_engine.py
├── recovery_executor.py
├── ai_reasoner.py
└── razorpay_service.py
```

Observed state:

```text
failure_classifier.py     implemented
recovery_engine.py        implemented
guardrail_engine.py       implemented
recovery_executor.py      implemented
ai_reasoner.py            placeholder / not implemented
razorpay_service.py       placeholder / not implemented
```

Do not infer completion from file existence alone.

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

# 17. Simulation Mode

Current execution is:

```text
SIMULATION
```

The current executor contains deterministic simulation behavior.

Simulation results are visibly labeled in the frontend.

Simulation values must not be represented as actual merchant revenue.

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

# 19. Current Audit Storage

Observed audit persistence:

```text
in-memory Python AUDIT_STORE
```

Current audit endpoint:

```text
GET /api/recovery/audit/{transaction_id}
```

Current audit data disappears after backend restart.

This limitation is expected until persistent storage is implemented.

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

Observed state:

```text
IN-PROCESS IDEMPOTENCY IMPLEMENTED ✅
AUTOMATED TEST PASS ✅
```

The executor currently has in-memory idempotency state/result storage.

Duplicate identical recovery requests in the same backend process return the existing result instead of executing the workflow again.

---

# 22. Idempotency Limitation

Current idempotency is not durable.

Backend restart causes in-memory state to be lost.

Therefore current implementation must not be described as:

```text
persistent idempotency
crash-safe idempotency
production financial idempotency
```

Persistent storage must be added before relying on real external financial execution.

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

# 25. Swagger Verification

The following was manually verified through FastAPI Swagger.

Successful execution:

```text
POST /api/recovery/execute
HTTP 200
RX18492
ALLOWED
RECOVERED
```

Blocked execution:

```text
POST /api/recovery/execute
HTTP 200
RX20117
BLOCKED
```

Audit retrieval was separately verified.

---

# 26. Successful Audit API Verification

Observed request:

```text
GET /api/recovery/audit/RX18492
```

Observed HTTP response:

```text
200
```

Observed audit included actual backend events.

---

# 27. Blocked Audit API Verification

Observed request:

```text
GET /api/recovery/audit/RX20117
```

Observed HTTP response:

```text
200
```

Observed events:

```text
DETECT
CLASSIFY
DECIDE
GUARDRAIL — BLOCKED
```

This manually proved that blocked workflows do not generate fake execution stages.

---

# 28. Backend API

Current `main.py` exposes:

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

Webhook API is not implemented yet.

---

# 29. Dashboard API

Current endpoint:

```text
GET /api/dashboard
```

Current dashboard response is demo data.

The UI explicitly labels the environment accordingly.

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

Current test files:

```text
backend/tests/test_recovery_flow.py
backend/tests/test_recovery_api.py
```

---

# 33. Backend Test Result

Verified on:

```text
2026-08-23
```

Command:

```bat
python -m pytest tests -v
```

Observed result:

```text
12 passed
```

Observed runtime:

```text
12 passed in 0.42s
```

---

# 34. Recovery Flow Test Coverage

Observed service tests cover:

```text
successful recovery
maximum retry blocking
blocked recovery stops before execution
idempotent duplicate request
high-value manual review
unknown-failure manual review
```

All passed in the latest run.

---

# 35. API Test Coverage

Observed API tests cover:

```text
successful execute endpoint
audit endpoint
blocked execution endpoint
API idempotency
high-value manual review
invalid amount validation
```

All passed in the latest run.

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
C:\Users\DELL\recoverai\backend
```

with venv active:

```bat
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

Observed frontend stack:

```text
React
TypeScript
Vite
Motion for React
Lucide React
Recharts
```

---

# 41. Frontend Path

```text
C:\Users\DELL\recoverai\frontend
```

Local development URL:

```text
http://localhost:5173
```

---

# 42. Frontend Source Structure

Observed / implemented areas include:

```text
frontend/src/
├── components/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MetricCard.tsx
│   ├── transactions/
│   │   └── DecisionDrawer.tsx
│   └── agent/
│       └── AgentReplay.tsx
│
├── pages/
│   └── Dashboard.tsx
│
├── services/
│   ├── dashboardApi.ts
│   └── recoveryApi.ts
│
├── types/
│   ├── dashboard.ts
│   └── recovery.ts
│
├── App.tsx
├── index.css
└── main.tsx
```

---

# 43. Frontend Dashboard

Observed dashboard currently includes:

```text
Sidebar
Header
Command Center
Hero
Revenue metrics
Recovery Queue
Live Activity
Demo/simulation label
Run Recovery action
Decision Drawer
```

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

# 48. Recovery API Service

Current file:

```text
frontend/src/services/recoveryApi.ts
```

Observed responsibilities:

```text
POST /api/recovery/execute
GET  /api/recovery/audit/{transaction_id}
```

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

Observed state:

```text
IMPLEMENTED ✅
INTEGRATED INTO DECISION DRAWER ✅
FINAL VISUAL VERIFICATION PENDING
```

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

# 57. Agent Replay Successful Path Expected Verification

Still visually verify:

```text
RX18492

DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

and confirm replay repeats those same events.

---

# 58. Agent Replay Blocked Path Expected Verification

Still visually verify:

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

This remains the immediate P0 verification task.

---

# 59. Frontend Build

Latest command:

```bat
npm run build
```

Latest observed result:

```text
vite v8.2.2
2216 modules transformed
production build successful
```

Observed output included:

```text
✓ built in 558ms
```

No TypeScript build errors remained.

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
```

Do not describe the frontend as broken based on older errors.

---

# 63. Dashboard ↔ Backend Connection

Current frontend obtains dashboard data through:

```text
GET /api/dashboard
```

Observed successful response contains:

```text
metrics
transactions
agent_activity
```

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

Do not estimate.

Use:

```text
docs/phases.md §32
```

Current strict state recorded there:

```text
13 / 14 verified
```

Remaining item:

```text
final Agent Replay successful + blocked visual verification
```

---

# 68. What Is Not Implemented Yet

Do not claim the following as complete:

```text
Supabase persistence
Persistent audit storage
Persistent idempotency
Razorpay Test Mode integration
Razorpay payment execution
Razorpay webhooks
Webhook signature verification
Webhook duplicate handling
AI Reasoner
LLM fallback implementation
SSE real-time dashboard
Authentication
Multi-merchant tenancy
Advanced analytics
Production deployment
```

---

# 69. Supabase Status

Current status:

```text
PENDING
```

Do not start before final P0 Agent Replay verification unless the implementation phase documents are deliberately updated.

---

# 70. Razorpay Status

Current status:

```text
PENDING
```

No claim should be made that RecoverAI is currently executing real Razorpay recoveries.

Current mode remains simulation.

---

# 71. Razorpay Service

Current observed file:

```text
backend/services/razorpay_service.py
```

Earlier directory listing showed it as an empty placeholder.

Do not treat file presence as implementation.

---

# 72. AI Reasoner Status

Current observed file:

```text
backend/services/ai_reasoner.py
```

Earlier directory listing showed it as an empty placeholder.

AI explanation is not currently part of the working recovery decision path.

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

The current UI uses demo/simulation data.

Therefore wording must distinguish:

```text
SIMULATION
DEMO DATA
TEST ENVIRONMENT
```

from actual merchant revenue.

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
frontend Vite / npm

Terminal 3:
tests / curl as needed
```

Do not stop Uvicorn while testing in-memory audit behavior.

---

# 80. In-Memory Audit Caveat

Because audit is currently in memory:

```text
restart backend
      ↓
AUDIT_STORE reset
```

Therefore execute the transaction again after restart before expecting audit events.

---

# 81. In-Memory Idempotency Caveat

Because idempotency is currently in memory:

```text
restart backend
      ↓
idempotency state reset
```

This is acceptable for the current simulation checkpoint but not the final persistent financial architecture.

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

Before major backend integrations, rerun:

```bat
python -m pytest tests -v
```

Expected based on current state:

```text
12 passed
```

Any new integration should preserve existing P0 tests.

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

Dashboard metrics are still hardcoded/demo data in the backend.

Do not describe them as database-derived metrics.

Persistent/calculated dashboard metrics belong to a future phase.

---

# 87. Current Agent Activity

Dashboard Live Activity currently uses demo/static backend data.

Do not describe it as SSE-driven real-time activity yet.

---

# 88. Current Search UI

The Command Center header visually includes search.

Do not assume full search functionality unless separately implemented and tested.

---

# 89. Current Sidebar

Sidebar UI exists.

Navigation items should not be interpreted as completed product pages merely because they are displayed.

---

# 90. Current Buildathon Focus

Engineering work remains focused on the Razorpay AI Buildathon recovery product.

Avoid scope drift into a generic financial platform.

---

# 91. Buildathon Core Demo Story

Current strongest demo narrative:

```text
A payment fails
      ↓
RecoverAI detects it
      ↓
classifies the failure
      ↓
selects a recovery strategy
      ↓
runs deterministic guardrails
      ↓
allows or blocks the action
      ↓
simulates execution when allowed
      ↓
verifies outcome
      ↓
shows the audit trail
      ↓
replays the agent decision visually
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

Do not redesign the dashboard while core integrations are pending.

Existing UI is already strong enough to support the current product demo.

Future UI work should improve usability or explainability rather than decorative complexity.

---

# 96. Current Main Backend File

Observed:

```text
backend/main.py
```

contains current dashboard demo data and recovery API routes.

It was cleaned to remove scattered imports and now includes the blocked demo transaction.

---

# 97. Current Core Tests Are P0 Regression Tests

The existing 12 tests should be preserved as regression protection while P1 integrations are added.

Do not delete them simply because Supabase or Razorpay introduces new test layers.

---

# 98. Persistent Storage Transition Rule

When Supabase is introduced:

```text
frontend
```

should not need to change its audit integration solely because storage changes.

Current public audit interface remains:

```text
GET /api/recovery/audit/{transaction_id}
```

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

# 101. Current Documentation Reconstruction

The project previously finalized documentation in conversation, but the files were not physically present in the local repository shown in VS Code.

The `/docs` directory is now being rebuilt.

Current reconstruction order:

```text
1. phases.md
2. memory.md
3. rules.md
4. architecture.md
5. PRD.md
6. design.md
7. project-overview.md
```

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

# 104. Current P1 Start Condition

Do not start P1 merely because backend tests pass.

Current remaining P0 checkpoint:

```text
Agent Replay visual verification
```

Once this is confirmed, update:

```text
phases.md §32
phases.md §34
phases.md §35
memory.md QUICK RESUME
```

before starting P1.

---

# 105. Expected Next P1 Direction

Per the current phase plan, after P0 closes, persistence/integration work begins according to `phases.md`.

Do not use this memory file to redefine that sequence.

Read `phases.md` before starting.

---

# 106. Current Known Good Backend Test Command

```bat
cd C:\Users\DELL\recoverai\backend
venv\Scripts\activate
python -m pytest tests -v
```

Latest verified:

```text
12 passed
```

---

# 107. Current Known Good Frontend Build Command

```bat
cd C:\Users\DELL\recoverai\frontend
npm run build
```

Latest verified:

```text
successful production build
```

---

# 108. Current Known Good Backend Start Command

```bat
cd C:\Users\DELL\recoverai\backend
venv\Scripts\activate
python -m uvicorn main:app --reload
```

---

# 109. Current Known Good Frontend Start Command

```bat
cd C:\Users\DELL\recoverai\frontend
npm run dev
```

---

# 110. Current Health Check

```bat
curl http://127.0.0.1:8000/health
```

Expected service:

```text
RecoverAI API
```

---

# 111. Current Dashboard Check

```bat
curl http://127.0.0.1:8000/api/dashboard
```

The current response should contain the canonical success and blocked demo transactions.

---

# 112. Current Swagger Check

```text
http://127.0.0.1:8000/docs
```

Useful for manual API behavior inspection.

---

# 113. Current Frontend Check

```text
http://localhost:5173
```

Expected:

```text
RecoverAI Command Center
```

when FastAPI and Vite are both running.

---

# 114. Current Critical Limitations

Current Buildathon prototype limitations:

```text
Audit persistence is in memory.
Idempotency persistence is in memory.
Dashboard metrics are demo data.
Recovery execution is simulation.
Razorpay is not integrated yet.
AI Reasoner is not implemented yet.
Live Activity is not real-time SSE yet.
```

These should remain explicit.

---

# 115. Things That Must Not Be Claimed Yet

Do not claim:

```text
Real merchant revenue was recovered.
RecoverAI processed production Razorpay payments.
Razorpay webhooks are active.
Supabase audit persistence is complete.
LLM reasoning is powering decisions.
The product is production-ready.
Idempotency survives crashes/restarts.
```

unless those conditions become implemented and verified later.

---

# 116. Current Product Strength

The current implemented strength is the controlled deterministic core:

```text
failure understanding
      ↓
strategy selection
      ↓
safety guardrail
      ↓
simulation
      ↓
verification
      ↓
audit
      ↓
explainable UI
```

This should remain the center of the Buildathon product.

---

# 117. Current Safety Demo Strength

The blocked transaction demonstrates an important product principle:

```text
RecoverAI's goal is not to retry everything.

RecoverAI's goal is to recover safely.
```

This behavior is currently backed by actual backend execution logic and tests.

---

# 118. Current Hiring / Demo Engineering Principle

The demo should show actual system behavior rather than only a polished UI.

Current evidence already includes:

```text
working APIs
working safety checks
automated tests
audit trail
Decision Drawer
simulation transparency
```

Agent Replay visual verification is the final current P0 gate.

---

# 119. Current Repository Cleanup Pending

Before final submission, still verify:

```text
README
.gitignore
secret exclusion
requirements.txt
frontend package metadata
setup instructions
environment documentation
deployment instructions
test commands
known limitations
```

This is not the immediate task.

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

Current remaining task:

```text
Verify Agent Replay in browser.
```

Successful case:

```text
RX18492
→ reaches VERIFY
```

Blocked case:

```text
RX20117
→ stops at GUARDRAIL
```

---

# 123. Current Session Snapshot

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
<what the repository actually does>

Drift:
<difference if any>
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

Do not report approximate P0 completion percentages.

Calculate P0 progress only from:

```text
phases.md §32
```

Formula:

```text
number of checked P0 items
──────────────────────────
total P0 checklist items
```

Current `phases.md` has:

```text
14 total P0 items
```

Current recorded strict progress:

```text
13 / 14 verified
```

Overall project completion, if ever discussed separately, must be clearly distinguished from P0 completion and must not be guessed.

---

# 129. Path Portability Rule

Current hardcoded Windows path is valid for the present solo development machine:

```text
C:\Users\DELL\recoverai
```

If development moves to:

```text
another Windows machine
macOS
Linux
CI
another developer workstation
```

manually adapt path-specific instructions.

No portability refactor is required right now.

---

# 130. Immediate Resume Commands

If starting a new session now:

## Terminal 1 — Backend

```bat
cd C:\Users\DELL\recoverai\backend
venv\Scripts\activate
python -m uvicorn main:app --reload
```

## Terminal 2 — Frontend

```bat
cd C:\Users\DELL\recoverai\frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

Test:

```text
RX18492 → RUN RECOVERY → AGENT REPLAY
RX20117 → RUN RECOVERY → AGENT REPLAY
```

---

# 131. Immediate Success Criteria

For `RX18492`:

```text
Agent Replay:
DETECT
CLASSIFY
DECIDE
GUARDRAIL
EXECUTE
VERIFY
```

For `RX20117`:

```text
Agent Replay:
DETECT
CLASSIFY
DECIDE
GUARDRAIL — BLOCKED
```

Forbidden for blocked case:

```text
EXECUTE
VERIFY
```

If both are visually confirmed:

1. Update `phases.md §32` to `14/14`.
2. Update `phases.md §34`.
3. Update `phases.md §35`.
4. Replace QUICK RESUME.
5. Rotate Section 123 into session history.
6. Begin the documented P1 next phase.
# Frontend AI Decision Analysis — Current Status

The GroqCloud-backed AI explanation layer is now connected to the existing RecoverAI Decision Drawer.

Current frontend files:

```text
frontend/src/components/ai/AIReasoningPanel.tsx
frontend/src/services/aiApi.ts
frontend/src/types/ai.ts
frontend/src/components/transactions/DecisionDrawer.tsx
---
# Multi-Page Product Workspace — Current Status

RecoverAI is no longer dashboard-only.

React Router now provides working navigation for:

```text
Overview
Transactions
Recovery Agent
Activity
Guardrails
Settings
# END OF MEMORY DOCUMENT