import type { DashboardResponse } from "../types/dashboard";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getDashboardData(): Promise<DashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`);

  if (!response.ok) {
    throw new Error(
      `Failed to load dashboard data: ${response.status}`
    );
  }

  return response.json();
}