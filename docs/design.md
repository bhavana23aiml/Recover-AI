# RecoverAI — UI/UX Design System

**Project:** RecoverAI — Intelligent AI-Powered Revenue Recovery Agent
**Track:** AI Revenue Recovery
**Document:** UI/UX Design System
**Status:** ACTIVE
**Last Updated:** 2026-09-04


## 1. Design Goal

RecoverAI should feel like a **premium AI-powered fintech command center**, not a generic admin dashboard.

The interface must communicate:

- Trust
- Intelligence
- Safety
- Financial clarity
- Operational control
- Professional engineering depth
- Clear authentication state
- Honest execution-environment state

The product should visually support the core recovery flow:

```text
Detect
  ↓
Classify
  ↓
Decide
  ↓
Guardrail
  ↓
Execute
  ↓
Verify
  ↓
Audit
```

For an allowed demo recovery, the UI may then show the resulting recovery outcome.

For a blocked recovery, the visual flow must stop at `GUARDRAIL`; the UI must not fabricate `EXECUTE` or `VERIFY`.

Animations and visual effects must support this story rather than being decorative.

The UI must also preserve these product distinctions:

```text
AI explanation
≠
financial authority

authentication
≠
tenant isolation

SIMULATION
≠
RAZORPAY_TEST
≠
production processing
```

---

# 2. Overall Visual Direction

## Product Style

**Dark fintech + AI operations dashboard**

The interface should feel:

- Minimal
- Premium
- Technical
- Calm
- Data-focused
- Reliable
- Modern

Avoid overly bright startup-style gradients, excessive glass effects, gaming-style neon, or unnecessary animation.

The UI should feel closer to a serious financial operations platform.

---

# 3. Theme

## Primary Theme

RecoverAI uses a **dark-first interface**.

### Main Background

```text
#080B0F

```

### Elevated Background

```text
#0D1116

```

### Card / Surface Background

```text
rgba(255, 255, 255, 0.016)

```

### Sidebar Background

```text
rgba(10, 13, 17, 0.92)

```

### Primary Border

```text
rgba(255, 255, 255, 0.065)

```

### Secondary Border

```text
rgba(255, 255, 255, 0.04)

```

---

# 4. Brand Colors

RecoverAI should avoid overly saturated colors.

## Primary Accent

Warm premium neutral:

```text
#E5DCC7

```

Used for:

- Brand mark
- Important headings
- Highlighted controls
- Premium accents

## Secondary Accent

Muted gold:

```text
#93866A

```

Used for:

- Section labels
- Icons
- Financial highlights
- Recovery indicators

## Success

Muted green:

```text
#A7BB86

```

Used for:

- Recovered
- Allowed
- Successful verification
- Agent active state

## Warning

Muted amber:

```text
#C7B58D

```

Used for:

- Recovering
- Retry scheduled
- Medium-risk events

## Error

Muted red:

```text
#C97B74

```

Used for:

- Failed payments
- Guardrail blocks
- System errors

## Neutral

```text
#747B83

```

Used for:

- Secondary text
- Inactive navigation
- Supporting information

## Contrast Notes

`#93866A` on `#080B0F` sits around **5.6:1** — passes AA for normal text.
`#747B83` on `#080B0F` sits around **4.7:1** — passes AA but is close to the 4.5:1 floor.

Rule: never use `#747B83` below 13px or below regular weight. For anything smaller (table sub-labels, timestamps, 11px caption text), step up to a lighter neutral — add:

```text
Neutral Light   #9BA2AA   (for text under 13px)

```

Do not rely on color alone for status (see Section 28, Accessibility) — pair every status color with an icon or text label.

---

# 5. Typography

## Primary Font

```text
DM Sans

```

Use for:

- Body text
- Navigation
- Tables
- Forms
- Status labels
- Supporting information

## Display Font

```text
Manrope

```

Use for:

- Page titles
- KPI numbers
- Hero titles
- Important financial values

---

# 6. Typography Scale

## Hero Heading

```text
48px–60px
Weight: 700
Line height: ~1.0
Letter spacing: -0.04em

```

