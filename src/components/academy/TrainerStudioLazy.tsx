'use client';

import dynamic from 'next/dynamic';
import { Container } from '@/components/ui/Container';

// Client wrapper for the course editor island (it reads browser storage, so no server render).
export const TrainerStudioLazy = dynamic(
  () => import('@/components/academy/TrainerStudio').then((module) => module.TrainerStudio),
  {
    ssr: false,
    loading: () => (
      <Container className="py-12">
        <p role="status" className="text-slate-300">
          Loading the course editor...
        </p>
      </Container>
    ),
  },
);
