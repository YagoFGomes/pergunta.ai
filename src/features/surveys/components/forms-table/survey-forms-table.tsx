'use client';

import { keepPreviousData } from '@tanstack/react-query';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import { useSurveysFormsList, useSurveysFrameworksList } from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import type { PaginatedFormList } from '@/lib/api/generated/model/paginatedFormList';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';
import type { SurveysFormsListParams } from '@/lib/api/generated/model/surveysFormsListParams';
import { getSurveyFormsColumns } from './columns';
import { SurveyFormCreateDialog } from './survey-form-create-dialog';
import { buildSurveyFrameworkOptions, SURVEY_FORM_STATUS_FILTER_VALUE } from './options';

const FORM_FILTER_KEYS = ['status', 'framework'] as const;
const EMPTY_FRAMEWORKS: SurveyFramework[] = [];
const OPERATIONAL_FORM_STATUSES: ReadonlySet<Status37cEnum> = new Set([
  Status37cEnum.DRAFT,
  Status37cEnum.ACTIVE
]);

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
        <h2 className='text-lg font-semibold'>Nenhum formulário criado</h2>
        <p className='text-muted-foreground max-w-md text-sm'>
          Comece criando o primeiro formulário de pesquisa. A configuração de perguntas entra nas
          próximas tarefas do fluxo de surveys.
        </p>
      </div>
      <SurveyFormCreateDialog />
    </div>
  );
}

export function SurveyFormsTable() {
  const frameworksQuery = useSurveysFrameworksList(
    { is_active: 'true' },
    {
      query: {
        staleTime: 60_000
      }
    }
  );

  const frameworks =
    getOrvalResponseData<SurveyFramework[]>(frameworksQuery.data) ?? EMPTY_FRAMEWORKS;
  const frameworkOptions = React.useMemo(
    () => buildSurveyFrameworkOptions(frameworks),
    [frameworks]
  );
  const columns = React.useMemo(
    () => getSurveyFormsColumns({ frameworkOptions }),
    [frameworkOptions]
  );

  const { params } = useModuleTableParams<Form, (typeof FORM_FILTER_KEYS)[number]>({
    columns,
    filterKeys: FORM_FILTER_KEYS
  });

  const rawStatusFilter = normalizeSingleFilter(params.status);
  const effectiveStatusFilter = rawStatusFilter ?? SURVEY_FORM_STATUS_FILTER_VALUE.OPERATIONAL;
  const statusForApi =
    effectiveStatusFilter === Status37cEnum.DRAFT ||
    effectiveStatusFilter === Status37cEnum.ACTIVE ||
    effectiveStatusFilter === Status37cEnum.ARCHIVED
      ? effectiveStatusFilter
      : undefined;

  const apiParams = React.useMemo<SurveysFormsListParams>(
    () => ({
      page: String(params.page),
      page_size: String(params.perPage),
      ...(statusForApi && {
        status: statusForApi
      }),
      ...(normalizeSingleFilter(params.framework) && {
        framework: normalizeSingleFilter(params.framework)
      })
    }),
    [params.framework, params.page, params.perPage, statusForApi]
  );

  const formsQuery = useSurveysFormsList(apiParams, {
    query: {
      placeholderData: keepPreviousData
    }
  });

  const paginatedForms = getOrvalResponseData<PaginatedFormList>(formsQuery.data);
  const formsFromApi = paginatedForms?.results ?? [];
  const forms = formsFromApi.filter((form) => {
    if (effectiveStatusFilter === SURVEY_FORM_STATUS_FILTER_VALUE.OPERATIONAL) {
      return OPERATIONAL_FORM_STATUSES.has(form.status ?? Status37cEnum.DRAFT);
    }

    if (effectiveStatusFilter === SURVEY_FORM_STATUS_FILTER_VALUE.ALL) {
      return true;
    }

    if (
      effectiveStatusFilter === Status37cEnum.DRAFT ||
      effectiveStatusFilter === Status37cEnum.ACTIVE ||
      effectiveStatusFilter === Status37cEnum.ARCHIVED
    ) {
      return form.status === effectiveStatusFilter;
    }

    return true;
  });

  const totalItems =
    effectiveStatusFilter === SURVEY_FORM_STATUS_FILTER_VALUE.OPERATIONAL
      ? forms.length
      : (paginatedForms?.count ?? forms.length);
  const pageCount = getModuleTablePageCount(totalItems, params.perPage);
  const hasFilters = Boolean(
    params.framework ||
    (rawStatusFilter && rawStatusFilter !== SURVEY_FORM_STATUS_FILTER_VALUE.OPERATIONAL)
  );
  const hasNoFrameworkFilterOptions = frameworksQuery.isSuccess && frameworkOptions.length === 0;

  const { table } = useDataTable({
    data: forms,
    columns,
    pageCount,
    shallow: true,
    debounceMs: MODULE_TABLE_DEFAULT_DEBOUNCE_MS,
    initialState: {
      columnFilters: [{ id: 'status', value: SURVEY_FORM_STATUS_FILTER_VALUE.OPERATIONAL }],
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
          title='Erro ao carregar formulários'
          fallbackMessage='Não foi possível carregar a lista de formulários.'
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
          {frameworksQuery.isFetching ? (
            <Badge variant='outline' className='gap-1'>
              <Icons.spinner className='h-3 w-3 animate-spin' />
              Filtros
            </Badge>
          ) : null}
          {frameworksQuery.isError ? (
            <Badge variant='outline'>Filtro de frameworks indisponível</Badge>
          ) : null}
          {hasNoFrameworkFilterOptions ? (
            <Badge variant='outline'>Sem frameworks ativos</Badge>
          ) : null}
          <Badge variant='outline'>{totalItems} formulários</Badge>
        </>
      }
    />
  );
}
