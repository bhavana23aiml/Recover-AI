import type {
  ReactNode,
} from "react";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CopyCheck,
  IndianRupee,
  OctagonX,
  Repeat2,
  ShieldAlert,
  ShieldCheck,
  Timer,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


// =========================================================
// COLORS
// =========================================================

const COLORS = {
  surface: "#0D1116",
  elevated: "#11161C",
  border: "rgba(255,255,255,0.065)",
  borderSoft: "rgba(255,255,255,0.04)",
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
// FRONTEND MIRROR OF CURRENT BACKEND POLICY
// =========================================================
//
// These values mirror the deterministic RecoverAI backend
// guardrail configuration. Enforcement remains backend-side.
// AI does not own or modify these thresholds.
// =========================================================

const policies = [
  {
    title: "Maximum retries",
    value: "2",
    description:
      "Retry-based recovery is blocked once the configured retry boundary has already been reached.",
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
      "Below this threshold, RecoverAI withholds automatic recovery rather than acting.",
    icon: ShieldAlert,
  },

  {
    title: "Automatic amount limit",
    value: "₹50,000",
    description:
      "Recoveries above this automatic amount boundary require additional review.",
    icon: IndianRupee,
  },

  {
    title: "Retry cooldown",
    value: "15 min",
    description:
      "Retry-based recovery respects the configured cooldown before another attempt is permitted.",
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
      "Automatic recovery stops after the configured consecutive-failure boundary is reached.",
    icon: OctagonX,
  },
];


const outcomes = [
  {
    title: "ALLOWED",
    description:
      "All deterministic execution conditions are satisfied.",
    color: COLORS.success,
    icon: (
      <CheckCircle2
        size={17}
      />
    ),
  },

  {
    title: "REVIEW REQUIRED",
    description:
      "Automatic execution is withheld and the recovery requires review.",
    color: COLORS.warning,
    icon: (
      <AlertTriangle
        size={17}
      />
    ),
  },

  {
    title: "BLOCKED",
    description:
      "A hard safety condition prevents automatic recovery execution.",
    color: COLORS.error,
    icon: (
      <OctagonX
        size={17}
      />
    ),
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
              "10px 32px 48px",
          }}
        >
          {/* ================================================= */}
          {/* COMPACT PAGE CONTEXT                              */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: 18,
              marginBottom: 15,
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                maxWidth: 760,
                margin: 0,
                color:
                  COLORS.muted,
                fontSize: 12,
                lineHeight: 1.65,
              }}
            >
              Deterministic controls decide
              whether RecoverAI may execute,
              require review, or stop a
              recovery. AI explanations
              cannot override these rules.
            </p>


            <div
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 7,
                padding:
                  "6px 9px",
                borderRadius: 999,
                border:
                  "1px solid rgba(167,187,134,0.16)",
                background:
                  "rgba(167,187,134,0.055)",
                color:
                  COLORS.success,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing:
                  "0.08em",
              }}
            >
              <ShieldCheck
                size={11}
              />

              BACKEND ENFORCED
            </div>
          </div>


          {/* ================================================= */}
          {/* AUTHORITY SUMMARY                                 */}
          {/* ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <AuthorityCard
              label="Execution authority"
              value="Guardrails"
              detail="Deterministic"
              icon={
                <ShieldCheck
                  size={15}
                />
              }
            />

            <AuthorityCard
              label="AI authority"
              value="Explanation only"
              detail="Cannot override"
              icon={
                <BrainCircuit
                  size={15}
                />
              }
            />

            <AuthorityCard
              label="Policy controls"
              value={String(
                policies.length,
              )}
              detail="Frontend mirror"
              icon={
                <CopyCheck
                  size={15}
                />
              }
            />
          </div>


          {/* ================================================= */}
          {/* SAFETY ARCHITECTURE                               */}
          {/* ================================================= */}

          <section
            style={{
              padding: 20,
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
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: 12,
                marginBottom: 15,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    color:
                      COLORS.gold,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing:
                      "0.13em",
                  }}
                >
                  EXECUTION AUTHORITY
                </div>

                <div
                  style={{
                    marginTop: 4,
                    color:
                      COLORS.text,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Guardrail decision precedes execution
                </div>
              </div>

              <span
                style={{
                  color:
                    COLORS.subtle,
                  fontSize: 9,
                }}
              >
                Deterministic control path
              </span>
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
                overflowX:
                  "auto",
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
                paddingTop: 15,
                marginTop: 16,
                borderTop:
                  `1px solid ${COLORS.borderSoft}`,
                color:
                  COLORS.muted,
                fontSize: 10,
                lineHeight: 1.65,
              }}
            >
              <BrainCircuit
                size={14}
                color={
                  COLORS.gold
                }
                style={{
                  marginTop: 2,
                  flexShrink: 0,
                }}
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
          </section>


          {/* ================================================= */}
          {/* CURRENT SAFETY POLICY                             */}
          {/* ================================================= */}

          <SectionHeading
            title="CURRENT SAFETY POLICY"
            detail="Frontend mirror · Backend enforced"
          />


          <div
            className="guardrails-policy-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 22,
            }}
          >
            {policies.map(
              (
                policy,
                index,
              ) => {
                const Icon =
                  policy.icon;

                const isStopRule =
                  policy.title ===
                    "Maximum retries" ||
                  policy.title ===
                    "Consecutive failures";

                return (
                  <div
                    key={
                      policy.title
                    }
                    style={{
                      minHeight: 152,
                      padding: 17,
                      borderRadius: 15,
                      border:
                        isStopRule
                          ? "1px solid rgba(201,123,116,0.12)"
                          : `1px solid ${COLORS.border}`,
                      background:
                        isStopRule
                          ? "linear-gradient(180deg, rgba(201,123,116,0.025), rgba(255,255,255,0.008))"
                          : COLORS.surface,
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
                          width: 33,
                          height: 33,
                          display:
                            "grid",
                          placeItems:
                            "center",
                          flexShrink: 0,
                          borderRadius: 10,
                          background:
                            isStopRule
                              ? "rgba(201,123,116,0.05)"
                              : "rgba(229,220,199,0.045)",
                          color:
                            isStopRule
                              ? COLORS.error
                              : COLORS.accent,
                        }}
                      >
                        <Icon
                          size={15}
                        />
                      </div>


                      <div
                        style={{
                          textAlign:
                            "right",
                        }}
                      >
                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              isStopRule
                                ? "#D7A09A"
                                : COLORS.accent,
                            fontFamily:
                              "Manrope, sans-serif",
                            fontSize: 19,
                            fontWeight: 650,
                          }}
                        >
                          {
                            policy.value
                          }
                        </strong>

                        <span
                          style={{
                            display:
                              "block",
                            marginTop: 3,
                            color:
                              COLORS.subtle,
                            fontSize: 8,
                            fontWeight: 700,
                            letterSpacing:
                              "0.06em",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          POLICY {index + 1}
                        </span>
                      </div>
                    </div>


                    <div
                      style={{
                        marginTop: 14,
                        color:
                          COLORS.text,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {
                        policy.title
                      }
                    </div>


                    <div
                      style={{
                        marginTop: 6,
                        color:
                          COLORS.subtle,
                        fontSize: 10,
                        lineHeight: 1.55,
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
          {/* GUARDRAIL OUTCOMES                                */}
          {/* ================================================= */}

          <SectionHeading
            title="GUARDRAIL OUTCOMES"
            detail="Only ALLOWED may continue automatically"
          />


          <div
            className="guardrails-outcome-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 22,
            }}
          >
            {outcomes.map(
              (
                outcome,
              ) => (
                <DecisionState
                  key={
                    outcome.title
                  }
                  icon={
                    outcome.icon
                  }
                  title={
                    outcome.title
                  }
                  description={
                    outcome.description
                  }
                  color={
                    outcome.color
                  }
                />
              ),
            )}
          </div>


          {/* ================================================= */}
          {/* VERIFIED RECOVERY EXAMPLES                        */}
          {/* ================================================= */}

          <SectionHeading
            title="VERIFIED RECOVERY EXAMPLES"
            detail="Canonical demo cases"
          />


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
              detail="The deterministic guardrail permits the proposed recovery action."
              color={
                COLORS.success
              }
              icon={
                <CheckCircle2
                  size={15}
                />
              }
            />

            <ExampleCard
              transaction="RX20117"
              amount="₹68,000"
              retry="Retry 2"
              status="BLOCKED"
              detail="The retry boundary has already been reached, so automatic execution is not authorized."
              color={
                COLORS.error
              }
              icon={
                <OctagonX
                  size={15}
                />
              }
            />
          </div>


          {/* ================================================= */}
          {/* READ-ONLY NOTE                                    */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems:
                "flex-start",
              gap: 8,
              marginTop: 14,
              color:
                COLORS.subtle,
              fontSize: 10,
              lineHeight: 1.6,
            }}
          >
            <ShieldCheck
              size={12}
              style={{
                marginTop: 2,
                flexShrink: 0,
              }}
            />

            <span>
              This page is read-only.
              Policy enforcement remains in
              the backend recovery pipeline,
              not in frontend controls.
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}


// =========================================================
// AUTHORITY CARD
// =========================================================

function AuthorityCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: 11,
        minHeight: 58,
        padding:
          "11px 13px",
        borderRadius: 13,
        border:
          `1px solid ${COLORS.border}`,
        background:
          COLORS.surface,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          display: "grid",
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
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            color:
              COLORS.subtle,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing:
              "0.05em",
            textTransform:
              "uppercase",
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: "flex",
            alignItems:
              "baseline",
            gap: 7,
            marginTop: 3,
            flexWrap: "wrap",
          }}
        >
          <strong
            style={{
              color:
                COLORS.text,
              fontSize: 11,
            }}
          >
            {value}
          </strong>

          <span
            style={{
              color:
                COLORS.subtle,
              fontSize: 8,
            }}
          >
            {detail}
          </span>
        </div>
      </div>
    </div>
  );
}


