import {
  ShieldCheck,
  ShieldAlert,
  Repeat2,
  BrainCircuit,
  IndianRupee,
  Timer,
  CopyCheck,
  OctagonX,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const COLORS = {
  surface: "#0D1116",

  elevated: "#11161C",

  border:
    "rgba(255,255,255,0.065)",

  borderSoft:
    "rgba(255,255,255,0.04)",

  text: "#F3F4F6",

  muted: "#9BA2AA",

  subtle: "#747B83",

  accent: "#E5DCC7",

  gold: "#93866A",

  success: "#A7BB86",

  warning: "#C7B58D",

  error: "#C97B74",
};


// =========================================================
// CURRENT BACKEND POLICY
// =========================================================
//
// These values mirror the deterministic RecoverAI backend
// configuration currently used by the guardrail engine.
//
// AI does not own or modify these thresholds.
// =========================================================

const policies = [
  {
    title: "Maximum retries",

    value: "2",

    description:
      "Retry-based recovery is blocked once the transaction has already reached the configured retry limit.",

    icon: Repeat2,
  },

  {
    title: "Auto-execute confidence",

    value: "≥ 80%",

    description:
      "Automatic recovery requires sufficient deterministic classification confidence.",

    icon: BrainCircuit,
  },

  {
    title: "Minimum action confidence",

    value: "≥ 50%",

    description:
      "Below this confidence threshold, RecoverAI blocks recovery action rather than acting automatically.",

    icon: ShieldAlert,
  },

  {
    title: "Automatic amount limit",

    value: "₹50,000",

    description:
      "Recoveries above the configured automatic amount boundary require additional review.",

    icon: IndianRupee,
  },

  {
    title: "Retry cooldown",

    value: "15 min",

    description:
      "RecoverAI applies a configured cooldown boundary around retry-based recovery behavior.",

    icon: Timer,
  },

  {
    title: "Duplicate window",

    value: "30 sec",

    description:
      "Duplicate protection prevents repeated execution attempts inside the configured protection window.",

    icon: CopyCheck,
  },

  {
    title: "Consecutive failures",

    value: "2",

    description:
      "The system stops automatic recovery after the configured consecutive-failure boundary is reached.",

    icon: OctagonX,
  },
];


// =========================================================
// PAGE
// =========================================================

export default function Guardrails() {
  return (
    <div className="app-shell">
      <Sidebar />


      <main className="main-content">
        <Header />


        <section
          style={{
            padding:
              "30px 32px 48px",
          }}
        >
          {/* ================================================= */}
          {/* PAGE HEADER                                       */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems:
                "flex-end",

              gap: 24,

              marginBottom: 28,

              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",

                  alignItems:
                    "center",

                  gap: 8,

                  marginBottom: 9,

                  color:
                    COLORS.gold,

                  fontSize: 10,

                  fontWeight: 800,

                  letterSpacing:
                    "0.15em",
                }}
              >
                <ShieldCheck
                  size={14}
                />

                DETERMINISTIC SAFETY
              </div>


              <h1
                style={{
                  margin: 0,

                  color:
                    COLORS.text,

                  fontFamily:
                    "Manrope, sans-serif",

                  fontSize: 32,

                  fontWeight: 650,

                  letterSpacing:
                    "-0.04em",
                }}
              >
                Guardrails
              </h1>


              <p
                style={{
                  maxWidth: 700,

                  margin:
                    "9px 0 0",

                  color:
                    COLORS.muted,

                  fontSize: 13,

                  lineHeight: 1.65,
                }}
              >
                Deterministic controls
                decide whether RecoverAI
                may execute, require
                review, or stop a recovery.
                AI explanations cannot
                override these rules.
              </p>
            </div>


            <div
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap: 7,

                padding:
                  "7px 10px",

                borderRadius: 999,

                border:
                  "1px solid rgba(167,187,134,0.16)",

                background:
                  "rgba(167,187,134,0.06)",

                color:
                  COLORS.success,

                fontSize: 9,

                fontWeight: 800,

                letterSpacing:
                  "0.1em",
              }}
            >
              <ShieldCheck
                size={12}
              />

              ENFORCED
            </div>
          </div>


          {/* ================================================= */}
          {/* SAFETY ARCHITECTURE                               */}
          {/* ================================================= */}

          <div
            style={{
              padding: 22,

              marginBottom: 18,

              borderRadius: 18,

              border:
                `1px solid ${COLORS.border}`,

              background:
                "linear-gradient(180deg, rgba(229,220,199,0.025), rgba(255,255,255,0.012))",
            }}
          >
            <div
              style={{
                marginBottom: 16,

                color:
                  COLORS.subtle,

                fontSize: 9,

                fontWeight: 800,

                letterSpacing:
                  "0.14em",
              }}
            >
              EXECUTION AUTHORITY
            </div>


            <div
              className="guardrails-flow"
              style={{
                display: "grid",

                gridTemplateColumns:
                  "repeat(7, auto)",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap: 10,
              }}
            >
              <FlowNode
                title="Failure"
                subtitle="Detected"
              />

              <FlowArrow />

              <FlowNode
                title="Decision"
                subtitle="Deterministic"
              />

              <FlowArrow />

              <FlowNode
                title="Guardrail"
                subtitle="Authoritative"
                active
              />

              <FlowArrow />

              <FlowNode
                title="Execution"
                subtitle="Only if allowed"
              />
            </div>


            <div
              style={{
                display: "flex",

                alignItems:
                  "flex-start",

                gap: 9,

                paddingTop: 17,

                marginTop: 18,

                borderTop:
                  `1px solid ${COLORS.borderSoft}`,

                color:
                  COLORS.muted,

                fontSize: 11,

                lineHeight: 1.65,
              }}
            >
              <BrainCircuit
                size={15}
                color={
                  COLORS.gold
                }
              />

              <span>
                GroqCloud AI is used for
                explanation only. It cannot
                change retry limits,
                confidence thresholds,
                amount limits, stop
                conditions, verification,
                or payment execution.
              </span>
            </div>
          </div>


          {/* ================================================= */}
          {/* POLICY GRID                                       */}
          {/* ================================================= */}

          <div
            style={{
              marginBottom: 10,

              color:
                COLORS.subtle,

              fontSize: 10,

              fontWeight: 800,

              letterSpacing:
                "0.14em",
            }}
          >
            CURRENT SAFETY POLICY
          </div>


          <div
            className="guardrails-policy-grid"
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",

              gap: 12,

              marginBottom: 26,
            }}
          >
            {policies.map(
              (policy) => {
                const Icon =
                  policy.icon;

                return (
                  <div
                    key={
                      policy.title
                    }
                    style={{
                      minHeight: 160,

                      padding: 18,

                      borderRadius: 15,

                      border:
                        `1px solid ${COLORS.border}`,

                      background:
                        COLORS.surface,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "flex-start",

                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 34,

                          height: 34,

                          display:
                            "grid",

                          placeItems:
                            "center",

                          flexShrink: 0,

                          borderRadius: 10,

                          background:
                            "rgba(229,220,199,0.045)",

                          color:
                            COLORS.accent,
                        }}
                      >
                        <Icon
                          size={16}
                        />
                      </div>


                      <strong
                        style={{
                          color:
                            COLORS.accent,

                          fontFamily:
                            "Manrope, sans-serif",

                          fontSize: 20,

                          fontWeight: 650,
                        }}
                      >
                        {
                          policy.value
                        }
                      </strong>
                    </div>


                    <div
                      style={{
                        marginTop: 16,

                        color:
                          COLORS.text,

                        fontSize: 12,

                        fontWeight: 700,
                      }}
                    >
                      {policy.title}
                    </div>


                    <div
                      style={{
                        marginTop: 7,

                        color:
                          COLORS.subtle,

                        fontSize: 10,

                        lineHeight: 1.6,
                      }}
                    >
                      {
                        policy.description
                      }
                    </div>
                  </div>
                );
              },
            )}
          </div>


          {/* ================================================= */}
          {/* DECISION STATES                                   */}
          {/* ================================================= */}

          <div
            style={{
              marginBottom: 10,

              color:
                COLORS.subtle,

              fontSize: 10,

              fontWeight: 800,

              letterSpacing:
                "0.14em",
            }}
          >
            GUARDRAIL OUTCOMES
          </div>


          <div
            className="guardrails-outcome-grid"
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",

              gap: 12,

              marginBottom: 26,
            }}
          >
            <DecisionState
              icon={
                <CheckCircle2
                  size={18}
                />
              }
              title="ALLOWED"
              description="All deterministic execution conditions are satisfied."
              color={
                COLORS.success
              }
            />


            <DecisionState
              icon={
                <AlertTriangle
                  size={18}
                />
              }
              title="REVIEW REQUIRED"
              description="Recovery is withheld from automatic execution and requires review."
              color={
                COLORS.warning
              }
            />


            <DecisionState
              icon={
                <OctagonX
                  size={18}
                />
              }
              title="BLOCKED"
              description="A hard safety condition prevents automatic recovery execution."
              color={
                COLORS.error
              }
            />
          </div>


          {/* ================================================= */}
          {/* VERIFIED EXAMPLES                                 */}
          {/* ================================================= */}

          <div
            style={{
              marginBottom: 10,

              color:
                COLORS.subtle,

              fontSize: 10,

              fontWeight: 800,

              letterSpacing:
                "0.14em",
            }}
          >
            VERIFIED RECOVERY EXAMPLES
          </div>


          <div
            className="guardrails-example-grid"
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",

              gap: 12,
            }}
          >
            <ExampleCard
              transaction="RX18492"
              amount="₹7,499"
              retry="Retry 0"
              status="ALLOWED"
              detail="The deterministic guardrail allows the proposed recovery action."
              color={
                COLORS.success
              }
            />


            <ExampleCard
              transaction="RX20117"
              amount="₹68,000"
              retry="Retry 2"
              status="BLOCKED"
              detail="Maximum retry limit has already been reached, so automatic execution is not authorized."
              color={
                COLORS.error
              }
            />
          </div>


          {/* ================================================= */}
          {/* SAFETY NOTE                                       */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: 15,

              padding:
                "12px 14px",

              borderRadius: 10,

              border:
                `1px solid ${COLORS.borderSoft}`,

              color:
                COLORS.subtle,

              fontSize: 10,

              lineHeight: 1.6,
            }}
          >
            This page is read-only.
            Guardrail policy remains
            enforced by the backend
            recovery pipeline rather than
            by frontend controls.
          </div>
        </section>
      </main>
    </div>
  );
}


