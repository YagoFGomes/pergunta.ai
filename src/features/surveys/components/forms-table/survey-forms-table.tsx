'use client';

import { keepPreviousData } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { ModuleDataTableSkeleton } from '@/features/platform/components/module-data-table-skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { useModuleTableParams } from '@/features/platform/hooks/use-module-table-params';
import {
  MODULE_TABLE_DEFAULT_DEBOUNCE_MS,
  getModuleTablePageCount
} from '@/features/platform/lib/module-table';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import { useSurveysFormsList } from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import type { PaginatedFormList } from '@/lib/api/generated/model/paginatedFormList';
import type { SurveysFormsListParams } from '@/lib/api/generated/model/surveysFormsListParams';
import { cn } from '@/lib/utils';

import { surveyFormsColumns } from './columns';

const FORM_FILTER_KEYS = ['status', 'framework'] as const;

function normalizeSingleFilter(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function SurveyFormsEmptyState() {
  return (
    <div className='flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center'>
      <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
        <Icons.forms className='text-muted-foreground size-6' />
      </div>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>Nenhum formulario criado</h2>
        <p className='text-muted-foreground max-w-md text-sm'>
          Comece criando o primeiro formulario de pesquisa. A configuracao de perguntas entra nas
          proximas tarefas do fluxo de surveys.
        </p>
      </div>
      <Link
        href='/dashboard/surveys/forms/new'
        className={cn(buttonVariants(), 'text-xs md:text-sm')}
      >
        <Icons.add className='mr-2 h-4 w-4' />
        Novo formulario
      </Link>
    </div>
  );
}

export function SurveyFormsTable() {
  const { params } = useModuleTableParams<Form, (typeof FORM_FILTER_KEYS)[number]>({
    columns: surveyFormsColumns,
    filterKeys: FORM_FILTER_KEYS
  });

  const apiParams = React.useMemo<SurveysFormsListParams>(
    () => ({
      page: String(params.page),
      page_size: String(params.perPage),
      ...(normalizeSingleFilter(params.status) && {
        status: normalizeSingleFilter(params.status)
      }),
      ...(normalizeSingleFilter(params.framework) && {
        framework: normalizeSingleFilter(params.framework)
      })
    }),
    [params.framework, params.page, params.perPage, params.status]
  );

  const formsQuery = useSurveysFormsList(apiParams, {
    query: {
      placeholderData: keepPreviousData
    }
  });

  const paginatedForms = getOrvalResponseData<PaginatedFormList>(formsQuery.data);
  const forms = paginatedForms?.results ?? [];
  const totalItems = paginatedForms?.count ?? 0;
  const pageCount = getModuleTablePageCount(totalItems, params.perPage);
  const hasFilters = Boolean(params.status || params.framework);

  const { table } = useDataTable({
    data: forms,
    columns: surveyFormsColumns,
    pageCount,
    shallow: true,
    debounceMs: MODULE_TABLE_DEFAULT_DEBOUNCE_MS,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  if (formsQuery.isPending) {
    return <ModuleDataTableSkeleton columnCount={6} filterCount={2} />;
  }

  if (formsQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={formsQuery.error}
          title='Erro ao carregar formularios'
          fallbackMessage='Nao foi possivel carregar a lista de formularios.'
        />
        <div>
          <Button variant='outline' onClick={() => formsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (totalItems === 0 && !hasFilters) {
    return <SurveyFormsEmptyState />;
  }

  return (
    <ModuleDataTable
      table={table}
      toolbarChildren={
        <>
          {formsQuery.isFetching ? (
            <Badge variant='outline' className='gap-1'>
              <Icons.spinner className='h-3 w-3 animate-spin' />
              Atualizando
            </Badge>
          ) : null}
          <Badge variant='outline'>{totalItems} formularios</Badge>
        </>
      }
    />
  );
}
