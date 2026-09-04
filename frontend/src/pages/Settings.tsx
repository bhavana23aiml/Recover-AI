import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


// =========================================================
// COLORS
// =========================================================

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


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000";


type BackendState =
  | "checking"
  | "online"
  | "offline";


type IntegrationState =
  | BackendState
  | "configured";


// =========================================================
// PAGE
// =========================================================

export default function Settings() {
  const [
    backendState,
    setBackendState,
  ] =
    useState<BackendState>(
      "checking",
    );


  // =======================================================
  // BACKEND HEALTH CHECK
  // =======================================================

  async function checkBackend() {
    try {
      setBackendState(
        "checking",
      );

      const response =
        await fetch(
          `${API_BASE_URL}/health`,
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },
          },
        );

      setBackendState(
        response.ok
          ? "online"
          : "offline",
      );
    } catch {
      setBackendState(
        "offline",
      );
    }
  }


  useEffect(() => {
    void checkBackend();
  }, []);


  const backendLabel =
    backendState ===
    "online"
      ? "Reachable"
      : backendState ===
          "checking"
        ? "Checking..."
        : "Unavailable";


  // =======================================================
  // RENDER
  // =======================================================

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
                maxWidth: 720,
                margin: 0,
                color:
                  COLORS.muted,
                fontSize: 12,
                lineHeight: 1.65,
              }}
            >
              Review the current
              RecoverAI environment,
              integration configuration,
              and financial safety
              boundaries. Only the backend
              API is actively health-checked
              from this screen.
            </p>


            <button
              type="button"
              onClick={
                checkBackend
              }
              disabled={
                backendState ===
                "checking"
              }
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 7,
                height: 34,
                padding:
                  "0 11px",
                borderRadius: 9,
                border:
                  `1px solid ${COLORS.border}`,
                background:
                  COLORS.surface,
                color:
                  backendState ===
                  "checking"
                    ? COLORS.subtle
                    : COLORS.accent,
                fontSize: 9,
                fontWeight: 750,
                cursor:
                  backendState ===
                  "checking"
                    ? "wait"
                    : "pointer",
                opacity:
                  backendState ===
                  "checking"
                    ? 0.72
                    : 1,
              }}
            >
              <RefreshCw
                size={13}
              />

              {backendState ===
              "checking"
                ? "CHECKING API"
                : "CHECK BACKEND"}
            </button>
          </div>


          {/* ================================================= */}
          {/* ENVIRONMENT TRUTH STRIP                           */}
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
            <TruthCard
              label="Backend status"
              value={
                backendLabel
              }
              detail="Live /health check"
              tone={
                backendState ===
                "online"
                  ? "success"
                  : backendState ===
                      "offline"
                    ? "error"
                    : "warning"
              }
            />

            <TruthCard
              label="Payment environment"
              value="Razorpay Test Mode"
              detail="Configured · not health-checked here"
              tone="neutral"
            />

            <TruthCard
              label="AI role"
              value="Explanation only"
              detail="Provider availability not inferred"
              tone="neutral"
            />
          </div>


          {/* ================================================= */}
          {/* ENVIRONMENT                                       */}
          {/* ================================================= */}

          <SectionTitle
            detail="Only Backend API reports live reachability"
          >
            ENVIRONMENT
          </SectionTitle>


          <div
            className="settings-status-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <StatusCard
              icon={
                <Server
                  size={17}
                />
              }
              label="Backend API"
              value={
                backendLabel
              }
              description={
                API_BASE_URL
              }
              status={
                backendState
              }
              statusText={
                backendState ===
                "online"
                  ? "HEALTH CHECK PASSED"
                  : backendState ===
                      "checking"
                    ? "CHECKING"
                    : "HEALTH CHECK FAILED"
              }
            />


            <StatusCard
              icon={
                <CreditCard
                  size={17}
                />
              }
              label="Payment Gateway"
              value="Razorpay Test Mode"
              description="Test-mode integration is configured. This card does not claim current gateway availability."
              status="configured"
              statusText="CONFIGURED"
            />


            <StatusCard
              icon={
                <BrainCircuit
                  size={17}
                />
              }
              label="AI Provider"
              value="GroqCloud"
              description="Configured for grounded operator-facing explanations. Availability is not inferred from backend health."
              status="configured"
              statusText="CONFIGURED"
            />
          </div>


          {/* ================================================= */}
          {/* AI SAFETY BOUNDARY                                */}
          {/* ================================================= */}

          <SectionTitle
            detail="Deterministic core remains authoritative"
          >
            AI SAFETY BOUNDARY
          </SectionTitle>


          <div
            style={{
              padding: 19,
              marginBottom: 22,
              borderRadius: 16,
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
                alignItems:
                  "flex-start",
                gap: 20,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 11,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    display: "grid",
                    placeItems:
                      "center",
                    flexShrink: 0,
                    borderRadius: 11,
                    background:
                      "rgba(229,220,199,0.045)",
                    color:
                      COLORS.accent,
                  }}
                >
                  <BrainCircuit
                    size={18}
                  />
                </div>


                <div>
                  <strong
                    style={{
                      color:
                        COLORS.text,
                      fontSize: 13,
                    }}
                  >
                    Explanation-only AI
                  </strong>

                  <div
                    style={{
                      marginTop: 4,
                      color:
                        COLORS.subtle,
                      fontSize: 10,
                    }}
                  >
                    AI assists reasoning visibility, not execution authority
                  </div>
                </div>
              </div>


              <span
                style={{
                  padding:
                    "6px 9px",
                  borderRadius: 999,
                  border:
                    `1px solid ${COLORS.border}`,
                  background:
                    "rgba(255,255,255,0.018)",
                  color:
                    COLORS.accent,
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing:
                    "0.08em",
                }}
              >
                DETERMINISTIC BOUNDARY
              </span>
            </div>


            <div
              className="settings-boundary-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <BoundaryItem
                mode="allowed"
              >
                Generate grounded diagnosis
                and explanation
              </BoundaryItem>

              <BoundaryItem
                mode="allowed"
              >
                Explain recovery rationale
              </BoundaryItem>

              <BoundaryItem
                mode="blocked"
              >
                Cannot override guardrails
              </BoundaryItem>

              <BoundaryItem
                mode="blocked"
              >
                Cannot authorize execution
              </BoundaryItem>

              <BoundaryItem
                mode="blocked"
              >
                Cannot mark payment successful
              </BoundaryItem>

              <BoundaryItem
                mode="blocked"
              >
                Cannot bypass verification
              </BoundaryItem>
            </div>
          </div>


          {/* ================================================= */}
          {/* SECURITY & SECRETS                                */}
          {/* ================================================= */}

          <SectionTitle
            detail="Client interface exposes no secret values"
          >
            SECURITY & SECRETS
          </SectionTitle>


          <div
            style={{
              padding: 19,
              marginBottom: 22,
              borderRadius: 16,
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
                  "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 35,
                  height: 35,
                  display:
                    "grid",
                  placeItems:
                    "center",
                  flexShrink: 0,
                  borderRadius: 10,
                  background:
                    "rgba(147,134,106,0.06)",
                  color:
                    COLORS.gold,
                }}
              >
                <LockKeyhole
                  size={17}
                />
              </div>


              <div>
                <strong
                  style={{
                    color:
                      COLORS.text,
                    fontSize: 12,
                  }}
                >
                  Credentials stay server-side
                </strong>


                <p
                  style={{
                    maxWidth: 800,
                    margin:
                      "7px 0 0",
                    color:
                      COLORS.muted,
                    fontSize: 11,
                    lineHeight: 1.65,
                  }}
                >
                  RecoverAI does not expose
                  GroqCloud API keys,
                  Razorpay secrets,
                  webhook secrets, or
                  backend-only Supabase
                  credentials in the frontend
                  Settings interface.
                </p>
              </div>
            </div>
          </div>


          {/* ================================================= */}
          {/* EXECUTION MODEL                                   */}
          {/* ================================================= */}

          <SectionTitle
            detail="Financial actions remain constrained and verified"
          >
            EXECUTION MODEL
          </SectionTitle>


          <div
            className="settings-execution-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            <ExecutionStep
              number="01"
              title="Decide"
              detail="Deterministic recovery rules"
            />

            <ExecutionStep
              number="02"
              title="Guard"
              detail="Authoritative safety checks"
              highlighted
            />

            <ExecutionStep
              number="03"
              title="Execute"
              detail="Only after authorization"
            />

            <ExecutionStep
              number="04"
              title="Verify"
              detail="Independent result validation"
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
              This Settings view is
              intentionally read-only for
              the current Buildathon
              environment. Financial safety
              thresholds are enforced by
              the backend rather than
              editable client-side controls.
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}