Example:

> Recover revenue before it disappears.

---

## Page Heading

```text
24px–30px
Weight: 700

```

Example:

> Command Center

---

## Section Heading

```text
16px–20px
Weight: 600–700

```

Example:

> Recovery Queue

---

## KPI Value

```text
26px–34px
Weight: 700

```

Example:

> ₹1,71,920

---

## Body

```text
13px–15px
Weight: 400
Line height: 1.5–1.7

```

---

## Labels

```text
9px–11px
Weight: 600–700
Uppercase where appropriate
Letter spacing: 0.08em–0.14em

```

---

# 7. Spacing & Grid System

All spacing must derive from a single 4px base scale. No ad hoc pixel values.

```text
Token     Value
--sp-1    4px
--sp-2    8px
--sp-3    12px
--sp-4    16px
--sp-5    24px
--sp-6    32px
--sp-7    48px
--sp-8    64px

```

## Usage Rules

- Card internal padding: `--sp-5` (24px) desktop, `--sp-4` (16px) mobile.
- Gap between KPI cards: `--sp-4` (16px).
- Gap between major sections: `--sp-7` (48px).
- Gap between label and value inside a card: `--sp-2` (8px).
- Table row vertical padding: `--sp-3` (12px).
- Never use raw values (e.g. `padding: 18px`) — round to the nearest token.

## Grid

```text
Desktop:  12-column grid, 24px gutter
Tablet:   8-column grid, 16px gutter
Mobile:   4-column grid, 12px gutter

```

KPI cards span 3 columns on desktop (4-up row), 4 columns on tablet (2-up row), full width on mobile.

---

# 8. Radius, Elevation & Shadow Tokens

Consistent, restrained — the doc says "avoid large shadows"; these are the actual values that enforce it.

## Radius

```text
Token        Value    Use
--r-sm       6px      Badges, small buttons, inputs
--r-md       10px     Cards, table rows
--r-lg       16px     Drawer panel, modals
--r-pill     999px    Status pills, chips

```

## Elevation (shadow)

Shadows stay subtle and dark — never black drop-shadows on a dark UI; use a soft, low-opacity dark shadow plus a faint top highlight border to imply lift.

```text
Token       box-shadow
--e-0       none (flat cards, default state)
--e-1       0 1px 2px rgba(0,0,0,0.24)          (hovered row/card)
--e-2       0 4px 16px rgba(0,0,0,0.32)         (dropdowns, popovers)
--e-3       0 12px 40px rgba(0,0,0,0.45)        (drawer, modal)

```

Rule: a component uses at most one elevation level above its resting state. Never jump `--e-0` → `--e-3` on hover.

## Z-Index Scale

```text
Token         Value   Use
--z-base      0       Page content
--z-sticky    10      Sticky header
--z-dropdown  20      Menus, tooltips
--z-drawer    30      AI Decision Drawer
--z-modal     40      Modals, confirmation dialogs
--z-toast     50      Toast/notification stack

```

---

# 9. Motion Tokens — Easing & Timing

Durations were specified; this section fixes the curves so the same duration doesn't read inconsistently across components.

```text
Token          Cubic Bezier              Use
--ease-out     cubic-bezier(0.16, 1, 0.3, 1)     Entrances, fade-ups, counters
--ease-in-out  cubic-bezier(0.65, 0, 0.35, 1)     Drawer slide, page transitions
--ease-standard cubic-bezier(0.4, 0, 0.2, 1)      Hover states, micro-interactions

```

```text
Token        Duration   Use
--d-fast     120ms      Hover, button press
--d-base     200ms      Row hover, badge change
--d-medium   320ms      Card entrance, drawer open
--d-slow     450ms      Replay step, timeline entry
--d-counter  800–1500ms KPI number counting

```

Rule: entrances use `--ease-out`. Anything sliding in/out of the viewport (drawer, modal) uses `--ease-in-out`. Never use linear easing except for continuous status pulses.

---

# 10. Layout

## Desktop Structure

