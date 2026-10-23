'use client';

import type { ComponentProps, MouseEvent } from 'react';
import { useConsultation } from '@/components/forms/ConsultationProvider';
import type { ConsultationPreset } from '@/components/forms/ConsultationForm';
import { Button } from '@/components/ui/Button';

type ButtonProps = Extract<ComponentProps<typeof Button>, { href?: undefined }>;

interface ConsultationButtonProps extends Omit<ButtonProps, 'href' | 'asChild'> {
  preset?: ConsultationPreset;
}

/** A button that opens the consultation dialog (header, mobile menu, FinOps estimator). */
export function ConsultationButton({
  preset,
  onClick,
  children,
  ...rest
}: ConsultationButtonProps) {
  const { open } = useConsultation();
  return (
    <Button
      {...rest}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        open(preset);
      }}
    >
      {children ?? 'Book a consultation'}
    </Button>
  );
}
