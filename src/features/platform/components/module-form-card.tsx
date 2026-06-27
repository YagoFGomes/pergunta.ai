import type * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ModuleFormCardProps = React.ComponentProps<typeof Card> & {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
};

export function ModuleFormCard({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  ...props
}: ModuleFormCardProps) {
  return (
    <Card className={cn('mx-auto w-full', className)} {...props}>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('space-y-8', contentClassName)}>
        {children}
        {footer ? (
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>{footer}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
