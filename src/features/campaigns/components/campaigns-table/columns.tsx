'use client';

import Link from 'next/link';
import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ModuleRowActions } from '@/features/platform/components/module-row-actions';
import type { Campaign } from '@/lib/api/generated/model/campaign';
import { cn } from '@/lib/utils';

import {
  CAMPAIGN_STATUS_OPTIONS,
  formatModuleDate,
  getCampaignStatusClassName,
  getCampaignStatusLabel,
  getDeliveryChannelLabel
} from '../../lib/campaign-utils';

type GetCampaignsColumnsConfig = {
  onDelete?: (campaign: Campaign) => void;
  disableActions?: boolean;
};

export function getCampaignsColumns({
  onDelete,
  disableActions = false
}: GetCampaignsColumnsConfig = {}): ColumnDef<Campaign>[] {
  return [
    {
      id: 'search',
      accessorFn: (campaign) => `${campaign.name} ${campaign.description ?? ''}`,
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Campanha',
        placeholder: 'Buscar campanha...',
        variant: 'text'
      },
      header: ({ column }: { column: Column<Campaign, unknown> }) => (
        <DataTableColumnHeader column={column} title='Campanha' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-[280px] flex-col gap-1'>
          <Link
            href={`/dashboard/campaigns/${row.original.id}`}
            className='font-medium hover:underline'
          >
            {row.original.name}
          </Link>
          <span className='text-muted-foreground line-clamp-2 text-xs'>
            {row.original.description || 'Sem descricao'}
          </span>
        </div>
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
        options: CAMPAIGN_STATUS_OPTIONS
      },
      header: ({ column }: { column: Column<Campaign, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className={cn(getCampaignStatusClassName(row.original.status))}>
          {getCampaignStatusLabel(row.original.status)}
        </Badge>
      )
    },
    {
      id: 'delivery_channel',
      accessorKey: 'delivery_channel',
      enableSorting: false,
      header: ({ column }: { column: Column<Campaign, unknown> }) => (
        <DataTableColumnHeader column={column} title='Canal' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>{getDeliveryChannelLabel(row.original.delivery_channel)}</Badge>
      )
    },
    {
      id: 'recipients',
      enableSorting: false,
      header: ({ column }: { column: Column<Campaign, unknown> }) => (
        <DataTableColumnHeader column={column} title='Destinatarios' />
      ),
      cell: ({ row }) => (
        <span className='text-sm tabular-nums'>
          {row.original.recipients_sent}/{row.original.max_recipients ?? '-'}
        </span>
      )
    },
    {
      id: 'responded',
      accessorKey: 'recipients_responded',
      enableSorting: false,
      header: ({ column }: { column: Column<Campaign, unknown> }) => (
        <DataTableColumnHeader column={column} title='Respostas' />
      ),
      cell: ({ row }) => (
        <span className='text-sm tabular-nums'>{row.original.recipients_responded}</span>
      )
    },
    {
      id: 'start_date',
      accessorKey: 'start_date',
      enableSorting: false,
      header: ({ column }: { column: Column<Campaign, unknown> }) => (
        <DataTableColumnHeader column={column} title='Início' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col text-sm'>
          <span>{formatModuleDate(row.original.start_date)}</span>
          <span className='text-muted-foreground text-xs'>{row.original.start_time || '-'}</span>
        </div>
      )
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
            triggerAriaLabel='Abrir ações da campanha'
            items={[
              {
                key: 'details',
                label: 'Detalhes',
                icon: Icons.externalLink,
                href: `/dashboard/campaigns/${row.original.id}`
              },
              {
                key: 'steps',
                label: 'Steps',
                icon: Icons.forms,
                href: `/dashboard/campaigns/${row.original.id}/steps`
              },
              {
                key: 'delete',
                label: 'Excluir campanha',
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