```text
┌───────────────┬─────────────────────────────────┐
│               │                                 │
│   Sidebar     │        Main Content             │
│               │                                 │
│               │                                 │
└───────────────┴─────────────────────────────────┘

```

### Sidebar Width

```text
240px–260px

```

### Main Content

```text
Padding:
32px–40px desktop  (--sp-6 to --sp-7)
16px mobile        (--sp-4)

```

---

# 11. Sidebar

The authenticated application sidebar should contain:

- RecoverAI identity
- Overview
- Transactions
- Recovery Agent
- Activity
- Guardrails
- Settings
- Environment indicator
- Logout action

Example:

```text
RecoverAI
Revenue Recovery

▣ Overview
▭ Transactions
▣ Recovery Agent
〽 Activity
⬡ Guardrails
⚙ Settings

● Test Environment

↪ Logout
```

## Sidebar Rules

- Active item receives a subtle highlighted background.
- Route state must determine the active item.
- Do not use bright filled navigation buttons.
- Icons should remain consistent.
- Navigation transitions should be subtle (`--d-fast`, `--ease-standard`).
- Sidebar remains fixed on desktop.
- Logout must terminate the authenticated session and return the user to the login experience.
- Do not display merchant/tenant identity unless merchant scoping is actually implemented.
- The environment indicator should distinguish non-production operation clearly.

---

# 12. Header

The application header may contain:

- Current route/section title
- Search, only when wired to real behavior
- Notification control, only when wired to real behavior
- Recovery Agent / system state when backed by a meaningful source

Example:

```text
AI REVENUE RECOVERY

Command Center

[ Search transactions... ]    Agent Active
```

Header state should be visible but understated.

## Header Truthfulness Rules

- Do not show a clickable search field that does nothing.
- Do not show a notification badge/count unless it is backed by real application state.
- Do not infer `AI Online` or `Razorpay Online` from the generic `/health` endpoint.
- Provider-specific status labels require provider-specific evidence.
- If a control is intentionally decorative during the demo, remove it or render it clearly non-interactive rather than implying functionality.

---

# 13. Hero Section

The hero should immediately explain the product.

Example:

```text
RECOVERAI

Recover revenue
before it disappears.

Detect failed payments, choose safe recovery
strategies, enforce guardrails, and verify outcomes.

DEMO DATA
Recovered today
₹31,900
```

## Hero Rules

- Large typography.
- Minimal content.
- One primary business outcome.
- Subtle background effects only.
- No giant illustrations unless directly useful.
- Demo metrics must carry a visible `DEMO DATA`, `SIMULATION`, or equivalent truthful label.
- Do not use a percentage increase or business-performance claim unless that value is actually derived from the corresponding dataset.

---

# 14. KPI Cards

Primary KPIs:

```text
Revenue at Risk
Revenue Recovered
Recovery Rate
Active Recoveries
```

Possible secondary KPIs:

```text
Successful Retries
Guardrail Blocks
Manual Reviews
Failed Payments
Average Recovery Time
```

## KPI Card Structure

```text
Revenue Recovered             ₹

₹1,71,920

DEMO DATA
```

Card padding `--sp-5`, radius `--r-md`, resting elevation `--e-0`, hover elevation `--e-1`.

## Data Truthfulness

Current dashboard/demo values must not be presented as measured merchant production performance unless they are calculated from persisted verified transaction data.

Where values are illustrative, use a compact persistent label such as:

```text
DEMO DATA
SIMULATION
TEST ENVIRONMENT
```

A verified Razorpay Test Mode payment may be labeled `RAZORPAY TEST MODE`; it still must not be presented as production revenue.

## Motion

Cards should:

- Fade upward on load (`--d-medium`, `--ease-out`)
- Enter with slight stagger (60–80ms between cards)
- Move upward 2–4px on hover (`--d-fast`, `--ease-standard`)
- Avoid large scaling effects

---

# 15. Recovery Queue

Transaction table fields:

```text
Transaction
Amount
Failure Reason
Agent Action
Confidence
Status

```

Example:

```text
RX18492
₹7,499
Bank unavailable
Retry scheduled
94%
Recovering

```

