/** Banner copy is a function of whether analytics is switched on, so it can never overstate it. */
export function bannerCopy(analyticsEnabled: boolean): string {
  if (analyticsEnabled) {
    return 'We use privacy-friendly analytics only if you accept. You can change your choice at any time.';
  }
  return 'We do not currently run any analytics. If we add privacy-friendly analytics later, we will only turn it on if you accept it.';
}
