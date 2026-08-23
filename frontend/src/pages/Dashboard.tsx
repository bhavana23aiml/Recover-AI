import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "motion/react";

import {
  IndianRupee,
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MetricCard from "../components/MetricCard";

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
  RecoveryDecisionDrawerData,
} from "../types/recovery";

import type {
  DashboardResponse,
  Transaction,
  AgentActivity,
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


export default function Dashboard() {
  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardResponse | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
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
  ] = useState(false);

  const [
    executingTransactionId,
    setExecutingTransactionId,
  ] = useState<string | null>(
    null,
  );

  const [
    recoveryError,
    setRecoveryError,
  ] = useState<string | null>(
    null,
  );


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const data =
          await getDashboardData();

        setDashboard(data);

        setError(null);
      } catch (err) {
        console.error(
          "Dashboard API error:",
          err,
        );

        setError(
          "Unable to connect to the RecoverAI backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  // =====================================================
  // EXECUTE RECOVERY
  // =====================================================
  //
  // IMPORTANT:
  //
  // Recovery runs ONLY when the user explicitly clicks
  // "Run recovery".
  //
  // Merely viewing a transaction does not execute
  // financial/recovery logic.
  // =====================================================

  async function handleRunRecovery(
    transaction: Transaction,
  ) {
    if (executingTransactionId) {
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


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",

          display: "grid",

          placeItems: "center",

          background: "#080b0f",

          color: "#ffffff",
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [
              0.4,
              1,
              0.4,
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          RecoverAI is loading...
        </motion.div>
      </div>
    );
  }


  // =====================================================
  // DASHBOARD ERROR
  // =====================================================

  if (
    error ||
    !dashboard
  ) {
    return (
      <div
        style={{
          minHeight: "100vh",

          display: "grid",

          placeItems: "center",

          background: "#080b0f",

          color: "#ffffff",
        }}
      >
        <div>
          <h2>
            RecoverAI connection error
          </h2>

          <p
            style={{
              color: "#888",
            }}
          >
            {error}
          </p>

          <p
            style={{
              color: "#666",
            }}
          >
            Make sure FastAPI is
            running on port 8000.
          </p>
        </div>
      </div>
    );
  }


  const metrics =
    dashboard.metrics;

  const transactions:
    Transaction[] =
      dashboard.transactions;

  const activities:
    AgentActivity[] =
      dashboard.agent_activity;


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
              duration: 0.6,
            }}
          >
            <div>
              <span className="hero-label">
                RECOVERAI LIVE
              </span>

              <h2>
                Recover revenue
                <br />
                before it disappears.
              </h2>

              <p>
                Detect failed payments,
                choose safe recovery
                strategies and measure
                every rupee recovered.
              </p>
            </div>


            <div className="hero-stat">
              <span>
                Recovered today
              </span>

              <strong>
                {formatRupees(
                  metrics.recovered_today,
                )}
              </strong>

              <div className="hero-growth">
                <ArrowUpRight
                  size={15}
                />

                12.4%
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
              subtitle="+8.4% vs previous period"
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

                padding:
                  "12px 14px",

                borderRadius: 10,

                border:
                  "1px solid rgba(201,123,116,0.22)",

                background:
                  "rgba(201,123,116,0.06)",

                color:
                  "#C97B74",

                fontSize: 12,

                lineHeight: 1.5,
              }}
            >
              {recoveryError}
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


                <button
                  className="ghost-button"
                  type="button"
                >
                  View all
                </button>
              </div>


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
                        {/* ID */}

                        <strong>
                          {
                            transaction.id
                          }
                        </strong>


                        {/* AMOUNT */}

                        <span>
                          {formatRupees(
                            transaction.amount,
                          )}
                        </span>


                        {/* FAILURE */}

                        <span>
                          {
                            transaction.failure_reason
                          }
                        </span>


                        {/* ACTION */}

                        <span>
                          {
                            transaction.agent_action
                          }
                        </span>


                        {/* STATUS + EXPLICIT RECOVERY BUTTON */}

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
                            className={`status-badge ${transaction.status.toLowerCase()}`}
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

                            aria-label={`Run recovery for ${transaction.id}`}

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
                                "1px solid rgba(229,220,199,0.12)",

                              background:
                                isExecuting
                                  ? "rgba(255,255,255,0.025)"
                                  : "rgba(229,220,199,0.05)",

                              color:
                                isExecuting
                                  ? "#747B83"
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
                              : "RUN RECOVERY"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  },
                )}
              </div>
            </motion.div>


            {/* =============================================== */}
            {/* LIVE AGENT                                     */}
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
                    Live Activity
                  </h3>
                </div>


                <div className="live-label">
                  <span />

                  LIVE
                </div>
              </div>


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