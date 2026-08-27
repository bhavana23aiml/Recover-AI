// =========================================================
// RECOVERAI — RAZORPAY TEST MODE API
// =========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000";


// =========================================================
// TYPES
// =========================================================

export interface RazorpayRecoveryOrderRequest {
  recovery_job_id: string;
}


export interface RazorpayRecoveryOrderResponse {
  recovery_job_id: string;

  razorpay_order_id: string;

  amount_paise: number;

  currency: string;

  status: string;

  key_id: string;

  execution_mode: "RAZORPAY_TEST";
}


export interface RazorpayVerifyPaymentRequest {
  recovery_job_id: string;

  razorpay_order_id: string;

  razorpay_payment_id: string;

  razorpay_signature: string;
}


export interface RazorpayVerifyPaymentResponse {
  recovery_job_id: string;

  razorpay_order_id: string;

  razorpay_payment_id: string;

  payment_status: string;

  verified: boolean;

  execution_mode: "RAZORPAY_TEST";
}


export interface RazorpayReconcilePaymentRequest {
  recovery_job_id: string;
}


export interface RazorpayReconcilePaymentResponse {
  recovery_job_id: string;

  transaction_id: string;

  razorpay_order_id: string;

  razorpay_payment_id: string;

  amount_paise: number;

  currency: string;

  payment_status: string;

  reconciled: boolean;

  execution_mode: "RAZORPAY_TEST";
}


interface FastApiErrorResponse {
  detail?: unknown;
}


// =========================================================
// ERROR HANDLING
// =========================================================

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    const detail = (
      data as FastApiErrorResponse
    ).detail;

    if (
      typeof detail === "string"
    ) {
      return detail;
    }

    if (
      detail !== undefined
    ) {
      try {
        return JSON.stringify(
          detail,
        );
      } catch {
        return fallback;
      }
    }
  }

  return fallback;
}


// =========================================================
// RESPONSE PARSER
// =========================================================

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  let data: unknown;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      `RecoverAI Razorpay API returned an invalid response (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `RecoverAI Razorpay request failed with status ${response.status}.`,
      ),
    );
  }

  return data as T;
}


// =========================================================
// CREATE RAZORPAY RECOVERY ORDER
// =========================================================
//
// IMPORTANT:
//
// Frontend sends ONLY recovery_job_id.
//
// It does NOT decide:
//
// - amount
// - currency
// - guardrail status
//
// RecoverAI backend loads trusted values
// from persistence.
// =========================================================

export async function createRazorpayRecoveryOrder(
  recoveryJobId: string,
): Promise<RazorpayRecoveryOrderResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/razorpay/recovery-order`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body:
          JSON.stringify({
            recovery_job_id:
              recoveryJobId,
          }),
      },
    );

  return parseResponse<RazorpayRecoveryOrderResponse>(
    response,
  );
}


// =========================================================
// VERIFY RAZORPAY CHECKOUT PAYMENT
// =========================================================
//
// Razorpay Checkout gives the browser:
//
// - razorpay_order_id
// - razorpay_payment_id
// - razorpay_signature
//
// Browser success is NOT considered verified.
//
// RecoverAI backend performs:
// - persisted order validation
// - cryptographic signature verification
// - independent Razorpay fetch
// - amount verification
// - currency verification
// - captured-status verification
// =========================================================

export async function verifyRazorpayPayment(
  request: RazorpayVerifyPaymentRequest,
): Promise<RazorpayVerifyPaymentResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/razorpay/verify-payment`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body:
          JSON.stringify(
            request,
          ),
      },
    );

  return parseResponse<RazorpayVerifyPaymentResponse>(
    response,
  );
}


// =========================================================
// RECONCILE RAZORPAY PAYMENT
// =========================================================
//
// Used when:
//
// Razorpay payment succeeds
//        ↓
// normal browser verification fails/times out
//        ↓
// frontend asks RecoverAI to reconcile
//        ↓
// RecoverAI independently queries Razorpay
//
// IMPORTANT:
//
// Frontend sends ONLY recovery_job_id.
//
// Frontend does NOT send:
// - payment ID
// - order ID
// - amount
// - currency
// - payment status
//
// RecoverAI discovers and verifies these independently.
// =========================================================

export async function reconcileRazorpayPayment(
  recoveryJobId: string,
): Promise<RazorpayReconcilePaymentResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/razorpay/reconcile-payment`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body:
          JSON.stringify({
            recovery_job_id:
              recoveryJobId,
          }),
      },
    );

  return parseResponse<RazorpayReconcilePaymentResponse>(
    response,
  );
}