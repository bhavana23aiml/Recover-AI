import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "motion/react";

import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Play,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  getRecoveryAudit,
} from "../../services/recoveryApi";

import type {
  AuditEvent,
} from "../../types/recovery";


interface AgentReplayProps {
  transactionId: string | null;
}


const COLORS = {
  background: "#080B0F",
  surface: "#0D1116",

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


function getStatusColor(
  status: string,
) {
  switch (status) {
    case "SUCCESS":
    case "ALLOWED":
      return COLORS.success;

    case "BLOCKED":
    case "FAILED":
      return COLORS.error;

    case "REVIEW_REQUIRED":
    case "PENDING":
    case "RUNNING":
      return COLORS.warning;

    default:
      return COLORS.subtle;
  }
}


function getStepIcon(
  event: AuditEvent,
) {
  const color =
    getStatusColor(event.status);

  switch (event.step) {
    case "DETECT":
      return (
        <Activity
          size={16}
          color={color}
        />
      );

    case "CLASSIFY":
    case "DECIDE":
      return (
        <BrainCircuit
          size={16}
          color={color}
        />
      );

    case "GUARDRAIL":
      return (
        <ShieldCheck
          size={16}
          color={color}
        />
      );

    case "EXECUTE":
      return (
        <RotateCcw
          size={16}
          color={color}
        />
      );

    case "VERIFY":
      return event.status ===
        "SUCCESS" ? (
        <CheckCircle2
          size={16}
          color={color}
        />
      ) : (
        <XCircle
          size={16}
          color={color}
        />
      );

    default:
      return (
        <Clock3
          size={16}
          color={color}
        />
      );
  }
}


export default function AgentReplay({
  transactionId,
}: AgentReplayProps) {
  const [
    events,
    setEvents,
  ] = useState<AuditEvent[]>([]);

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  // =====================================================
  // LOAD REAL BACKEND AUDIT EVENTS
  // =====================================================

  useEffect(() => {
    if (!transactionId) {
      setEvents([]);
      setVisibleCount(0);
      setPlaying(false);
      return;
    }

    let cancelled = false;

    async function loadAudit() {
      try {
        setLoading(true);
        setError(null);
        setEvents([]);
        setVisibleCount(0);
        setPlaying(false);

        const audit =
          await getRecoveryAudit(
            transactionId!,
          );

        if (cancelled) {
          return;
        }

        setEvents(audit);

        if (audit.length > 0) {
          setVisibleCount(1);

          setPlaying(
            audit.length > 1,
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load recovery audit.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAudit();

    return () => {
      cancelled = true;
    };
  }, [transactionId]);


  // =====================================================
  // REPLAY TIMER
  // =====================================================

  useEffect(() => {
    if (!playing) {
      return;
    }

    if (
      visibleCount >=
      events.length
    ) {
      setPlaying(false);
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setVisibleCount(
            (current) =>
              Math.min(
                current + 1,
                events.length,
              ),
          );
        },
        700,
      );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    playing,
    visibleCount,
    events.length,
  ]);


  // =====================================================
  // STOP WHEN LAST REAL EVENT IS SHOWN
  // =====================================================

  useEffect(() => {
    if (
      events.length > 0 &&
      visibleCount >=
        events.length
    ) {
      setPlaying(false);
    }
  }, [
    visibleCount,
    events.length,
  ]);


  const visibleEvents =
    useMemo(
      () =>
        events.slice(
          0,
          visibleCount,
        ),
      [
        events,
        visibleCount,
      ],
    );


  const finalEvent =
    events.length > 0
      ? events[
          events.length - 1
        ]
      : null;


  function replay() {
    if (events.length === 0) {
      return;
    }

    setVisibleCount(1);

    setPlaying(
      events.length > 1,
    );
  }


  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (!transactionId) {
    return (
      <div
        style={{
          padding: 20,

          borderRadius: 16,

          border:
            `1px solid ${COLORS.border}`,

          background:
            "rgba(255,255,255,0.014)",

          color: COLORS.muted,

          fontSize: 13,
        }}
      >
        Select a recovery
        transaction to replay its
        decision trace.
      </div>
    );
  }


  return (
    <div
      style={{
        borderRadius: 16,

        border:
          `1px solid ${COLORS.border}`,

        background:
          "rgba(255,255,255,0.014)",

        overflow: "hidden",
      }}
    >
      {/* ================================================= */}
      {/* HEADER                                            */}
      {/* ================================================= */}

      <div
        style={{
          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          gap: 16,

          padding:
            "17px 18px",

          borderBottom:
            `1px solid ${COLORS.borderSoft}`,
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

              marginBottom: 5,

              color:
                COLORS.gold,

              fontSize: 10,

              fontWeight: 750,

              letterSpacing:
                "0.14em",
            }}
          >
            <BrainCircuit
              size={14}
            />

            AGENT REPLAY
          </div>

          <strong
            style={{
              fontFamily:
                "Manrope, sans-serif",

              fontSize: 15,
            }}
          >
            {transactionId}
          </strong>
        </div>


        <button
          type="button"

          onClick={replay}

          disabled={
            loading ||
            events.length === 0 ||
            playing
          }

          style={{
            display:
              "inline-flex",

            alignItems:
              "center",

            gap: 7,

            padding:
              "8px 11px",

            borderRadius: 9,

            border:
              `1px solid ${COLORS.border}`,

            background:
              "rgba(229,220,199,0.04)",

            color:
              playing
                ? COLORS.subtle
                : COLORS.accent,

            fontSize: 10,

            fontWeight: 750,

            letterSpacing:
              "0.06em",

            cursor:
              loading ||
              playing ||
              events.length === 0
                ? "not-allowed"
                : "pointer",

            opacity:
              loading ||
              events.length === 0
                ? 0.55
                : 1,
          }}
        >
          <Play size={12} />

          {playing
            ? "REPLAYING"
            : "REPLAY"}
        </button>
      </div>


      {/* ================================================= */}
      {/* SIMULATION LABEL                                  */}
      {/* ================================================= */}

      <div
        style={{
          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          gap: 12,

          padding:
            "12px 18px",

          borderBottom:
            `1px solid ${COLORS.borderSoft}`,
        }}
      >
        <span
          style={{
            padding:
              "5px 8px",

            borderRadius: 999,

            border:
              `1px solid ${COLORS.border}`,

            color:
              COLORS.accent,

            fontSize: 9,

            fontWeight: 750,

            letterSpacing:
              "0.12em",
          }}
        >
          SIMULATION
        </span>

        <span
          style={{
            color:
              COLORS.subtle,

            fontSize: 11,
          }}
        >
          Real backend audit events
        </span>
      </div>


      {/* ================================================= */}
      {/* LOADING                                           */}
      {/* ================================================= */}

      {loading && (
        <div
          style={{
            padding: 24,

            color:
              COLORS.muted,

            fontSize: 12,
          }}
        >
          Loading recovery trace...
        </div>
      )}


      {/* ================================================= */}
      {/* ERROR                                             */}
      {/* ================================================= */}

      {error && (
        <div
          style={{
            padding: 18,

            color:
              COLORS.error,

            fontSize: 12,

            lineHeight: 1.55,
          }}
        >
          {error}
        </div>
      )}


      {/* ================================================= */}
      {/* REPLAY                                            */}
      {/* ================================================= */}

      {!loading &&
        !error &&
        events.length > 0 && (
          <div
            style={{
              padding:
                "18px",
            }}
          >
            <AnimatePresence
              initial={false}
            >
              {visibleEvents.map(
                (
                  event,
                  index,
                ) => {
                  const isLast =
                    index ===
                    visibleEvents.length -
                      1;

                  const statusColor =
                    getStatusColor(
                      event.status,
                    );

                  return (
                    <motion.div
                      key={`${event.step}-${event.timestamp}-${index}`}

                      initial={{
                        opacity: 0,
                        y: 12,
                        scale: 0.985,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}

                      exit={{
                        opacity: 0,
                      }}

                      transition={{
                        duration: 0.28,

                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}

                      style={{
                        position:
                          "relative",

                        display:
                          "grid",

                        gridTemplateColumns:
                          "38px 1fr",

                        gap: 12,

                        paddingBottom:
                          isLast
                            ? 0
                            : 18,
                      }}
                    >
                      {/* TIMELINE */}

                      <div
                        style={{
                          position:
                            "relative",

                          display:
                            "flex",

                          justifyContent:
                            "center",
                        }}
                      >
                        <motion.div
                          initial={{
                            scale: 0.5,
                          }}

                          animate={{
                            scale: 1,
                          }}

                          style={{
                            position:
                              "relative",

                            zIndex: 2,

                            width: 32,
                            height: 32,

                            display:
                              "grid",

                            placeItems:
                              "center",

                            borderRadius:
                              10,

                            border:
                              `1px solid ${statusColor}35`,

                            background:
                              `${statusColor}10`,
                          }}
                        >
                          {getStepIcon(
                            event,
                          )}
                        </motion.div>


                        {!isLast && (
                          <motion.div
                            initial={{
                              scaleY: 0,
                            }}

                            animate={{
                              scaleY: 1,
                            }}

                            transition={{
                              duration:
                                0.35,
                            }}

                            style={{
                              position:
                                "absolute",

                              top: 32,

                              bottom:
                                -18,

                              width: 1,

                              transformOrigin:
                                "top",

                              background:
                                COLORS.border,
                            }}
                          />
                        )}
                      </div>


                      {/* EVENT */}

                      <div
                        style={{
                          minWidth: 0,

                          paddingTop: 2,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "space-between",

                            gap: 12,

                            marginBottom: 6,
                          }}
                        >
                          <strong
                            style={{
                              color:
                                COLORS.accent,

                              fontSize:
                                11,

                              letterSpacing:
                                "0.06em",
                            }}
                          >
                            {event.step}
                          </strong>

                          <span
                            style={{
                              color:
                                statusColor,

                              fontSize:
                                9,

                              fontWeight:
                                750,

                              letterSpacing:
                                "0.08em",
                            }}
                          >
                            {event.status}
                          </span>
                        </div>


                        <p
                          style={{
                            margin: 0,

                            color:
                              COLORS.muted,

                            fontSize: 12,

                            lineHeight:
                              1.55,
                          }}
                        >
                          {event.message}
                        </p>
                      </div>
                    </motion.div>
                  );
                },
              )}
            </AnimatePresence>


            {/* ============================================= */}
            {/* FINAL STATE                                   */}
            {/* ============================================= */}

            {!playing &&
              visibleCount ===
                events.length &&
              finalEvent && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                  }}

                  transition={{
                    delay: 0.15,
                  }}

                  style={{
                    marginTop: 20,

                    padding:
                      "12px 14px",

                    borderRadius:
                      10,

                    border:
                      `1px solid ${getStatusColor(
                        finalEvent.status,
                      )}30`,

                    background:
                      `${getStatusColor(
                        finalEvent.status,
                      )}09`,
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: 8,

                      color:
                        getStatusColor(
                          finalEvent.status,
                        ),

                      fontSize:
                        10,

                      fontWeight:
                        750,

                      letterSpacing:
                        "0.08em",
                    }}
                  >
                    {finalEvent.status ===
                      "SUCCESS" ||
                    finalEvent.status ===
                      "ALLOWED" ? (
                      <CheckCircle2
                        size={14}
                      />
                    ) : (
                      <XCircle
                        size={14}
                      />
                    )}

                    REPLAY COMPLETE
                  </div>
                </motion.div>
              )}
          </div>
        )}
    </div>
  );
}