// =========================================================
// TRUTH CARD
// =========================================================

function TruthCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone:
    | "success"
    | "warning"
    | "error"
    | "neutral";
}) {
  const palette = {
    success: {
      value:
        COLORS.success,
      border:
        "rgba(167,187,134,0.12)",
      background:
        "rgba(167,187,134,0.03)",
    },

    warning: {
      value:
        COLORS.warning,
      border:
        "rgba(199,181,141,0.12)",
      background:
        "rgba(199,181,141,0.03)",
    },

    error: {
      value:
        COLORS.error,
      border:
        "rgba(201,123,116,0.14)",
      background:
        "rgba(201,123,116,0.03)",
    },

    neutral: {
      value:
        COLORS.accent,
      border:
        COLORS.border,
      background:
        "rgba(255,255,255,0.018)",
    },
  }[tone];

  return (
    <div
      style={{
        minHeight: 58,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "space-between",
        gap: 12,
        padding:
          "10px 13px",
        borderRadius: 12,
        border:
          `1px solid ${palette.border}`,
        background:
          palette.background,
      }}
    >
      <div>
        <div
          style={{
            color:
              COLORS.subtle,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing:
              "0.04em",
            textTransform:
              "uppercase",
          }}
        >
          {label}
        </div>

        <strong
          style={{
            display: "block",
            marginTop: 4,
            color:
              palette.value,
            fontSize: 11,
          }}
        >
          {value}
        </strong>
      </div>

      <span
        style={{
          maxWidth: 150,
          color:
            COLORS.subtle,
          fontSize: 8,
          lineHeight: 1.45,
          textAlign: "right",
        }}
      >
        {detail}
      </span>
    </div>
  );
}


