'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Form } from '@/lib/api/generated/model/form';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import { cn } from '@/lib/utils';

import { SurveyFormCellAction } from './cell-action';
import {
  SURVEY_FORM_FRAMEWORK_OPTIONS,
  SURVEY_FORM_STATUS_OPTIONS,
  getSurveyFormStatusLabel
} from './options';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

function formatDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return dateFormatter.format(date);
}

function getStatusBadgeClassName(status?: Form['status']) {
  if (status === Status37cEnum.ACTIVE) return 'border-emerald-500/30 text-emerald-700';
  if (status === Status37cEnum.ARCHIVED) return 'text-muted-foreground';
  return 'border-amber-500/30 text-amber-700';
}

export const surveyFormsColumns: ColumnDef<Form>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    enableSorting: false,
    header: ({ column }: { column: Column<Form, unknown> }) => (
      <DataTableColumnHeader column={column} title='Formulario' />
    ),
    cell: ({ row }) => (
      <div className='flex min-w-[260px] flex-col gap-1'>
        <span className='font-medium'>{row.original.title}</span>
        {row.original.description ? (
          <span className='text-muted-foreground line-clamp-2 text-xs'>
            {row.original.description}
          </span>
        ) : (
          <span className='text-muted-foreground text-xs'>Sem descricao</span>
        )}
      </div>
    )
  },
  {
    id: 'framework',
    accessorKey: 'framework_code',
    enableSorting: false,
    enableColumnFilter: true,
    header: ({ column }: { column: Column<Form, unknown> }) => (
      <DataTableColumnHeader column={column} title='Framework' />
    ),
    cell: ({ row }) => <Badge variant='outline'>{row.original.framework_code || 'Custom'}</Badge>,
    meta: {
      label: 'Framework',
      variant: 'select',
      options: SURVEY_FORM_FRAMEWORK_OPTIONS
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    enableColumnFilter: true,
    header: ({ column }: { column: Column<Form, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className={cn(getStatusBadgeClassName(row.original.status))}>
        {getSurveyFormStatusLabel(row.original.status)}
      </Badge>
    ),
    meta: {
      label: 'Status',
      variant: 'select',
      options: SURVEY_FORM_STATUS_OPTIONS
    }
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    enableSorting: false,
    header: ({ column }: { column: Column<Form, unknown> }) => (
      <DataTableColumnHeader column={column} title='Criado em' />
    ),
    cell: ({ row }) => <span className='text-sm'>{formatDate(row.original.created_at)}</span>
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    enableSorting: false,
    header: ({ column }: { column: Column<Form, unknown> }) => (
      <DataTableColumnHeader column={column} title='Atualizado em' />
    ),
    cell: ({ row }) => <span className='text-sm'>{formatDate(row.original.updated_at)}</span>
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <SurveyFormCellAction data={row.original} />
  }
];
