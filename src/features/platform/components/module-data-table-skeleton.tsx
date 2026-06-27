import type * as React from 'react';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { cn } from '@/lib/utils';

type ModuleDataTableSkeletonProps = Omit<
  React.ComponentProps<typeof DataTableSkeleton>,
  'columnCount'
> & {
  columnCount?: number;
};

export function ModuleDataTableSkeleton({
  columnCount = 5,
  rowCount = 10,
  filterCount = 1,
  withViewOptions = true,
  withPagination = true,
  className,
  ...props
}: ModuleDataTableSkeletonProps) {
  return (
    <DataTableSkeleton
      columnCount={columnCount}
      rowCount={rowCount}
      filterCount={filterCount}
      withViewOptions={withViewOptions}
      withPagination={withPagination}
      className={cn('min-h-[480px]', className)}
      {...props}
    />
  );
}
