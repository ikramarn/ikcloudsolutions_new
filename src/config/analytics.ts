// Analytics is off at launch and no analytics package is installed.
// When it is turned on, set `enabled` to true and implement loadAnalytics(); AnalyticsGate only
// renders its children for visitors who accepted analytics.
export const analyticsConfig = {
  enabled: false,
} as const;

/** Hook point for a future privacy-friendly analytics script. Intentionally a no-op. */
export function loadAnalytics(): void {}
