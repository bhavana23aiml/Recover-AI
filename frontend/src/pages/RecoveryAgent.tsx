import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bot,
  Activity,
  ShieldCheck,
  Search,
  CircleDot,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AgentReplay from "../components/agent/AgentReplay";

import {
  getDashboardData,
} from "../services/dashboardApi";

import type {
  AgentActivity,
  Transaction,
} from "../types/dashboard";


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


// =========================================================
// HELPERS
// =========================================================

function formatLabel(
  value: string,
) {
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


function formatRupees(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,
    },
  ).format(value);
}


// =========================================================
// PAGE
// =========================================================

export default function RecoveryAgent() {
  const [
    transactions,
    setTransactions,
  ] =
    useState<Transaction[]>(
      [],
    );

  const [
    activities,
    setActivities,
  ] =
    useState<AgentActivity[]>(
      [],
    );

  const [
    selectedTransactionId,
    setSelectedTransactionId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  // =======================================================
  // LOAD REAL BACKEND DATA
  // =======================================================

  useEffect(() => {
    let active = true;

    async function loadAgentData() {
      try {
        setLoading(true);

        const response =
          await getDashboardData();

        if (!active) {
          return;
        }

        setTransactions(
          response.transactions,
        );

        setActivities(
          response.agent_activity,
        );

        if (
          response.transactions
            .length > 0
        ) {
          setSelectedTransactionId(
            response.transactions[0]
              .id,
          );
        }

        setError(null);
      } catch (err) {
        if (!active) {
          return;
        }

        console.error(
          "Recovery Agent API error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Recovery Agent.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAgentData();

    return () => {
      active = false;
    };
  }, []);


  // =======================================================
  // FILTER
  // =======================================================

  const filteredTransactions =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return transactions;
      }

      return transactions.filter(
        (transaction) =>
          transaction.id
            .toLowerCase()
            .includes(query) ||
          transaction.failure_code
            .toLowerCase()
            .includes(query) ||
          transaction.failure_reason
            .toLowerCase()
            .includes(query) ||
          transaction.agent_action
            .toLowerCase()
            .includes(query),
      );
    }, [
      transactions,
      search,
    ]);


  const selectedTransaction =
    transactions.find(
      (transaction) =>
        transaction.id ===
        selectedTransactionId,
    ) ?? null;


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
                <Bot
                  size={14}
                />

                AUTONOMOUS RECOVERY
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
                Recovery Agent
              </h1>


              <p
                style={{
                  maxWidth: 650,

                  margin:
                    "9px 0 0",

                  color:
                    COLORS.muted,

                  fontSize: 13,

                  lineHeight: 1.65,
                }}
              >
                Inspect RecoverAI's
                deterministic decision
                trace, safety controls,
                and recovery activity.
              </p>
            </div>


            <div
              style={{
                display: "flex",

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
              <CircleDot
                size={11}
              />

              AGENT ONLINE
            </div>
          </div>


          {/* ================================================= */}
          {/* SAFETY STRIP                                      */}
          {/* ================================================= */}

          <div
            className="recovery-agent-status-grid"
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",

              gap: 12,

              marginBottom: 18,
            }}
          >
            <StatusCard
              icon={
                <Bot
                  size={16}
                />
              }
              label="Decision Engine"
              value="Deterministic"
            />


            <StatusCard
              icon={
                <ShieldCheck
                  size={16}
                />
              }
              label="Safety Layer"
              value="Guardrails Active"
            />


            <StatusCard
              icon={
                <Activity
                  size={16}
                />
              }
              label="Audit Mode"
              value="Replay Enabled"
            />
          </div>


          {/* ================================================= */}
          {/* MAIN CONTENT                                      */}
          {/* ================================================= */}

          {loading ? (
            <StatePanel>
              Loading Recovery Agent...
            </StatePanel>
          ) : error ? (
            <StatePanel>
              {error}
            </StatePanel>
          ) : (
            <div
              className="recovery-agent-layout"
              style={{
                display: "grid",

                gridTemplateColumns:
                  "320px minmax(0, 1fr)",

                gap: 18,

                alignItems:
                  "start",
              }}
            >
              {/* ============================================= */}
              {/* TRANSACTION SELECTOR                          */}
              {/* ============================================= */}

              <div
                style={{
                  borderRadius: 16,

                  border:
                    `1px solid ${COLORS.border}`,

                  background:
                    COLORS.surface,

                  overflow:
                    "hidden",
                }}
              >
                <div
                  style={{
                    padding: 16,

                    borderBottom:
                      `1px solid ${COLORS.borderSoft}`,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 12,

                      color:
                        COLORS.text,

                      fontSize: 12,

                      fontWeight: 700,
                    }}
                  >
                    Recovery Queue
                  </div>


                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <Search
                      size={14}
                      style={{
                        position:
                          "absolute",

                        top: "50%",

                        left: 11,

                        transform:
                          "translateY(-50%)",

                        color:
                          COLORS.subtle,
                      }}
                    />


                    <input
                      value={search}
                      onChange={(
                        event,
                      ) =>
                        setSearch(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Search transaction..."
                      style={{
                        width: "100%",

                        boxSizing:
                          "border-box",

                        height: 38,

                        padding:
                          "0 11px 0 34px",

                        borderRadius: 9,

                        border:
                          `1px solid ${COLORS.border}`,

                        outline:
                          "none",

                        background:
                          COLORS.elevated,

                        color:
                          COLORS.text,

                        fontSize: 11,
                      }}
                    />
                  </div>
                </div>


                <div
                  style={{
                    maxHeight: 540,

                    overflowY:
                      "auto",
                  }}
                >
                  {filteredTransactions.length ===
                  0 ? (
                    <div
                      style={{
                        padding: 20,

                        color:
                          COLORS.subtle,

                        fontSize: 10,

                        textAlign:
                          "center",
                      }}
                    >
                      No matching
                      transactions.
                    </div>
                  ) : (
                    filteredTransactions.map(
                      (
                        transaction,
                      ) => {
                        const active =
                          transaction.id ===
                          selectedTransactionId;

                        return (
                          <button
                            key={
                              transaction.id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedTransactionId(
                                transaction.id,
                              )
                            }
                            style={{
                              width:
                                "100%",

                              display:
                                "block",

                              padding:
                                "14px 16px",

                              border:
                                "none",

                              borderBottom:
                                `1px solid ${COLORS.borderSoft}`,

                              textAlign:
                                "left",

                              background:
                                active
                                  ? "rgba(229,220,199,0.045)"
                                  : "transparent",

                              color:
                                COLORS.text,

                              cursor:
                                "pointer",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                justifyContent:
                                  "space-between",

                                gap: 12,
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: 11,
                                }}
                              >
                                {
                                  transaction.id
                                }
                              </strong>


                              <span
                                style={{
                                  color:
                                    COLORS.accent,

                                  fontSize: 10,

                                  fontWeight: 700,
                                }}
                              >
                                {formatRupees(
                                  transaction.amount,
                                )}
                              </span>
                            </div>


                            <div
                              style={{
                                marginTop: 6,

                                color:
                                  COLORS.muted,

                                fontSize: 10,
                              }}
                            >
                              {formatLabel(
                                transaction.failure_code,
                              )}
                            </div>


                            <div
                              style={{
                                display:
                                  "flex",

                                justifyContent:
                                  "space-between",

                                gap: 10,

                                marginTop: 6,

                                color:
                                  COLORS.subtle,

                                fontSize: 9,
                              }}
                            >
                              <span>
                                Retry{" "}
                                {
                                  transaction.retry_count
                                }
                              </span>


                              <span>
                                {formatLabel(
                                  transaction.status,
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      },
                    )
                  )}
                </div>
              </div>


              {/* ============================================= */}
              {/* AGENT REPLAY                                  */}
              {/* ============================================= */}

              <div
                style={{
                  minWidth: 0,
                }}
              >
                {selectedTransaction && (
                  <div
                    style={{
                      display: "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",

                      gap: 18,

                      padding:
                        "15px 17px",

                      marginBottom: 12,

                      borderRadius: 14,

                      border:
                        `1px solid ${COLORS.border}`,

                      background:
                        COLORS.surface,

                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color:
                            COLORS.subtle,

                          fontSize: 9,

                          fontWeight: 800,

                          letterSpacing:
                            "0.12em",
                        }}
                      >
                        SELECTED RECOVERY
                      </div>


                      <strong
                        style={{
                          display:
                            "block",

                          marginTop: 5,

                          color:
                            COLORS.text,

                          fontSize: 14,
                        }}
                      >
                        {
                          selectedTransaction.id
                        }
                      </strong>
                    </div>


                    <div
                      style={{
                        textAlign:
                          "right",
                      }}
                    >
                      <div
                        style={{
                          color:
                            COLORS.text,

                          fontSize: 13,

                          fontWeight: 700,
                        }}
                      >
                        {formatRupees(
                          selectedTransaction.amount,
                        )}
                      </div>


                      <div
                        style={{
                          marginTop: 4,

                          color:
                            COLORS.subtle,

                          fontSize: 9,
                        }}
                      >
                        {formatLabel(
                          selectedTransaction.agent_action,
                        )}
                      </div>
                    </div>
                  </div>
                )}


                <div
                  style={{
                    padding: 18,

                    borderRadius: 16,

                    border:
                      `1px solid ${COLORS.border}`,

                    background:
                      COLORS.surface,

                    overflowX:
                      "auto",
                  }}
                >
                  <AgentReplay
                    transactionId={
                      selectedTransactionId
                    }
                  />
                </div>
              </div>
            </div>
          )}


          {/* ================================================= */}
          {/* RECENT AGENT ACTIVITY                             */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: 26,
            }}
          >
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
              RECENT AGENT ACTIVITY
            </div>


            <div
              style={{
                borderRadius: 16,

                border:
                  `1px solid ${COLORS.border}`,

                background:
                  COLORS.surface,

                overflow:
                  "hidden",
              }}
            >
              {activities.length ===
              0 ? (
                <div
                  style={{
                    padding: 22,

                    color:
                      COLORS.subtle,

                    fontSize: 11,
                  }}
                >
                  No agent activity
                  available.
                </div>
              ) : (
                activities.map(
                  (
                    activity,
                    index,
                  ) => (
                    <div
                      key={`${activity.time}-${index}`}
                      className="recovery-agent-activity-row"
                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "80px 180px 1fr",

                        gap: 18,

                        padding:
                          "14px 17px",

                        borderBottom:
                          index ===
                          activities.length -
                            1
                            ? "none"
                            : `1px solid ${COLORS.borderSoft}`,
                      }}
                    >
                      <span
                        style={{
                          color:
                            COLORS.subtle,

                          fontSize: 10,
                        }}
                      >
                        {
                          activity.time
                        }
                      </span>


                      <strong
                        style={{
                          color:
                            COLORS.text,

                          fontSize: 11,
                        }}
                      >
                        {
                          activity.title
                        }
                      </strong>


                      <span
                        style={{
                          color:
                            COLORS.muted,

                          fontSize: 11,

                          lineHeight: 1.5,
                        }}
                      >
                        {
                          activity.detail
                        }
                      </span>
                    </div>
                  ),
                )
              )}
            </div>
          </div>


          {/* ================================================= */}
          {/* SAFETY NOTE                                       */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: 14,

              color:
                COLORS.subtle,

              fontSize: 10,

              lineHeight: 1.6,
            }}
          >
            Recovery Agent replay is
            read-only. Viewing an audit
            trace does not execute or
            retry a payment.
          </div>
        </section>
      </main>
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
}: {
  icon: React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",

        alignItems:
          "center",

        gap: 12,

        padding:
          "15px 16px",

        borderRadius: 14,

        border:
          `1px solid ${COLORS.border}`,

        background:
          COLORS.surface,
      }}
    >
      <div
        style={{
          width: 34,

          height: 34,

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


      <div>
        <div
          style={{
            color:
              COLORS.subtle,

            fontSize: 9,

            marginBottom: 4,
          }}
        >
          {label}
        </div>


        <strong
          style={{
            color:
              COLORS.text,

            fontSize: 11,
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}


// =========================================================
// STATE PANEL
// =========================================================

function StatePanel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 42,

        borderRadius: 16,

        border:
          `1px solid ${COLORS.border}`,

        background:
          COLORS.surface,

        color:
          COLORS.muted,

        textAlign:
          "center",

        fontSize: 12,
      }}
    >
      {children}
    </div>
  );
}