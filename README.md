# RecoverAI

**Intelligent AI-Powered Revenue Recovery Agent**

RecoverAI is a safety-first revenue recovery platform built for the Razorpay AI Buildathon. It detects failed payments, classifies failure reasons, selects a recovery strategy, evaluates deterministic guardrails, executes only when permitted, verifies outcomes independently, and records an auditable recovery trail.

> **Core principle:** Detect accurately → decide explainably → constrain deterministically → execute safely → verify independently → audit everything.

## Live Demo

- Frontend: https://recover-ai-kohl.vercel.app
- Backend: https://recover-ai-ybxo.onrender.com
- Health: https://recover-ai-ybxo.onrender.com/health

## Problem

Failed digital payments create recoverable revenue loss, but naive retry systems can introduce duplicate attempts, unsafe retry loops, high-value risk, poor explainability, and weak auditability.

RecoverAI turns failed-payment recovery into a controlled decision pipeline with explicit safety boundaries.

## Solution

```text
Failed Payment
    ↓
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
AUDIT TRAIL
    ↓
Revenue Recovered
```

If a guardrail blocks recovery, the workflow stops before external execution.

## Key Capabilities

- Deterministic payment-failure classification
- Recovery strategy selection
- Deterministic guardrails
- Retry-limit enforcement
- High-value recovery restrictions
- Razorpay Test Mode integration
- Independent payment verification and reconciliation
- Persistent idempotency and recovery audit trail
- Supabase-backed authentication and persistence
- Explanation-only AI reasoning using GroqCloud
- Deterministic AI fallback when provider calls fail
- Read-only Agent Replay
- Protected frontend routes and authenticated backend APIs
- Production deployment on Vercel + Render

## Safety Architecture

AI is deliberately not an authority in RecoverAI.

AI may:
- explain a classification
- explain a recovery strategy
- summarize a guardrail result
- produce human-readable reasoning

AI may **not**:
- override guardrails
- increase retry limits
- authorize blocked execution
- mark a payment successful
- bypass verification
- change stop conditions
- create or execute payments directly

Authoritative path:

```text
DETECT → CLASSIFY → DECIDE → GUARDRAIL → EXECUTE → VERIFY
```

Blocked path:

```text
DETECT → CLASSIFY → DECIDE → GUARDRAIL → STOP
```

## Canonical Demo Cases

### Allowed Recovery — RX18492

```text
Transaction: RX18492
Amount: ₹7,499
Failure: BANK_UNAVAILABLE
Retry count: 0
Classification: TRANSIENT_BANK_FAILURE
Confidence: 94%
Decision: DELAYED_RETRY
Guardrail: ALLOWED
Result: Recovery proceeds through execution and verification
```

### Blocked Recovery — RX20117

```text
Transaction: RX20117
Amount: ₹68,000
Failure: BANK_UNAVAILABLE
Retry count: 2
Classification: TRANSIENT_BANK_FAILURE
Confidence: 94%
Decision: DELAYED_RETRY
Guardrail: BLOCKED
Reason: Maximum retry limit reached
Result: No external execution or verification
```

## Guardrail Policy

```text
MAX_RETRIES=2
MIN_CONFIDENCE_AUTO_EXECUTE=0.80
MIN_CONFIDENCE_ANY_ACTION=0.50
RETRY_COOLDOWN_MINUTES=15
DUPLICATE_WINDOW_SECONDS=30
MAX_RECOVERABLE_AMOUNT_AUTO=50000
STOP_ON_CONSECUTIVE_FAILURES=2
```

## Authentication

RecoverAI uses Supabase Auth.

Protected application APIs require:

```http
Authorization: Bearer <Supabase access token>
```

Protected routes include:

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

Public routes:

```text
GET /
GET /health
```

The Razorpay webhook uses Razorpay signature verification rather than Supabase user authentication.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Motion
- Supabase Auth
- Vercel

### Backend
- Python 3.12
- FastAPI
- Uvicorn
- Pydantic
- Supabase
- Razorpay Python SDK
- GroqCloud
- Pytest
- Render

## Repository Structure

```text
Recover-AI/
├── backend/
│   ├── core/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vercel.json
└── docs/
    ├── rules.md
    ├── architecture.md
    ├── PRD.md
    ├── design.md
    ├── project-overview.md
    ├── phases.md
    └── memory.md
```

## Local Setup

### Backend

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and provide your own values.

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=

RECOVERAI_PERSISTENCE_ENABLED=true

RAZORPAY_ENABLED=true
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

RECOVERAI_AI_ENABLED=true
AI_PROVIDER=groqcloud
AI_MODEL=openai/gpt-oss-120b
AI_TIMEOUT_SECONDS=8
AI_MAX_RETRIES=1
GROQ_API_KEY=

CORS_ALLOWED_ORIGINS=
```

Never commit real secrets.

## Frontend Environment Variables

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Only public frontend-safe values belong in Vite environment variables.

## Production Deployment

### Backend — Render

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
Python Version: 3.12.14
```

Production backend: `https://recover-ai-ybxo.onrender.com`

### Frontend — Vercel

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Production frontend: `https://recover-ai-kohl.vercel.app`

## Testing

Backend regression suite:

```bash
cd backend
python -m pytest -q
```

Verified baseline:

```text
47 passed
2 non-blocking Supabase client deprecation warnings
0 failed
```

Frontend production build:

```bash
cd frontend
npm run build
```

Verified production build completes successfully.

## Production Validation

The deployed application has been manually validated for:
- Supabase login
- protected frontend routing
- authenticated dashboard requests
- production CORS
- Render backend health
- unauthenticated API rejection
- AI reasoning
- allowed recovery flow
- blocked recovery flow
- Agent Replay
- audit retrieval
- Razorpay Test Mode recovery integration

## UI Sections

- Command Center
- Transactions
- Recovery Agent
- Activity
- Guardrails
- Settings
- Login
- Signup

## Razorpay Mode

RecoverAI currently uses **Razorpay Test Mode only**.

No real-money payment execution is claimed by this build.

## Data & Demo Limitations

Current dashboard KPIs and several displayed activity values are demo/buildathon data intended to demonstrate the recovery workflow.

The current authentication layer blocks anonymous access, but the product does **not** yet implement tenant-level or merchant-level data isolation.

RecoverAI should therefore not be represented as a production-ready multi-tenant payment platform.

## Design Philosophy

```text
Deterministic systems → authority
AI                    → explanation
Guardrails            → safety boundary
Verification          → payment truth
Audit trail           → evidence
```

## Final Build Status

```text
Frontend deployment        ✅
Backend deployment         ✅
Supabase Auth              ✅
Production CORS            ✅
Razorpay Test Mode         ✅
AI reasoning               ✅
Allowed recovery flow      ✅
Blocked guardrail flow     ✅
Audit / Agent Replay       ✅
Backend regression tests   ✅
Production E2E             ✅
```

---

**RecoverAI — Intelligent AI-Powered Revenue Recovery Agent**
