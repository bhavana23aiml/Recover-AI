import type {
  AuditEvent,
  RecoveryExecutionResponse,
  RecoveryRequest,
} from "../types/recovery";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000";


type FastApiValidationError = {
  detail?: unknown;
};


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

    if (typeof detail === "string") {
      return detail;
    }

    if (detail !== undefined) {
      try {
        return JSON.stringify(detail);
      } catch {
        return fallback;
      }
    }
  }

  return fallback;
}


async function parseResponse<T>(
  response: Response,
): Promise<T> {
  let data: unknown;

  try {
    data = await response.json();
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


/**
 * Explicitly trigger one recovery attempt.
 *
 * Important:
 * This performs POST /api/recovery/execute.
 * It must only be called from an explicit recovery action,
 * not merely when opening the Decision Drawer.
 */
export async function executeRecovery(
  request: RecoveryRequest,
): Promise<RecoveryExecutionResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/recovery/execute`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(request),
    },
  );

  return parseResponse<RecoveryExecutionResponse>(
    response,
  );
}


/**
 * Read the real audit events already generated
 * by the backend for a transaction.
 *
 * This endpoint does NOT execute a recovery.
 */
export async function getRecoveryAudit(
  transactionId: string,
): Promise<AuditEvent[]> {
  const encodedTransactionId =
    encodeURIComponent(transactionId);

  const response = await fetch(
    `${API_BASE_URL}/api/recovery/audit/${encodedTransactionId}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<AuditEvent[]>(
    response,
  );
}