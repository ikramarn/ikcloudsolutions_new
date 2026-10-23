import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="py-24">
      <Container>
        <h1 className="text-4xl font-extrabold text-white">Page not found</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-300">
          We could not find that page. It may have moved, or the address may be wrong.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/">Go to the home page</Button>
          <Button href="/ai-agents" variant="secondary">
            AI Agents
          </Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
      </Container>
    </section>
  );
}
