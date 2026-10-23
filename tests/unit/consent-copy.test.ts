import { describe, expect, it } from 'vitest';
import { bannerCopy, cookiesAnalyticsCopy } from '@/components/consent/copy';
import { analyticsConfig } from '@/config/analytics';

describe('analytics copy is a function of analytics.enabled', () => {
  it('banner copy says "do not currently run" when analytics is off', () => {
    expect(bannerCopy(false)).toContain('do not currently run');
  });

  it('cookies page copy says "do not currently run" when analytics is off', () => {
    expect(cookiesAnalyticsCopy(false)).toContain('do not currently run');
  });

  it('neither says it when analytics is on', () => {
    expect(bannerCopy(true)).not.toContain('do not currently run');
    expect(cookiesAnalyticsCopy(true)).not.toContain('do not currently run');
  });

  it('launches with analytics switched off', () => {
    expect(analyticsConfig.enabled).toBe(false);
  });
});
