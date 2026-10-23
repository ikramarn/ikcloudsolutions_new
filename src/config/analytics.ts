// Analytics is off at launch and no analytics package is installed.
// When it is turned on, set `enabled` to true and render the analytics script inside
// AnalyticsGate, which only renders its children for visitors who accepted analytics.
export const analyticsConfig = {
  enabled: false,
} as const;
