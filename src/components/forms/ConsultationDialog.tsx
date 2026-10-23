'use client';

import { ConsultationForm, type ConsultationPreset } from '@/components/forms/ConsultationForm';
import { Modal } from '@/components/ui/Modal';

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset?: ConsultationPreset | undefined;
  /** Defaults to NEXT_PUBLIC_TURNSTILE_SITE_KEY. */
  turnstileSiteKey?: string | undefined;
}

/**
 * The form is mounted by the dialog's content, so it exists only while the dialog is open and
 * its whole state resets on close. There is no early return above any hook.
 */
export function ConsultationDialog({
  open,
  onOpenChange,
  preset,
  turnstileSiteKey,
}: ConsultationDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Book a consultation"
      description="Tell us what you need and we will reply by email to arrange a time."
      className="sm:max-w-2xl"
    >
      <ConsultationForm preset={preset} turnstileSiteKey={turnstileSiteKey} />
    </Modal>
  );
}
