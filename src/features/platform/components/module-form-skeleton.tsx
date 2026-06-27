import type * as React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ModuleFormSkeletonProps = React.ComponentProps<typeof Card> & {
  fieldCount?: number;
  withTextarea?: boolean;
};

export function ModuleFormSkeleton({
  fieldCount = 4,
  withTextarea = true,
  className,
  ...props
}: ModuleFormSkeletonProps) {
  return (
    <Card className={cn('mx-auto w-full', className)} {...props}>
      <CardHeader className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-full max-w-md' />
      </CardHeader>
      <CardContent className='space-y-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {Array.from({ length: fieldCount }).map((_, index) => (
            <div key={index} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>
        {withTextarea ? (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-28 w-full' />
          </div>
        ) : null}
        <div className='flex justify-end gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-32' />
        </div>
      </CardContent>
    </Card>
  );
}
