import {
  useEffect,
  useState,
} from "react";

import {
  BrainCircuit,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

import {
  getAIReasoning,
} from "../../services/aiApi";

import {
  getReasoningSourceLabel,
  isDeterministicFallback,
  isGroqCloudReasoning,
} from "../../types/ai";

import type {
  AIReasoningResponse,
} from "../../types/ai";

import type {
  RecoveryDecisionDrawerData,
} from "../../types/recovery";


// =========================================================
// PROPS
// =========================================================

interface AIReasoningPanelProps {
  data: RecoveryDecisionDrawerData;
}


// =========================================================
// COLORS
// =========================================================

const COLORS = {
  surface: "#0D1116",

  surfaceElevated: "#11161C",

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
// COMPONENT
// =========================================================

export default function AIReasoningPanel({
  data,
}: AIReasoningPanelProps) {
  const [
    reasoning,
    setReasoning,
  ] =
    useState<AIReasoningResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  // =======================================================
  // LOAD AI EXPLANATION
  // =======================================================

  useEffect(() => {
    let active = true;

    async function loadReasoning() {
      try {
        setLoading(true);

        setError(null);

        setReasoning(null);

        const response =
          await getAIReasoning({
            transaction_id:
              data.transactionId,

            amount:
              data.amount,

            failure_code:
              data.failureCode,

            retry_count:
              data.retryCount,
          });

        if (!active) {
          return;
        }

        setReasoning(
          response,
        );
      } catch (err) {
        if (!active) {
          return;
        }

        console.error(
          "AI reasoning error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load AI reasoning.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReasoning();

    return () => {
      active = false;
    };
  }, [
    data.transactionId,
    data.amount,
    data.failureCode,
    data.retryCount,
  ]);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div
        style={{
          padding: 18,

          borderRadius: 14,

          border:
            `1px solid ${COLORS.border}`,

          background:
            "rgba(255,255,255,0.014)",
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems: "center",

            gap: 10,

            color:
              COLORS.muted,

            fontSize: 12,
          }}
        >
          <RefreshCcw
            size={15}
          />

          Generating grounded AI explanation...
        </div>
      </div>
    );
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <div
        style={{
          padding: 18,

          borderRadius: 14,

          border:
            "1px solid rgba(201,123,116,0.18)",

          background:
            "rgba(201,123,116,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems:
              "flex-start",

            gap: 10,
          }}
        >
          <AlertTriangle
            size={17}
            color={
              COLORS.error
            }
          />

          <div>
            <strong
              style={{
                display:
                  "block",

                marginBottom: 5,

                fontSize: 12,

                color:
                  COLORS.error,
              }}
            >
              AI explanation unavailable
            </strong>

            <div
              style={{
                color:
                  COLORS.muted,

                fontSize: 11,

                lineHeight: 1.6,
              }}
            >
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }


  // =======================================================
  // EMPTY
  // =======================================================

  if (!reasoning) {
    return null;
  }


  const groqCloud =
    isGroqCloudReasoning(
      reasoning,
    );

  const fallback =
    isDeterministicFallback(
      reasoning,
    );

  const sourceLabel =
    getReasoningSourceLabel(
      reasoning,
    );


  // =======================================================
  // RESULT
  // =======================================================

  return (
    <div
      style={{
        overflow: "hidden",

        borderRadius: 16,

        border:
          `1px solid ${COLORS.border}`,

        background:
          "linear-gradient(180deg, rgba(229,220,199,0.025), rgba(255,255,255,0.012))",
      }}
    >
      {/* ================================================= */}
      {/* HEADER                                           */}
      {/* ================================================= */}

      <div
        style={{
          padding:
            "16px 17px",

          borderBottom:
            `1px solid ${COLORS.borderSoft}`,
        }}
      >
        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "flex-start",

            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",

              alignItems:
                "center",

              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,

                height: 34,

                display: "grid",

                placeItems:
                  "center",

                borderRadius: 10,

                border:
                  `1px solid ${COLORS.border}`,

                background:
                  "rgba(229,220,199,0.045)",
              }}
            >
              <BrainCircuit
                size={17}
                color={
                  COLORS.accent
                }
              />
            </div>

            <div>
              <strong
                style={{
                  display:
                    "block",

                  fontSize: 13,

                  color:
                    COLORS.text,
                }}
              >
                AI Decision Analysis
              </strong>

              <div
                style={{
                  marginTop: 3,

                  fontSize: 10,

                  color:
                    COLORS.subtle,
                }}
              >
                Explanation only · no execution authority
              </div>
            </div>
          </div>


          <Sparkles
            size={16}
            color={
              COLORS.gold
            }
          />
        </div>


        {/* SOURCE BADGES */}

        <div
          style={{
            display: "flex",

            flexWrap: "wrap",

            gap: 7,

            marginTop: 14,
          }}
        >
          <Badge
            label={
              sourceLabel
            }
            success={
              groqCloud
            }
          />

          {!fallback && (
            <Badge
              label="GROUNDED"
              success
            />
          )}

          {fallback && (
            <Badge
              label="FALLBACK"
            />
          )}

          <Badge
            label={
              data.canExecute
                ? "GUARDRAIL ALLOWED"
                : "EXECUTION BLOCKED"
            }
            success={
              data.canExecute
            }
            warning={
              !data.canExecute
            }
          />
        </div>
      </div>


      {/* ================================================= */}
      {/* REASONING                                        */}
      {/* ================================================= */}

      <div
        style={{
          padding:
            "4px 17px 17px",
        }}
      >
        <ReasoningBlock
          title="DIAGNOSIS"
          text={
            reasoning.diagnosis
          }
        />

        <ReasoningDivider />

        <ReasoningBlock
          title="RECOVERY RATIONALE"
          text={
            reasoning.recovery_rationale
          }
        />

        <ReasoningDivider />

        <ReasoningBlock
          title="CONFIDENCE"
          text={
            reasoning.confidence_narrative
          }
        />

        <ReasoningDivider />

        <ReasoningBlock
          title="SAFETY"
          text={
            reasoning.safety_explanation
          }
          safety
        />

        <ReasoningDivider />

        <ReasoningBlock
          title="OPERATOR SUMMARY"
          text={
            reasoning.operator_summary
          }
        />
      </div>


      {/* ================================================= */}
      {/* SAFETY FOOTER                                    */}
      {/* ================================================= */}

      <div
        style={{
          display: "flex",

          alignItems:
            "flex-start",

          gap: 9,

          padding:
            "12px 17px",

          borderTop:
            `1px solid ${COLORS.borderSoft}`,

          background:
            "rgba(255,255,255,0.012)",
        }}
      >
        <ShieldCheck
          size={14}
          color={
            COLORS.success
          }
        />

        <div
          style={{
            color:
              COLORS.subtle,

            fontSize: 10,

            lineHeight: 1.55,
          }}
        >
          Deterministic guardrails remain authoritative.
          AI reasoning cannot authorize recovery execution,
          change payment state, or bypass verification.
        </div>
      </div>
    </div>
  );
}


// =========================================================
// REASONING BLOCK
// =========================================================

function ReasoningBlock({
  title,
  text,
  safety = false,
}: {
  title: string;

  text: string;

  safety?: boolean;
}) {
  return (
    <div
      style={{
        padding:
          "14px 0",
      }}
    >
      <div
        style={{
          display: "flex",

          alignItems:
            "center",

          gap: 7,

          marginBottom: 7,

          color:
            safety
              ? COLORS.success
              : COLORS.subtle,

          fontSize: 9,

          fontWeight: 750,

          letterSpacing:
            "0.13em",
        }}
      >
        {safety && (
          <CheckCircle2
            size={12}
          />
        )}

        {title}
      </div>

      <div
        style={{
          color:
            COLORS.muted,

          fontSize: 12,

          lineHeight: 1.65,
        }}
      >
        {text}
      </div>
    </div>
  );
}


// =========================================================
// DIVIDER
// =========================================================

function ReasoningDivider() {
  return (
    <div
      style={{
        height: 1,

        background:
          COLORS.borderSoft,
      }}
    />
  );
}


// =========================================================
// BADGE
// =========================================================

function Badge({
  label,
  success = false,
  warning = false,
}: {
  label: string;

  success?: boolean;

  warning?: boolean;
}) {
  let color =
    COLORS.accent;

  let background =
    "rgba(229,220,199,0.05)";

  let border =
    "rgba(229,220,199,0.12)";

  if (success) {
    color =
      COLORS.success;

    background =
      "rgba(167,187,134,0.06)";

    border =
      "rgba(167,187,134,0.16)";
  }

  if (warning) {
    color =
      COLORS.error;

    background =
      "rgba(201,123,116,0.06)";

    border =
      "rgba(201,123,116,0.16)";
  }

  return (
    <span
      style={{
        display:
          "inline-flex",

        alignItems:
          "center",

        padding:
          "5px 7px",

        borderRadius: 999,

        border:
          `1px solid ${border}`,

        background,

        color,

        fontSize: 8,

        fontWeight: 800,

        letterSpacing:
          "0.1em",
      }}
    >
      {label}
    </span>
  );
}