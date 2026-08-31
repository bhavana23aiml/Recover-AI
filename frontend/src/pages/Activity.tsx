import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity as ActivityIcon,
  CheckCircle2,
  Clock3,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import {
  getDashboardData,
} from "../services/dashboardApi";

import {
  getRecoveryAudit,
} from "../services/recoveryApi";

import type {
  Transaction,
} from "../types/dashboard";

import type {
  AuditEvent,
} from "../types/recovery";


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


function getEventColor(
  event: AuditEvent,
) {
  const status =
    event.status.toLowerCase();

  if (
    status.includes("success") ||
    status.includes("allowed") ||
    status.includes("verified")
  ) {
    return COLORS.success;
  }

  if (
    status.includes("block") ||
    status.includes("fail") ||
    status.includes("error")
  ) {
    return COLORS.error;
  }

  return COLORS.warning;
}


function EventIcon({
  event,
}: {
  event: AuditEvent;
}) {
  const status =
    event.status.toLowerCase();

  if (
    status.includes("block") ||
    status.includes("fail") ||
    status.includes("error")
  ) {
    return (
      <XCircle
        size={16}
        color={COLORS.error}
      />
    );
  }

  if (
    event.step ===
    "GUARDRAIL"
  ) {
    return (
      <ShieldAlert
        size={16}
        color={
          getEventColor(
            event,
          )
        }
      />
    );
  }

  if (
    status.includes("success") ||
    status.includes("allowed") ||
    status.includes("verified")
  ) {
    return (
      <CheckCircle2
        size={16}
        color={
          COLORS.success
        }
      />
    );
  }

  return (
    <Clock3
      size={16}
      color={
        COLORS.warning
      }
    />
  );
}


// =========================================================
// PAGE
// =========================================================

