import type {
  DashboardResponse,
} from "../types/dashboard";

import {
  authenticatedJson,
} from "./authFetch";


export async function getDashboardData(): Promise<DashboardResponse> {
  return authenticatedJson<DashboardResponse>(
    "/api/dashboard",
  );
}