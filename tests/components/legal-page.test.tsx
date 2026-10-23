import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { LegalPage } from '@/components/legal/LegalPage';
import { cookiesDocument } from '@/content/legal/cookies';
import { dpaSummaryDocument } from '@/content/legal/dpa-summary';
import { privacyDocument } from '@/content/legal/privacy';
import { securityDocument } from '@/content/legal/security';
import { storageInventory } from '@/content/legal/storage-inventory';
import { siteConfig } from '@/config/site';

function renderPage(doc: Parameters<typeof LegalPage>[0]['doc']) {
  return render(
    <ConsentProvider>
      <LegalPage doc={doc} />
    </ConsentProvider>,
  );
}

describe('LegalPage', () => {
  it('shows one h1, the last updated date and a table of contents', () => {
    renderPage(privacyDocument);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
    const toc = screen.getByRole('navigation', { name: 'On this page' });
    expect(within(toc).getAllByRole('link')).toHaveLength(privacyDocument.sections.length);
  });

  it('shows the draft banner while legal pages are unreviewed', () => {
    expect(siteConfig.legalReviewed).toBe(false);
    renderPage(privacyDocument);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders [placeholders] as visibly marked text', () => {
    const { container } = renderPage(privacyDocument);
    const marks = container.querySelectorAll('mark[data-placeholder]');
    expect(marks.length).toBeGreaterThan(0);
    for (const mark of marks) expect(mark.textContent).toMatch(/^\[.+\]$/);
  });
});

describe('/cookies content', () => {
  it('has the honest analytics sentence, the full inventory and the settings button', () => {
    renderPage(cookiesDocument(false));
    expect(screen.getByText(/do not currently run any analytics/)).toBeInTheDocument();
    for (const row of storageInventory) {
      expect(screen.getByRole('rowheader', { name: row.item })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Cookie settings' })).toBeInTheDocument();
  });
});

describe('security and DPA summary wording', () => {
  it('states that no certification is held', () => {
    renderPage(securityDocument);
    expect(
      screen.getByText(
        /We do not currently hold ISO 27001, SOC 2 or Cyber Essentials certification\./,
      ),
    ).toBeInTheDocument();
  });

  it('heads the subprocessor list as planned and to be confirmed', () => {
    renderPage(dpaSummaryDocument);
    expect(
      screen.getByRole('heading', {
        name: /Planned subprocessors, to be confirmed before launch/,
      }),
    ).toBeInTheDocument();
  });
});
