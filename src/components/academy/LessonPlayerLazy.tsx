'use client';

import dynamic from 'next/dynamic';

// The lesson dialog (video, tabs, quiz) loads on first open, so the catalogue stays light.
export const LessonPlayerLazy = dynamic(
  () => import('@/components/academy/LessonPlayer').then((module) => module.LessonPlayer),
  { ssr: false },
);
