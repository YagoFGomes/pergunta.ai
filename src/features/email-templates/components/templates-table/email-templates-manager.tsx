'use client';

import { keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { ModuleDataTableSkeleton } from '@/features/platform/components/module-data-table-skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { useModuleTableParams } from '@/features/platform/hooks/use-module-table-params';
import { MODULE_TABLE_DEFAULT_DEBOUNCE_MS } from '@/features/platform/lib/module-table';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import { useEmailTemplatesList } from '@/lib/api/generated/endpoints';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import type { EmailTemplatesListParams } from '@/lib/api/generated/model/emailTemplatesListParams';

import { getEmailTemplatesColumns } from './columns';

const EMAIL_TEMPLATE_FILTER_KEYS = ['search', 'status', 'template_type'] as const;

function normalizeSingleFilter(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function EmailTemplatesManager() {
  const columns = useMemo(() => getEmailTemplatesColumns(), []);

  const { params } = useModuleTableParams<
    EmailTemplate,
    (typeof EMAIL_TEMPLATE_FILTER_KEYS)[number]
  >({
    columns,
    filterKeys: EMAIL_TEMPLATE_FILTER_KEYS
  });

  const apiParams = useMemo<EmailTemplatesListParams>(
    () => ({
      ...(normalizeSingleFilter(params.search) && {
        search: normalizeSingleFilter(params.search)
      }),
      ...(normalizeSingleFilter(params.status) && {
        status: normalizeSingleFilter(params.status)
      }),
      ...(normalizeSingleFilter(params.template_type) && {
        template_type: normalizeSingleFilter(params.template_type)
      })
    }),
    [params.search, params.status, params.template_type]
  );

  const templatesQuery = useEmailTemplatesList(apiParams, {
    query: {
      placeholderData: keepPreviousData
    }
  });

  const templates = getOrvalResponseData<EmailTemplate[]>(templatesQuery.data) ?? [];
  const hasFilters = Boolean(params.search || params.status || params.template_type);

  const { table } = useDataTable({
    data: templates,
    columns,
    pageCount: 1,
    shallow: false,
    debounceMs: MODULE_TABLE_DEFAULT_DEBOUNCE_MS,
    initialState: {
      sorting: [],
      columnPinning: { right: ['actions'] }
    }
  });

  if (templatesQuery.isPending) {
    return <ModuleDataTableSkeleton columnCount={7} filterCount={3} />;
  }

  if (templatesQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={templatesQuery.error}
          title='Erro ao carregar templates'
          fallbackMessage='Nao foi possivel carregar os templates de email.'
        />
        <div>
          <Button variant='outline' onClick={() => templatesQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col px-4 pt-2 pb-4 md:px-6 md:pt-4'>
      <div className='space-y-1'>
        <h2 className='text-xl font-semibold'>Templates de email</h2>
        <p className='text-muted-foreground text-sm'>
          Consulte os templates disponiveis para vincular nas campanhas.
        </p>
      </div>

      {templates.length === 0 && !hasFilters ? (
        <Alert>
          <AlertTitle>Nenhum template encontrado</AlertTitle>
          <AlertDescription>
            Crie templates para personalizar os envios de campanhas.
          </AlertDescription>
        </Alert>
      ) : null}

      <ModuleDataTable
        table={table}
        toolbarChildren={
          <>
            {templatesQuery.isFetching ? (
              <Badge variant='outline' className='gap-1'>
                <Icons.spinner className='h-3 w-3 animate-spin' />
                Atualizando
              </Badge>
            ) : null}
            <Badge variant='outline'>{templates.length} templates</Badge>
          </>
        }
      />
    </div>
  );
}
