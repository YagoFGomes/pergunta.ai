'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
  type SurveysFormsCreateMutationBody,
  type SurveysFormsPartialUpdateMutationBody
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import {
  surveyFormCreateFieldSchemas,
  surveyFormCreateFormConfig,
  type SurveyFormCreateValues
} from '../schemas/survey-form';

const CREATE_SURVEY_FORM_ID = 'survey-form-create';
const EDIT_SURVEY_FORM_ID = 'survey-form-edit';

function toCreatePayload(values: SurveyFormCreateValues): SurveysFormsCreateMutationBody {
  const description = values.description.trim();

  return {
    title: values.title.trim(),
    ...(description && { description })
  } as SurveysFormsCreateMutationBody;
}

function toUpdatePayload(values: SurveyFormCreateValues): SurveysFormsPartialUpdateMutationBody {
  return {
    title: values.title.trim(),
    description: values.description.trim()
  };
}

function getFormDefaultValues(form?: Form): SurveyFormCreateValues {
  if (!form) {
    return resolveModuleFormDefaults(surveyFormCreateFormConfig.defaultValues);
  }

  return {
    title: form.title,
    description: form.description ?? ''
  };
}

function formatDateTime(value?: string) {
  if (!value) return 'Data indisponível';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';

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

        notifySuccess('Formulário atualizado.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível atualizar o formulário.');
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

        notifySuccess('Formulário criado.', 'Agora configure as perguntas da pesquisa.');
        router.push(
          createdForm?.id
            ? `/dashboard/surveys/forms/${createdForm.id}/questions`
            : '/dashboard/surveys/forms'
        );
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível criar o formulário.');
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
        notifySuccess('Formulário publicado.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível publicar o formulário.');
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
        notifySuccess('Formulário arquivado.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível arquivar o formulário.');
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

  const { FormTextField, FormTextareaField } = useFormFields<SurveyFormCreateValues>();

  return (
    <>
      <ModuleFormCard
        title={isEdit ? 'Editar metadados' : 'Dados do formulário'}
        description={
          isEdit
            ? 'Atualize as informações principais do formulário.'
            : 'Crie o rascunho inicial. As perguntas serao configuradas na proxima tela.'
        }
        footer={
          <ModuleFormActions
            mode={isEdit ? 'edit' : 'create'}
            formId={formId}
            isPending={isPending}
            submitLabel={isEdit ? 'Salvar alterações' : 'Criar formulário'}
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
                Criado em {formatDateTime(initialForm.created_at)}. Última atualização em{' '}
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
              title='Identificação'
              description='Defina o titulo e descricao para identificar este formulário no dashboard.'
            >
              <FormTextField
                name='title'
                label='Titulo'
                required
                placeholder='Ex.: Pesquisa de satisfação pós-atendimento'
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
                placeholder='Explique o objetivo deste formulário.'
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
              {confirmAction === 'publish' ? 'Publicar formulário?' : 'Arquivar formulário?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'publish'
                ? 'O formulário será publicado e ficara disponível para uso em campanhas. O formulário deve ter ao menos uma pergunta para ser publicado.'
                : 'O formulário será arquivado e não podera mais ser usado em novas campanhas. Esta ação não pode ser desfeita.'}
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
          title='Erro ao carregar formulário'
          fallbackMessage='Não foi possível carregar os dados deste formulário.'
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
        title='Formulário não encontrado'
        message='Não encontramos dados para este formulário.'
      />
    );
  }

  return <SurveyFormEditor key={surveyForm.id} mode='edit' initialForm={surveyForm} />;
}
