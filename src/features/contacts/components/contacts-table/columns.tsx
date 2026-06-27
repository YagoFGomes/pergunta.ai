'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import type { EmailContact } from '@/lib/api/generated/model/emailContact';
import { EmailContactStatusEnum } from '@/lib/api/generated/model/emailContactStatusEnum';
import { cn } from '@/lib/utils';

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

function getStatusLabel(status?: EmailContact['status']) {
  if (status === EmailContactStatusEnum.UNSUBSCRIBED) return 'Descadastrado';
  if (status === EmailContactStatusEnum.BOUNCED) return 'Bounced';
  return 'Ativo';
}

function getStatusClassName(status?: EmailContact['status']) {
  if (status === EmailContactStatusEnum.ACTIVE || !status) {
    return 'border-emerald-500/30 text-emerald-700';
  }

  if (status === EmailContactStatusEnum.UNSUBSCRIBED) {
    return 'border-amber-500/30 text-amber-700';
  }

  return 'text-muted-foreground';
}

type GetContactsByListColumnsConfig = {
  onEdit?: (contact: EmailContact) => void;
  onDelete?: (contact: EmailContact) => void;
  disableActions?: boolean;
};

export function getContactsByListColumns({
  onEdit,
  onDelete,
  disableActions = false
}: GetContactsByListColumnsConfig = {}): ColumnDef<EmailContact>[] {
  return [
    {
      id: 'email',
      accessorKey: 'email',
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Contato',
        placeholder: 'Buscar email...',
        variant: 'text'
      },
      header: ({ column }: { column: Column<EmailContact, unknown> }) => (
        <DataTableColumnHeader column={column} title='Contato' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-[220px] flex-col gap-1'>
          <span className='font-medium'>{row.original.name}</span>
          <span className='text-muted-foreground text-xs'>{row.original.email}</span>
        </div>
      )
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailContact, unknown> }) => (
        <DataTableColumnHeader column={column} title='Telefone' />
      ),
      cell: ({ row }) => <span className='text-sm'>{row.original.phone || '-'}</span>
    },
    {
      id: 'status',
      accessorKey: 'status',
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Status',
        variant: 'select',
        options: [
          { label: 'Ativo', value: EmailContactStatusEnum.ACTIVE },
          { label: 'Descadastrado', value: EmailContactStatusEnum.UNSUBSCRIBED },
          { label: 'Bounced', value: EmailContactStatusEnum.BOUNCED }
        ]
      },
      header: ({ column }: { column: Column<EmailContact, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className={cn(getStatusClassName(row.original.status))}>
          {getStatusLabel(row.original.status)}
        </Badge>
      )
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailContact, unknown> }) => (
        <DataTableColumnHeader column={column} title='Criado em' />
      ),
      cell: ({ row }) => <span className='text-sm'>{formatDate(row.original.created_at)}</span>
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Editar contato'
            disabled={disableActions || !onEdit}
            onClick={() => onEdit?.(row.original)}
          >
            <Icons.edit className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Excluir contato'
            className='text-destructive hover:text-destructive'
            disabled={disableActions || !onDelete}
            onClick={() => onDelete?.(row.original)}
          >
            <Icons.trash className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  ];
}
