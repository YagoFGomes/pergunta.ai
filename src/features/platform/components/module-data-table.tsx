'use client';

import type { Table as TanstackTable } from '@tanstack/react-table';
import type * as React from 'react';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { cn } from '@/lib/utils';

type ModuleDataTableProps<TData> = React.ComponentProps<'div'> & {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  toolbarChildren?: React.ReactNode;
  toolbarClassName?: string;
  showToolbar?: boolean;
};

export function ModuleDataTable<TData>({
  table,
  actionBar,
  toolbarChildren,
  toolbarClassName,
  showToolbar = true,
  className,
  ...props
}: ModuleDataTableProps<TData>) {
  return (
    <div
      className={cn('flex min-h-[360px] min-w-0 flex-1 flex-col sm:min-h-[480px]', className)}
      {...props}
    >
      <DataTable table={table} actionBar={actionBar}>
        {showToolbar ? (
          <DataTableToolbar table={table} className={toolbarClassName}>
            {toolbarChildren}
          </DataTableToolbar>
        ) : null}
      </DataTable>
    </div>
  );
}
