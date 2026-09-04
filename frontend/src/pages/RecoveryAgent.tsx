import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  Activity,
  Bot,
  CheckCircle2,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AgentReplay from "../components/agent/AgentReplay";

import {
  PanelSkeleton,
  StatePanel,
} from "../components/ui/SystemState";

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


const PIPELINE_STAGES = [
  "DETECT",
  "CLASSIFY",
  "DECIDE",
  "GUARDRAIL",
  "EXECUTE",
  "VERIFY",
] as const;


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


function normalizeStatus(
  status: string,
) {
  return status
    .trim()
    .toLowerCase();
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
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  // =======================================================
  // LOAD BACKEND DATA
  // =======================================================

  const loadAgentData =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getDashboardData();

          const nextTransactions =
            response.transactions ??
            [];

          setTransactions(
            nextTransactions,
          );

          setActivities(
            response.agent_activity ??
              [],
          );

          setSelectedTransactionId(
            (current) => {
              if (
                current &&
                nextTransactions.some(
                  (transaction) =>
                    transaction.id ===
                    current,
                )
              ) {
                return current;
              }

              return (
                nextTransactions[0]
                  ?.id ?? null
              );
            },
          );
        } catch (err) {
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
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    void loadAgentData();
  }, [
    loadAgentData,
  ]);


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
            .includes(query) ||
          transaction.status
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


  const selectedBlocked =
    selectedTransaction
      ? normalizeStatus(
          selectedTransaction.status,
        ).includes("block")
      : false;


  function clearSearch() {
    setSearch("");
  }


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
                maxWidth: 690,
                margin: 0,
                color:
                  COLORS.muted,
                fontSize: 12,
                lineHeight: 1.65,
              }}
            >
              Inspect the deterministic
              recovery trace, guardrail
              decision, verification path,
              and audit evidence without
              executing a payment.
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
                  `1px solid ${COLORS.border}`,
                background:
                  "rgba(255,255,255,0.018)",
                color:
                  COLORS.subtle,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing:
                  "0.08em",
              }}
            >
              <ShieldCheck
                size={11}
              />

              READ-ONLY REPLAY
            </div>
          </div>


          {/* ================================================= */}
          {/* SYSTEM TRUTH STRIP                                */}
          {/* ================================================= */}

          <div
            className="recovery-agent-status-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <StatusCard
              icon={
                <Bot size={15} />
              }
              label="Decision Engine"
              value="Deterministic"
            />

            <StatusCard
              icon={
                <ShieldCheck
                  size={15}
                />
              }
              label="Safety Authority"
              value="Guardrails"
            />

            <StatusCard
              icon={
                <Activity
                  size={15}
                />
              }
              label="Audit Mode"
              value="Replay only"
            />
          </div>


          {/* ================================================= */}
          {/* MAIN STATES / CONTENT                             */}
          {/* ================================================= */}

          {loading ? (
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
              <PanelSkeleton />
              <PanelSkeleton />
            </div>
          ) : error ? (
            <StatePanel
              kind="error"
              title="Unable to load Recovery Agent"
              description={
                error
              }
              actionLabel="Retry"
              onAction={() => {
                void loadAgentData();
              }}
            />
          ) : transactions.length ===
            0 ? (
            <StatePanel
              kind="empty"
              title="No recovery traces available"
              description="Recovery traces will become available when failed transactions exist."
            />
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
              {/* LEFT INVESTIGATION COLUMN                     */}
              {/* ============================================= */}

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                {/* RECOVERY QUEUE */}

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
                      padding:
                        "15px 16px",
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
                          "center",
                        gap: 10,
                        marginBottom: 11,
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
                              "0.12em",
                          }}
                        >
                          RECOVERY QUEUE
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
                          Select a transaction
                        </div>
                      </div>

                      <span
                        style={{
                          padding:
                            "4px 7px",
                          borderRadius: 999,
                          border:
                            `1px solid ${COLORS.border}`,
                          color:
                            COLORS.subtle,
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {
                          transactions.length
                        }
                      </span>
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
                      maxHeight: 410,
                      overflowY:
                        "auto",
                    }}
                  >
                    {filteredTransactions.length ===
                    0 ? (
                      <div
                        style={{
                          padding: 14,
                        }}
                      >
                        <StatePanel
                          kind="no-results"
                          compact
                          title="No matching transaction"
                          description="Try a different transaction ID, failure, action, or status."
                          actionLabel="Clear search"
                          onAction={
                            clearSearch
                          }
                        />
                      </div>
                    ) : (
                      filteredTransactions.map(
                        (
                          transaction,
                        ) => {
                          const active =
                            transaction.id ===
                            selectedTransactionId;

                          const blocked =
                            normalizeStatus(
                              transaction.status,
                            ).includes(
                              "block",
                            );

                          const recovered =
                            normalizeStatus(
                              transaction.status,
                            ) ===
                            "recovered";

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
                                  "13px 16px",
                                border:
                                  "none",
                                borderBottom:
                                  `1px solid ${COLORS.borderSoft}`,
                                boxShadow:
                                  blocked
                                    ? "inset 2px 0 0 rgba(201,123,116,0.34)"
                                    : active
                                      ? "inset 2px 0 0 rgba(229,220,199,0.25)"
                                      : "none",
                                textAlign:
                                  "left",
                                background:
                                  active
                                    ? blocked
                                      ? "rgba(201,123,116,0.055)"
                                      : "rgba(229,220,199,0.045)"
                                    : blocked
                                      ? "rgba(201,123,116,0.022)"
                                      : "transparent",
                                color:
                                  COLORS.text,
                                cursor:
                                  "pointer",
                                transition:
                                  "background 160ms ease",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  alignItems:
                                    "center",
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
                                  alignItems:
                                    "center",
                                  gap: 10,
                                  marginTop: 8,
                                }}
                              >
                                <span
                                  style={{
                                    color:
                                      blocked
                                        ? COLORS.error
                                        : COLORS.subtle,
                                    fontSize: 9,
                                    fontWeight:
                                      blocked
                                        ? 700
                                        : 500,
                                  }}
                                >
                                  Retry{" "}
                                  {
                                    transaction.retry_count
                                  }
                                </span>

                                <span
                                  style={{
                                    display:
                                      "inline-flex",
                                    alignItems:
                                      "center",
                                    gap: 4,
                                    color:
                                      blocked
                                        ? COLORS.error
                                        : recovered
                                          ? COLORS.success
                                          : COLORS.warning,
                                    fontSize: 8,
                                    fontWeight: 800,
                                    letterSpacing:
                                      "0.05em",
                                    textTransform:
                                      "uppercase",
                                  }}
                                >
                                  {blocked ? (
                                    <ShieldAlert
                                      size={9}
                                    />
                                  ) : recovered ? (
                                    <CheckCircle2
                                      size={9}
                                    />
                                  ) : null}

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


                {/* SELECTED CONTEXT */}

                {selectedTransaction ? (
                  <SelectedContextCard
                    transaction={
                      selectedTransaction
                    }
                    blocked={
                      selectedBlocked
                    }
                  />
                ) : (
                  <StatePanel
                    kind="no-selection"
                    compact
                    title="No transaction selected"
                    description="Choose a transaction above to inspect its recovery context."
                  />
                )}


                {/* SAFETY BOUNDARY */}

                <SafetyBoundaryCard />
              </div>


              {/* ============================================= */}
              {/* RIGHT REPLAY COLUMN                           */}
              {/* ============================================= */}

              <div
                style={{
                  minWidth: 0,
                }}
              >
                {!selectedTransaction ? (
                  <StatePanel
                    kind="no-selection"
                    title="Select a recovery transaction"
                    description="Choose a transaction from the queue to inspect its decision and audit trace."
                  />
                ) : (
                  <>
                    {/* SELECTED RECOVERY HEADER */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: 18,
                        padding:
                          "14px 16px",
                        marginBottom: 10,
                        borderRadius: 14,
                        border:
                          selectedBlocked
                            ? "1px solid rgba(201,123,116,0.16)"
                            : `1px solid ${COLORS.border}`,
                        background:
                          selectedBlocked
                            ? "rgba(201,123,116,0.025)"
                            : COLORS.surface,
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color:
                              selectedBlocked
                                ? COLORS.error
                                : COLORS.gold,
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing:
                              "0.12em",
                          }}
                        >
                          {selectedBlocked
                            ? "GUARDRAIL-BLOCKED RECOVERY"
                            : "SELECTED RECOVERY"}
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

                        <div
                          style={{
                            marginTop: 4,
                            color:
                              COLORS.subtle,
                            fontSize: 9,
                          }}
                        >
                          {formatLabel(
                            selectedTransaction.failure_code,
                          )}{" "}
                          · Retry{" "}
                          {
                            selectedTransaction.retry_count
                          }
                        </div>
                      </div>


                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 18,
                          flexWrap:
                            "wrap",
                        }}
                      >
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

                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: 5,
                            padding:
                              "6px 8px",
                            borderRadius: 999,
                            border:
                              selectedBlocked
                                ? "1px solid rgba(201,123,116,0.18)"
                                : `1px solid ${COLORS.border}`,
                            background:
                              selectedBlocked
                                ? "rgba(201,123,116,0.055)"
                                : "rgba(255,255,255,0.018)",
                            color:
                              selectedBlocked
                                ? COLORS.error
                                : COLORS.accent,
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing:
                              "0.06em",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {selectedBlocked ? (
                            <ShieldAlert
                              size={10}
                            />
                          ) : (
                            <ShieldCheck
                              size={10}
                            />
                          )}

                          {formatLabel(
                            selectedTransaction.status,
                          )}
                        </span>
                      </div>
                    </div>


                    {/* PIPELINE MAP */}

                    <div
                      style={{
                        padding:
                          "12px 14px",
                        marginBottom: 10,
                        borderRadius: 14,
                        border:
                          `1px solid ${COLORS.border}`,
                        background:
                          "rgba(255,255,255,0.014)",
                        overflowX:
                          "auto",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: 10,
                          color:
                            COLORS.subtle,
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing:
                            "0.11em",
                        }}
                      >
                        RECOVERY DECISION PATH
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(11, auto)",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: 7,
                          minWidth: 650,
                        }}
                      >
                        {PIPELINE_STAGES.map(
                          (
                            stage,
                            index,
                          ) => (
                            <div
                              key={
                                stage
                              }
                              style={{
                                display:
                                  "contents",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  minHeight: 29,
                                  padding:
                                    "0 9px",
                                  borderRadius: 9,
                                  border:
                                    stage ===
                                      "GUARDRAIL"
                                      ? "1px solid rgba(147,134,106,0.20)"
                                      : `1px solid ${COLORS.border}`,
                                  background:
                                    stage ===
                                      "GUARDRAIL"
                                      ? "rgba(147,134,106,0.055)"
                                      : COLORS.surface,
                                  color:
                                    stage ===
                                      "GUARDRAIL"
                                      ? COLORS.accent
                                      : COLORS.muted,
                                  fontSize: 8,
                                  fontWeight: 800,
                                  letterSpacing:
                                    "0.07em",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {stage}
                              </div>

                              {index <
                                PIPELINE_STAGES.length -
                                  1 && (
                                <span
                                  style={{
                                    color:
                                      COLORS.subtle,
                                    fontSize: 12,
                                    textAlign:
                                      "center",
                                  }}
                                >
                                  →
                                </span>
                              )}
                            </div>
                          ),
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: 9,
                          color:
                            COLORS.subtle,
                          fontSize: 9,
                          lineHeight: 1.5,
                        }}
                      >
                        Guardrails are
                        authoritative. A
                        blocked trace does
                        not proceed to
                        external execution.
                      </div>
                    </div>


                    {/* AGENT REPLAY */}

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
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: 12,
                          marginBottom: 14,
                          flexWrap:
                            "wrap",
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
                                "0.12em",
                            }}
                          >
                            AGENT REPLAY
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              color:
                                COLORS.muted,
                              fontSize: 10,
                            }}
                          >
                            Read-only audit
                            trace for this
                            transaction
                          </div>
                        </div>

                        <span
                          style={{
                            padding:
                              "5px 8px",
                            borderRadius: 999,
                            border:
                              `1px solid ${COLORS.border}`,
                            color:
                              COLORS.subtle,
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing:
                              "0.06em",
                          }}
                        >
                          NO EXECUTION
                        </span>
                      </div>

                      <AgentReplay
                        transactionId={
                          selectedTransactionId
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}


          {/* ================================================= */}
          {/* RECOVERY ACTIVITY                                 */}
          {/* ================================================= */}

          {!loading &&
            !error && (
              <div
                style={{
                  marginTop: 16,
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
                    marginBottom: 9,
                    flexWrap:
                      "wrap",
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
                    RECOVERY ACTIVITY
                  </div>

                  <span
                    style={{
                      color:
                        COLORS.subtle,
                      fontSize: 9,
                    }}
                  >
                    Dashboard activity feed
                  </span>
                </div>


                {activities.length ===
                0 ? (
                  <StatePanel
                    kind="empty"
                    compact
                    title="No recovery activity yet"
                    description="Recovery activity will appear here when dashboard events are available."
                  />
                ) : (
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
                    {activities.map(
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
                              "76px 180px 1fr",
                            gap: 18,
                            padding:
                              "13px 17px",
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
                    )}
                  </div>
                )}
              </div>
            )}


          {/* ================================================= */}
          {/* SAFETY NOTE                                       */}
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
              Recovery Agent replay is
              read-only. Selecting a
              transaction or viewing its
              trace does not execute or
              retry a payment.
            </span>
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
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: 11,
        padding:
          "13px 14px",
        borderRadius: 14,
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
// SELECTED CONTEXT CARD
// =========================================================

function SelectedContextCard({
  transaction,
  blocked,
}: {
  transaction: Transaction;
  blocked: boolean;
}) {
  return (
    <div
      style={{
        padding:
          "15px 16px",
        borderRadius: 16,
        border:
          blocked
            ? "1px solid rgba(201,123,116,0.15)"
            : `1px solid ${COLORS.border}`,
        background:
          blocked
            ? "rgba(201,123,116,0.025)"
            : COLORS.surface,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              color:
                blocked
                  ? COLORS.error
                  : COLORS.gold,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing:
                "0.12em",
            }}
          >
            SELECTED CONTEXT
          </div>

          <strong
            style={{
              display: "block",
              marginTop: 4,
              color:
                COLORS.text,
              fontSize: 12,
            }}
          >
            {transaction.id}
          </strong>
        </div>

        {blocked ? (
          <ShieldAlert
            size={17}
            color={
              COLORS.error
            }
          />
        ) : (
          <ShieldCheck
            size={17}
            color={
              COLORS.accent
            }
          />
        )}
      </div>


      <ContextRow
        label="Amount"
        value={formatRupees(
          transaction.amount,
        )}
      />

      <ContextRow
        label="Failure"
        value={formatLabel(
          transaction.failure_code,
        )}
      />

      <ContextRow
        label="Retry count"
        value={String(
          transaction.retry_count,
        )}
        danger={
          blocked
        }
      />

      <ContextRow
        label="Agent action"
        value={formatLabel(
          transaction.agent_action,
        )}
      />

      <ContextRow
        label="Current state"
        value={formatLabel(
          transaction.status,
        )}
        danger={
          blocked
        }
        last
      />
    </div>
  );
}


// =========================================================
// SAFETY BOUNDARY CARD
// =========================================================

function SafetyBoundaryCard() {
  return (
    <div
      style={{
        padding:
          "15px 16px",
        borderRadius: 16,
        border:
          `1px solid ${COLORS.border}`,
        background:
          "rgba(255,255,255,0.014)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems:
            "center",
          gap: 8,
          color:
            COLORS.accent,
        }}
      >
        <ShieldCheck
          size={15}
        />

        <strong
          style={{
            fontSize: 11,
          }}
        >
          Safety Boundary
        </strong>
      </div>

      <div
        style={{
          display: "grid",
          gap: 9,
          marginTop: 13,
        }}
      >
        <SafetyLine>
          Replay is read-only.
        </SafetyLine>

        <SafetyLine>
          Guardrails remain authoritative.
        </SafetyLine>

        <SafetyLine>
          AI cannot authorize execution.
        </SafetyLine>

        <SafetyLine>
          Payment success requires verification.
        </SafetyLine>
      </div>
    </div>
  );
}


// =========================================================
// SMALL UI HELPERS
// =========================================================

function ContextRow({
  label,
  value,
  danger = false,
  last = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "flex-start",
        gap: 12,
        padding:
          "9px 0",
        borderBottom:
          last
            ? "none"
            : `1px solid ${COLORS.borderSoft}`,
      }}
    >
      <span
        style={{
          color:
            COLORS.subtle,
          fontSize: 9,
        }}
      >
        {label}
      </span>

      <span
        style={{
          maxWidth: 180,
          color:
            danger
              ? COLORS.error
              : COLORS.text,
          fontSize: 10,
          fontWeight: 650,
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {value}
      </span>
    </div>
  );
}


function SafetyLine({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems:
          "flex-start",
        gap: 8,
        color:
          COLORS.muted,
        fontSize: 10,
        lineHeight: 1.45,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          marginTop: 5,
          borderRadius:
            "50%",
          flexShrink: 0,
          background:
            COLORS.gold,
        }}
      />

      <span>
        {children}
      </span>
    </div>
  );
}
