'use client';

import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { ModuleDataTableSkeleton } from '@/features/platform/components/module-data-table-skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { useModuleTableParams } from '@/features/platform/hooks/use-module-table-params';
import { MODULE_TABLE_DEFAULT_DEBOUNCE_MS } from '@/features/platform/lib/module-table';
import { notifyError } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getEmailTemplatesListQueryKey,
  useEmailTemplatesCreate,
  useEmailTemplatesList
} from '@/lib/api/generated/endpoints';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import type { EmailTemplatesListParams } from '@/lib/api/generated/model/emailTemplatesListParams';
import { Status372Enum } from '@/lib/api/generated/model/status372Enum';
import { TemplateTypeEnum } from '@/lib/api/generated/model/templateTypeEnum';
import {
  emailTemplateFieldSchemas,
  emailTemplateFormSchema,
  getMissingRequiredVariableDeclarations,
  normalizeEmailTemplateValues,
  type EmailTemplateFormValues
} from '@/features/email-templates/schemas/email-template';

import { getEmailTemplatesColumns } from './columns';
import { EMAIL_TEMPLATE_STATUS_OPTIONS, EMAIL_TEMPLATE_TYPE_OPTIONS } from './options';

const EMAIL_TEMPLATE_FILTER_KEYS = ['search', 'status', 'template_type'] as const;

const DEFAULT_TEMPLATE_VALUES: EmailTemplateFormValues = {
  name: '',
  slug: '',
  template_type: TemplateTypeEnum.WELCOME,
  subject: '',
  html_content: '<p>Ola {{ contact_name }}</p>',
  plain_text_content: '',
  requiredVariablesText: 'contact_name',
  language: 'pt-BR',
  status: Status372Enum.ACTIVE
};

function normalizeSingleFilter(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function EmailTemplatesManager() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const createMutation = useEmailTemplatesCreate({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getEmailTemplatesListQueryKey() });
        toast.success('Template criado com sucesso.');
        setIsCreateDialogOpen(false);
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel criar o template.');
      }
    }
  });

  const templates = getOrvalResponseData<EmailTemplate[]>(templatesQuery.data) ?? [];
  const hasFilters = Boolean(params.search || params.status || params.template_type);
  const isCreating = createMutation.isPending;

  const form = useAppForm({
    defaultValues: DEFAULT_TEMPLATE_VALUES,
    onSubmit: async ({ value }) => {
      const parsed = emailTemplateFormSchema.safeParse(value);

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? 'Revise os campos do template.');
        return;
      }

      const normalized = normalizeEmailTemplateValues(parsed.data);
      const missingVariables = getMissingRequiredVariableDeclarations(normalized);

      if (missingVariables.length > 0) {
        toast.error(`Declare as variaveis usadas no template: ${missingVariables.join(', ')}.`);
        return;
      }

      await createMutation.mutateAsync({
        data: normalized
      });
    }
  });

  const { FormTextField, FormTextareaField, FormSelectField } =
    useFormFields<EmailTemplateFormValues>();

  function openCreateDialog() {
    form.reset(DEFAULT_TEMPLATE_VALUES);
    setIsCreateDialogOpen(true);
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
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold'>Templates de email</h2>
            <p className='text-muted-foreground text-sm'>
              Consulte os templates disponiveis para vincular nas campanhas.
            </p>
          </div>
          <Button onClick={openCreateDialog} disabled={isCreating}>
            Novo template
          </Button>
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

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (isCreating) {
            return;
          }

          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Novo template</DialogTitle>
            <DialogDescription>
              Configure o conteudo e as variaveis obrigatorias do template.
            </DialogDescription>
          </DialogHeader>

          <form.AppForm>
            <form.Form className='space-y-4 p-0 md:p-0'>
              <div className='grid gap-4 md:grid-cols-2'>
                <FormTextField
                  name='name'
                  label='Nome'
                  required
                  placeholder='Ex: Convite NPS'
                  maxLength={255}
                  validators={{
                    onBlur: emailTemplateFieldSchemas.name
                  }}
                  disabled={isCreating}
                />

                <FormTextField
                  name='slug'
                  label='Slug'
                  required
                  placeholder='convite-nps'
                  maxLength={100}
                  validators={{
                    onBlur: emailTemplateFieldSchemas.slug
                  }}
                  disabled={isCreating}
                />

                <FormSelectField
                  name='template_type'
                  label='Tipo'
                  required
                  options={EMAIL_TEMPLATE_TYPE_OPTIONS}
                  validators={{
                    onBlur: emailTemplateFieldSchemas.template_type
                  }}
                  disabled={isCreating}
                />

                <FormSelectField
                  name='status'
                  label='Status'
                  required
                  options={EMAIL_TEMPLATE_STATUS_OPTIONS}
                  validators={{
                    onBlur: emailTemplateFieldSchemas.status
                  }}
                  disabled={isCreating}
                />
              </div>

              <FormTextField
                name='subject'
                label='Assunto'
                required
                placeholder='Sua pesquisa esta pronta, {{ contact_name }}'
                maxLength={255}
                validators={{
                  onBlur: emailTemplateFieldSchemas.subject
                }}
                disabled={isCreating}
              />

              <FormTextareaField
                name='html_content'
                label='Conteudo HTML'
                required
                rows={7}
                validators={{
                  onBlur: emailTemplateFieldSchemas.html_content
                }}
                disabled={isCreating}
              />

              <FormTextareaField
                name='plain_text_content'
                label='Conteudo texto'
                rows={4}
                validators={{
                  onBlur: emailTemplateFieldSchemas.plain_text_content
                }}
                disabled={isCreating}
              />

              <div className='grid gap-4 md:grid-cols-[1fr_160px]'>
                <FormTextField
                  name='requiredVariablesText'
                  label='Variaveis obrigatorias'
                  placeholder='contact_name, survey_link'
                  validators={{
                    onBlur: emailTemplateFieldSchemas.requiredVariablesText
                  }}
                  disabled={isCreating}
                />

                <FormTextField
                  name='language'
                  label='Idioma'
                  required
                  placeholder='pt-BR'
                  maxLength={10}
                  validators={{
                    onBlur: emailTemplateFieldSchemas.language
                  }}
                  disabled={isCreating}
                />
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type='submit' disabled={!canSubmit || isSubmitting || isCreating}>
                      Criar template
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form.Form>
          </form.AppForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
