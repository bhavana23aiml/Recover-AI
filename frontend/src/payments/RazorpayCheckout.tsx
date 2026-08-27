import {
  useState,
} from "react";

import {
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  CircleCheck,
  RefreshCw,
} from "lucide-react";

import {
  createRazorpayRecoveryOrder,
  verifyRazorpayPayment,
  reconcileRazorpayPayment,
} from "../services/razorpayApi";

import type {
  RazorpayRecoveryOrderResponse,
  RazorpayVerifyPaymentResponse,
  RazorpayReconcilePaymentResponse,
} from "../services/razorpayApi";


// =========================================================
// RAZORPAY CHECKOUT TYPES
// =========================================================

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}


interface RazorpayCheckoutOptions {
  key: string;

  amount: number;

  currency: string;

  name: string;

  description: string;

  order_id: string;

  handler: (
    response: RazorpaySuccessResponse,
  ) => void | Promise<void>;

  modal?: {
    ondismiss?: () => void;
  };

  theme?: {
    color?: string;
  };

  retry?: {
    enabled?: boolean;
  };
}


interface RazorpayInstance {
  open: () => void;
}


interface RazorpayConstructor {
  new (
    options: RazorpayCheckoutOptions,
  ): RazorpayInstance;
}


declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}


// =========================================================
// COMPLETION TYPE
// =========================================================

type RazorpayCompletionResult =
  | RazorpayVerifyPaymentResponse
  | RazorpayReconcilePaymentResponse;


type CompletionMode =
  | "VERIFIED"
  | "RECONCILED";


interface CompletionState {
  paymentId: string;
  paymentStatus: string;
  mode: CompletionMode;
}


// =========================================================
// COMPONENT PROPS
// =========================================================

interface RazorpayCheckoutProps {
  recoveryJobId: string;

  transactionId?: string;

  disabled?: boolean;

  onVerified?: (
    result: RazorpayCompletionResult,
  ) => void;
}


// =========================================================
// RAZORPAY CHECKOUT SCRIPT
// =========================================================

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";


function loadRazorpayCheckout(): Promise<void> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const existingScript =
        document.querySelector<HTMLScriptElement>(
          `script[src="${RAZORPAY_SCRIPT_URL}"]`,
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(),
          {
            once: true,
          },
        );

        existingScript.addEventListener(
          "error",
          () =>
            reject(
              new Error(
                "Unable to load Razorpay Checkout.",
              ),
            ),
          {
            once: true,
          },
        );

        return;
      }

      const script =
        document.createElement(
          "script",
        );

      script.src =
        RAZORPAY_SCRIPT_URL;

      script.async =
        true;

      script.onload =
        () => {
          resolve();
        };

      script.onerror =
        () => {
          reject(
            new Error(
              "Unable to load Razorpay Checkout.",
            ),
          );
        };

      document.body.appendChild(
        script,
      );
    },
  );
}


// =========================================================
// FORMAT AMOUNT
// =========================================================

function formatPaise(
  amountPaise: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
    },
  ).format(
    amountPaise / 100,
  );
}


// =========================================================
// COMPONENT
// =========================================================

