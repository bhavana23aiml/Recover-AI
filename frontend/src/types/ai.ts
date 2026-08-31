import type { FailureCode } from "./recovery";


// =========================================================
// AI REASONING REQUEST
// =========================================================

export interface AIReasoningRequest {
  transaction_id: string;
  amount: number;
  failure_code: FailureCode;
  retry_count: number;
}


// =========================================================
// AI REASONING RESPONSE
// =========================================================

export interface AIReasoningResponse {
  transaction_id: string;

  diagnosis: string;

  recovery_rationale: string;

  confidence_narrative: string;

  safety_explanation: string;

  operator_summary: string;

  source: string;

  ai_used: boolean;

  fallback_used: boolean;
}


// =========================================================
// AI REASONING STATE
// =========================================================

export interface AIReasoningState {
  data: AIReasoningResponse | null;
  loading: boolean;
  error: string | null;
}


// =========================================================
// DISPLAY HELPERS
// =========================================================

export function isGroqCloudReasoning(
  reasoning: AIReasoningResponse,
): boolean {
  return (
    reasoning.ai_used === true &&
    reasoning.source === "llm:groqcloud"
  );
}


export function isDeterministicFallback(
  reasoning: AIReasoningResponse,
): boolean {
  return (
    reasoning.fallback_used === true ||
    reasoning.source === "deterministic_fallback"
  );
}


export function getReasoningSourceLabel(
  reasoning: AIReasoningResponse,
): string {
  if (isGroqCloudReasoning(reasoning)) {
    return "GROQCLOUD";
  }

  if (isDeterministicFallback(reasoning)) {
    return "DETERMINISTIC FALLBACK";
  }

  return reasoning.source
    .replace("llm:", "")
    .replaceAll("_", " ")
    .toUpperCase();
}