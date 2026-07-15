'use client';

import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { ModuleDataTableSkeleton } from '@/features/platform/components/module-data-table-skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { useModuleTableParams } from '@/features/platform/hooks/use-module-table-params';
import { MODULE_TABLE_DEFAULT_DEBOUNCE_MS } from '@/features/platform/lib/module-table';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getEmailTemplatesListQueryKey,
  useEmailTemplatesCreate,
  useEmailTemplatesDestroy,
  useEmailTemplatesList
} from '@/lib/api/generated/endpoints';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import type { EmailTemplatesListParams } from '@/lib/api/generated/model/emailTemplatesListParams';
import { EmailTemplateStatusEnum } from '@/lib/api/generated/model/emailTemplateStatusEnum';
import { TemplateTypeEnum } from '@/lib/api/generated/model/templateTypeEnum';
import { defaultStarterDesign } from '@/features/email-templates/constants/email-template-designs';

import { EmailTemplateSeedDialog } from '@/features/email-templates/components/email-template-seed-templates';

import { getEmailTemplatesColumns } from './columns';

const EMAIL_TEMPLATE_FILTER_KEYS = ['search', 'status', 'template_type'] as const;

function normalizeSingleFilter(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function EmailTemplatesManager() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSeedDialogOpen, setIsSeedDialogOpen] = useState(false);
  const [deleteTemplate, setDeleteTemplate] = useState<EmailTemplate | null>(null);

  const createMutation = useEmailTemplatesCreate({
    mutation: {
      onSuccess: async (response) => {
        const created = getOrvalResponseData<EmailTemplate>(response);
        await queryClient.invalidateQueries({ queryKey: getEmailTemplatesListQueryKey() });
        if (created?.id) {
          router.push(`/dashboard/email-templates/${created.id}/edit`);
        }
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível criar o template.');
      }
    }
  });

  const destroyMutation = useEmailTemplatesDestroy({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getEmailTemplatesListQueryKey() });
        notifySuccess('Template excluído com sucesso.');
        setDeleteTemplate(null);
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível excluir o template.');
      }
    }
  });

  const hasMutationInFlight = createMutation.isPending || destroyMutation.isPending;

  const columns = useMemo(
    () =>
      getEmailTemplatesColumns({
        onDelete: setDeleteTemplate,
        disableActions: hasMutationInFlight
      }),
    [hasMutationInFlight]
  );

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

  function handleCreateNew() {
    const timestamp = Date.now();
    void createMutation.mutateAsync({
      data: {
        name: 'Novo Template',
        slug: `novo-template-${timestamp}`,
        template_type: TemplateTypeEnum.WELCOME,
        subject: 'Assunto do e-mail',
        html_content: '<p>Seu template aqui</p>',
        plain_text_content: '',
        required_variables: ['contact_name', 'survey_link'],
        design_json: defaultStarterDesign as never,
        language: 'pt-BR',
        status: EmailTemplateStatusEnum.INACTIVE as never
      }
    });
  }

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
          fallbackMessage='Não foi possível carregar os templates de email.'
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
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold'>Templates de email</h2>
            <p className='text-muted-foreground text-sm'>
              Consulte os templates disponíveis para vincular nas campanhas.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsSeedDialogOpen(true)}
              disabled={hasMutationInFlight}
            >
              <Icons.page className='mr-2 h-4 w-4' />A partir de modelo
            </Button>
            <Button
              onClick={handleCreateNew}
              isLoading={createMutation.isPending}
              disabled={hasMutationInFlight}
            >
              Novo template
            </Button>
          </div>
        </div>
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

      <AlertDialog
        open={Boolean(deleteTemplate)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTemplate(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              O template {deleteTemplate?.name ? `"${deleteTemplate.name}"` : ''} será removido
              permanentemente. Templates globais podem exigir permissao de superuser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={hasMutationInFlight}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={hasMutationInFlight || !deleteTemplate}
              onClick={(event) => {
                event.preventDefault();

                if (!deleteTemplate) {
                  return;
                }

                void destroyMutation.mutateAsync({ id: deleteTemplate.id });
              }}
            >
              Excluir template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EmailTemplateSeedDialog open={isSeedDialogOpen} onOpenChange={setIsSeedDialogOpen} />
    </div>
  );
}
