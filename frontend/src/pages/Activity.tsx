import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import {
  PanelSkeleton,
  StatePanel,
} from "../components/ui/SystemState";

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


function normalizeStatus(
  status: string,
) {
  return status
    .trim()
    .toLowerCase();
}


function getEventColor(
  event: AuditEvent,
) {
  const status =
    normalizeStatus(
      event.status,
    );

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
    normalizeStatus(
      event.status,
    );

  if (
    status.includes("block") ||
    status.includes("fail") ||
    status.includes("error")
  ) {
    return (
      <XCircle
        size={15}
        color={
          COLORS.error
        }
      />
    );
  }

  if (
    event.step ===
    "GUARDRAIL"
  ) {
    return (
      <ShieldAlert
        size={15}
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
        size={15}
        color={
          COLORS.success
        }
      />
    );
  }

  return (
    <Clock3
      size={15}
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
  ] =
    useState(true);

  const [
    loadingAudit,
    setLoadingAudit,
  ] =
    useState(false);

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
  ] =
    useState("");


  // =======================================================
  // LOAD TRANSACTIONS
  // =======================================================

  const loadTransactions =
    useCallback(
      async () => {
        try {
          setLoadingTransactions(
            true,
          );
          setError(null);

          const response =
            await getDashboardData();

          const nextTransactions =
            response.transactions ??
            [];

          setTransactions(
            nextTransactions,
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
            "Activity transaction error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load transactions.",
          );
        } finally {
          setLoadingTransactions(
            false,
          );
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
  // LOAD AUDIT TRAIL
  // =======================================================

  const loadAudit =
    useCallback(
      async (
        transactionId: string,
      ) => {
        try {
          setLoadingAudit(
            true,
          );
          setAuditError(
            null,
          );

          const events =
            await getRecoveryAudit(
              transactionId,
            );

          setAuditEvents(
            events ?? [],
          );
        } catch (err) {
          console.error(
            "Audit API error:",
            err,
          );

          setAuditEvents(
            [],
          );

          setAuditError(
            err instanceof Error
              ? err.message
              : "Unable to load audit trail.",
          );
        } finally {
          setLoadingAudit(
            false,
          );
        }
      },
      [],
    );


  useEffect(() => {
    if (
      !selectedTransactionId
    ) {
      setAuditEvents(
        [],
      );
      setAuditError(
        null,
      );
      return;
    }

    void loadAudit(
      selectedTransactionId,
    );
  }, [
    selectedTransactionId,
    loadAudit,
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


  const selectedBlocked =
    selectedTransaction
      ? normalizeStatus(
          selectedTransaction.status,
        ).includes(
          "block",
        )
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
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: 18,
              marginBottom: 15,
              flexWrap:
                "wrap",
            }}
          >
            <p
              style={{
                maxWidth: 700,
                margin: 0,
                color:
                  COLORS.muted,
                fontSize: 12,
                lineHeight: 1.65,
              }}
            >
              Inspect the backend audit
              evidence recorded for each
              recovery workflow. This view
              is read-only and does not
              execute recovery actions.
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

              READ-ONLY AUDIT
            </div>
          </div>


          {/* ================================================= */}
          {/* SUMMARY STRIP                                     */}
          {/* ================================================= */}

          {!loadingTransactions &&
            !error &&
            transactions.length >
              0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <SummaryCard
                  label="Recovery transactions"
                  value={
                    String(
                      transactions.length,
                    )
                  }
                />

                <SummaryCard
                  label="Selected transaction"
                  value={
                    selectedTransaction
                      ?.id ??
                    "—"
                  }
                />

                <SummaryCard
                  label="Recorded audit events"
                  value={
                    loadingAudit
                      ? "…"
                      : String(
                          auditEvents.length,
                        )
                  }
                  tone={
                    auditError
                      ? "error"
                      : "neutral"
                  }
                />
              </div>
            )}


          {/* ================================================= */}
          {/* PAGE STATES / CONTENT                             */}
          {/* ================================================= */}

          {loadingTransactions ? (
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
              <PanelSkeleton />
              <PanelSkeleton />
            </div>
          ) : error ? (
            <StatePanel
              kind="error"
              title="Unable to load activity"
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
              title="No recovery activity available"
              description="Audit events will appear here after recovery workflows have been recorded."
            />
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
              {/* TRANSACTION INDEX                             */}
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
                        AUDIT INDEX
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
                        Recovery Transactions
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
                      description="Try another transaction ID, failure code, or status."
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
                              "13px 15px",
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
                            background:
                              active
                                ? blocked
                                  ? "rgba(201,123,116,0.055)"
                                  : "rgba(229,220,199,0.045)"
                                : blocked
                                  ? "rgba(201,123,116,0.022)"
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
                              alignItems:
                                "center",
                              gap: 10,
                              marginTop: 6,
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
                              {formatLabel(
                                transaction.status,
                              )}
                            </span>

                            <span
                              style={{
                                color:
                                  COLORS.subtle,
                                fontSize: 9,
                              }}
                            >
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
              {/* AUDIT LEDGER                                  */}
              {/* ============================================= */}

              <div
                style={{
                  minWidth: 0,
                }}
              >
                {!selectedTransaction ? (
                  <StatePanel
                    kind="no-selection"
                    title="Select a transaction"
                    description="Choose a recovery transaction to inspect its recorded audit events."
                  />
                ) : (
                  <>
                    {/* SELECTED LEDGER CONTEXT */}

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
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 7,
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
                          {selectedBlocked ? (
                            <ShieldAlert
                              size={11}
                            />
                          ) : (
                            <ShieldCheck
                              size={11}
                            />
                          )}

                          RECOVERY AUDIT LEDGER
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
                            {formatLabel(
                              selectedTransaction.status,
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
                          READ ONLY
                        </span>
                      </div>
                    </div>


                    {/* LEDGER BODY */}

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
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: 12,
                          padding:
                            "12px 16px",
                          borderBottom:
                            `1px solid ${COLORS.borderSoft}`,
                          background:
                            "rgba(255,255,255,0.014)",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color:
                                COLORS.text,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            Recorded recovery events
                          </div>

                          <div
                            style={{
                              marginTop: 3,
                              color:
                                COLORS.subtle,
                              fontSize: 9,
                            }}
                          >
                            Ordered backend audit trail
                          </div>
                        </div>

                        {!loadingAudit &&
                          !auditError && (
                          <span
                            style={{
                              color:
                                COLORS.subtle,
                              fontSize: 9,
                            }}
                          >
                            {
                              auditEvents.length
                            }{" "}
                            events
                          </span>
                        )}
                      </div>


                      {loadingAudit ? (
                        <div
                          style={{
                            padding: 16,
                          }}
                        >
                          <PanelSkeleton />
                        </div>
                      ) : auditError ? (
                        <div
                          style={{
                            padding: 16,
                          }}
                        >
                          <StatePanel
                            kind="error"
                            compact
                            title="Unable to load audit trail"
                            description={
                              auditError
                            }
                            actionLabel="Retry"
                            onAction={() => {
                              if (
                                selectedTransactionId
                              ) {
                                void loadAudit(
                                  selectedTransactionId,
                                );
                              }
                            }}
                          />
                        </div>
                      ) : auditEvents.length ===
                        0 ? (
                        <div
                          style={{
                            padding: 16,
                          }}
                        >
                          <StatePanel
                            kind="empty"
                            compact
                            title="No audit events recorded"
                            description="This transaction does not currently have a recovery audit trail."
                          />
                        </div>
                      ) : (
                        <div>
                          {auditEvents.map(
                            (
                              event,
                              index,
                            ) => (
                              <div
                                key={`${event.step}-${event.timestamp}-${index}`}
                                className="activity-audit-row"
                                style={{
                                  position:
                                    "relative",
                                  display:
                                    "grid",
                                  gridTemplateColumns:
                                    "42px 105px 105px minmax(0,1fr) 150px",
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
                                {/* TIMELINE CONNECTOR */}

                                {index !==
                                  auditEvents.length -
                                    1 && (
                                  <span
                                    aria-hidden="true"
                                    style={{
                                      position:
                                        "absolute",
                                      left: 31,
                                      top: 45,
                                      bottom: -16,
                                      width: 1,
                                      background:
                                        "rgba(229,220,199,0.075)",
                                    }}
                                  />
                                )}


                                {/* ICON */}

                                <div
                                  style={{
                                    position:
                                      "relative",
                                    zIndex: 1,
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
                                    display:
                                      "inline-flex",
                                    width:
                                      "fit-content",
                                    padding:
                                      "4px 7px",
                                    borderRadius: 999,
                                    border:
                                      `1px solid ${getEventColor(
                                        event,
                                      )}26`,
                                    background:
                                      `${getEventColor(
                                        event,
                                      )}0D`,
                                    color:
                                      getEventColor(
                                        event,
                                      ),
                                    fontSize: 8,
                                    fontWeight: 800,
                                    letterSpacing:
                                      "0.05em",
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
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
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
              Activity is read-only.
              Opening this page or
              selecting a transaction does
              not trigger recovery
              execution.
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?:
    | "neutral"
    | "error";
}) {
  const valueColor =
    tone === "error"
      ? COLORS.error
      : COLORS.accent;

  const border =
    tone === "error"
      ? "rgba(201,123,116,0.15)"
      : COLORS.border;

  const background =
    tone === "error"
      ? "rgba(201,123,116,0.03)"
      : "rgba(255,255,255,0.018)";

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
          `1px solid ${border}`,
        background,
      }}
    >
      <span
        style={{
          color:
            COLORS.subtle,
          fontSize: 9,
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
            valueColor,
          fontSize: 15,
          fontWeight: 650,
        }}
      >
        {value}
      </strong>
    </div>
  );
}
