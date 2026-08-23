import { AnimatePresence, motion } from "motion/react";

import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock3,
  BrainCircuit,
  IndianRupee,
  RotateCcw,
} from "lucide-react";

import AgentReplay from "../agent/AgentReplay";

import type {
  RecoveryDecisionDrawerData,
  GuardrailStatus,
  ExecutionStatus,
} from "../../types/recovery";


interface DecisionDrawerProps {
  open: boolean;

  data: RecoveryDecisionDrawerData | null;

  onClose: () => void;
}


const COLORS = {
  background: "#080B0F",

  surface: "#0D1116",

  surfaceElevated: "#11161C",

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


function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}


function formatAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}


function formatFailureCode(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}


function guardrailStyle(
  status: GuardrailStatus,
) {
  switch (status) {
    case "ALLOWED":
      return {
        color: COLORS.success,

        background:
          "rgba(167,187,134,0.08)",

        border:
          "1px solid rgba(167,187,134,0.18)",
      };

    case "REVIEW_REQUIRED":
      return {
        color: COLORS.warning,

        background:
          "rgba(199,181,141,0.08)",

        border:
          "1px solid rgba(199,181,141,0.18)",
      };

    case "BLOCKED":
      return {
        color: COLORS.error,

        background:
          "rgba(201,123,116,0.08)",

        border:
          "1px solid rgba(201,123,116,0.18)",
      };
  }
}


function executionColor(
  status: ExecutionStatus,
) {
  switch (status) {
    case "RECOVERED":
      return COLORS.success;

    case "ACTION_COMPLETED":
      return COLORS.accent;

    case "REVIEW_REQUIRED":
      return COLORS.warning;

    case "BLOCKED":
    case "FAILED":
      return COLORS.error;

    default:
      return COLORS.muted;
  }
}


function ExecutionIcon({
  status,
}: {
  status: ExecutionStatus;
}) {
  switch (status) {
    case "RECOVERED":
      return (
        <CheckCircle2
          size={18}
          color={COLORS.success}
        />
      );

    case "REVIEW_REQUIRED":
      return (
        <AlertTriangle
          size={18}
          color={COLORS.warning}
        />
      );

    case "BLOCKED":
    case "FAILED":
      return (
        <XCircle
          size={18}
          color={COLORS.error}
        />
      );

    default:
      return (
        <Clock3
          size={18}
          color={COLORS.muted}
        />
      );
  }
}


