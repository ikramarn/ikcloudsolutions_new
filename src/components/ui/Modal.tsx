'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required: dialogs must be named. */
  title: string;
  description?: string;
  /** While true the overlay click and Esc do not close the dialog (for example while submitting). */
  busy?: boolean;
  className?: string;
  children: ReactNode;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  busy = false,
  className,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          onPointerDownOutside={(event) => {
            if (busy) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          className={cn(
            'glass-panel-glow fixed inset-0 z-50 flex flex-col overflow-y-auto p-6 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[90vh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl',
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-extrabold text-white">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-slate-300">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close
              aria-label="Close dialog"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
