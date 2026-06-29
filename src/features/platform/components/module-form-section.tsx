import type * as React from 'react';

import { FieldDescription, FieldGroup, FieldLegend, FieldSeparator } from '@/components/ui/field';
import { MODULE_FORM_GRID_CLASSNAME } from '@/features/platform/constants/module-form';
import { cn } from '@/lib/utils';

type ModuleFormSectionProps = React.ComponentProps<'section'> & {
  title?: string;
  description?: string;
  columns?: 1 | 2;
  separated?: boolean;
};

export function ModuleFormSection({
  title,
  description,
  columns = 2,
  separated = false,
  className,
  children,
  ...props
}: ModuleFormSectionProps) {
  return (
    <section className={cn('min-w-0 space-y-4', className)} {...props}>
      {separated ? <FieldSeparator /> : null}
      {title || description ? (
        <div className='min-w-0 space-y-1'>
          {title ? <FieldLegend>{title}</FieldLegend> : null}
          {description ? <FieldDescription>{description}</FieldDescription> : null}
        </div>
      ) : null}
      <FieldGroup className={columns === 1 ? 'grid min-w-0 gap-6' : MODULE_FORM_GRID_CLASSNAME}>
        {children}
      </FieldGroup>
    </section>
  );
}