## Row Interaction

Clicking a transaction should open the **AI Decision Drawer**.

Hover behavior:

- Slight horizontal movement (2px, `--d-fast`)
- Subtle background change
- Cursor indication

Row radius `--r-md`, row vertical padding `--sp-3`. Do not use excessive shadows.

---

# 16. Status System

## Recovered

```text
Green
RECOVERED

```

## Recovering

```text
Amber
RECOVERING

```

## Waiting

```text
Neutral
WAITING

```

## Failed

```text
Red
FAILED

```

## Blocked

```text
Red
BLOCKED

```

## Review Required

```text
Amber
REVIEW REQUIRED

```

## Scheduled

```text
Muted gold
RETRY SCHEDULED

```

Status pills use `--r-pill`, `--sp-2` horizontal padding, and always pair color with an icon (see Section 30, Icon System) so status is never conveyed by color alone.

---

# 17. AI Decision Drawer

The Decision Drawer is one of RecoverAI's most important explainability surfaces.

Clicking a failed payment should open a side drawer that separates deterministic system facts from optional AI explanation.

Example:

```text
Transaction #RX18492

₹7,499

FAILED
BANK_UNAVAILABLE

DETERMINISTIC CLASSIFICATION
Transient bank failure

Confidence
94%

Recommended Action
Delayed retry

Guardrail Status
✓ ALLOWED

Retry Count
0 / 2

AI EXPLANATION
A concise explanation grounded only in the
deterministic classification, action, and guardrail state.
```

The drawer should explain **why** the system selected the action without making AI appear to be the financial authority.

For a blocked case such as `RX20117`, the drawer must clearly show:

```text
GUARDRAIL STATUS
BLOCKED

CAN EXECUTE
NO

Reason
Maximum retry threshold reached.
```

The UI must not imply that a blocked action will execute.

If the AI provider is unavailable, the drawer may show the deterministic fallback explanation without breaking the recovery UI.

Drawer width: 420px desktop / full-screen mobile. Radius `--r-lg` on the exposed edge only. Elevation `--e-3`. Slide-in uses `--ease-in-out`, `--d-medium`. Z-index `--z-drawer`.

---

# 18. Agent Replay

Agent Replay is a major differentiator.

It must render the **backend audit events that actually exist**.

Canonical successful event sequence:

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

Example successful simulation:

```text
Payment #RX18492

₹7,499 FAILED

● DETECT
BANK_UNAVAILABLE

● CLASSIFY
Transient bank failure
Confidence: 94%

● DECIDE
Delayed retry

● GUARDRAIL
Retry 0 / 2
✓ ALLOWED

● EXECUTE
SIMULATION

● VERIFY
SUCCESS

SIMULATED RECOVERY
₹7,499
```

Canonical blocked sequence:

```text
Payment #RX20117

₹68,000
Retry Count 2

● DETECT
● CLASSIFY
● DECIDE
● GUARDRAIL
⛔ BLOCKED

STOP
```

For that blocked attempt, Agent Replay must **not** render:

```text
EXECUTE
VERIFY
```

Replay displays history; it does not create financial state.

---

# 19. Agent Replay Motion Rules

Use Motion for React.

Each step should:

1. Fade in
2. Move upward slightly
3. Activate connecting line
4. Update status indicator
5. Continue to next step

Suggested delay:

```text
--d-slow (450ms) per step

```

Use `--ease-out` for the fade/rise, `--ease-standard` for the connecting-line fill.

Replay should feel intentional and understandable.

Avoid making it too fast.

---

# 20. Agent Activity

The activity surface should summarize actual backend recovery/audit events.

Example:

```text
18:42  RX18492  Guardrail allowed
18:42  RX18492  Execution recorded
18:42  RX18492  Verification succeeded

18:45  RX20117  Guardrail blocked
```

Use `LIVE` language only when the interface is genuinely receiving live/streamed updates.

If the page refreshes data through normal API requests rather than SSE or another real-time channel, label the component simply:

```text
Agent Activity
Recent Activity
Recovery Activity
```

