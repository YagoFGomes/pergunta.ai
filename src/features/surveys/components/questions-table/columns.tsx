'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { FormQuestion } from '@/lib/api/generated/model/formQuestion';

import { getQuestionTypeLabel } from '../../schemas/survey-question';

export function getSurveyQuestionsColumns(): ColumnDef<FormQuestion>[] {
  return [
    {
      id: 'order',
      accessorKey: 'order',
      enableSorting: false,
      header: ({ column }: { column: Column<FormQuestion, unknown> }) => (
        <DataTableColumnHeader column={column} title='Ordem' />
      ),
      cell: ({ row }) => <span className='text-sm font-medium'>#{row.original.order}</span>
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
    }
  ];
}
