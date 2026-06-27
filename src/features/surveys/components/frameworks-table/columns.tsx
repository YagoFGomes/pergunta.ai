'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';

type GetSurveyFrameworksColumnsConfig = {
  onEdit?: (framework: SurveyFramework) => void;
  onToggleActive?: (framework: SurveyFramework) => void;
  onDeactivateAsDelete?: (framework: SurveyFramework) => void;
  disableActions?: boolean;
};

export function getSurveyFrameworksColumns({
  onEdit,
  onToggleActive,
  onDeactivateAsDelete,
  disableActions = false
}: GetSurveyFrameworksColumnsConfig = {}): ColumnDef<SurveyFramework>[] {
  return [
    {
      id: 'code',
      accessorKey: 'code',
      enableSorting: false,
      header: ({ column }: { column: Column<SurveyFramework, unknown> }) => (
        <DataTableColumnHeader column={column} title='Codigo' />
      ),
      cell: ({ row }) => <span className='font-medium uppercase'>{row.original.code}</span>
    },
    {
      id: 'name',
      accessorKey: 'name',
      enableSorting: false,
      header: ({ column }: { column: Column<SurveyFramework, unknown> }) => (
        <DataTableColumnHeader column={column} title='Nome' />
      ),
      cell: ({ row }) => <span>{row.original.name}</span>
    },
    {
      id: 'description',
      accessorKey: 'description',
      enableSorting: false,
      header: ({ column }: { column: Column<SurveyFramework, unknown> }) => (
        <DataTableColumnHeader column={column} title='Descricao' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground line-clamp-2 text-sm'>
          {row.original.description || 'Sem descricao'}
        </span>
      )
    },
    {
      id: 'origin',
      accessorKey: 'is_seed',
      enableSorting: false,
      header: ({ column }: { column: Column<SurveyFramework, unknown> }) => (
        <DataTableColumnHeader column={column} title='Origem' />
      ),
      cell: ({ row }) =>
        row.original.is_seed ? (
          <Badge variant='outline'>Seed</Badge>
        ) : (
          <Badge variant='outline'>Custom</Badge>
        )
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      enableSorting: false,
      header: ({ column }: { column: Column<SurveyFramework, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant='outline' className='border-emerald-500/30 text-emerald-700'>
            Ativo
          </Badge>
        ) : (
          <Badge variant='outline'>Inativo</Badge>
        )
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const framework = row.original;
        const canEdit = !framework.is_seed;
        const canDeactivateAsDelete = !framework.is_seed && Boolean(framework.is_active);

        return (
          <div className='flex items-center justify-end gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => onToggleActive?.(framework)}
              disabled={disableActions || !onToggleActive}
              aria-label={framework.is_active ? 'Desativar framework' : 'Ativar framework'}
            >
              {framework.is_active ? (
                <Icons.lock className='h-4 w-4' />
              ) : (
                <Icons.check className='h-4 w-4' />
              )}
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => onEdit?.(framework)}
              disabled={disableActions || !onEdit || !canEdit}
              aria-label='Editar framework'
            >
              <Icons.edit className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='text-destructive hover:text-destructive'
              onClick={() => onDeactivateAsDelete?.(framework)}
              disabled={disableActions || !onDeactivateAsDelete || !canDeactivateAsDelete}
              aria-label='Excluir framework'
            >
              <Icons.trash className='h-4 w-4' />
            </Button>
          </div>
        );
      }
    }
  ];
}
