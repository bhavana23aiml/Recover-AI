export type FailureCode =
  | "BANK_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "PAYMENT_TIMEOUT"
  | "INSUFFICIENT_FUNDS"
  | "MANDATE_FAILURE"
  | "CUSTOMER_ABANDONED"
  | "ISSUER_DECLINED"
  | "UNKNOWN_ERROR";


export type GuardrailStatus =
  | "ALLOWED"
  | "BLOCKED"
  | "REVIEW_REQUIRED";


export type ExecutionStatus =
  | "RECOVERED"
  | "ACTION_COMPLETED"
  | "FAILED"
  | "BLOCKED"
  | "REVIEW_REQUIRED";


export interface RecoveryRequest {
  transaction_id: string;
  amount: number;
  failure_code: FailureCode;
  retry_count: number;

  // Backend currently generates this when omitted.
  // We keep it optional for future explicit API usage.
  idempotency_key?: string;
}


export interface AuditEvent {
  step:
    | "DETECT"
    | "CLASSIFY"
    | "DECIDE"
    | "GUARDRAIL"
    | "EXECUTE"
    | "VERIFY"
    | "ERROR";

  status: string;

  message: string;

  timestamp: string;
}


export interface RecoveryExecutionResponse {
  transaction_id: string;

  amount: number;

  failure_code: FailureCode;

  category: string;

  action: string;

  confidence: number;

  guardrail_status: GuardrailStatus;

  can_execute: boolean;

  execution_status: ExecutionStatus;

  recovered_amount: number;

  simulation_probability: number | null;

  execution_mode: "SIMULATION";

  audit_trail: AuditEvent[];
}


export interface RecoveryDecisionDrawerData {
  transactionId: string;

  amount: number;

  failureCode: FailureCode;

  retryCount: number;

  category: string;

  action: string;

  confidence: number;

  guardrailStatus: GuardrailStatus;

  canExecute: boolean;

  executionStatus: ExecutionStatus;

  recoveredAmount: number;

  executionMode: "SIMULATION";

  simulationProbability: number | null;

  auditTrail: AuditEvent[];
}


export function mapRecoveryResponseToDrawer(
  response: RecoveryExecutionResponse,
  retryCount: number,
): RecoveryDecisionDrawerData {
  return {
    transactionId: response.transaction_id,

    amount: response.amount,

    failureCode: response.failure_code,

    retryCount,

    category: response.category,

    action: response.action,

    confidence: response.confidence,

    guardrailStatus: response.guardrail_status,

    canExecute: response.can_execute,

    executionStatus: response.execution_status,

    recoveredAmount: response.recovered_amount,

    executionMode: response.execution_mode,

    simulationProbability:
      response.simulation_probability,

    auditTrail: response.audit_trail,
  };
}