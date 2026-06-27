'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { ModuleFormActions } from '@/features/platform/components/module-form-actions';
import { ModuleFormCard } from '@/features/platform/components/module-form-card';
import { ModuleFormSection } from '@/features/platform/components/module-form-section';
import { ModuleFormSkeleton } from '@/features/platform/components/module-form-skeleton';
import { resolveModuleFormDefaults } from '@/features/platform/lib/module-form';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
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
import {
  getSurveysFormsListQueryKey,
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsArchiveCreate,
  useSurveysFormsCreate,
  useSurveysFormsPartialUpdate,
  useSurveysFormsPublishCreate,
  useSurveysFormsRetrieve,
  useSurveysFrameworksList,
  type SurveysFormsCreateMutationBody,
  type SurveysFormsPartialUpdateMutationBody
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';
import { cn } from '@/lib/utils';

import { buildSurveyFrameworkSelectOptions } from './forms-table/options';
import {
  surveyFormCreateFieldSchemas,
  surveyFormCreateFormConfig,
  type SurveyFormCreateValues
} from '../schemas/survey-form';

const CREATE_SURVEY_FORM_ID = 'survey-form-create';
const EDIT_SURVEY_FORM_ID = 'survey-form-edit';
const EMPTY_FRAMEWORKS: SurveyFramework[] = [];

function toCreatePayload(values: SurveyFormCreateValues): SurveysFormsCreateMutationBody {
  const description = values.description.trim();

  return {
    framework: values.framework,
    title: values.title.trim(),
    ...(description && { description })
  } as SurveysFormsCreateMutationBody;
}

function toUpdatePayload(values: SurveyFormCreateValues): SurveysFormsPartialUpdateMutationBody {
  return {
    framework: values.framework,
    title: values.title.trim(),
    description: values.description.trim()
  };
}

function getFormDefaultValues(form?: Form): SurveyFormCreateValues {
  if (!form) {
    return resolveModuleFormDefaults(surveyFormCreateFormConfig.defaultValues);
  }

  return {
    framework: form.framework,
    title: form.title,
    description: form.description ?? ''
  };
}

function formatDateTime(value?: string) {
  if (!value) return 'Data indisponivel';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponivel';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

type SurveyFormEditorProps = {
  mode: 'create' | 'edit';
  initialForm?: Form;
};

function SurveyFormEditor({ mode, initialForm }: SurveyFormEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';
  const formId = isEdit ? EDIT_SURVEY_FORM_ID : CREATE_SURVEY_FORM_ID;
  const [confirmAction, setConfirmAction] = React.useState<'publish' | 'archive' | null>(null);

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
    () => buildSurveyFrameworkSelectOptions(frameworks),
    [frameworks]
  );

  const updateMutation = useSurveysFormsPartialUpdate({
    mutation: {
      onSuccess: async (response) => {
        const updatedForm = getOrvalResponseData<Form>(response);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getSurveysFormsListQueryKey()
          }),
          queryClient.invalidateQueries({
            queryKey: getSurveysFormsRetrieveQueryKey(updatedForm?.id ?? initialForm?.id)
          })
        ]);

        notifySuccess('Formulario atualizado.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel atualizar o formulario.');
      }
    }
  });

  const createMutation = useSurveysFormsCreate({
    mutation: {
      onSuccess: async (response) => {
        const createdForm = getOrvalResponseData<Form>(response);

        await queryClient.invalidateQueries({
          queryKey: getSurveysFormsListQueryKey()
        });

        notifySuccess('Formulario criado.', 'Agora configure as perguntas da pesquisa.');
        router.push(
          createdForm?.id
            ? `/dashboard/surveys/forms/${createdForm.id}/questions`
            : '/dashboard/surveys/forms'
        );
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel criar o formulario.');
      }
    }
  });

  const publishMutation = useSurveysFormsPublishCreate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<Form>(response);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getSurveysFormsListQueryKey() }),
          queryClient.invalidateQueries({
            queryKey: getSurveysFormsRetrieveQueryKey(updated?.id ?? initialForm?.id)
          })
        ]);
        notifySuccess('Formulario publicado.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel publicar o formulario.');
      }
    }
  });

  const archiveMutation = useSurveysFormsArchiveCreate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<Form>(response);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getSurveysFormsListQueryKey() }),
          queryClient.invalidateQueries({
            queryKey: getSurveysFormsRetrieveQueryKey(updated?.id ?? initialForm?.id)
          })
        ]);
        notifySuccess('Formulario arquivado.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel arquivar o formulario.');
      }
    }
  });

  const handleStatusAction = async () => {
    if (!initialForm?.id) return;
    if (confirmAction === 'publish') {
      await publishMutation.mutateAsync({ id: initialForm.id, data: initialForm as never });
    } else if (confirmAction === 'archive') {
      await archiveMutation.mutateAsync({ id: initialForm.id, data: initialForm as never });
    }
    setConfirmAction(null);
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    archiveMutation.isPending;

  const form = useAppForm({
    defaultValues: getFormDefaultValues(initialForm),
    validators: {
      onSubmit: surveyFormCreateFormConfig.schema
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        if (!initialForm?.id) return;

        await updateMutation.mutateAsync({
          id: initialForm.id,
          data: toUpdatePayload(value)
        });
      } else {
        await createMutation.mutateAsync({
          data: toCreatePayload(value)
        });
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } =
    useFormFields<SurveyFormCreateValues>();

  if (frameworksQuery.isPending) {
    return <ModuleFormSkeleton />;
  }

  if (frameworksQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={frameworksQuery.error}
          title='Erro ao carregar frameworks'
          fallbackMessage='Nao foi possivel carregar os frameworks disponiveis para este tenant.'
        />
        <div>
          <Button variant='outline' onClick={() => frameworksQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (frameworkOptions.length === 0) {
    return (
      <Alert>
        <Icons.info className='h-4 w-4' />
        <AlertTitle>Nenhum framework ativo</AlertTitle>
        <AlertDescription className='space-y-3'>
          <p>
            Este tenant ainda nao possui frameworks ativos para criar formularios. Ative ou crie um
            framework antes de iniciar um novo formulario.
          </p>
          <Link
            href='/dashboard/surveys/frameworks'
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Abrir frameworks
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <ModuleFormCard
        title={isEdit ? 'Editar metadados' : 'Dados do formulario'}
        description={
          isEdit
            ? 'Atualize as informacoes principais do formulario.'
            : 'Crie o rascunho inicial. As perguntas serao configuradas na proxima tela.'
        }
        footer={
          <ModuleFormActions
            mode={isEdit ? 'edit' : 'create'}
            formId={formId}
            isPending={isPending}
            submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar formulario'}
            onCancel={() => router.push('/dashboard/surveys/forms')}
          />
        }
      >
        {isEdit && initialForm ? (
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
            <Alert className='flex-1'>
              <Icons.info className='h-4 w-4' />
              <AlertTitle>Status atual: {initialForm.status ?? 'Sem status'}</AlertTitle>
              <AlertDescription>
                Criado em {formatDateTime(initialForm.created_at)}. Ultima atualizacao em{' '}
                {formatDateTime(initialForm.updated_at)}.
              </AlertDescription>
            </Alert>
            <div className='flex shrink-0 gap-2'>
              {initialForm.status === Status37cEnum.DRAFT && (
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => setConfirmAction('publish')}
                  disabled={isPending}
                >
                  <Icons.upload className='mr-2 h-4 w-4' />
                  Publicar
                </Button>
              )}
              {initialForm.status === Status37cEnum.ACTIVE && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setConfirmAction('archive')}
                  disabled={isPending}
                >
                  <Icons.lock className='mr-2 h-4 w-4' />
                  Arquivar
                </Button>
              )}
            </div>
          </div>
        ) : null}

        <form.AppForm>
          <form.Form id={formId} className='space-y-8 p-0 md:p-0'>
            <ModuleFormSection
              title='Configuracao base'
              description='Escolha o framework e defina como este formulario aparecera no dashboard.'
            >
              <FormSelectField
                name='framework'
                label='Framework'
                required
                options={frameworkOptions}
                placeholder='Selecione um framework'
                validators={{
                  onBlur: surveyFormCreateFieldSchemas.framework
                }}
              />

              <FormTextField
                name='title'
                label='Titulo'
                required
                placeholder='Ex.: Pesquisa de satisfacao pos-atendimento'
                maxLength={255}
                validators={{
                  onBlur: surveyFormCreateFieldSchemas.title
                }}
              />
            </ModuleFormSection>

            <ModuleFormSection
              title='Descricao'
              description='Use uma descricao curta para orientar operadores internos.'
              columns={1}
              separated
            >
              <FormTextareaField
                name='description'
                label='Descricao'
                placeholder='Explique o objetivo deste formulario.'
                maxLength={2000}
                rows={5}
                validators={{
                  onBlur: surveyFormCreateFieldSchemas.description
                }}
              />
            </ModuleFormSection>
          </form.Form>
        </form.AppForm>
      </ModuleFormCard>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'publish' ? 'Publicar formulario?' : 'Arquivar formulario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'publish'
                ? 'O formulario sera publicado e ficara disponivel para uso em campanhas. O formulario deve ter ao menos uma pergunta para ser publicado.'
                : 'O formulario sera arquivado e nao podera mais ser usado em novas campanhas. Esta acao nao pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusAction} disabled={isPending}>
              {isPending ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : null}
              {confirmAction === 'publish' ? 'Publicar' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function SurveyFormCreate() {
  return <SurveyFormEditor mode='create' />;
}

type SurveyFormEditProps = {
  formId: string;
};

export function SurveyFormEdit({ formId }: SurveyFormEditProps) {
  const formQuery = useSurveysFormsRetrieve(formId);
  const surveyForm = getOrvalResponseData<Form>(formQuery.data);

  if (formQuery.isPending) {
    return <ModuleFormSkeleton />;
  }

  if (formQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={formQuery.error}
          title='Erro ao carregar formulario'
          fallbackMessage='Nao foi possivel carregar os dados deste formulario.'
        />
        <div>
          <Button variant='outline' onClick={() => formQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!surveyForm) {
    return (
      <ModuleErrorAlert
        title='Formulario nao encontrado'
        message='Nao encontramos dados para este formulario.'
      />
    );
  }

  return <SurveyFormEditor key={surveyForm.id} mode='edit' initialForm={surveyForm} />;
}
