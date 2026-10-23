'use client';

import dynamic from 'next/dynamic';
import { Container } from '@/components/ui/Container';

// Client wrapper: next/dynamic with ssr:false is only allowed in a client component. The island
// reads browser storage, so it renders on the client after the server HTML (banner and heading).
export const AcademyAppLazy = dynamic(
  () => import('@/components/academy/AcademyApp').then((module) => module.AcademyApp),
  {
    ssr: false,
    loading: () => (
      <Container className="py-12">
        <p role="status" className="text-slate-300">
          Loading the demo courses...
        </p>
      </Container>
    ),
  },
);
