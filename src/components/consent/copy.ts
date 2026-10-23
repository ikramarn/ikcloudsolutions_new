/** Banner copy is a function of whether analytics is switched on, so it can never overstate it. */
export function bannerCopy(analyticsEnabled: boolean): string {
  if (analyticsEnabled) {
    return 'We use privacy-friendly analytics only if you accept. You can change your choice at any time.';
  }
  return 'We do not currently run any analytics. If we add privacy-friendly analytics later, we will only turn it on if you accept it.';
}

/** The same honesty rule for the /cookies page: derived from analytics.enabled, never typed. */
export function cookiesAnalyticsCopy(analyticsEnabled: boolean): string {
  if (analyticsEnabled) {
    return 'We use privacy-friendly analytics only if you accept them. You can change or withdraw your choice at any time with the cookie settings below.';
  }
  return 'We do not currently run any analytics. If we add privacy-friendly analytics later, we will only turn it on if you accept it, and we will update this page first.';
}