// =========================================================
// FLOW NODE
// =========================================================

function FlowNode({
  title,
  subtitle,
  active = false,
}: {
  title: string;

  subtitle: string;

  active?: boolean;
}) {
  return (
    <div
      style={{
        minWidth: 130,

        padding:
          "13px 14px",

        borderRadius: 12,

        border:
          active
            ? "1px solid rgba(167,187,134,0.18)"
            : `1px solid ${COLORS.border}`,

        background:
          active
            ? "rgba(167,187,134,0.06)"
            : COLORS.surface,
      }}
    >
      <div
        style={{
          color:
            active
              ? COLORS.success
              : COLORS.text,

          fontSize: 11,

          fontWeight: 700,
        }}
      >
        {title}
      </div>


      <div
        style={{
          marginTop: 4,

          color:
            COLORS.subtle,

          fontSize: 9,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}


// =========================================================
// FLOW ARROW
// =========================================================

function FlowArrow() {
  return (
    <span
      style={{
        color:
          COLORS.subtle,

        fontSize: 16,

        textAlign:
          "center",
      }}
    >
      →
    </span>
  );
}


// =========================================================
// DECISION STATE
// =========================================================

function DecisionState({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;

  title: string;

  description: string;

  color: string;
}) {
  return (
    <div
      style={{
        padding: 18,

        borderRadius: 15,

        border:
          `1px solid ${COLORS.border}`,

        background:
          COLORS.surface,
      }}
    >
      <div
        style={{
          display: "flex",

          alignItems:
            "center",

          gap: 9,

          color,
        }}
      >
        {icon}


        <strong
          style={{
            fontSize: 11,

            letterSpacing:
              "0.06em",
          }}
        >
          {title}
        </strong>
      </div>


      <p
        style={{
          margin:
            "11px 0 0",

          color:
            COLORS.muted,

          fontSize: 10,

          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}


// =========================================================
// EXAMPLE CARD
// =========================================================

function ExampleCard({
  transaction,
  amount,
  retry,
  status,
  detail,
  color,
}: {
  transaction: string;

  amount: string;

  retry: string;

  status: string;

  detail: string;

  color: string;
}) {
  return (
    <div
      style={{
        padding: 18,

        borderRadius: 15,

        border:
          `1px solid ${COLORS.border}`,

        background:
          COLORS.surface,
      }}
    >
      <div
        style={{
          display: "flex",

          justifyContent:
            "space-between",

          gap: 16,

          flexWrap: "wrap",
        }}
      >
        <div>
          <strong
            style={{
              color:
                COLORS.text,

              fontSize: 13,
            }}
          >
            {transaction}
          </strong>


          <div
            style={{
              marginTop: 5,

              color:
                COLORS.subtle,

              fontSize: 9,
            }}
          >
            {amount} · {retry}
          </div>
        </div>


        <span
          style={{
            height:
              "fit-content",

            padding:
              "5px 8px",

            borderRadius: 999,

            border:
              `1px solid ${color}33`,

            background:
              `${color}0D`,

            color,

            fontSize: 8,

            fontWeight: 800,

            letterSpacing:
              "0.09em",
          }}
        >
          {status}
        </span>
      </div>


      <p
        style={{
          margin:
            "13px 0 0",

          color:
            COLORS.muted,

          fontSize: 10,

          lineHeight: 1.6,
        }}
      >
        {detail}
      </p>
    </div>
  );
}