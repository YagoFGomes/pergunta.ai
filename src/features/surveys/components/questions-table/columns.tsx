'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ModuleRowActions } from '@/features/platform/components/module-row-actions';
import type { FormQuestion } from '@/lib/api/generated/model/formQuestion';

import { getQuestionTypeLabel } from '../../schemas/survey-question';

type GetSurveyQuestionsColumnsConfig = {
  onEdit?: (question: FormQuestion) => void;
  onDelete?: (question: FormQuestion) => void;
  onManageOptions?: (question: FormQuestion) => void;
  onMoveUp?: (question: FormQuestion) => void;
  onMoveDown?: (question: FormQuestion) => void;
  canMoveUp?: (question: FormQuestion) => boolean;
  canMoveDown?: (question: FormQuestion) => boolean;
  canManageOptions?: (question: FormQuestion) => boolean;
  disableActions?: boolean;
};

export function getSurveyQuestionsColumns({
  onEdit,
  onDelete,
  onManageOptions,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  canManageOptions,
  disableActions = false
}: GetSurveyQuestionsColumnsConfig = {}): ColumnDef<FormQuestion>[] {
  return [
    {
      id: 'order',
      accessorKey: 'order',
      enableSorting: false,
      header: ({ column }: { column: Column<FormQuestion, unknown> }) => (
        <DataTableColumnHeader column={column} title='Ordem' />
      ),
      cell: ({ row }) => <span className='text-sm font-medium'>#{row.index + 1}</span>
    },
    {
      id: 'label',
      accessorKey: 'label',
      enableSorting: false,
      header: ({ column }: { column: Column<FormQuestion, unknown> }) => (
        <DataTableColumnHeader column={column} title='Pergunta' />
      ),
      cell: ({ row }) => (
        <div className='min-w-[280px]'>
          <p className='font-medium leading-snug'>{row.original.label}</p>
        </div>
      )
    },
    {
      id: 'question_type',
      accessorKey: 'question_type',
      enableSorting: false,
      header: ({ column }: { column: Column<FormQuestion, unknown> }) => (
        <DataTableColumnHeader column={column} title='Tipo' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>{getQuestionTypeLabel(row.original.question_type)}</Badge>
      )
    },
    {
      id: 'is_required',
      accessorKey: 'is_required',
      enableSorting: false,
      header: ({ column }: { column: Column<FormQuestion, unknown> }) => (
        <DataTableColumnHeader column={column} title='Obrigatória' />
      ),
      cell: ({ row }) =>
        row.original.is_required ? (
          <Badge variant='outline' className='border-emerald-500/30 text-emerald-700'>
            Sim
          </Badge>
        ) : (
          <Badge variant='outline'>Não</Badge>
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
            triggerAriaLabel='Abrir ações da pergunta'
            items={[
              {
                key: 'move-up',
                label: 'Mover para cima',
                icon: Icons.chevronUp,
                onSelect: () => onMoveUp?.(row.original),
                disabled: disableActions || !onMoveUp || !(canMoveUp?.(row.original) ?? false)
              },
              {
                key: 'move-down',
                label: 'Mover para baixo',
                icon: Icons.chevronDown,
                onSelect: () => onMoveDown?.(row.original),
                disabled: disableActions || !onMoveDown || !(canMoveDown?.(row.original) ?? false)
              },
              {
                key: 'manage-options',
                label: 'Gerenciar opções',
                icon: Icons.adjustments,
                onSelect: () => onManageOptions?.(row.original),
                disabled:
                  disableActions || !onManageOptions || !(canManageOptions?.(row.original) ?? false)
              },
              {
                key: 'edit',
                label: 'Editar pergunta',
                icon: Icons.edit,
                onSelect: () => onEdit?.(row.original),
                disabled: disableActions || !onEdit
              },
              {
                key: 'delete',
                label: 'Remover pergunta',
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
