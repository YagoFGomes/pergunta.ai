'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ModuleRowActions } from '@/features/platform/components/module-row-actions';
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
      size: 56,
      minSize: 56,
      maxSize: 56,
      cell: ({ row }) => {
        const framework = row.original;
        const canEdit = !framework.is_seed;
        const canDeactivateAsDelete = !framework.is_seed && Boolean(framework.is_active);

        return (
          <div className='flex justify-end'>
            <ModuleRowActions
              triggerAriaLabel='Abrir ações do framework'
              items={[
                {
                  key: 'toggle-active',
                  label: framework.is_active ? 'Desativar framework' : 'Ativar framework',
                  icon: framework.is_active ? Icons.lock : Icons.check,
                  onSelect: () => onToggleActive?.(framework),
                  disabled: disableActions || !onToggleActive
                },
                {
                  key: 'edit',
                  label: 'Editar framework',
                  icon: Icons.edit,
                  onSelect: () => onEdit?.(framework),
                  disabled: disableActions || !onEdit || !canEdit
                },
                {
                  key: 'delete',
                  label: 'Excluir framework',
                  icon: Icons.trash,
                  onSelect: () => onDeactivateAsDelete?.(framework),
                  disabled: disableActions || !onDeactivateAsDelete || !canDeactivateAsDelete,
                  destructive: true,
                  separatorBefore: true
                }
              ]}
            />
          </div>
        );
      }
    }
  ];
}
