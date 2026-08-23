# RecoverAI — UI/UX Design System

## 1. Design Goal

RecoverAI should feel like a **premium AI-powered fintech command center**, not a generic admin dashboard.

The interface must communicate:

- Trust
- Intelligence
- Safety
- Financial clarity
- Real-time activity
- Professional engineering depth

The product should visually support the core recovery flow:

```text
Detect
  ↓
Analyze
  ↓
Decide
  ↓
Guardrail
  ↓
Execute
  ↓
Verify
  ↓
Recover Revenue
```

Animations and visual effects must support this story rather than being decorative.

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

Do not rely on color alone for status — pair every status color with an icon or text label.

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

Consistent, restrained — avoid large shadows.

## Radius

```text
Token        Value    Use
--r-sm       6px      Badges, small buttons, inputs
--r-md       10px     Cards, table rows
--r-lg       16px     Drawer panel, modals
--r-pill     999px    Status pills, chips
```

## Elevation

Shadows stay subtle and dark — never black drop-shadows on a dark UI; use a soft, low-opacity dark shadow plus a faint top highlight border to imply lift.

```text
Token       box-shadow
--e-0       none
--e-1       0 1px 2px rgba(0,0,0,0.24)
--e-2       0 4px 16px rgba(0,0,0,0.32)
--e-3       0 12px 40px rgba(0,0,0,0.45)
```

Rule: a component uses at most one elevation level above its resting state.

Never jump:

```text
--e-0 → --e-3
```

on hover.

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

```text
Token           Cubic Bezier                    Use
--ease-out      cubic-bezier(0.16, 1, 0.3, 1)   Entrances, fade-ups, counters

--ease-in-out   cubic-bezier(0.65, 0, 0.35, 1)  Drawer slide, page transitions

--ease-standard cubic-bezier(0.4, 0, 0.2, 1)    Hover states, micro-interactions
```

```text
Token        Duration   Use
--d-fast     120ms      Hover, button press
--d-base     200ms      Row hover, badge change
--d-medium   320ms      Card entrance, drawer open
--d-slow     450ms      Replay step, timeline entry
--d-counter  800–1500ms KPI number counting
```

Rule:

- Entrances use `--ease-out`.
- Anything sliding in/out of the viewport uses `--ease-in-out`.
- Never use linear easing except for continuous status pulses.

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

32px–40px desktop
(--sp-6 to --sp-7)

16px mobile
(--sp-4)
```

---

# 11. Sidebar

Sidebar should contain:

- RecoverAI logo
- Overview
- Transactions
- Recovery Agent
- Activity
- Guardrails
- Settings
- Environment indicator

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
```

## Sidebar Rules

- Active item receives subtle highlighted background.
- Do not use bright filled buttons.
- Icons should remain consistent.
- Navigation transitions should be subtle (`--d-fast`, `--ease-standard`).
- Sidebar remains fixed on desktop.

---

# 12. Header

Header contains:

- Current section
- Search
- Notification icon
- Recovery Agent status

Example:

```text
AI REVENUE RECOVERY

Command Center

[ Search transactions... ]  🔔  ● Agent Active
```

Agent status should be visible but understated.

---

# 13. Hero Section

The hero should immediately explain the product.

Example:

```text
RECOVERAI LIVE

Recover revenue
before it disappears.

Detect failed payments, choose safe recovery
strategies and measure every rupee recovered.

Recovered today
₹31,900
↗ 12.4%
```

## Hero Rules

- Large typography.
- Minimal content.
- One primary business outcome.
- Subtle background effects only.
- No giant illustrations unless directly useful.

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

+₹31,900 today
```

Card padding:

```text
--sp-5
```

Radius:

```text
--r-md
```

Resting elevation:

```text
--e-0
```

Hover elevation:

```text
--e-1
```

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

- Slight horizontal movement
- Subtle background change
- Cursor indication

Row radius:

```text
--r-md
```

Row vertical padding:

```text
--sp-3
```

Do not use excessive shadows.

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

Status pills use:

```text
--r-pill
```

and:

```text
--sp-2
```

horizontal padding.

Always pair status color with an icon and/or text.

---

# 17. AI Decision Drawer

This is one of the most important components.

Clicking a failed payment should open a side drawer.

Example:

```text
Transaction #RX18492

₹7,499

FAILED
BANK_UNAVAILABLE

AI Diagnosis
Temporary issuer degradation

Confidence
94%