export default function RazorpayCheckout({
  recoveryJobId,
  transactionId,
  disabled = false,
  onVerified,
}: RazorpayCheckoutProps) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    order,
    setOrder,
  ] =
    useState<RazorpayRecoveryOrderResponse | null>(
      null,
    );

  const [
    completion,
    setCompletion,
  ] =
    useState<CompletionState | null>(
      null,
    );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  // =======================================================
  // APPLY NORMAL VERIFICATION RESULT
  // =======================================================

  function applyVerifiedResult(
    result: RazorpayVerifyPaymentResponse,
  ) {
    setCompletion({
      paymentId:
        result.razorpay_payment_id,

      paymentStatus:
        result.payment_status,

      mode:
        "VERIFIED",
    });

    setError(
      null,
    );

    onVerified?.(
      result,
    );
  }


  // =======================================================
  // APPLY RECONCILIATION RESULT
  // =======================================================

  function applyReconciledResult(
    result: RazorpayReconcilePaymentResponse,
  ) {
    setCompletion({
      paymentId:
        result.razorpay_payment_id,

      paymentStatus:
        result.payment_status,

      mode:
        "RECONCILED",
    });

    setError(
      null,
    );

    onVerified?.(
      result,
    );
  }


  // =======================================================
  // ATTEMPT RECONCILIATION
  // =======================================================

  async function attemptReconciliation():
    Promise<boolean> {
    try {
      const reconciled =
        await reconcileRazorpayPayment(
          recoveryJobId,
        );

      if (
        !reconciled.reconciled ||
        reconciled.payment_status
          .toLowerCase() !==
          "captured"
      ) {
        return false;
      }

      applyReconciledResult(
        reconciled,
      );

      return true;

    } catch (err) {
      console.info(
        "RecoverAI reconciliation not available:",
        err,
      );

      return false;
    }
  }


  // =======================================================
  // PAYMENT HANDLER
  // =======================================================

  async function handleCheckout() {
    if (
      loading ||
      disabled ||
      completion
    ) {
      return;
    }

    try {
      setLoading(
        true,
      );

      setError(
        null,
      );


      // ---------------------------------------------------
      // 1. CREATE OR REUSE TRUSTED RAZORPAY ORDER
      // ---------------------------------------------------
      //
      // Frontend sends only recoveryJobId.
      //
      // Backend owns:
      // - amount
      // - currency
      // - guardrail result
      // - persisted order
      // ---------------------------------------------------

      const createdOrder =
        await createRazorpayRecoveryOrder(
          recoveryJobId,
        );

      setOrder(
        createdOrder,
      );


      // ---------------------------------------------------
      // 2. PRE-CHECK RECONCILIATION
      // ---------------------------------------------------
      //
      // Important for page reloads / failed callbacks.
      //
      // Example:
      //
      // Razorpay already captured payment
      //        ↓
      // browser callback previously failed
      //        ↓
      // user returns later
      //        ↓
      // do NOT reopen already-paid order
      //        ↓
      // reconcile first
      // ---------------------------------------------------

      const alreadyRecovered =
        await attemptReconciliation();

      if (
        alreadyRecovered
      ) {
        setLoading(
          false,
        );

        return;
      }


      // ---------------------------------------------------
      // 3. LOAD OFFICIAL RAZORPAY CHECKOUT
      // ---------------------------------------------------

      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout did not initialise.",
        );
      }


      // ---------------------------------------------------
      // 4. OPEN RAZORPAY TEST CHECKOUT
      // ---------------------------------------------------

      const checkout =
        new window.Razorpay({
          key:
            createdOrder.key_id,

          amount:
            createdOrder.amount_paise,

          currency:
            createdOrder.currency,

          name:
            "RecoverAI",

          description:
            transactionId
              ? `Revenue recovery · ${transactionId}`
              : "Revenue recovery",

          order_id:
            createdOrder.razorpay_order_id,


          // -------------------------------------------------
          // CHECKOUT SUCCESS CALLBACK
          // -------------------------------------------------

          handler:
            async (
              response:
                RazorpaySuccessResponse,
            ) => {
              try {
                setLoading(
                  true,
                );

                setError(
                  null,
                );


                // -------------------------------------------
                // Defensive browser consistency check
                // -------------------------------------------
                //
                // Backend remains authoritative.
                // -------------------------------------------

                if (
                  response.razorpay_order_id !==
                  createdOrder.razorpay_order_id
                ) {
                  throw new Error(
                    "Razorpay returned an unexpected order ID.",
                  );
                }


                // -------------------------------------------
                // 5. NORMAL PAYMENT VERIFICATION
                // -------------------------------------------

                try {
                  const verified =
                    await verifyRazorpayPayment({
                      recovery_job_id:
                        createdOrder.recovery_job_id,

                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,
                    });


                  if (
                    !verified.verified
                  ) {
                    throw new Error(
                      "Payment verification did not complete.",
                    );
                  }


                  applyVerifiedResult(
                    verified,
                  );

                  return;

                } catch (
                  verificationError
                ) {
                  console.warn(
                    "Normal Razorpay verification failed. Attempting reconciliation.",
                    verificationError,
                  );
                }


                // -------------------------------------------
                // 6. AUTOMATIC RECONCILIATION FALLBACK
                // -------------------------------------------
                //
                // Covers:
                //
                // payment captured at Razorpay
                //        ↓
                // callback verification network failure
                //        ↓
                // RecoverAI independently queries Razorpay
                //        ↓
                // order + amount + currency + capture checked
                // -------------------------------------------

                const reconciled =
                  await attemptReconciliation();


                if (
                  !reconciled
                ) {
                  throw new Error(
                    "Payment could not be verified or reconciled. Do not retry the payment until its gateway state is checked.",
                  );
                }

              } catch (err) {
                console.error(
                  "RecoverAI payment completion error:",
                  err,
                );

                setError(
                  err instanceof Error
                    ? err.message
                    : (
                      "Unable to verify or reconcile "
                      + "the Razorpay payment."
                    ),
                );

              } finally {
                setLoading(
                  false,
                );
              }
            },


          // -------------------------------------------------
          // CHECKOUT CLOSED
          // -------------------------------------------------

          modal: {
            ondismiss: () => {
              setLoading(
                false,
              );
            },
          },


          // -------------------------------------------------
          // DISPLAY ONLY
          // -------------------------------------------------

          theme: {
            color:
              "#111318",
          },

          retry: {
            enabled:
              true,
          },
        });


      checkout.open();

    } catch (err) {
      console.error(
        "Razorpay Checkout error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start Razorpay Checkout.",
      );

      setLoading(
        false,
      );
    }
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <div
      style={{
        display:
          "flex",

        flexDirection:
          "column",

        gap:
          10,
      }}
    >
      <button
        type="button"

        disabled={
          disabled ||
          loading ||
          completion !== null
        }

        onClick={
          handleCheckout
        }

        style={{
          display:
            "inline-flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          gap:
            8,

          minHeight:
            38,

          padding:
            "9px 14px",

          borderRadius:
            9,

          border:
            "1px solid rgba(229,220,199,0.15)",

          background:
            completion
              ? "rgba(94,159,119,0.10)"
              : loading
                ? "rgba(255,255,255,0.025)"
                : "rgba(229,220,199,0.07)",

          color:
            completion
              ? "#8FC49F"
              : loading
                ? "#747B83"
                : "#E5DCC7",

          fontSize:
            11,

          fontWeight:
            700,

          letterSpacing:
            "0.035em",

          cursor:
            disabled ||
            loading ||
            completion
              ? "not-allowed"
              : "pointer",

          transition:
            "all 160ms ease",
        }}
      >
        {completion ? (
          <>
            <CircleCheck
              size={14}
            />

            PAYMENT VERIFIED
          </>
        ) : loading ? (
          <>
            <LoaderCircle
              size={14}

              style={{
                animation:
                  "spin 1s linear infinite",
              }}
            />

            CHECKING PAYMENT
          </>
        ) : (
          <>
            <CreditCard
              size={14}
            />

            PAY WITH RAZORPAY
          </>
        )}
      </button>


      {/* ================================================= */}
      {/* ORDER STATUS                                      */}
      {/* ================================================= */}

      {order &&
        !completion && (
          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                6,

              fontSize:
                10,

              color:
                "#747B83",
            }}
          >
            <ShieldCheck
              size={12}
            />

            Razorpay Test Mode ·{" "}

            {formatPaise(
              order.amount_paise,
              order.currency,
            )}
          </div>
        )}


      {/* ================================================= */}
      {/* VERIFIED / RECONCILED STATUS                      */}
      {/* ================================================= */}

      {completion && (
        <div
          style={{
            padding:
              "10px 12px",

            borderRadius:
              8,

            border:
              "1px solid rgba(94,159,119,0.18)",

            background:
              "rgba(94,159,119,0.055)",

            color:
              "#8FC49F",

            fontSize:
              10,

            lineHeight:
              1.6,
          }}
        >
          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                6,

              fontWeight:
                700,
            }}
          >
            {completion.mode ===
            "RECONCILED" ? (
              <RefreshCw
                size={12}
              />
            ) : (
              <ShieldCheck
                size={12}
              />
            )}

            {completion.mode ===
            "RECONCILED"
              ? "Gateway reconciled"
              : "Gateway verified"}

            {" · "}

            {
              completion.paymentStatus
            }
          </div>
        </div>
      )}


      {/* ================================================= */}
      {/* ERROR                                             */}
      {/* ================================================= */}

      {error && (
        <div
          style={{
            padding:
              "10px 12px",

            borderRadius:
              8,

            border:
              "1px solid rgba(201,123,116,0.20)",

            background:
              "rgba(201,123,116,0.055)",

            color:
              "#C97B74",

            fontSize:
              10,

            lineHeight:
              1.5,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}