Do not imply server-push real-time behavior that is not implemented.

---

# 21. Charts

Use Recharts.

Charts must be visually restrained and must communicate whether the data is:

```text
DEMO DATA
SIMULATION DATA
PERSISTED CALCULATED DATA
```

Never use charts to imply production merchant performance when the underlying values are illustrative.

## Recovery Performance

```text
Recovered Revenue vs Revenue at Risk
```

## Failure Reason Distribution

```text
Bank unavailable
Insufficient funds
Network error
Issuer declined
Other
```

## Recovery Success Rate

Use only when the numerator and denominator are defined by actual underlying data.

## Recovery Trend

```text
Daily recovered ₹
```

Only label this as actual recovery when the values come from verified persisted recovery outcomes.

---

# 22. Motion System

Use:

```text
motion/react

```

Animations should improve comprehension. All durations/easings should reference the tokens in Section 9 — do not hardcode ms values in components.

## Allowed Motion

- Fade-up
- Staggered entry
- Drawer slide
- Number counters
- Timeline progression
- Status pulse
- Chart transition
- Button hover
- Row hover
- Page transitions
- Loading skeletons

## Avoid

- Constant bouncing
- Large rotations
- Excessive scaling
- Confetti
- Continuous decorative motion
- Animation that delays interaction

---

# 23. Animated KPI Counters

Numbers should count smoothly when loaded.

Example:

```text
₹0
↓
₹74,000
↓
₹1,21,000
↓
₹1,71,920

```

Duration: `--d-counter` (0.8–1.5s), `--ease-out`.

Numbers should update smoothly after a recovery action.

Example:

```text
Before:
₹1,71,920

Recovered:
₹7,499

After:
₹1,79,419

```

---

# 24. Loading States

Do not display blank screens.

Use:

- Skeleton cards
- Skeleton table rows
- Loading text
- Subtle pulsing indicators

Example:

```text
RecoverAI is analyzing transactions...

```

Skeleton pulse uses a slow, linear opacity loop (1.5s cycle) — the one place a linear easing is acceptable, since it's a continuous idle state rather than an entrance.

---

# 25. Error States

Errors must be clear and non-technical for users.

Example:

```text
Unable to load recovery data.

The backend service is temporarily unavailable.

[ Retry ]

```

Technical errors can be logged separately.

Never display stack traces to normal users.

---

# 26. Empty States

Example:

```text
No payments currently require recovery.

RecoverAI is monitoring incoming transactions.

```

Avoid empty white space without explanation.

---

# 27. Guardrail Visualization

Safety must be visible.

Example:

```text
Safety Check

Confidence             94% ✓
Retry Count             0/2 ✓
Action Allowed          YES ✓
Manual Review           NO ✓

GUARDRAIL STATUS

✓ ALLOWED

```

Blocked example:

```text
Retry Count

2 / 2

Maximum retry threshold reached.

⛔ RECOVERY BLOCKED

```

---

# 28. AI Boundaries in UI

The UI must make clear when information is:

- Deterministic
- AI-generated
- Simulated
- Razorpay Test Mode data
- Demo data
- Verified payment state

Use labels such as:

```text
DETERMINISTIC DECISION
AI EXPLANATION
GUARDRAIL DECISION
SIMULATION
RAZORPAY TEST MODE
TEST ENVIRONMENT
DEMO DATA
VERIFIED
```

Do not label deterministic classifier output as though an LLM generated it.

Do not make AI appear to authorize payment execution.

The AI explanation must remain visually subordinate to:

```text
guardrail status
can_execute
verification status
payment state
```

If `can_execute = false`, wording must remain proposed/recommended and must not imply execution will occur.

Do not present simulated metrics as real financial performance.

---

# 29. Execution Environment Labels

RecoverAI currently has two relevant non-production contexts:

```text
SIMULATION
RAZORPAY_TEST
```

When deterministic recovery behavior is simulated, show:

```text
SIMULATION MODE
DEMO DATA
```

When the UI is interacting with Razorpay's Test Mode integration, show:

```text
RAZORPAY TEST MODE
TEST ENVIRONMENT
```