// =========================================================
// SECTION HEADING
// =========================================================

function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        gap: 12,
        marginBottom: 10,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          color:
            COLORS.subtle,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing:
            "0.13em",
        }}
      >
        {title}
      </div>

      <span
        style={{
          color:
            COLORS.subtle,
          fontSize: 9,
        }}
      >
        {detail}
      </span>
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
          "12px 14px",
        borderRadius: 12,
        border:
          active
            ? "1px solid rgba(167,187,134,0.18)"
            : `1px solid ${COLORS.border}`,
        background:
          active
            ? "rgba(167,187,134,0.055)"
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
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div
      style={{
        minHeight: 112,
        padding: 17,
        borderRadius: 15,
        border:
          `1px solid ${color}22`,
        background:
          `${color}08`,
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
            fontSize: 10,
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
            "10px 0 0",
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
  icon,
}: {
  transaction: string;
  amount: string;
  retry: string;
  status: string;
  detail: string;
  color: string;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        padding: 17,
        borderRadius: 15,
        border:
          `1px solid ${color}22`,
        background:
          `linear-gradient(180deg, ${color}08, rgba(255,255,255,0.008))`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
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
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: 5,
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
              "0.08em",
          }}
        >
          {icon}
          {status}
        </span>
      </div>


      <p
        style={{
          margin:
            "12px 0 0",
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
