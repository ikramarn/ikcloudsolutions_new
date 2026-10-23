import { describe, expect, it } from 'vitest';
import type { DemoScenario } from '@/content/agents/demo-types';
import { demoScenarios, getScenario } from '@/content/agents/demos';
import { industries, INDUSTRY_SLUGS } from '@/content/agents/industries';

const EXPECTED_IDS = [
  'general-voice',
  'general-whatsapp',
  'clinics-voice',
  'clinics-whatsapp',
  'estate-agents-voice',
  'estate-agents-whatsapp',
  'home-services-voice',
  'home-services-whatsapp',
];

const FICTIONAL_BUSINESS: Record<string, string> = {
  clinics: 'Meadowbank Dental Practice',
  'estate-agents': 'Harbour Lane Lettings and Sales',
  'home-services': 'Pennant Heating and Plumbing',
};

/** Longest chain of quick-reply hops from a scenario. Throws on a cycle. */
function branchDepth(scenario: DemoScenario, trail: readonly string[] = []): number {
  if (trail.includes(scenario.id)) throw new Error(`Quick-reply cycle at ${scenario.id}`);
  const next = (scenario.quickReplies ?? []).map((reply) => {
    const target = getScenario(reply.nextScenarioId);
    if (!target) throw new Error(`Unknown quick-reply target ${reply.nextScenarioId}`);
    return 1 + branchDepth(target, [...trail, scenario.id]);
  });
  return next.length === 0 ? 0 : Math.max(...next);
}

describe('demo scenarios (A4)', () => {
  it('has exactly the eight agreed scenarios', () => {
    expect(demoScenarios.map((scenario) => scenario.id).sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it('has exactly three industries', () => {
    expect(industries.map((industry) => industry.slug)).toEqual([...INDUSTRY_SLUGS]);
    expect(INDUSTRY_SLUGS).toEqual(['clinics', 'estate-agents', 'home-services']);
  });

  it.each(industries)(
    'resolves both scripts for $slug to the right channel and industry',
    (industry) => {
      const voice = getScenario(industry.demoScriptIds.voice);
      const whatsapp = getScenario(industry.demoScriptIds.whatsapp);
      expect(voice).toMatchObject({ channel: 'voice', industry: industry.slug });
      expect(whatsapp).toMatchObject({ channel: 'whatsapp', industry: industry.slug });
    },
  );

  it('has a general voice and a general WhatsApp scenario', () => {
    expect(getScenario('general-voice')).toMatchObject({ channel: 'voice', industry: 'general' });
    expect(getScenario('general-whatsapp')).toMatchObject({
      channel: 'whatsapp',
      industry: 'general',
    });
  });

  describe.each(demoScenarios)('$id', (scenario) => {
    const text = [scenario.title, scenario.summary, ...scenario.turns.map((turn) => turn.text)];

    it('has at least six turns and an owner summary', () => {
      expect(scenario.turns.length).toBeGreaterThanOrEqual(6);
      expect(scenario.summary.trim().length).toBeGreaterThan(20);
    });

    it('names a fictional business', () => {
      const expected =
        scenario.industry === 'general'
          ? 'Example Business'
          : FICTIONAL_BUSINESS[scenario.industry];
      expect(scenario.fictionalBusiness).toBe(expected);
      expect(scenario.turns.some((turn) => turn.text.includes(scenario.fictionalBusiness))).toBe(
        true,
      );
    });

    it('has no price literals or forbidden claims', () => {
      for (const line of text) {
        expect(line).not.toMatch(/[$£]/);
        expect(line).not.toMatch(/human-like|indistinguishable|guarantee|24\/7/i);
      }
    });

    it('keeps quick-reply branches within depth two and only on WhatsApp', () => {
      if (scenario.channel === 'voice') expect(scenario.quickReplies).toBeUndefined();
      expect(branchDepth(scenario)).toBeLessThanOrEqual(2);
      for (const reply of scenario.quickReplies ?? []) {
        expect(getScenario(reply.nextScenarioId)?.channel).toBe('whatsapp');
      }
    });
  });

  it('opens every voice script with the AI disclosure', () => {
    for (const scenario of demoScenarios.filter((item) => item.channel === 'voice')) {
      const firstSpoken = scenario.turns.find((turn) => turn.speaker === 'ai');
      expect(firstSpoken?.text, scenario.id).toMatch(/AI assistant/);
      expect(firstSpoken?.text, scenario.id).toMatch(/recorded/);
    }
  });

  it('says it is an AI at the start of every WhatsApp script', () => {
    for (const scenario of demoScenarios.filter((item) => item.channel === 'whatsapp')) {
      const firstReply = scenario.turns.find((turn) => turn.speaker === 'ai');
      expect(firstReply?.text, scenario.id).toMatch(/AI assistant/);
    }
  });

  describe('safety content', () => {
    const turnsOf = (id: string) =>
      (getScenario(id)?.turns ?? []).map((turn) => turn.text).join(' ');

    it('points clinic emergencies at NHS 111 and 999 without giving medical advice', () => {
      const clinic = turnsOf('clinics-voice');
      expect(clinic).toMatch(/NHS 111/);
      expect(clinic).toMatch(/999/);
      expect(clinic).toMatch(/cannot give medical advice/);
    });

    it('sends a gas smell to the National Gas Emergency Service first', () => {
      expect(turnsOf('home-services-voice')).toMatch(
        /leave the property[\s\S]*National Gas Emergency Service on 0800 111 999/,
      );
    });

    it('does not negotiate or value in the estate agent scripts', () => {
      expect(turnsOf('estate-agents-voice')).toMatch(/cannot give a valuation/);
      expect(turnsOf('estate-agents-voice')).toMatch(/not able to advise on pricing/);
      expect(turnsOf('estate-agents-whatsapp')).toMatch(/cannot negotiate/);
    });
  });
});