Recommended Action
Delayed retry

Retry Delay
30 minutes

Estimated Recovery Probability
72%

Guardrail Status
✓ ALLOWED

Retry Count
0 / 2
```

The drawer should also explain **why** the system chose the action.

Drawer width:

```text
420px desktop
full-screen mobile
```

Radius:

```text
--r-lg
```

on the exposed edge only.

Elevation:

```text
--e-3
```

Slide-in:

```text
--ease-in-out
--d-medium
```

Z-index:

```text
--z-drawer
```

---

# 18. Agent Replay

Agent Replay is a major differentiator.

It should visually animate:

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

Example:

```text
Payment #RX18492

₹7,499 FAILED

● DETECT
Bank unavailable

● CLASSIFY
Transient bank failure
Confidence: 94%

● DECIDE
Delayed retry
30 minutes

● GUARDRAIL
Retry 0/2
✓ Allowed

● EXECUTE
Simulated payment retry

● VERIFY
Payment recovered

₹7,499 RECOVERED
```

Agent Replay must represent the actual backend audit trail.

For a blocked transaction, it must stop where the backend audit stops.

Example:

```text
● DETECT

● CLASSIFY

● DECIDE

● GUARDRAIL
⛔ BLOCKED
```

Do not visually create `EXECUTE` or `VERIFY` if those events did not occur.

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
--d-slow
450ms per step
```

Use:

```text
--ease-out
```

for fade/rise.

Use:

```text
--ease-standard
```

for connecting-line fill.

Replay should feel intentional and understandable.

Avoid making it too fast.

---

# 20. Live Agent Activity

Display agent events as a vertical timeline.

Example:

```text
10:41:02

Failure detected

Issuer degradation affecting
18 payments

      │

10:41:05

Transactions classified

₹38,420 identified as
recoverable revenue

      │

10:41:08

Recovery strategy selected

30-minute retry approved
```

Latest event should appear at the top or visibly animate into the stream using:

```text
--d-medium
--ease-out
```

---

# 21. Charts

Use charts only when they communicate useful financial information.

Recommended charts:

## Recovery Performance

```text
Recovered Revenue vs Revenue at Risk
```

## Failure Reason Distribution

```text
Bank unavailable
Network error
Insufficient funds
Issuer decline
Timeout
```

## Recovery Success Rate

```text
By recovery strategy
```

## Recovery Trend

```text
Daily recovered ₹
```

Avoid unnecessary 3D or decorative charts.

Chart entrance uses:

```text
--d-medium
--ease-out
```

---

# 22. Motion System

Use:

```text
motion/react
```

Animations should improve comprehension.

All durations/easings should reference the tokens in Section 9.

Do not hardcode arbitrary timing values in components.

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

Duration:

```text
--d-counter
0.8–1.5s
--ease-out
```

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

Skeleton pulse uses a slow, linear opacity loop:

```text
1.5s cycle
```

This is the one place linear easing is acceptable because it is a continuous idle state rather than an entrance.

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
- Real payment data

Use labels such as:

```text
AI EXPLANATION
SIMULATION
TEST ENVIRONMENT
GUARDRAIL DECISION
DEMO DATA
```

Do not present simulated metrics as real financial performance.

---

# 29. Simulation Mode

During the Buildathon, the interface should clearly show:

```text
TEST ENVIRONMENT
```

or:

```text
SIMULATION MODE
```

when recovery execution is simulated.

This should remain visible in relevant screens.

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

- **Primary** — `#E5DCC7` background, `#080B0F` text. Used sparingly.
- **Secondary** — transparent background, primary border, light text.
- **Ghost** — no border, no background, text-only.
- **Destructive** — `#C97B74` border/text on transparent; filled only on confirm step.

Hover:

```text
background lightens ~6%
--d-fast
--ease-standard
```

No scale transform on buttons.

## Inputs

```text
Height:
36px

Radius:
--r-sm

Border:
Secondary Border

Border on focus:
1px solid #E5DCC7
+
visible focus ring

Padding-X:
--sp-3
```

Placeholder text uses:

```text
#747B83
```

only at sizes meeting the contrast rule in Section 4.

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

## Desktop — ≥1024px

Full sidebar + dashboard layout.

KPI cards:

```text
4-up
```

## Tablet — 768–1023px

Sidebar may collapse to:

```text
icon-only rail
```

or:

```text
overlay drawer
```

Metrics:

