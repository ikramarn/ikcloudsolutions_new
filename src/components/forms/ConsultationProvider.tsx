'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ConsultationDialogLazy } from '@/components/forms/ConsultationDialogLazy';
import type { ConsultationPreset } from '@/components/forms/ConsultationForm';

interface ConsultationContextValue {
  /** Opens the consultation dialog, optionally with the "what do you need" choice preset. */
  open: (preset?: ConsultationPreset) => void;
  close: () => void;
}

const ConsultationContext = createContext<ConsultationContextValue | null>(null);

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  // The dialog code is only requested after the first open().
  const [hasOpened, setHasOpened] = useState(false);
  const [preset, setPreset] = useState<ConsultationPreset | undefined>(undefined);

  const open = useCallback((next?: ConsultationPreset) => {
    setPreset(next);
    setHasOpened(true);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ConsultationContext value={value}>
      {children}
      {hasOpened ? (
        <ConsultationDialogLazy open={isOpen} onOpenChange={setIsOpen} preset={preset} />
      ) : null}
    </ConsultationContext>
  );
}

export function useConsultation(): ConsultationContextValue {
  const context = useContext(ConsultationContext);
  if (!context) throw new Error('useConsultation must be used inside <ConsultationProvider>.');
  return context;
}
