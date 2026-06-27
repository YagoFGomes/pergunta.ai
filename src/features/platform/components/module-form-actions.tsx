'use client';

import { Button } from '@/components/ui/button';
import { MODULE_FORM_ACTION_LABELS } from '@/features/platform/constants/module-form';
import type { ModuleFormMode } from '@/features/platform/lib/module-form';
import { cn } from '@/lib/utils';

type ModuleFormActionsProps = React.ComponentProps<'div'> & {
  mode?: ModuleFormMode;
  formId?: string;
  isPending?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
};

export function ModuleFormActions({
  mode = 'create',
  formId,
  isPending = false,
  submitLabel,
  cancelLabel = MODULE_FORM_ACTION_LABELS.cancel,
  onCancel,
  className,
  ...props
}: ModuleFormActionsProps) {
  const resolvedSubmitLabel = submitLabel ?? MODULE_FORM_ACTION_LABELS[mode];

  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    >
      {onCancel ? (
        <Button type='button' variant='outline' onClick={onCancel}>
          {cancelLabel}
        </Button>
      ) : null}
      <Button type='submit' form={formId} isLoading={isPending}>
        {resolvedSubmitLabel}
      </Button>
    </div>
  );
}
