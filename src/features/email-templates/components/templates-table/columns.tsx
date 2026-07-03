'use client';

import Link from 'next/link';
import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ModuleRowActions } from '@/features/platform/components/module-row-actions';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import { Status372Enum } from '@/lib/api/generated/model/status372Enum';
import { cn } from '@/lib/utils';

import {
  EMAIL_TEMPLATE_STATUS_OPTIONS,
  EMAIL_TEMPLATE_TYPE_OPTIONS,
  getEmailTemplateStatusLabel,
  getEmailTemplateTypeLabel
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

function getStatusClassName(status?: EmailTemplate['status']) {
  if (status === Status372Enum.ACTIVE || !status) {
    return 'border-emerald-500/30 text-emerald-700';
  }

  return 'text-muted-foreground';
}

function getRequiredVariablesCount(requiredVariables: EmailTemplate['required_variables']) {
  if (!requiredVariables) return 0;
  if (Array.isArray(requiredVariables)) return requiredVariables.length;
  if (typeof requiredVariables === 'object') return Object.keys(requiredVariables).length;

  return 0;
}

type GetEmailTemplatesColumnsConfig = {
  onDelete?: (template: EmailTemplate) => void;
  disableActions?: boolean;
};

export function getEmailTemplatesColumns({
  onDelete,
  disableActions = false
}: GetEmailTemplatesColumnsConfig = {}): ColumnDef<EmailTemplate>[] {
  return [
    {
      id: 'search',
      accessorFn: (template) => `${template.name} ${template.subject} ${template.slug}`,
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Template',
        placeholder: 'Buscar template...',
        variant: 'text'
      },
      header: ({ column }: { column: Column<EmailTemplate, unknown> }) => (
        <DataTableColumnHeader column={column} title='Template' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-[280px] flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-medium'>{row.original.name}</span>
            {row.original.is_default ? <Badge variant='secondary'>Padrao</Badge> : null}
          </div>
          <span className='text-muted-foreground line-clamp-1 text-xs'>{row.original.subject}</span>
          <span className='text-muted-foreground font-mono text-xs'>{row.original.slug}</span>
        </div>
      )
    },
    {
      id: 'template_type',
      accessorKey: 'template_type',
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Tipo',
        variant: 'select',
        options: EMAIL_TEMPLATE_TYPE_OPTIONS
      },
      header: ({ column }: { column: Column<EmailTemplate, unknown> }) => (
        <DataTableColumnHeader column={column} title='Tipo' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>{getEmailTemplateTypeLabel(row.original.template_type)}</Badge>
      )
    },
    {
      id: 'language',
      accessorKey: 'language',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailTemplate, unknown> }) => (
        <DataTableColumnHeader column={column} title='Idioma' />
      ),
      cell: ({ row }) => <span className='text-sm uppercase'>{row.original.language || '-'}</span>
    },
    {
      id: 'required_variables',
      accessorKey: 'required_variables',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailTemplate, unknown> }) => (
        <DataTableColumnHeader column={column} title='Variáveis' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>
          {getRequiredVariablesCount(row.original.required_variables)}
        </Badge>
      )
    },
    {
      id: 'status',
      accessorKey: 'status',
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Status',
        variant: 'select',
        options: EMAIL_TEMPLATE_STATUS_OPTIONS
      },
      header: ({ column }: { column: Column<EmailTemplate, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className={cn(getStatusClassName(row.original.status))}>
          {getEmailTemplateStatusLabel(row.original.status)}
        </Badge>
      )
    },
    {
      id: 'updated_at',
      accessorKey: 'updated_at',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailTemplate, unknown> }) => (
        <DataTableColumnHeader column={column} title='Atualizado em' />
      ),
      cell: ({ row }) => <span className='text-sm'>{formatDate(row.original.updated_at)}</span>
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      size: 56,
      minSize: 56,
      maxSize: 56,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <ModuleRowActions
            triggerAriaLabel='Abrir ações do template'
            items={[
              {
                key: 'edit',
                label: 'Editar template',
                icon: Icons.edit,
                href: `/dashboard/email-templates/${row.original.id}/edit`
              },
              {
                key: 'delete',
                label: 'Excluir template',
                icon: Icons.trash,
                onSelect: () => onDelete?.(row.original),
                disabled: disableActions || !onDelete,
                destructive: true,
                separatorBefore: true
              }
            ]}
          />
        </div>
      )
    }
  ];
}