These states must not be collapsed into a generic "production-like" label.

Rules:

- `SIMULATION` demonstrates RecoverAI's deterministic recovery logic.
- `RAZORPAY_TEST` demonstrates real integration with Razorpay's Test environment.
- Neither proves production merchant payment processing.
- Neither should be described as live merchant revenue.
- A Razorpay payment should only be shown as verified after backend verification/reconciliation confirms it.

This context should remain visible on recovery/payment surfaces where confusion is possible.

---

# 30. Component Specs — Buttons & Inputs

## Buttons

```text
Size      Height   Padding-X   Radius     Font
Small     28px     --sp-3      --r-sm     12px / 600
Medium    36px     --sp-4      --r-sm     13px / 600
Large     44px     --sp-5      --r-md     14px / 700

```

Variants:

- **Primary** — `#E5DCC7` background, `#080B0F` text. Used sparingly (one per view).
- **Secondary** — transparent background, `--Primary Border`, light text.
- **Ghost** — no border, no background, text-only, used in tables/rows.
- **Destructive** — `#C97B74` border/text on transparent, filled only on confirm step.

Hover: background lightens \~6%, `--d-fast`, `--ease-standard`. No scale transform on buttons.

## Inputs

```text
Height: 36px (matches Medium button)
Radius: --r-sm
Border: --Secondary Border, resting
Border on focus: 1px solid #E5DCC7 + visible focus ring (see Accessibility)
Padding-X: --sp-3

```

Placeholder text uses `#747B83` (only at ≥13px, per contrast rule in Section 4).

---

# 31. Responsive Design

## Breakpoints

```text
Token       Min-width   Target
--bp-sm     0px         Mobile
--bp-md     768px       Tablet
--bp-lg     1024px      Small desktop
--bp-xl     1440px      Desktop

```

## Desktop (≥1024px)

Full sidebar + dashboard layout. KPI cards 4-up.

## Tablet (768–1023px)

Sidebar may collapse to icon-only rail (64px) or overlay drawer.

Metrics:

```text
2 columns

```

## Mobile (<768px)

Metrics:

```text
1 column

```

Use:

- Mobile navigation (bottom bar or hamburger)
- Scrollable tables or card conversion
- Full-screen AI Decision drawer

The interface must remain readable on mobile.

---

# 32. Accessibility

Requirements:

- Sufficient text contrast — see contrast notes in Section 4; verify any new color pairing against a 4.5:1 (normal text) / 3:1 (large text, ≥24px or ≥19px bold) minimum before shipping.
- Keyboard-friendly buttons — all interactive elements reachable via Tab, activated via Enter/Space.
- Visible focus states — every focusable element gets a 2px outline in `#E5DCC7` at 60% opacity, offset 2px. Never `outline: none` without a replacement.
- Meaningful labels — icon-only buttons get `aria-label`.
- Avoid relying only on color — status always pairs a color with an icon and/or text (see Section 16).
- Proper semantic HTML — tables use `<table>`, not divs; forms use `<label for>`.
- Icons accompanied by text where required — sidebar nav icons always pair with text labels, never icon-only on desktop.

---

# 33. Component Strategy

Create reusable components and keep business safety decisions outside presentation code.

Representative structure:

```text
src/
├── styles/
│   └── tokens.css
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   │
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── RecoveryChart.tsx
│   │   └── AgentActivity.tsx
│   │
│   ├── transactions/
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionRow.tsx
│   │   └── DecisionDrawer.tsx
│   │
│   ├── agent/
│   │   ├── AgentReplay.tsx
│   │   ├── ReplayStep.tsx
│   │   └── ConfidenceMeter.tsx
│   │
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   │
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Skeleton.tsx
│       └── StatusIndicator.tsx
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── RecoveryAgent.tsx
│   ├── Activity.tsx
│   ├── Guardrails.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   └── Signup.tsx
│
├── services/
│   ├── authFetch.ts
│   ├── dashboardApi.ts
│   ├── recoveryApi.ts
│   ├── aiApi.ts
│   └── razorpayApi.ts
│
└── lib/
    └── supabase.ts
```

