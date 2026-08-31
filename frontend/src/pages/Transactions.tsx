import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CreditCard,
  IndianRupee,
  RotateCcw,
  Search,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import DecisionDrawer from "../components/transactions/DecisionDrawer";

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
  background: "#080B0F",

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


function getStatusStyle(
  status: string,
) {
  const normalized =
    status.toLowerCase();

  if (
    normalized.includes(
      "recover",
    ) ||
    normalized.includes(
      "success",
    )
  ) {
    return {
      color:
        COLORS.success,

      background:
        "rgba(167,187,134,0.07)",

      border:
        "1px solid rgba(167,187,134,0.16)",
    };
  }

  if (
    normalized.includes(
      "block",
    ) ||
    normalized.includes(
      "fail",
    ) ||
    normalized.includes(
      "stop",
    )
  ) {
    return {
      color:
        COLORS.error,

      background:
        "rgba(201,123,116,0.07)",

      border:
        "1px solid rgba(201,123,116,0.16)",
    };
  }

  return {
    color:
      COLORS.warning,

    background:
      "rgba(199,181,141,0.07)",

    border:
      "1px solid rgba(199,181,141,0.16)",
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
  ] = useState(true);

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
  ] = useState("");

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
  ] = useState(false);


  // =======================================================
  // LOAD REAL BACKEND DATA
  // =======================================================

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
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

        setError(null);
      } catch (err) {
        if (!active) {
          return;
        }

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
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      active = false;
    };
  }, []);


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
    }, [transactions]);


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

      setRecoveryError(null);

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

      setDrawerOpen(true);
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
                  display:
                    "flex",

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
                <CreditCard
                  size={14}
                />

                PAYMENT RECOVERY
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
                Transactions
              </h1>


              <p
                style={{
                  maxWidth: 620,

                  margin:
                    "9px 0 0",

                  color:
                    COLORS.muted,

                  fontSize: 13,

                  lineHeight: 1.65,
                }}
              >
                Inspect failed payments,
                recovery state, retry
                history, and backend
                recovery decisions.
              </p>
            </div>


            <div
              style={{
                color:
                  COLORS.subtle,

                fontSize: 12,
              }}
            >
              {
                filteredTransactions.length
              }{" "}
              transactions
            </div>
          </div>


          {/* ================================================= */}
          {/* FILTER BAR                                        */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",

              flexWrap: "wrap",

              gap: 10,

              padding: 12,

              marginBottom: 18,

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
                style={{
                  width: "100%",

                  boxSizing:
                    "border-box",

                  height: 42,

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
              style={{
                height: 42,

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
              }}
            >
              <option value="ALL">
                All failure types
              </option>


              {failureCodes.map(
                (failureCode) => (
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
                display: "flex",

                alignItems:
                  "flex-start",

                gap: 10,

                padding:
                  "13px 15px",

                marginBottom: 16,

                borderRadius: 11,

                border:
                  "1px solid rgba(201,123,116,0.18)",

                background:
                  "rgba(201,123,116,0.05)",

                color:
                  COLORS.error,

                fontSize: 12,
              }}
            >
              <AlertTriangle
                size={16}
              />

              {recoveryError}
            </div>
          )}


          {/* ================================================= */}
          {/* CONTENT                                           */}
          {/* ================================================= */}

          {loading ? (
            <StatePanel>
              Loading transactions
              from RecoverAI...
            </StatePanel>
          ) : error ? (
            <StatePanel>
              {error}
            </StatePanel>
          ) : filteredTransactions.length ===
            0 ? (
            <StatePanel>
              No transactions match
              the current filters.
            </StatePanel>
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
                    "1.1fr 0.9fr 1.35fr 0.65fr 1.25fr 0.85fr 0.95fr",

                  gap: 16,

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
                    "0.12em",
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

                <span />
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

                  return (
                    <div
                      key={
                        transaction.id
                      }
                      className="transactions-table-row"
                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "1.1fr 0.9fr 1.35fr 0.65fr 1.25fr 0.85fr 0.95fr",

                        alignItems:
                          "center",

                        gap: 16,

                        minHeight: 72,

                        padding:
                          "13px 18px",

                        borderBottom:
                          index ===
                          filteredTransactions.length -
                            1
                            ? "none"
                            : `1px solid ${COLORS.borderSoft}`,
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
                            maxWidth: 180,

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
                            COLORS.muted,

                          fontSize: 12,
                        }}
                      >
                        {
                          transaction.retry_count
                        }
                      </div>


                      {/* ACTION */}

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

                            padding:
                              "5px 8px",

                            borderRadius: 999,

                            fontSize: 8,

                            fontWeight: 800,

                            letterSpacing:
                              "0.08em",

                            ...getStatusStyle(
                              transaction.status,
                            ),
                          }}
                        >
                          {formatLabel(
                            transaction.status,
                          ).toUpperCase()}
                        </span>
                      </div>


                      {/* ACTION BUTTON */}

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
                        style={{
                          display:
                            "inline-flex",

                          justifyContent:
                            "center",

                          alignItems:
                            "center",

                          gap: 6,

                          height: 34,

                          padding:
                            "0 10px",

                          borderRadius: 9,

                          border:
                            `1px solid ${COLORS.border}`,

                          background:
                            executing
                              ? "rgba(255,255,255,0.025)"
                              : "rgba(229,220,199,0.055)",

                          color:
                            executing
                              ? COLORS.subtle
                              : COLORS.accent,

                          fontSize: 9,

                          fontWeight: 750,

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
                        }}
                      >
                        <RotateCcw
                          size={12}
                        />

                        {executing
                          ? "RUNNING"
                          : "RUN RECOVERY"}
                      </button>
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
              marginTop: 14,

              color:
                COLORS.subtle,

              fontSize: 10,

              lineHeight: 1.6,
            }}
          >
            Recovery execution occurs
            only after an explicit Run
            Recovery action. Viewing or
            filtering transactions does
            not execute payment recovery.
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