```text
2 columns
```

## Mobile — <768px

Metrics:

```text
1 column
```

Use:

- Mobile navigation
- Scrollable tables or card conversion
- Full-screen AI Decision Drawer

The interface must remain readable on mobile.

---

# 32. Accessibility

Requirements:

- Sufficient text contrast.
- Verify new color pairings against a minimum of:
  - `4.5:1` for normal text
  - `3:1` for large text
- Keyboard-friendly buttons.
- All interactive elements reachable via Tab.
- Controls activated via Enter/Space where appropriate.
- Visible focus states.
- Every focusable element receives a visible outline.
- Never use `outline: none` without a replacement.
- Icon-only buttons require `aria-label`.
- Status must never depend on color alone.
- Proper semantic HTML should be used where appropriate.
- Tables should use semantic table elements when implemented as true data tables.
- Forms should use associated labels.
- Sidebar navigation icons should pair with readable labels on desktop.

Recommended focus style:

```text
2px outline
#E5DCC7 at 60% opacity
2px offset
```

---

# 33. Component Strategy

Create reusable components.

Suggested structure:

```text
src/
├── styles/
│   └── tokens.css

├── components/
│
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── RecoveryChart.tsx
│   │   └── AgentActivity.tsx
│
│   ├── transactions/
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionRow.tsx
│   │   └── DecisionDrawer.tsx
│
│   ├── agent/
│   │   ├── AgentReplay.tsx
│   │   ├── ReplayStep.tsx
│   │   └── ConfidenceMeter.tsx
│
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Skeleton.tsx
│       └── StatusIndicator.tsx
```

All spacing, radius, elevation, easing, and z-index values in components should reference design tokens rather than introducing inconsistent arbitrary values.

Do not restructure stable P0 components solely to match this target tree.

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

Recommended sizing:

```text
16px — inline with body text
18px — navigation
20px — section headers
```

Recommended stroke width:

```text
1.75
```

---

# 35. Design Rules

## DO

- Keep spacing consistent.
- Use the spacing tokens.
- Keep cards aligned.
- Use restrained color.
- Prioritize financial metrics.
- Animate meaningful state changes.
- Keep critical recovery information visible.
- Clearly communicate confidence.
- Clearly display guardrail decisions.
- Use reusable components.
- Maintain responsive layouts.
- Make simulation and demo context visible.
- Make blocked recovery as understandable as successful recovery.

## DO NOT

- Use flashy gradients everywhere.
- Use excessive blur.
- Use large shadows.
- Animate every element continuously.
- Hide important data behind unnecessary interactions.
- Use random colors.
- Mix inconsistent typography.
- Make AI appear more certain than it is.
- Display simulated values as production results.
- Prioritize appearance over functionality.
- Fabricate Agent Replay stages.
- Make blocked transactions appear to have executed.

---

# 36. Core Screens

RecoverAI should eventually contain:

## 1. Command Center

Overall recovery dashboard.

## 2. Transactions

All payment transactions with filters.

## 3. Recovery Agent

Current recovery jobs and decisions.

## 4. Agent Replay

Detailed replay for a selected payment.

## 5. Activity

System-wide audit/activity stream.

## 6. Guardrails

Safety policies and blocked actions.

## 7. Settings

Simulation/environment settings.

Not every sidebar destination must be fully implemented during P0.

---

# 37. Main UX Story

The best demonstration should allow a reviewer to understand the system in seconds:

```text
₹7,499 payment failed

        ↓

RecoverAI detected it

        ↓

Failure classified

        ↓

Recovery strategy chosen

        ↓

Guardrails validated it

        ↓

Recovery executed

        ↓

Payment verified

        ↓

₹7,499 recovered

        ↓

Dashboard revenue counter increases
```

Every design decision should support this story.

The corresponding safety story is equally important:

```text
₹68,000 payment failed

        ↓

RecoverAI detected it

        ↓

Failure classified

        ↓

Recovery strategy considered

        ↓

Guardrails detected unsafe conditions

        ↓

RECOVERY BLOCKED

        ↓

No execution

        ↓

Audit trail preserved
```

---

# 38. Final Design Principle

RecoverAI must communicate:

> **"This is an intelligent financial recovery system that acts carefully, explains its decisions, respects safety constraints, and measures actual recovery outcomes."**

The design should reinforce:

```text
trust
+
intelligence
+
measurable financial impact
```

rather than simply looking visually impressive.