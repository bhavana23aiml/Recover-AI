import type {
  AIReasoningRequest,
  AIReasoningResponse,
} from "../types/ai";

import {
  authenticatedFetch,
} from "./authFetch";


// =========================================================
// FASTAPI ERROR SHAPE
// =========================================================

type FastApiError = {
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
      data as FastApiError
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
      `RecoverAI AI API returned an invalid response (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `RecoverAI AI request failed with status ${response.status}.`,
      ),
    );
  }

  return data as T;
}


// =========================================================
// GET AI REASONING
// =========================================================

/**
 * Request an explanation for an already-determined
 * RecoverAI recovery decision.
 *
 * Endpoint:
 *
 * POST /api/ai/reasoning
 *
 * Authentication:
 *
 * A valid Supabase session is required.
 *
 * IMPORTANT:
 *
 * This function remains explanation-only.
 *
 * Calling it does NOT:
 *
 * - execute recovery
 * - retry payment
 * - call Razorpay checkout
 * - create a Razorpay order
 * - verify payment
 * - change guardrails
 * - mark revenue recovered
 */
export async function getAIReasoning(
  request: AIReasoningRequest,
): Promise<AIReasoningResponse> {
  const response =
    await authenticatedFetch(
      "/api/ai/reasoning",
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

  return parseResponse<AIReasoningResponse>(
    response,
  );
}