// =========================================================
// SECTION TITLE
// =========================================================

function SectionTitle({
  children,
  detail,
}: {
  children: ReactNode;
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
        {children}
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
// STATUS CARD
// =========================================================

function StatusCard({
  icon,
  label,
  value,
  description,
  status,
  statusText,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  status:
    IntegrationState;
  statusText: string;
}) {
  const tone =
    status === "online"
      ? {
          color:
            COLORS.success,
          border:
            "rgba(167,187,134,0.14)",
          background:
            "rgba(167,187,134,0.035)",
        }
      : status === "offline"
        ? {
            color:
              COLORS.error,
            border:
              "rgba(201,123,116,0.16)",
            background:
              "rgba(201,123,116,0.035)",
          }
        : status === "checking"
          ? {
              color:
                COLORS.warning,
              border:
                "rgba(199,181,141,0.14)",
              background:
                "rgba(199,181,141,0.03)",
            }
          : {
              color:
                COLORS.gold,
              border:
                COLORS.border,
              background:
                COLORS.surface,
            };

  return (
    <div
      style={{
        minHeight: 155,
        padding: 17,
        borderRadius: 15,
        border:
          `1px solid ${tone.border}`,
        background:
          tone.background,
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
            width: 35,
            height: 35,
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


        <span
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: 5,
            padding:
              "4px 7px",
            borderRadius: 999,
            border:
              `1px solid ${tone.color}2A`,
            color:
              tone.color,
            fontSize: 7,
            fontWeight: 800,
            letterSpacing:
              "0.06em",
          }}
        >
          {status ===
          "checking" ? (
            <RefreshCw
              size={10}
            />
          ) : status ===
            "offline" ? (
            <AlertTriangle
              size={10}
            />
          ) : status ===
            "online" ? (
            <CheckCircle2
              size={10}
            />
          ) : (
            <ShieldCheck
              size={10}
            />
          )}

          {statusText}
        </span>
      </div>


      <div
        style={{
          marginTop: 14,
          color:
            COLORS.subtle,
          fontSize: 9,
        }}
      >
        {label}
      </div>


      <strong
        style={{
          display: "block",
          marginTop: 5,
          color:
            status ===
            "offline"
              ? COLORS.error
              : status ===
                  "checking"
                ? COLORS.warning
                : COLORS.text,
          fontSize: 12,
        }}
      >
        {value}
      </strong>


      <div
        style={{
          marginTop: 7,
          color:
            COLORS.subtle,
          fontSize: 9,
          lineHeight: 1.55,
          wordBreak:
            "break-word",
        }}
      >
        {description}
      </div>
    </div>
  );
}


// =========================================================
// BOUNDARY ITEM
// =========================================================

function BoundaryItem({
  children,
  mode,
}: {
  children: ReactNode;
  mode:
    | "allowed"
    | "blocked";
}) {
  const color =
    mode ===
    "allowed"
      ? COLORS.success
      : COLORS.error;

  return (
    <div
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: 8,
        padding:
          "10px 11px",
        borderRadius: 9,
        border:
          `1px solid ${color}1F`,
        background:
          `${color}08`,
        color:
          COLORS.muted,
        fontSize: 10,
      }}
    >
      {mode ===
      "allowed" ? (
        <CheckCircle2
          size={13}
          color={
            color
          }
        />
      ) : (
        <ShieldCheck
          size={13}
          color={
            color
          }
        />
      )}

      {children}
    </div>
  );
}


// =========================================================
// EXECUTION STEP
// =========================================================

function ExecutionStep({
  number,
  title,
  detail,
  highlighted = false,
}: {
  number: string;
  title: string;
  detail: string;
  highlighted?: boolean;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        border:
          highlighted
            ? "1px solid rgba(147,134,106,0.18)"
            : `1px solid ${COLORS.border}`,
        background:
          highlighted
            ? "rgba(147,134,106,0.045)"
            : COLORS.surface,
      }}
    >
      <span
        style={{
          color:
            COLORS.gold,
          fontSize: 9,
          fontWeight: 800,
        }}
      >
        {number}
      </span>


      <strong
        style={{
          display: "block",
          marginTop: 10,
          color:
            highlighted
              ? COLORS.accent
              : COLORS.text,
          fontSize: 12,
        }}
      >
        {title}
      </strong>


      <div
        style={{
          marginTop: 5,
          color:
            COLORS.subtle,
          fontSize: 9,
          lineHeight: 1.5,
        }}
      >
        {detail}
      </div>
    </div>
  );
}
