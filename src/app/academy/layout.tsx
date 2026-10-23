import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';

// Every Academy page is a demo: kept out of search results (meta tag here, X-Robots-Tag header in
// next.config.ts) and never blocked in robots.txt, because a crawl block would hide the noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div role="note" className="border-b border-violet-brand/40 bg-violet-brand/15 py-3">
        <Container className="flex flex-wrap items-center gap-3 text-sm text-slate-100">
          <Badge tone="demo">Demo</Badge>
          <p>Demo: sample content, nothing here is a paid course.</p>
        </Container>
      </div>
      {children}
    </>
  );
}
