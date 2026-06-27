'use client';

import { useStore } from '@tanstack/react-form';
import { Switch } from '@/components/ui/switch';
import { FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  useFieldContext,
  FormFieldSet,
  FormField,
  createFormField
} from '@/components/ui/form-context';

interface SwitchFieldProps {
  label: string;
  description?: string;
  disabled?: boolean;
}

export function SwitchField({ label, description, disabled = false }: SwitchFieldProps) {
  const field = useFieldContext();
  const value = useStore(field.store, (s) => s.value) as boolean;

  return (
    <FormFieldSet>
      <FormField orientation='horizontal'>
        <div className='flex flex-1 flex-col gap-1.5 leading-snug'>
          <FieldLabel className='text-base'>{label}</FieldLabel>
          {description && <FieldDescription>{description}</FieldDescription>}
        </div>
        <Switch
          checked={value}
          onCheckedChange={field.handleChange}
          onBlur={field.handleBlur}
          disabled={disabled}
        />
      </FormField>
    </FormFieldSet>
  );
}

export const FormSwitchField = createFormField(SwitchField);