export default function Activity() {
  const [
    transactions,
    setTransactions,
  ] =
    useState<Transaction[]>(
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
    auditEvents,
    setAuditEvents,
  ] =
    useState<AuditEvent[]>(
      [],
    );

  const [
    loadingTransactions,
    setLoadingTransactions,
  ] = useState(true);

  const [
    loadingAudit,
    setLoadingAudit,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    auditError,
    setAuditError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    search,
    setSearch,
  ] = useState("");


  // =======================================================
  // LOAD TRANSACTIONS
  // =======================================================

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      try {
        setLoadingTransactions(
          true,
        );

        const response =
          await getDashboardData();

        if (!active) {
          return;
        }

        setTransactions(
          response.transactions,
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
          "Activity transaction error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transactions.",
        );
      } finally {
        if (active) {
          setLoadingTransactions(
            false,
          );
        }
      }
    }

    loadTransactions();

    return () => {
      active = false;
    };
  }, []);


  // =======================================================
  // LOAD AUDIT TRAIL
  // =======================================================

  useEffect(() => {
    if (
      !selectedTransactionId
    ) {
      setAuditEvents([]);
      return;
    }

    let active = true;

    async function loadAudit() {
      try {
        setLoadingAudit(true);

        setAuditError(null);

        const events =
          await getRecoveryAudit(
            selectedTransactionId!,
          );

        if (!active) {
          return;
        }

        setAuditEvents(
          events,
        );
      } catch (err) {
        if (!active) {
          return;
        }

        console.error(
          "Audit API error:",
          err,
        );

        setAuditEvents([]);

        setAuditError(
          err instanceof Error
            ? err.message
            : "Unable to load audit trail.",
        );
      } finally {
        if (active) {
          setLoadingAudit(false);
        }
      }
    }

    loadAudit();

    return () => {
      active = false;
    };
  }, [
    selectedTransactionId,
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
                <ActivityIcon
                  size={14}
                />

                AUDIT & OBSERVABILITY
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
                Activity
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
                Inspect the real backend
                audit events produced by
                each recovery workflow.
              </p>
            </div>


            <div
              style={{
                color:
                  COLORS.subtle,

                fontSize: 11,
              }}
            >
              Read-only audit view
            </div>
          </div>


          {/* ================================================= */}
          {/* CONTENT                                           */}
          {/* ================================================= */}

          {loadingTransactions ? (
            <StatePanel>
              Loading recovery
              activity...
            </StatePanel>
          ) : error ? (
            <StatePanel>
              {error}
            </StatePanel>
          ) : (
            <div
              className="activity-layout"
              style={{
                display: "grid",

                gridTemplateColumns:
                  "300px minmax(0, 1fr)",

                gap: 18,

                alignItems:
                  "start",
              }}
            >
              {/* ============================================= */}
              {/* TRANSACTION LIST                              */}
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
                    padding: 15,

                    borderBottom:
                      `1px solid ${COLORS.borderSoft}`,
                  }}
                >
                  <div
                    style={{
                      color:
                        COLORS.text,

                      fontSize: 12,

                      fontWeight: 700,

                      marginBottom: 12,
                    }}
                  >
                    Recovery Transactions
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


                {filteredTransactions.length ===
                0 ? (
                  <div
                    style={{
                      padding: 22,

                      textAlign:
                        "center",

                      color:
                        COLORS.subtle,

                      fontSize: 10,
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

                            padding:
                              "14px 15px",

                            border:
                              "none",

                            borderBottom:
                              `1px solid ${COLORS.borderSoft}`,

                            background:
                              active
                                ? "rgba(229,220,199,0.045)"
                                : "transparent",

                            textAlign:
                              "left",

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
                                color:
                                  COLORS.text,

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

                              fontSize: 9,
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

                              marginTop: 5,

                              color:
                                COLORS.subtle,

                              fontSize: 9,
                            }}
                          >
                            <span>
                              {formatLabel(
                                transaction.status,
                              )}
                            </span>

                            <span>
                              Retry{" "}
                              {
                                transaction.retry_count
                              }
                            </span>
                          </div>
                        </button>
                      );
                    },
                  )
                )}
              </div>


              {/* ============================================= */}
              {/* AUDIT TRAIL                                   */}
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
                        AUDIT TRAIL
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

                          fontSize: 12,

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
                        Retry{" "}
                        {
                          selectedTransaction.retry_count
                        }
                      </div>
                    </div>
                  </div>
                )}


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
                  {loadingAudit ? (
                    <StatePanelInline>
                      Loading audit
                      trail...
                    </StatePanelInline>
                  ) : auditError ? (
                    <StatePanelInline>
                      {auditError}
                    </StatePanelInline>
                  ) : auditEvents.length ===
                    0 ? (
                    <StatePanelInline>
                      No recovery audit
                      has been recorded
                      for this transaction
                      yet.
                    </StatePanelInline>
                  ) : (
                    auditEvents.map(
                      (
                        event,
                        index,
                      ) => (
                        <div
                          key={`${event.step}-${event.timestamp}-${index}`}
                          className="activity-audit-row"
                          style={{
                            display:
                              "grid",

                            gridTemplateColumns:
                              "42px 110px 110px minmax(0,1fr) 150px",

                            gap: 14,

                            alignItems:
                              "center",

                            padding:
                              "15px 17px",

                            borderBottom:
                              index ===
                              auditEvents.length -
                                1
                                ? "none"
                                : `1px solid ${COLORS.borderSoft}`,
                          }}
                        >
                          {/* ICON */}

                          <div
                            style={{
                              width: 30,

                              height: 30,

                              display:
                                "grid",

                              placeItems:
                                "center",

                              borderRadius: 9,

                              border:
                                `1px solid ${COLORS.border}`,

                              background:
                                COLORS.elevated,
                            }}
                          >
                            <EventIcon
                              event={
                                event
                              }
                            />
                          </div>


                          {/* STEP */}

                          <strong
                            style={{
                              color:
                                COLORS.text,

                              fontSize: 10,

                              letterSpacing:
                                "0.05em",
                            }}
                          >
                            {
                              event.step
                            }
                          </strong>


                          {/* STATUS */}

                          <span
                            style={{
                              color:
                                getEventColor(
                                  event,
                                ),

                              fontSize: 9,

                              fontWeight: 800,
                            }}
                          >
                            {formatLabel(
                              event.status,
                            ).toUpperCase()}
                          </span>


                          {/* MESSAGE */}

                          <span
                            style={{
                              color:
                                COLORS.muted,

                              fontSize: 11,

                              lineHeight: 1.5,

                              wordBreak:
                                "break-word",
                            }}
                          >
                            {
                              event.message
                            }
                          </span>


                          {/* TIMESTAMP */}

                          <span
                            style={{
                              color:
                                COLORS.subtle,

                              fontSize: 9,

                              textAlign:
                                "right",

                              wordBreak:
                                "break-word",
                            }}
                          >
                            {
                              event.timestamp
                            }
                          </span>
                        </div>
                      ),
                    )
                  )}
                </div>
              </div>
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
            Activity is read-only.
            Opening this page or
            selecting a transaction
            does not trigger recovery
            execution.
          </div>
        </section>
      </main>
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


// =========================================================
// INLINE STATE
// =========================================================

function StatePanelInline({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 36,

        color:
          COLORS.muted,

        textAlign:
          "center",

        fontSize: 11,
      }}
    >
      {children}
    </div>
  );
}