Exact filenames may differ from this representative map; the design rule is the separation of concerns.

Financial safety logic must remain backend-owned.

Authenticated API calls should use the shared authenticated request layer rather than duplicating bearer-token logic across components.

All spacing, radius, elevation, easing, and z-index values should use the design token system consistently. Avoid arbitrary one-off visual values where an existing token fits.

---

# 34. Icon System

Use:

```text
lucide-react

```

Icons must remain consistent.

Recommended:

```text
LayoutDashboard
CreditCard
Bot
ShieldCheck
Activity
Search
Bell
TrendingUp
IndianRupee
AlertTriangle
RotateCcw
CheckCircle
Clock
XCircle

```

Do not mix multiple icon libraries unnecessarily.

Icon sizing: 16px (inline with body text), 18px (nav items), 20px (section headers). Stroke width 1.75 across all sizes for visual consistency.

---

# 35. Design Rules

## DO

- Keep spacing consistent — use the tokens in Section 7.
- Keep cards aligned.
- Use restrained color.
- Prioritize financial metrics.
- Animate meaningful state changes.
- Keep critical recovery information visible.
- Clearly communicate AI confidence.
- Clearly display guardrail decisions.
- Clearly display execution environment.
- Clearly distinguish deterministic results from AI explanations.
- Keep authenticated/unauthenticated states visually unambiguous.
- Use reusable components.
- Maintain responsive layouts.
- Use backend truth for financial/recovery state.
- Label demo/simulation values honestly.

## DO NOT

- Use flashy gradients everywhere.
- Use excessive blur.
- Use large shadows outside the elevation system.
- Animate every element continuously.
- Hide important data behind unnecessary interactions.
- Use random colors.
- Mix inconsistent typography.
- Make AI appear more certain or authoritative than it is.
- Display simulated values as production results.
- Present Razorpay Test Mode as production.
- Present authentication as merchant/tenant isolation.
- Show fake online/provider status.
- Add dead search, notification, or recovery controls merely for appearance.
- Prioritize appearance over functionality.

---

# 36. Core Screens

The current RecoverAI product surface includes:

## 1. Login

Supabase-authenticated entry to protected RecoverAI pages.

## 2. Signup

Premium dark onboarding surface using the established RecoverAI visual language.

## 3. Command Center

Overall recovery dashboard.

## 4. Transactions

Payment transaction/recovery queue.

## 5. Recovery Agent

Recovery decisions, execution context, and operator-facing reasoning.

## 6. Agent Replay

Detailed backend-audit replay for a selected payment.

## 7. Activity

Recovery/audit activity surface.

## 8. Guardrails

Read-only view of deterministic safety policy/configuration unless future authorized configuration is intentionally implemented.

## 9. Settings

Application/environment information.

Settings must not claim Razorpay or AI-provider availability solely from generic backend health.

Protected application screens require authentication.

Login and signup remain public entry screens.

---

# 37. Main UX Story

The best demonstration should allow a reviewer to understand RecoverAI in seconds.

## Allowed Recovery Story

```text
Login
  ↓
Open RecoverAI Command Center
  ↓
Select RX18492 — ₹7,499 failed payment
  ↓
RecoverAI detects the failure
  ↓
Failure classified deterministically
  ↓
Recovery strategy selected
  ↓
Guardrail = ALLOWED
  ↓
Execute in explicit SIMULATION or RAZORPAY TEST context
  ↓
Verify outcome
  ↓
Show real backend audit events in Agent Replay
```

If using deterministic simulation:

```text
SIMULATED RECOVERY
₹7,499
```

If using Razorpay Test Mode and backend verification confirms the Test Mode payment:

```text
VERIFIED
RAZORPAY TEST MODE
```

Do not turn either result into a production merchant-revenue claim.

## Blocked Safety Story

```text
Select RX20117 — ₹68,000
Retry Count 2
  ↓
DETECT
  ↓
CLASSIFY
  ↓
DECIDE
  ↓
GUARDRAIL = BLOCKED
  ↓
STOP
```

