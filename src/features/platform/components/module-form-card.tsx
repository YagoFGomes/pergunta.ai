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
    <Card className={cn('mx-auto w-full min-w-0 overflow-hidden', className)} {...props}>
      <CardHeader>
        <CardTitle className='text-left text-xl font-bold sm:text-2xl'>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('space-y-6 sm:space-y-8', contentClassName)}>
        {children}
        {footer ? (
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end [&_button]:w-full sm:[&_button]:w-auto'>
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
