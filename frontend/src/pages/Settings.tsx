import {
  useEffect,
  useState,
} from "react";

import {
  Settings as SettingsIcon,
  Server,
  BrainCircuit,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LockKeyhole,
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


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000";


type BackendState =
  | "checking"
  | "online"
  | "offline";


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
    checkBackend();
  }, []);


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
                <SettingsIcon
                  size={14}
                />

                SYSTEM CONFIGURATION
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
                Settings
              </h1>


              <p
                style={{
                  maxWidth: 680,

                  margin:
                    "9px 0 0",

                  color:
                    COLORS.muted,

                  fontSize: 13,

                  lineHeight: 1.65,
                }}
              >
                Review the current
                RecoverAI environment,
                integrations, and safety
                boundaries.
              </p>
            </div>


            <button
              type="button"
              onClick={
                checkBackend
              }
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap: 7,

                height: 36,

                padding:
                  "0 12px",

                borderRadius: 9,

                border:
                  `1px solid ${COLORS.border}`,

                background:
                  COLORS.surface,

                color:
                  COLORS.accent,

                fontSize: 9,

                fontWeight: 750,

                cursor:
                  "pointer",
              }}
            >
              <RefreshCw
                size={13}
              />

              CHECK SYSTEM
            </button>
          </div>


          {/* ================================================= */}
          {/* ENVIRONMENT                                       */}
          {/* ================================================= */}

          <SectionTitle>
            ENVIRONMENT
          </SectionTitle>


          <div
            className="settings-status-grid"
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",

              gap: 12,

              marginBottom: 26,
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
                backendState ===
                "online"
                  ? "Online"
                  : backendState ===
                      "checking"
                    ? "Checking..."
                    : "Offline"
              }
              description={
                API_BASE_URL
              }
              status={
                backendState
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
              description="Gateway integration is isolated from real-money production payments."
              status="online"
            />


            <StatusCard
              icon={
                <BrainCircuit
                  size={17}
                />
              }
              label="AI Provider"
              value="GroqCloud"
              description="Used only for grounded operator-facing explanations."
              status="online"
            />
          </div>


          {/* ================================================= */}
          {/* AI CONFIGURATION                                  */}
          {/* ================================================= */}

          <SectionTitle>
            AI SAFETY BOUNDARY
          </SectionTitle>


          <div
            style={{
              padding: 20,

              marginBottom: 26,

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

                marginBottom: 18,

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
                    Deterministic core remains authoritative
                  </div>
                </div>
              </div>


              <span
                style={{
                  padding:
                    "6px 9px",

                  borderRadius: 999,

                  border:
                    "1px solid rgba(167,187,134,0.16)",

                  background:
                    "rgba(167,187,134,0.06)",

                  color:
                    COLORS.success,

                  fontSize: 8,

                  fontWeight: 800,

                  letterSpacing:
                    "0.1em",
                }}
              >
                SAFETY ENFORCED
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
              <BoundaryItem>
                Generate diagnosis and
                explanation
              </BoundaryItem>


              <BoundaryItem>
                Explain recovery rationale
              </BoundaryItem>


              <BoundaryItem>
                Cannot override guardrails
              </BoundaryItem>


              <BoundaryItem>
                Cannot authorize execution
              </BoundaryItem>


              <BoundaryItem>
                Cannot mark payment successful
              </BoundaryItem>


              <BoundaryItem>
                Cannot bypass verification
              </BoundaryItem>
            </div>
          </div>


          {/* ================================================= */}
          {/* SECURITY                                          */}
          {/* ================================================= */}

          <SectionTitle>
            SECURITY & SECRETS
          </SectionTitle>


          <div
            style={{
              padding: 20,

              marginBottom: 26,

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
              <LockKeyhole
                size={18}
                color={
                  COLORS.gold
                }
              />


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
                    maxWidth: 760,

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
                  Supabase credentials in
                  the frontend settings
                  interface.
                </p>
              </div>
            </div>
          </div>


          {/* ================================================= */}
          {/* EXECUTION MODEL                                   */}
          {/* ================================================= */}

          <SectionTitle>
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
            This Settings view is
            intentionally read-only for
            the current Buildathon
            environment. Financial safety
            thresholds are enforced by the
            backend rather than editable
            client-side controls.
          </div>
        </section>
      </main>
    </div>
  );
}


// =========================================================
// SECTION TITLE
// =========================================================

function SectionTitle({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
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
      {children}
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
}: {
  icon:
    React.ReactNode;

  label: string;

  value: string;

  description: string;

  status:
    BackendState;
}) {
  const healthy =
    status === "online";


  return (
    <div
      style={{
        minHeight: 145,

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


        {status ===
        "checking" ? (
          <RefreshCw
            size={14}
            color={
              COLORS.warning
            }
          />
        ) : healthy ? (
          <CheckCircle2
            size={14}
            color={
              COLORS.success
            }
          />
        ) : (
          <AlertTriangle
            size={14}
            color={
              COLORS.error
            }
          />
        )}
      </div>


      <div
        style={{
          marginTop: 15,

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
            healthy
              ? COLORS.text
              : status ===
                  "checking"
                ? COLORS.warning
                : COLORS.error,

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
}: {
  children:
    React.ReactNode;
}) {
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
          `1px solid ${COLORS.borderSoft}`,

        color:
          COLORS.muted,

        fontSize: 10,
      }}
    >
      <ShieldCheck
        size={13}
        color={
          COLORS.success
        }
      />

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
}: {
  number: string;

  title: string;

  detail: string;
}) {
  return (
    <div
      style={{
        padding: 16,

        borderRadius: 14,

        border:
          `1px solid ${COLORS.border}`,

        background:
          COLORS.surface,
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
            COLORS.text,

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