export default function DecisionDrawer({
  open,
  data,
  onClose,
}: DecisionDrawerProps) {
  return (
    <AnimatePresence>
      {open && data && (
        <>
          {/* ================================================= */}
          {/* BACKDROP                                         */}
          {/* ================================================= */}

          <motion.button
            type="button"
            aria-label="Close decision drawer"
            onClick={onClose}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            style={{
              position: "fixed",

              inset: 0,

              zIndex: 80,

              border: "none",

              padding: 0,

              background:
                "rgba(0,0,0,0.58)",

              backdropFilter:
                "blur(4px)",

              cursor: "default",
            }}
          />


          {/* ================================================= */}
          {/* DRAWER                                           */}
          {/* ================================================= */}

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Recovery decision for ${data.transactionId}`}
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              duration: 0.32,

              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            style={{
              position: "fixed",

              top: 0,

              right: 0,

              bottom: 0,

              zIndex: 90,

              width:
                "min(440px, 100vw)",

              background:
                COLORS.background,

              borderLeft:
                `1px solid ${COLORS.border}`,

              boxShadow:
                "-28px 0 80px rgba(0,0,0,0.42)",

              overflowY: "auto",

              color: COLORS.text,
            }}
          >

            {/* ================================================= */}
            {/* HEADER                                           */}
            {/* ================================================= */}

            <div
              style={{
                position: "sticky",

                top: 0,

                zIndex: 10,

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "flex-start",

                gap: 20,

                padding: "24px",

                background:
                  "rgba(8,11,15,0.94)",

                backdropFilter:
                  "blur(18px)",

                borderBottom:
                  `1px solid ${COLORS.borderSoft}`,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

                    gap: 8,

                    marginBottom: 8,

                    fontSize: 11,

                    fontWeight: 700,

                    letterSpacing:
                      "0.14em",

                    color:
                      COLORS.gold,
                  }}
                >
                  <BrainCircuit
                    size={14}
                  />

                  RECOVERY DECISION
                </div>


                <h2
                  style={{
                    margin: 0,

                    fontFamily:
                      "Manrope, sans-serif",

                    fontSize: 22,

                    lineHeight: 1.25,

                    fontWeight: 650,
                  }}
                >
                  {data.transactionId}
                </h2>


                <div
                  style={{
                    marginTop: 7,

                    fontSize: 13,

                    color:
                      COLORS.muted,
                  }}
                >
                  RecoverAI decision trace
                </div>
              </div>


              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                style={{
                  width: 36,

                  height: 36,

                  display: "grid",

                  placeItems:
                    "center",

                  flexShrink: 0,

                  borderRadius: 10,

                  border:
                    `1px solid ${COLORS.border}`,

                  background:
                    "rgba(255,255,255,0.025)",

                  color:
                    COLORS.muted,

                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>


            {/* ================================================= */}
            {/* CONTENT                                          */}
            {/* ================================================= */}

            <div
              style={{
                padding: "24px",
              }}
            >

              {/* =============================================== */}
              {/* ENVIRONMENT LABEL                               */}
              {/* =============================================== */}

              <div
                style={{
                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  gap: 12,

                  marginBottom: 20,
                }}
              >
                <span
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
                      `1px solid ${COLORS.border}`,

                    background:
                      "rgba(229,220,199,0.04)",

                    color:
                      COLORS.accent,

                    fontSize: 10,

                    fontWeight: 750,

                    letterSpacing:
                      "0.12em",
                  }}
                >
                  SIMULATION
                </span>


                <span
                  style={{
                    color:
                      COLORS.subtle,

                    fontSize: 12,
                  }}
                >
                  Backend decision
                </span>
              </div>


              {/* =============================================== */}
              {/* AMOUNT                                          */}
              {/* =============================================== */}

              <div
                style={{
                  padding: 20,

                  marginBottom: 14,

                  borderRadius: 16,

                  border:
                    `1px solid ${COLORS.border}`,

                  background:
                    "rgba(255,255,255,0.016)",
                }}
              >
                <div
                  style={{
                    display: "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    marginBottom: 13,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,

                      color:
                        COLORS.muted,
                    }}
                  >
                    Transaction amount
                  </span>


                  <IndianRupee
                    size={16}
                    color={COLORS.gold}
                  />
                </div>


                <strong
                  style={{
                    fontFamily:
                      "Manrope, sans-serif",

                    fontSize: 30,

                    fontWeight: 650,

                    letterSpacing:
                      "-0.035em",
                  }}
                >
                  {formatRupees(
                    data.amount,
                  )}
                </strong>
              </div>


              {/* =============================================== */}
              {/* FAILURE ANALYSIS                                */}
              {/* =============================================== */}

              <SectionTitle>
                FAILURE ANALYSIS
              </SectionTitle>


              <InfoPanel>
                <InfoRow
                  label="Failure"
                  value={formatFailureCode(
                    data.failureCode,
                  )}
                />

                <Divider />

                <InfoRow
                  label="Classification"
                  value={formatFailureCode(
                    data.category,
                  )}
                />

                <Divider />

                <InfoRow
                  label="Confidence"
                  value={`${Math.round(
                    data.confidence *
                      100,
                  )}%`}
                />
              </InfoPanel>


              {/* =============================================== */}
              {/* RECOVERY DECISION                               */}
              {/* =============================================== */}

              <SectionTitle>
                RECOVERY DECISION
              </SectionTitle>


              <InfoPanel>
                <div
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

                    gap: 11,

                    marginBottom: 16,
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
                    <RotateCcw
                      size={16}
                      color={
                        COLORS.accent
                      }
                    />
                  </div>


                  <div>
                    <div
                      style={{
                        fontSize: 11,

                        color:
                          COLORS.subtle,

                        marginBottom: 3,
                      }}
                    >
                      Selected action
                    </div>


                    <strong
                      style={{
                        fontSize: 14,
                      }}
                    >
                      {formatAction(
                        data.action,
                      )}
                    </strong>
                  </div>
                </div>


                {data.simulationProbability !==
                  null && (
                  <>
                    <Divider />

                    <InfoRow
                      label="Simulation probability"
                      value={`${Math.round(
                        data.simulationProbability *
                          100,
                      )}%`}
                    />
                  </>
                )}
              </InfoPanel>


              {/* =============================================== */}
              {/* GUARDRAIL DECISION                              */}
              {/* =============================================== */}

              <SectionTitle>
                GUARDRAIL DECISION
              </SectionTitle>


              <div
                style={{
                  padding: 18,

                  marginBottom: 22,

                  borderRadius: 14,

                  ...guardrailStyle(
                    data.guardrailStatus,
                  ),
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

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
                    {data.guardrailStatus ===
                    "ALLOWED" ? (
                      <ShieldCheck
                        size={18}
                      />
                    ) : (
                      <ShieldAlert
                        size={18}
                      />
                    )}


                    <strong
                      style={{
                        fontSize: 13,

                        letterSpacing:
                          "0.04em",
                      }}
                    >
                      {data.guardrailStatus.replace(
                        "_",
                        " ",
                      )}
                    </strong>
                  </div>


                  <span
                    style={{
                      fontSize: 11,
                    }}
                  >
                    {data.canExecute
                      ? "EXECUTION ALLOWED"
                      : "EXECUTION STOPPED"}
                  </span>
                </div>
              </div>


              {/* =============================================== */}
              {/* EXECUTION RESULT                                */}
              {/* =============================================== */}

              <SectionTitle>
                EXECUTION RESULT
              </SectionTitle>


              <InfoPanel>
                <div
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    gap: 16,
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
                    <ExecutionIcon
                      status={
                        data.executionStatus
                      }
                    />


                    <span
                      style={{
                        color:
                          executionColor(
                            data.executionStatus,
                          ),

                        fontSize: 13,

                        fontWeight: 700,
                      }}
                    >
                      {data.executionStatus.replace(
                        "_",
                        " ",
                      )}
                    </span>
                  </div>


                  {data.recoveredAmount >
                    0 && (
                    <strong
                      style={{
                        color:
                          COLORS.success,

                        fontSize: 15,
                      }}
                    >
                      +
                      {formatRupees(
                        data.recoveredAmount,
                      )}
                    </strong>
                  )}
                </div>
              </InfoPanel>


              {/* =============================================== */}
              {/* AGENT REPLAY                                    */}
              {/* =============================================== */}

              <SectionTitle>
                AGENT REPLAY
              </SectionTitle>


              <AgentReplay
                transactionId={
                  data.transactionId
                }
              />


              {/* =============================================== */}
              {/* SIMULATION DISCLAIMER                           */}
              {/* =============================================== */}

              <div
                style={{
                  padding:
                    "12px 14px",

                  marginTop: 20,

                  borderRadius: 10,

                  border:
                    `1px solid ${COLORS.borderSoft}`,

                  color:
                    COLORS.subtle,

                  fontSize: 11,

                  lineHeight: 1.6,
                }}
              >
                RecoverAI is displaying
                the decision and execution
                information returned by
                the backend. Simulation
                results are not presented
                as real recovered revenue.
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


// =========================================================
// SECTION TITLE
// =========================================================

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 24,

        marginBottom: 9,

        fontSize: 10,

        fontWeight: 750,

        letterSpacing:
          "0.14em",

        color: COLORS.subtle,
      }}
    >
      {children}
    </div>
  );
}


// =========================================================
// INFO PANEL
// =========================================================

function InfoPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding:
          "16px 17px",

        marginBottom: 20,

        borderRadius: 14,

        border:
          `1px solid ${COLORS.border}`,

        background:
          "rgba(255,255,255,0.014)",
      }}
    >
      {children}
    </div>
  );
}


// =========================================================
// INFO ROW
// =========================================================

function InfoRow({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",

        justifyContent:
          "space-between",

        alignItems:
          "center",

        gap: 20,
      }}
    >
      <span
        style={{
          fontSize: 12,

          color:
            COLORS.muted,
        }}
      >
        {label}
      </span>


      <strong
        style={{
          maxWidth: "60%",

          textAlign: "right",

          fontSize: 12,

          lineHeight: 1.45,

          color:
            COLORS.text,
        }}
      >
        {value}
      </strong>
    </div>
  );
}


// =========================================================
// DIVIDER
// =========================================================

function Divider() {
  return (
    <div
      style={{
        height: 1,

        margin: "13px 0",

        background:
          COLORS.borderSoft,
      }}
    />
  );
}