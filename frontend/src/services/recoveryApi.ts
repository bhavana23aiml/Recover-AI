import type {
  AuditEvent,
  RecoveryExecutionResponse,
  RecoveryRequest,
} from "../types/recovery";

import {
  authenticatedFetch,
} from "./authFetch";


// =========================================================
// FASTAPI ERROR SHAPE
// =========================================================

type FastApiValidationError = {
  detail?: unknown;
};


// =========================================================
// ERROR MESSAGE
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
      data as FastApiValidationError
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
      `RecoverAI API returned an invalid response (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `RecoverAI API request failed with status ${response.status}.`,
      ),
    );
  }

  return data as T;
}


// =========================================================
// EXECUTE RECOVERY
// =========================================================

/**
 * Explicitly trigger one recovery attempt.
 *
 * Authentication:
 *
 * A valid Supabase session is required.
 *
 * IMPORTANT:
 *
 * This performs:
 *
 * POST /api/recovery/execute
 *
 * It must only be called from an explicit recovery action.
 *
 * Opening the Decision Drawer must NOT call this function.
 */
export async function executeRecovery(
  request: RecoveryRequest,
): Promise<RecoveryExecutionResponse> {
  const response =
    await authenticatedFetch(
      "/api/recovery/execute",
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          request,
        ),
      },
    );

  return parseResponse<RecoveryExecutionResponse>(
    response,
  );
}


// =========================================================
// GET RECOVERY AUDIT
// =========================================================

/**
 * Read the real audit events already generated
 * by the backend for a transaction.
 *
 * Authentication:
 *
 * A valid Supabase session is required.
 *
 * This endpoint does NOT execute recovery.
 */
export async function getRecoveryAudit(
  transactionId: string,
): Promise<AuditEvent[]> {
  const encodedTransactionId =
    encodeURIComponent(
      transactionId,
    );

  const response =
    await authenticatedFetch(
      `/api/recovery/audit/${encodedTransactionId}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      },
    );

  return parseResponse<AuditEvent[]>(
    response,
  );
}