The interface must visibly demonstrate that no `EXECUTE` or `VERIFY` event occurs for that blocked attempt.

Every design decision should support both the recovery story **and** the safety story.

---

# 38. Final Design Principle

RecoverAI must communicate:

> **"This is an intelligent financial recovery system that acts carefully, explains its decisions, respects safety constraints, verifies outcomes, and makes its environment and limitations obvious."**

The design should reinforce:

```text
trust
+
intelligence
+
deterministic safety
+
verification
+
auditability
+
honest financial impact
```

rather than simply looking visually impressive.

A premium UI is successful only when it makes the system easier to understand and harder to misinterpret.

---

# 39. Authentication UX

Authentication is an implemented product boundary and should feel native to the same premium fintech system.

## Public Routes

```text
/signup
/login
```

## Protected Application Routes

```text
/
transactions
recovery-agent
activity
guardrails
settings
```

Exact route syntax follows the frontend router.

## Login Design

The login screen should:

- Use the same dark visual language as the application
- Make the RecoverAI product identity obvious
- Keep the form focused and uncluttered
- Provide explicit loading and authentication errors
- Never expose backend/private credential terminology
- Redirect authenticated users into the protected application

## Signup Design

The approved signup composition should remain structurally stable unless a real usability issue requires change.

It may use the RecoverAI recovery visual/video as supporting context, but the form must remain the primary interaction.

## Session UX

```text
Unauthenticated
      ↓
Login / Signup

Authenticated
      ↓
Protected RecoverAI application

Logout
      ↓
Login
```

Do not display tenant/merchant-switching UI because merchant-level tenancy is not currently implemented.

---

# 40. Razorpay Test Mode UX

Razorpay surfaces must make the payment environment obvious.

Recommended persistent label:

```text
RAZORPAY TEST MODE
```

The frontend may initiate the approved browser flow, but trusted payment facts come from the backend.

The UI must not imply that it determines:

```text
amount
currency
guardrail approval
payment success
reconciliation result
```

For a Test Mode checkout/payment result, display backend-confirmed states such as:

```text
ORDER CREATED
PAYMENT VERIFIED
RECONCILED
```

only after the corresponding backend response supports them.

If verification is incomplete or ambiguous, prefer:

```text
VERIFYING
PENDING VERIFICATION
RECONCILING
```

over a false success state.

---

# 41. Current Design Implementation Snapshot

As of 2026-09-04, the UI/product design should assume the following implementation truth:

```text
Premium dark application shell             ✅
Dashboard / transactions / recovery pages  ✅
Decision Drawer                            ✅
Agent Replay                               ✅
Guardrails / Settings                      ✅
Signup / Login                             ✅
Supabase authenticated session             ✅
Protected frontend routing                 ✅
Authenticated backend API calls            ✅
AI explanation surface                     ✅
Razorpay Test Mode browser flow            ✅
Signed webhook backend path                ✅
Frontend production build                  ✅
```

Important limitations:

```text
Multi-merchant tenancy                     ❌
Merchant-level data isolation              ❌
Production Razorpay processing             ❌
Guaranteed SSE/live streaming              ❌
All dashboard metrics production-derived   ❌
```

Design language must not conceal these limitations.

---

# 42. Final UI Truthfulness Checklist

Before demo freeze, verify:

```text
[ ] Login and signup are visually consistent with the product.
[ ] Protected routes do not render as authenticated when logged out.
[ ] Logout visibly ends the session.
[ ] Demo metrics are labeled.
[ ] SIMULATION and RAZORPAY TEST MODE are distinguishable.
[ ] AI explanation is not presented as payment authority.
[ ] Blocked replay stops at GUARDRAIL.
[ ] No fake EXECUTE / VERIFY steps appear.
[ ] Settings does not infer provider health from generic /health.
[ ] Search/notification controls are functional or removed.
[ ] No tenant-isolation claim appears.
[ ] No production Razorpay claim appears.
[ ] Financial success is shown only after the relevant verification state.
```

---

# END OF DESIGN DOCUMENT
