import {
  useCallback,
  useEffect,
  useState,
} from "react";

import RazorpayCheckout from "../payments/RazorpayCheckout";

import {
  motion,
} from "motion/react";

import {
  AlertTriangle,
  IndianRupee,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MetricCard from "../components/MetricCard";

import DecisionDrawer from "../components/transactions/DecisionDrawer";

import {
  DashboardSkeleton,
  StatePanel,
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
  RecoveryDecisionDrawerData,
} from "../types/recovery";

import type {
  AgentActivity,
  DashboardResponse,
  Transaction,
} from "../types/dashboard";


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


export default function Dashboard() {
  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardResponse | null>(
      null,
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


  // =====================================================
  // RECOVERY / DRAWER STATE
  // =====================================================

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


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const data =
            await getDashboardData();

          setDashboard(
            data,
          );
        } catch (err) {
          console.error(
            "Dashboard API error:",
            err,
          );

          setError(
            err instanceof Error &&
            err.message
              ? err.message
              : "Unable to load RecoverAI dashboard data.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    void loadDashboard();
  }, [
    loadDashboard,
  ]);


  // =====================================================
  // EXECUTE RECOVERY
  // =====================================================
  //
  // IMPORTANT:
  //
  // Recovery runs ONLY when the user explicitly clicks
  // "Run recovery" / "View block".
  //
  // Merely viewing a transaction does not execute
  // recovery logic.
  // =====================================================

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


  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="main-content">
          <Header />

          <DashboardSkeleton />
        </main>
      </div>
    );
  }


  // =====================================================
  // DASHBOARD ERROR STATE
  // =====================================================

  if (
    error ||
    !dashboard
  ) {
    return (
      <div className="app-shell">
        <Sidebar />

        <main className="main-content">
          <Header />

          <div
            style={{
              paddingTop: 8,
            }}
          >
            <StatePanel
              kind="error"
              title="Unable to load dashboard"
              description={
                error ??
                "RecoverAI could not load the current dashboard data."
              }
              actionLabel="Retry"
              onAction={() => {
                void loadDashboard();
              }}
            />
          </div>
        </main>
      </div>
    );
  }


  // =====================================================
  // DERIVED DASHBOARD DATA
  // =====================================================

  const metrics =
    dashboard.metrics;

  const transactions:
    Transaction[] =
      dashboard.transactions ??
      [];

  const activities:
    AgentActivity[] =
      dashboard.agent_activity ??
      [];

  const blockedCount =
    transactions.filter(
      (transaction) =>
        normalizeStatus(
          transaction.status,
        ) === "blocked",
    ).length;

  const recoveredCount =
    transactions.filter(
      (transaction) =>
        normalizeStatus(
          transaction.status,
        ) === "recovered",
    ).length;

  const activeQueueCount =
    transactions.length;

  const razorpayTestRecoveryJobId =
    import.meta.env
      .VITE_RAZORPAY_TEST_RECOVERY_JOB_ID;


  return (
    <>
      <div className="app-shell">
        <Sidebar />

        <main className="main-content">
          <Header />


          {/* ================================================= */}
          {/* HERO                                              */}
          {/* ================================================= */}

          <motion.section
            className="hero-panel"
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <div>
              <span className="hero-label">
                RECOVERY OPERATIONS
              </span>

              <h2>
                Recover revenue
                <br />
                before it disappears.
              </h2>

              <p>
                Detect failed payments,
                choose safe recovery
                strategies and verify
                every recovery outcome.
              </p>
            </div>


            {/* RECOVERY PULSE */}

            <div
              className="hero-stat"
              style={{
                minWidth: 280,
                padding:
                  "18px 20px",
                borderRadius: 15,
                border:
                  "1px solid rgba(229,220,199,0.09)",
                background:
                  "rgba(255,255,255,0.018)",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#93866A",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing:
                    "0.12em",
                  textTransform:
                    "uppercase",
                }}
              >
                Recovery Pulse
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: 12,
                  color: "#F3EFE6",
                  fontSize: 28,
                  lineHeight: 1.05,
                }}
              >
                {formatRupees(
                  metrics.recovered_today,
                )}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: 5,
                  color: "#747B83",
                  fontSize: 11,
                }}
              >
                Recovered today
              </span>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <div
                  style={{
                    padding:
                      "10px 11px",
                    borderRadius: 10,
                    border:
                      "1px solid rgba(229,220,199,0.07)",
                    background:
                      "rgba(255,255,255,0.018)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "#E5DCC7",
                      fontSize: 16,
                    }}
                  >
                    {activeQueueCount}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: 3,
                      color: "#747B83",
                      fontSize: 10,
                    }}
                  >
                    Queue items
                  </span>
                </div>

                <div
                  style={{
                    padding:
                      "10px 11px",
                    borderRadius: 10,
                    border:
                      "1px solid rgba(201,123,116,0.15)",
                    background:
                      "rgba(201,123,116,0.035)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "#D49A92",
                      fontSize: 16,
                    }}
                  >
                    {blockedCount}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: 3,
                      color: "#747B83",
                      fontSize: 10,
                    }}
                  >
                    Blocked safely
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: "#686E74",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing:
                    "0.08em",
                  textTransform:
                    "uppercase",
                }}
              >
                Demo / simulation data
              </div>
            </div>
          </motion.section>


          {/* ================================================= */}
          {/* DEMO DATA LABEL                                   */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing:
                "0.12em",
              color: "#747B83",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius:
                  "50%",
                background:
                  "#93866A",
              }}
            />

            DEMO DATA · SIMULATION ENVIRONMENT
          </div>


          {/* ================================================= */}
          {/* RAZORPAY TEST MODE                                */}
          {/* ================================================= */}

          {razorpayTestRecoveryJobId && (
            <motion.section
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
              }}
              style={{
                marginTop: 16,
                marginBottom: 16,
                padding: 18,
                borderRadius: 14,
                border:
                  "1px solid rgba(229,220,199,0.10)",
                background:
                  "rgba(255,255,255,0.025)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: 20,
                  flexWrap:
                    "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing:
                        "0.12em",
                      color: "#93866A",
                      marginBottom: 7,
                    }}
                  >
                    RAZORPAY TEST MODE
                  </div>

                  <strong
                    style={{
                      display: "block",
                      color: "#F3EFE6",
                      fontSize: 15,
                      marginBottom: 5,
                    }}
                  >
                    Gateway Verification
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#747B83",
                      fontSize: 11,
                    }}
                  >
                    RZPTEST002 · ₹1.00 · No real money
                  </span>

                  <span
                    style={{
                      display: "block",
                      marginTop: 5,
                      color: "#68716B",
                      fontSize: 10,
                    }}
                  >
                    Server-side payment verification enabled
                  </span>
                </div>

                <div
                  style={{
                    minWidth: 210,
                  }}
                >
                  <RazorpayCheckout
                    recoveryJobId={
                      razorpayTestRecoveryJobId
                    }
                    transactionId="RZPTEST002"
                    onVerified={(result) => {
                      console.log(
                        "RecoverAI gateway verification:",
                        result,
                      );
                    }}
                  />
                </div>
              </div>
            </motion.section>
          )}


          {/* ================================================= */}
          {/* METRICS                                           */}
          {/* ================================================= */}

          <section className="metrics-grid">
            <MetricCard
              title="Revenue at Risk"
              value={formatRupees(
                metrics.revenue_at_risk,
              )}
              subtitle={`Across ${metrics.failed_payments} failed payments`}
              icon={AlertTriangle}
              delay={0.05}
            />

            <MetricCard
              title="Revenue Recovered"
              value={formatRupees(
                metrics.revenue_recovered,
              )}
              subtitle={`+${formatRupees(
                metrics.recovered_today,
              )} today`}
              icon={IndianRupee}
              delay={0.1}
            />

            <MetricCard
              title="Recovery Rate"
              value={`${metrics.recovery_rate}%`}
              subtitle="Demo / simulation metric"
              icon={TrendingUp}
              delay={0.15}
            />

            <MetricCard
              title="Active Recoveries"
              value={`${metrics.active_recoveries}`}
              subtitle="Retries currently scheduled"
              icon={RotateCcw}
              delay={0.2}
            />
          </section>


          {/* ================================================= */}
          {/* RECOVERY ERROR                                    */}
          {/* ================================================= */}

          {recoveryError && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              style={{
                marginTop: 16,
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
            </motion.div>
          )}


          {/* ================================================= */}
          {/* LOWER DASHBOARD                                   */}
          {/* ================================================= */}

          <section className="content-grid">

            {/* =============================================== */}
            {/* RECOVERY QUEUE                                  */}
            {/* =============================================== */}

            <motion.div
              className="panel transactions-panel"
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
              }}
            >
              <div className="panel-header">
                <div>
                  <span className="section-label">
                    PAYMENTS
                  </span>

                  <h3>
                    Recovery Queue
                  </h3>
                </div>

                {transactions.length >
                  0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 7,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding:
                          "5px 8px",
                        borderRadius: 999,
                        border:
                          "1px solid rgba(229,220,199,0.08)",
                        color: "#7B8186",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing:
                          "0.04em",
                      }}
                    >
                      {transactions.length} QUEUED
                    </span>

                    <span
                      style={{
                        padding:
                          "5px 8px",
                        borderRadius: 999,
                        border:
                          "1px solid rgba(109,150,121,0.16)",
                        color: "#83A88D",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing:
                          "0.04em",
                      }}
                    >
                      {recoveredCount} RECOVERED
                    </span>

                    <span
                      style={{
                        padding:
                          "5px 8px",
                        borderRadius: 999,
                        border:
                          "1px solid rgba(201,123,116,0.18)",
                        color: "#C98A82",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing:
                          "0.04em",
                      }}
                    >
                      {blockedCount} BLOCKED
                    </span>
                  </div>
                )}
              </div>


              {transactions.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "0 16px 16px",
                  }}
                >
                  <StatePanel
                    kind="empty"
                    compact
                    title="No failed transactions"
                    description="New failed payments will appear here when they are detected by RecoverAI."
                  />
                </div>
              ) : (
                <div className="transaction-table">

                  {/* TABLE HEADER */}

                  <div className="transaction-row table-heading">
                    <span>
                      Transaction
                    </span>

                    <span>
                      Amount
                    </span>

                    <span>
                      Failure
                    </span>

                    <span>
                      Agent Action
                    </span>

                    <span>
                      Status
                    </span>
                  </div>


                  {/* TRANSACTIONS */}

                  {transactions.map(
                    (
                      transaction,
                    ) => {
                      const isExecuting =
                        executingTransactionId ===
                        transaction.id;

                      const isBlocked =
                        normalizeStatus(
                          transaction.status,
                        ) ===
                        "blocked";

                      return (
                        <motion.div
                          key={
                            transaction.id
                          }
                          className="transaction-row"
                          whileHover={{
                            x: 3,
                          }}
                        >
                          <strong>
                            {
                              transaction.id
                            }
                          </strong>

                          <span>
                            {formatRupees(
                              transaction.amount,
                            )}
                          </span>

                          <span>
                            {
                              transaction.failure_reason
                            }
                          </span>

                          <span>
                            {
                              transaction.agent_action
                            }
                          </span>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              gap: 10,
                              minWidth: 0,
                            }}
                          >
                            <span
                              className={`status-badge ${normalizeStatus(
                                transaction.status,
                              )}`}
                            >
                              {
                                transaction.status
                              }
                            </span>

                            <button
                              type="button"
                              disabled={
                                isExecuting
                              }
                              onClick={() =>
                                handleRunRecovery(
                                  transaction,
                                )
                              }
                              aria-label={
                                isBlocked
                                  ? `View safety block for ${transaction.id}`
                                  : `Run recovery for ${transaction.id}`
                              }
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap: 6,
                                padding:
                                  "6px 9px",
                                borderRadius:
                                  8,
                                border:
                                  isBlocked
                                    ? "1px solid rgba(201,123,116,0.20)"
                                    : "1px solid rgba(229,220,199,0.12)",
                                background:
                                  isExecuting
                                    ? "rgba(255,255,255,0.025)"
                                    : isBlocked
                                      ? "rgba(201,123,116,0.055)"
                                      : "rgba(229,220,199,0.05)",
                                color:
                                  isExecuting
                                    ? "#747B83"
                                    : isBlocked
                                      ? "#D39B94"
                                      : "#E5DCC7",
                                fontSize:
                                  10,
                                fontWeight:
                                  700,
                                letterSpacing:
                                  "0.035em",
                                cursor:
                                  isExecuting
                                    ? "not-allowed"
                                    : "pointer",
                                whiteSpace:
                                  "nowrap",
                                opacity:
                                  isExecuting
                                    ? 0.7
                                    : 1,
                                transition:
                                  "all 160ms ease",
                              }}
                            >
                              <RotateCcw
                                size={12}
                              />

                              {isExecuting
                                ? "RUNNING"
                                : isBlocked
                                  ? "VIEW BLOCK"
                                  : "RUN RECOVERY"}
                            </button>
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </div>
              )}
            </motion.div>


            {/* =============================================== */}
            {/* RECOVERY ACTIVITY                               */}
            {/* =============================================== */}

            <motion.div
              className="panel agent-panel"
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.32,
              }}
            >
              <div className="panel-header">
                <div>
                  <span className="section-label">
                    AGENT
                  </span>

                  <h3>
                    Recovery Activity
                  </h3>
                </div>

                <div
                  style={{
                    padding:
                      "5px 8px",
                    borderRadius: 999,
                    border:
                      "1px solid rgba(229,220,199,0.08)",
                    color: "#747B83",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing:
                      "0.06em",
                  }}
                >
                  AUDIT FEED
                </div>
              </div>


              {activities.length ===
              0 ? (
                <StatePanel
                  kind="empty"
                  compact
                  title="No recovery activity yet"
                  description="Recovery events will appear here as RecoverAI processes transactions."
                />
              ) : (
                <div className="activity-list">
                  {activities.map(
                    (
                      activity,
                      index,
                    ) => (
                      <motion.div
                        className="activity-item"
                        key={`${activity.time}-${index}`}
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            0.35 +
                            index *
                              0.08,
                        }}
                      >
                        <div className="activity-marker">
                          <span />

                          {index !==
                            activities.length -
                              1 && (
                            <div />
                          )}
                        </div>

                        <div className="activity-content">
                          <span className="activity-time">
                            {
                              activity.time
                            }
                          </span>

                          <strong>
                            {
                              activity.title
                            }
                          </strong>

                          <p>
                            {
                              activity.detail
                            }
                          </p>
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              )}
            </motion.div>
          </section>
        </main>
      </div>


      {/* =================================================== */}
      {/* DECISION DRAWER                                     */}
      {/* =================================================== */}

      <DecisionDrawer
        open={drawerOpen}
        data={decisionData}
        onClose={() =>
          setDrawerOpen(
            false,
          )
        }
      />
    </>
  );
}
