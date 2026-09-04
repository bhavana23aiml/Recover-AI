import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  RotateCcw,
  Search,
  ShieldAlert,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import DecisionDrawer from "../components/transactions/DecisionDrawer";

import {
  StatePanel,
  TableSkeleton,
} from "../components/ui/SystemState";

import {
  getDashboardData,
} from "../services/dashboardApi";

import {
  executeRecovery,
} from "../services/recoveryApi";

import {
  mapRecoveryResponseToDrawer,
} from "../types/recovery";

import type {
  FailureCode,
  RecoveryDecisionDrawerData,
} from "../types/recovery";

import type {
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


// =========================================================
// HELPERS
// =========================================================

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


function normalizeStatus(
  status: string,
) {
  return status
    .trim()
    .toLowerCase();
}


function getStatusStyle(
  status: string,
) {
  const normalized =
    normalizeStatus(status);

  if (
    normalized === "recovered" ||
    normalized.includes("success")
  ) {
    return {
      color: COLORS.success,
      background: "rgba(167,187,134,0.07)",
      border: "1px solid rgba(167,187,134,0.16)",
    };
  }

  if (
    normalized.includes("block") ||
    normalized.includes("fail") ||
    normalized.includes("stop")
  ) {
    return {
      color: COLORS.error,
      background: "rgba(201,123,116,0.07)",
      border: "1px solid rgba(201,123,116,0.16)",
    };
  }

  return {
    color: COLORS.warning,
    background: "rgba(199,181,141,0.07)",
    border: "1px solid rgba(199,181,141,0.16)",
  };
}


// =========================================================
// PAGE
// =========================================================

export default function Transactions() {
  const [
    transactions,
    setTransactions,
  ] =
    useState<Transaction[]>(
      [],
    );

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
  // SEARCH / FILTER
  // =======================================================

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    failureFilter,
    setFailureFilter,
  ] =
    useState<
      "ALL" | FailureCode
    >("ALL");


  // =======================================================
  // RECOVERY STATE
  // =======================================================

  const [
    executingTransactionId,
    setExecutingTransactionId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    recoveryError,
    setRecoveryError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    decisionData,
    setDecisionData,
  ] =
    useState<RecoveryDecisionDrawerData | null>(
      null,
    );

  const [
    drawerOpen,
    setDrawerOpen,
  ] =
    useState(false);


  // =======================================================
  // LOAD BACKEND DATA
  // =======================================================

  const loadTransactions =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getDashboardData();

          setTransactions(
            response.transactions ??
              [],
          );
        } catch (err) {
          console.error(
            "Transactions API error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load transactions.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    void loadTransactions();
  }, [
    loadTransactions,
  ]);


  // =======================================================
  // FAILURE CODE OPTIONS
  // =======================================================

  const failureCodes =
    useMemo(() => {
      return Array.from(
        new Set(
          transactions.map(
            (transaction) =>
              transaction.failure_code,
          ),
        ),
      );
    }, [
      transactions,
    ]);


  // =======================================================
  // FILTERED TRANSACTIONS
  // =======================================================

  const filteredTransactions =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return transactions.filter(
        (transaction) => {
          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            transaction.id
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.failure_reason
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.failure_code
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.agent_action
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.status
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesFailure =
            failureFilter ===
              "ALL" ||
            transaction.failure_code ===
              failureFilter;

          return (
            matchesSearch &&
            matchesFailure
          );
        },
      );
    }, [
      transactions,
      search,
      failureFilter,
    ]);


  // =======================================================
  // STATUS SUMMARY
  // =======================================================

  const statusSummary =
    useMemo(() => {
      const recovered =
        transactions.filter(
          (transaction) =>
            normalizeStatus(
              transaction.status,
            ) ===
            "recovered",
        ).length;

      const blocked =
        transactions.filter(
          (transaction) =>
            normalizeStatus(
              transaction.status,
            ).includes(
              "block",
            ),
        ).length;

      const recovering =
        transactions.filter(
          (transaction) =>
            normalizeStatus(
              transaction.status,
            ) ===
            "recovering",
        ).length;

      const waiting =
        transactions.filter(
          (transaction) =>
            normalizeStatus(
              transaction.status,
            ) ===
            "waiting",
        ).length;

      return {
        recovered,
        blocked,
        recovering,
        waiting,
      };
    }, [
      transactions,
    ]);


  // =======================================================
  // RUN RECOVERY
  // =======================================================

  async function handleRunRecovery(
    transaction: Transaction,
  ) {
    if (
      executingTransactionId
    ) {
      return;
    }

    try {
      setExecutingTransactionId(
        transaction.id,
      );

      setRecoveryError(
        null,
      );

      const response =
        await executeRecovery({
          transaction_id:
            transaction.id,

          amount:
            transaction.amount,

          failure_code:
            transaction.failure_code,

          retry_count:
            transaction.retry_count,
        });

      const drawerData =
        mapRecoveryResponseToDrawer(
          response,
          transaction.retry_count,
        );

      setDecisionData(
        drawerData,
      );

      setDrawerOpen(
        true,
      );
    } catch (err) {
      console.error(
        "Recovery execution error:",
        err,
      );

      setRecoveryError(
        err instanceof Error
          ? err.message
          : "Unable to execute recovery.",
      );
    } finally {
      setExecutingTransactionId(
        null,
      );
    }
  }


  function clearFilters() {
    setSearch("");
    setFailureFilter("ALL");
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
              gap: 20,
              marginBottom: 15,
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                maxWidth: 660,
                margin: 0,
                color:
                  COLORS.muted,
                fontSize: 12,
                lineHeight: 1.65,
              }}
            >
              Inspect failed payments,
              recovery state, retry
              history, and backend
              recovery decisions.
            </p>

            {!loading &&
              !error && (
              <div
                style={{
                  color:
                    COLORS.subtle,
                  fontSize: 11,
                }}
              >
                {
                  filteredTransactions.length
                }{" "}
                shown ·{" "}
                {
                  transactions.length
                }{" "}
                total
              </div>
            )}
          </div>


          {/* ================================================= */}
          {/* STATUS SUMMARY                                    */}
          {/* ================================================= */}

          {!loading &&
            !error &&
            transactions.length >
              0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <SummaryCard
                  label="Recovered"
                  value={
                    statusSummary.recovered
                  }
                  tone="success"
                />

                <SummaryCard
                  label="Recovering"
                  value={
                    statusSummary.recovering
                  }
                  tone="warning"
                />

                <SummaryCard
                  label="Waiting"
                  value={
                    statusSummary.waiting
                  }
                  tone="neutral"
                />

                <SummaryCard
                  label="Blocked safely"
                  value={
                    statusSummary.blocked
                  }
                  tone="error"
                />
              </div>
            )}


          {/* ================================================= */}
          {/* FILTER BAR                                        */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              padding: 11,
              marginBottom: 16,
              borderRadius: 14,
              border:
                `1px solid ${COLORS.border}`,
              background:
                "rgba(255,255,255,0.014)",
            }}
          >
            <div
              style={{
                position:
                  "relative",
                flex:
                  "1 1 320px",
              }}
            >
              <Search
                size={15}
                style={{
                  position:
                    "absolute",
                  top: "50%",
                  left: 13,
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
                placeholder="Search transaction ID, failure, action or status..."
                disabled={
                  loading ||
                  Boolean(error)
                }
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  height: 40,
                  padding:
                    "0 14px 0 38px",
                  borderRadius: 10,
                  border:
                    `1px solid ${COLORS.border}`,
                  outline: "none",
                  background:
                    COLORS.surface,
                  color:
                    COLORS.text,
                  fontSize: 12,
                  opacity:
                    loading ||
                    error
                      ? 0.55
                      : 1,
                }}
              />
            </div>


            <select
              value={
                failureFilter
              }
              onChange={(
                event,
              ) =>
                setFailureFilter(
                  event.target
                    .value as
                    | "ALL"
                    | FailureCode,
                )
              }
              disabled={
                loading ||
                Boolean(error)
              }
              style={{
                height: 40,
                minWidth: 190,
                padding:
                  "0 12px",
                borderRadius: 10,
                border:
                  `1px solid ${COLORS.border}`,
                background:
                  COLORS.surface,
                color:
                  COLORS.text,
                outline: "none",
                fontSize: 12,
                opacity:
                  loading ||
                  error
                    ? 0.55
                    : 1,
              }}
            >
              <option value="ALL">
                All failure types
              </option>

              {failureCodes.map(
                (
                  failureCode,
                ) => (
                  <option
                    key={
                      failureCode
                    }
                    value={
                      failureCode
                    }
                  >
                    {formatLabel(
                      failureCode,
                    )}
                  </option>
                ),
              )}
            </select>
          </div>


          {/* ================================================= */}
          {/* RECOVERY ERROR                                    */}
          {/* ================================================= */}

          {recoveryError && (
            <div
              style={{
                marginBottom: 16,
              }}
            >
              <StatePanel
                kind="error"
                compact
                title="Recovery action could not be completed"
                description={
                  recoveryError
                }
              />
            </div>
          )}


          {/* ================================================= */}
          {/* CONTENT STATES                                    */}
          {/* ================================================= */}

          {loading ? (
            <TableSkeleton
              rows={5}
            />
          ) : error ? (
            <StatePanel
              kind="error"
              title="Unable to load transactions"
              description={
                error
              }
              actionLabel="Retry"
              onAction={() => {
                void loadTransactions();
              }}
            />
          ) : transactions.length ===
            0 ? (
            <StatePanel
              kind="empty"
              title="No failed transactions"
              description="New failed payments will appear here when RecoverAI detects them."
            />
          ) : filteredTransactions.length ===
            0 ? (
            <StatePanel
              kind="no-results"
              title="No matching transactions"
              description="No transactions match the current search or failure filter."
              actionLabel="Clear filters"
              onAction={
                clearFilters
              }
            />
          ) : (
            <div
              style={{
                overflow:
                  "hidden",
                borderRadius: 16,
                border:
                  `1px solid ${COLORS.border}`,
                background:
                  COLORS.surface,
              }}
            >
              {/* ============================================= */}
              {/* TABLE HEADER                                  */}
              {/* ============================================= */}

              <div
                className="transactions-table-header"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.05fr 0.8fr 1.35fr 0.6fr 1.15fr 0.9fr 1.1fr",
                  gap: 14,
                  padding:
                    "12px 18px",
                  borderBottom:
                    `1px solid ${COLORS.borderSoft}`,
                  background:
                    "rgba(255,255,255,0.018)",
                  color:
                    COLORS.subtle,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing:
                    "0.11em",
                }}
              >
                <span>
                  TRANSACTION
                </span>

                <span>
                  AMOUNT
                </span>

                <span>
                  FAILURE
                </span>

                <span>
                  RETRY
                </span>

                <span>
                  AGENT ACTION
                </span>

                <span>
                  STATUS
                </span>

                <span
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  ACTION
                </span>
              </div>


              {/* ============================================= */}
              {/* ROWS                                          */}
              {/* ============================================= */}

              {filteredTransactions.map(
                (
                  transaction,
                  index,
                ) => {
                  const executing =
                    executingTransactionId ===
                    transaction.id;

                  const blocked =
                    normalizeStatus(
                      transaction.status,
                    ).includes(
                      "block",
                    );

                  return (
                    <div
                      key={
                        transaction.id
                      }
                      className="transactions-table-row"
                      style={{
                        position:
                          "relative",
                        display:
                          "grid",
                        gridTemplateColumns:
                          "1.05fr 0.8fr 1.35fr 0.6fr 1.15fr 0.9fr 1.1fr",
                        alignItems:
                          "center",
                        gap: 14,
                        minHeight: 72,
                        padding:
                          "13px 18px",
                        borderBottom:
                          index ===
                          filteredTransactions.length -
                            1
                            ? "none"
                            : `1px solid ${COLORS.borderSoft}`,
                        background:
                          blocked
                            ? "linear-gradient(90deg, rgba(201,123,116,0.045), transparent 34%)"
                            : "transparent",
                        boxShadow:
                          blocked
                            ? "inset 2px 0 0 rgba(201,123,116,0.36)"
                            : "none",
                        transition:
                          "background 160ms ease",
                      }}
                    >
                      {/* TRANSACTION */}

                      <div>
                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              COLORS.text,
                            fontSize: 12,
                          }}
                        >
                          {
                            transaction.id
                          }
                        </strong>

                        <span
                          style={{
                            display:
                              "block",
                            marginTop: 4,
                            color:
                              COLORS.subtle,
                            fontSize: 10,
                          }}
                        >
                          Payment failure
                        </span>
                      </div>


                      {/* AMOUNT */}

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 4,
                          color:
                            COLORS.text,
                          fontSize: 12,
                          fontWeight: 650,
                        }}
                      >
                        <IndianRupee
                          size={12}
                          color={
                            COLORS.gold
                          }
                        />

                        {formatRupees(
                          transaction.amount,
                        ).replace(
                          "₹",
                          "",
                        )}
                      </div>


                      {/* FAILURE */}

                      <div>
                        <div
                          style={{
                            color:
                              COLORS.text,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {formatLabel(
                            transaction.failure_code,
                          )}
                        </div>

                        <div
                          style={{
                            maxWidth: 190,
                            marginTop: 4,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                            color:
                              COLORS.subtle,
                            fontSize: 9,
                          }}
                          title={
                            transaction.failure_reason
                          }
                        >
                          {
                            transaction.failure_reason
                          }
                        </div>
                      </div>


                      {/* RETRY */}

                      <div
                        style={{
                          color:
                            blocked
                              ? COLORS.error
                              : COLORS.muted,
                          fontSize: 12,
                          fontWeight:
                            blocked
                              ? 700
                              : 500,
                        }}
                      >
                        {
                          transaction.retry_count
                        }
                      </div>


                      {/* AGENT ACTION */}

                      <div
                        style={{
                          color:
                            COLORS.muted,
                          fontSize: 10,
                          lineHeight: 1.45,
                        }}
                      >
                        {formatLabel(
                          transaction.agent_action,
                        )}
                      </div>


                      {/* STATUS */}

                      <div>
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: 5,
                            padding:
                              "5px 8px",
                            borderRadius: 999,
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing:
                              "0.07em",
                            whiteSpace:
                              "nowrap",
                            ...getStatusStyle(
                              transaction.status,
                            ),
                          }}
                        >
                          {blocked ? (
                            <ShieldAlert
                              size={10}
                            />
                          ) : normalizeStatus(
                              transaction.status,
                            ) ===
                            "recovered" ? (
                            <CheckCircle2
                              size={10}
                            />
                          ) : null}

                          {formatLabel(
                            transaction.status,
                          ).toUpperCase()}
                        </span>
                      </div>


                      {/* EXPLICIT ACTION */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          disabled={
                            executing ||
                            executingTransactionId !==
                              null
                          }
                          onClick={() =>
                            handleRunRecovery(
                              transaction,
                            )
                          }
                          aria-label={
                            blocked
                              ? `View safety block for ${transaction.id}`
                              : `Run recovery for ${transaction.id}`
                          }
                          style={{
                            display:
                              "inline-flex",
                            justifyContent:
                              "center",
                            alignItems:
                              "center",
                            gap: 6,
                            minWidth:
                              blocked
                                ? 90
                                : 104,
                            height: 34,
                            padding:
                              "0 10px",
                            borderRadius: 9,
                            border:
                              blocked
                                ? "1px solid rgba(201,123,116,0.20)"
                                : `1px solid ${COLORS.border}`,
                            background:
                              executing
                                ? "rgba(255,255,255,0.025)"
                                : blocked
                                  ? "rgba(201,123,116,0.055)"
                                  : "rgba(229,220,199,0.055)",
                            color:
                              executing
                                ? COLORS.subtle
                                : blocked
                                  ? "#D49A92"
                                  : COLORS.accent,
                            fontSize: 9,
                            fontWeight: 750,
                            letterSpacing:
                              "0.025em",
                            cursor:
                              executing
                                ? "wait"
                                : "pointer",
                            opacity:
                              executingTransactionId !==
                                null &&
                              !executing
                                ? 0.45
                                : 1,
                            whiteSpace:
                              "nowrap",
                            transition:
                              "all 160ms ease",
                          }}
                        >
                          {blocked ? (
                            <ShieldAlert
                              size={12}
                            />
                          ) : (
                            <RotateCcw
                              size={12}
                            />
                          )}

                          {executing
                            ? "RUNNING"
                            : blocked
                              ? "VIEW BLOCK"
                              : "RUN RECOVERY"}
                        </button>
                      </div>
                    </div>
                  );
                },
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
              padding:
                "0 2px",
              color:
                COLORS.subtle,
              fontSize: 10,
              lineHeight: 1.6,
            }}
          >
            <AlertTriangle
              size={12}
              style={{
                marginTop: 2,
                flexShrink: 0,
              }}
            />

            <span>
              Recovery execution occurs
              only after an explicit
              action. Viewing or filtering
              transactions does not execute
              recovery. For blocked rows,
              View Block replays the same
              protected backend decision
              path so the guardrail remains
              authoritative.
            </span>
          </div>
        </section>
      </main>


      {/* =================================================== */}
      {/* EXISTING DECISION DRAWER                            */}
      {/* =================================================== */}

      <DecisionDrawer
        open={
          drawerOpen
        }
        data={
          decisionData
        }
        onClose={() =>
          setDrawerOpen(
            false,
          )
        }
      />
    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
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
        "rgba(167,187,134,0.035)",
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
        "rgba(201,123,116,0.035)",
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
        minHeight: 62,
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
      <span
        style={{
          color:
            COLORS.subtle,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing:
            "0.04em",
          textTransform:
            "uppercase",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color:
            palette.value,
          fontSize: 19,
          fontWeight: 650,
        }}
      >
        {value}
      </strong>
    </div>
  );
}
