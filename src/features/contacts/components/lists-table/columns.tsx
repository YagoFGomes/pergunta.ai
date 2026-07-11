'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ModuleRowActions } from '@/features/platform/components/module-row-actions';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import { Status372Enum } from '@/lib/api/generated/model/status372Enum';
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

function getStatusLabel(status?: EmailList['status']) {
  return status === Status372Enum.ACTIVE ? 'Ativa' : 'Inativa';
}

function getStatusClassName(status?: EmailList['status']) {
  if (status === Status372Enum.ACTIVE) return 'border-emerald-500/30 text-emerald-700';
  return 'text-muted-foreground';
}

type GetContactListsColumnsConfig = {
  onEdit?: (list: EmailList) => void;
  onDelete?: (list: EmailList) => void;
  disableActions?: boolean;
};

export function getContactListsColumns({
  onEdit,
  onDelete,
  disableActions = false
}: GetContactListsColumnsConfig = {}): ColumnDef<EmailList>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailList, unknown> }) => (
        <DataTableColumnHeader column={column} title='Lista' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-[240px] flex-col gap-1'>
          <span className='font-medium'>{row.original.name}</span>
          <span className='text-muted-foreground line-clamp-2 text-xs'>
            {row.original.description || 'Sem descrição'}
          </span>
        </div>
      )
    },
    {
      id: 'contact_count',
      accessorKey: 'contact_count',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailList, unknown> }) => (
        <DataTableColumnHeader column={column} title='Contatos' />
      ),
      cell: ({ row }) => <Badge variant='outline'>{row.original.contact_count}</Badge>
    },
    {
      id: 'status',
      accessorKey: 'status',
      enableSorting: false,
      header: ({ column }: { column: Column<EmailList, unknown> }) => (
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
      header: ({ column }: { column: Column<EmailList, unknown> }) => (
        <DataTableColumnHeader column={column} title='Criada em' />
      ),
      cell: ({ row }) => <span className='text-sm'>{formatDate(row.original.created_at)}</span>
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
            triggerAriaLabel='Abrir ações da lista'
            items={[
              {
                key: 'contacts',
                label: 'Abrir contatos',
                icon: Icons.teams,
                href: `/dashboard/contacts/lists/${row.original.id}/contacts`
              },
              {
                key: 'edit',
                label: 'Editar lista',
                icon: Icons.edit,
                onSelect: () => onEdit?.(row.original),
                disabled: disableActions || !onEdit
              },
              {
                key: 'delete',
                label: 'Excluir lista',
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
