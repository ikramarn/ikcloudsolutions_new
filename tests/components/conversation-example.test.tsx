import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ConversationExample } from '@/components/agents/ConversationExample';
import { getScenario } from '@/content/agents/demos';
import { industries } from '@/content/agents/industries';

describe('ConversationExample', () => {
  it.each(industries)('puts both panels for $slug in the server HTML', (industry) => {
    const html = renderToString(
      <ConversationExample
        voiceId={industry.demoScriptIds.voice}
        whatsappId={industry.demoScriptIds.whatsapp}
      />,
    );
    const voice = getScenario(industry.demoScriptIds.voice);
    const whatsapp = getScenario(industry.demoScriptIds.whatsapp);
    expect(html).toContain(voice?.turns[1]?.text.replace(/'/g, '&#x27;') ?? 'missing');
    expect(html).toContain(whatsapp?.title ?? 'missing');
    expect(html).toContain(voice?.title ?? 'missing');
  });

  it('hides the inactive panel with CSS rather than removing it', () => {
    const html = renderToString(
      <ConversationExample voiceId="clinics-voice" whatsappId="clinics-whatsapp" />,
    );
    expect(html).toContain('data-[state=inactive]:hidden');
    expect(html).toContain('data-state="inactive"');
  });

  it('labels the example as simulated and includes the owner summary', () => {
    render(
      <ConversationExample voiceId="home-services-voice" whatsappId="home-services-whatsapp" />,
    );
    expect(screen.getAllByText('Simulated').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('What the owner receives (example)').length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it('throws at build time for an unknown scenario', () => {
    expect(() => renderToString(<ConversationExample voiceId="nope" whatsappId="nope" />)).toThrow(
      /Unknown demo scenario/,
    );
  });
});
