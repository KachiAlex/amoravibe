export type AdminMetricsSnapshot = {
  totalUsers: number;
  activeUsers: number;
  signupsThisWeek: number;
  bannedUsers: number;
};

/**
 * Placeholder metrics loader. In production this will call the trust service.
 * For now we keep the function async so callers can await it uniformly.
 */
export async function getAdminMetrics(): Promise<AdminMetricsSnapshot> {
  return {
    totalUsers: 1200,
    activeUsers: 350,
    signupsThisWeek: 24,
    bannedUsers: 12,
  };
}
