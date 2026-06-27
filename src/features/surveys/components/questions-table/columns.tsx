'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { FormQuestion } from '@/lib/api/generated/model/formQuestion';

import { getQuestionTypeLabel } from '../../schemas/survey-question';

type GetSurveyQuestionsColumnsConfig = {
  onEdit?: (question: FormQuestion) => void;
  onDelete?: (question: FormQuestion) => void;
  onMoveUp?: (question: FormQuestion) => void;
  onMoveDown?: (question: FormQuestion) => void;
  canMoveUp?: (question: FormQuestion) => boolean;
  canMoveDown?: (question: FormQuestion) => boolean;
  disableActions?: boolean;
};

export function getSurveyQuestionsColumns({
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
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
        <DataTableColumnHeader column={column} title='Obrigatoria' />
      ),
      cell: ({ row }) =>
        row.original.is_required ? (
          <Badge variant='outline' className='border-emerald-500/30 text-emerald-700'>
            Sim
          </Badge>
        ) : (
          <Badge variant='outline'>Nao</Badge>
        )
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
            onClick={() => onMoveUp?.(row.original)}
            disabled={disableActions || !onMoveUp || !(canMoveUp?.(row.original) ?? false)}
            aria-label='Mover pergunta para cima'
          >
            <Icons.chevronUp className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => onMoveDown?.(row.original)}
            disabled={disableActions || !onMoveDown || !(canMoveDown?.(row.original) ?? false)}
            aria-label='Mover pergunta para baixo'
          >
            <Icons.chevronDown className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => onEdit?.(row.original)}
            disabled={disableActions || !onEdit}
            aria-label='Editar pergunta'
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
            aria-label='Remover pergunta'
          >
            <Icons.trash className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  ];
}
