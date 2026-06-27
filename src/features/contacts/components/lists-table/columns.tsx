'use client';

import Link from 'next/link';
import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
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
            {row.original.description || 'Sem descricao'}
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
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
          <Button variant='ghost' size='icon' asChild aria-label='Abrir contatos da lista'>
            <Link href={`/dashboard/contacts/lists/${row.original.id}/contacts`}>
              <Icons.teams className='h-4 w-4' />
            </Link>
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => onEdit?.(row.original)}
            disabled={disableActions || !onEdit}
            aria-label='Editar lista'
          >
            <Icons.edit className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='text-destructive hover:text-destructive'
            onClick={() => onDelete?.(row.original)}
            disabled={disableActions || !onDelete}
            aria-label='Excluir lista'
          >
            <Icons.trash className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  ];
}
