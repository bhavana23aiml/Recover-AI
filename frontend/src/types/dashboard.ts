import type {
  FailureCode,
} from "./recovery";


// =========================================================
// DASHBOARD METRICS
// =========================================================

export interface DashboardMetrics {
  revenue_at_risk: number;

  revenue_recovered: number;

  recovery_rate: number;

  active_recoveries: number;

  failed_payments: number;

  recovered_today: number;
}


// =========================================================
// RECOVERY QUEUE TRANSACTION
// =========================================================

export interface Transaction {
  id: string;

  amount: number;

  failure_reason: string;

  failure_code: FailureCode;

  retry_count: number;

  agent_action: string;

  status: string;
}


// =========================================================
// LIVE AGENT ACTIVITY
// =========================================================

export interface AgentActivity {
  time: string;

  title: string;

  detail: string;
}


// =========================================================
// DASHBOARD API RESPONSE
// =========================================================

export interface DashboardResponse {
  metrics: DashboardMetrics;

  transactions: Transaction[];

  agent_activity: AgentActivity[];
}