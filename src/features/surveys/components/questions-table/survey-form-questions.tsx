'use client';

import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Icons } from '@/components/icons';
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
import { ModuleFormActions } from '@/features/platform/components/module-form-actions';
import { ModuleFormCard } from '@/features/platform/components/module-form-card';
import { ModuleFormSection } from '@/features/platform/components/module-form-section';
import { MODULE_TABLE_DEFAULT_DEBOUNCE_MS } from '@/features/platform/lib/module-table';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getSurveysFormsQuestionsListQueryKey,
  getSurveysFormsQuestionsRetrieveQueryKey,
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsQuestionsCreate,
  useSurveysFormsQuestionsDestroy,
  useSurveysFormsQuestionsList,
  useSurveysFormsQuestionsPartialUpdate,
  useSurveysFormsRetrieve
} from '@/lib/api/generated/endpoints';
import type { FormQuestion } from '@/lib/api/generated/model/formQuestion';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';

import {
  surveyQuestionCreateFieldSchemas,
  surveyQuestionCreateSchema,
  surveyQuestionTypeOptions,
  type SurveyQuestionCreateValues
} from '../../schemas/survey-question';
import { getSurveyQuestionsColumns } from './columns';

const CREATE_QUESTION_FORM_ID = 'survey-question-create';
const EDIT_QUESTION_FORM_ID = 'survey-question-edit';

type SurveyFormQuestionsProps = {
  formId: string;
};

function SurveyQuestionsEmptyState() {
  return (
    <div className='flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center'>
      <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
        <Icons.forms className='text-muted-foreground size-6' />
      </div>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>Nenhuma pergunta cadastrada</h2>
        <p className='text-muted-foreground max-w-md text-sm'>
          Adicione a primeira pergunta para comecar a montar este formulario de pesquisa.
        </p>
      </div>
    </div>
  );
}

export function SurveyFormQuestions({ formId }: SurveyFormQuestionsProps) {
  const queryClient = useQueryClient();
  const [editQuestion, setEditQuestion] = React.useState<FormQuestion | null>(null);
  const [deleteQuestion, setDeleteQuestion] = React.useState<FormQuestion | null>(null);

  const formQuery = useSurveysFormsRetrieve(formId, {
    query: {
      staleTime: 30_000
    }
  });

  const questionsQuery = useSurveysFormsQuestionsList(formId);

  const createMutation = useSurveysFormsQuestionsCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getSurveysFormsQuestionsListQueryKey(formId) }),
          queryClient.invalidateQueries({ queryKey: getSurveysFormsRetrieveQueryKey(formId) })
        ]);
        notifySuccess('Pergunta criada.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel criar a pergunta.');
      }
    }
  });

  const updateMutation = useSurveysFormsQuestionsPartialUpdate({
    mutation: {
      onSuccess: async (response) => {
        const updatedQuestion = getOrvalResponseData<FormQuestion>(response);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getSurveysFormsQuestionsListQueryKey(formId) }),
          queryClient.invalidateQueries({ queryKey: getSurveysFormsRetrieveQueryKey(formId) }),
          queryClient.invalidateQueries({
            queryKey: getSurveysFormsQuestionsRetrieveQueryKey(formId, updatedQuestion?.id)
          })
        ]);
        notifySuccess('Pergunta atualizada.');
        setEditQuestion(null);
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel atualizar a pergunta.');
      }
    }
  });

  const destroyMutation = useSurveysFormsQuestionsDestroy({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getSurveysFormsQuestionsListQueryKey(formId) }),
          queryClient.invalidateQueries({ queryKey: getSurveysFormsRetrieveQueryKey(formId) })
        ]);
        notifySuccess('Pergunta removida.');
        setDeleteQuestion(null);
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel remover a pergunta.');
      }
    }
  });

  const formDetails = getOrvalResponseData(formQuery.data);
  const questions = getOrvalResponseData<FormQuestion[]>(questionsQuery.data) ?? [];

  const form = useAppForm({
    defaultValues: {
      label: '',
      question_type: surveyQuestionTypeOptions[0].value,
      is_required: false
    } as SurveyQuestionCreateValues,
    validators: {
      onSubmit: surveyQuestionCreateSchema
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        formId,
        data: {
          label: value.label.trim(),
          question_type: value.question_type,
          is_required: value.is_required
        } as never
      });
      form.reset();
    }
  });

  const editForm = useAppForm({
    defaultValues: {
      label: editQuestion?.label ?? '',
      question_type: editQuestion?.question_type ?? surveyQuestionTypeOptions[0].value,
      is_required: editQuestion?.is_required ?? false
    } as SurveyQuestionCreateValues,
    validators: {
      onSubmit: surveyQuestionCreateSchema
    },
    onSubmit: async ({ value }) => {
      if (!editQuestion) return;

      await updateMutation.mutateAsync({
        formId,
        questionId: editQuestion.id,
        data: {
          label: value.label.trim(),
          question_type: value.question_type,
          is_required: value.is_required
        }
      });
    }
  });

  const { FormTextField, FormSelectField, FormSwitchField } =
    useFormFields<SurveyQuestionCreateValues>();

  const isFormArchived = formDetails?.status === Status37cEnum.ARCHIVED;
  const isMutating =
    createMutation.isPending || updateMutation.isPending || destroyMutation.isPending;

  const columns = React.useMemo(
    () =>
      getSurveyQuestionsColumns({
        onEdit: (question) => setEditQuestion(question),
        onDelete: (question) => setDeleteQuestion(question),
        disableActions: isFormArchived || isMutating
      }),
    [isFormArchived, isMutating]
  );

  React.useEffect(() => {
    if (!editQuestion) return;

    editForm.reset({
      label: editQuestion.label,
      question_type: editQuestion.question_type,
      is_required: Boolean(editQuestion.is_required)
    });
  }, [editForm, editQuestion]);

  const { table } = useDataTable({
    data: questions,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: MODULE_TABLE_DEFAULT_DEBOUNCE_MS,
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0
      }
    }
  });

  if (questionsQuery.isPending || formQuery.isPending) {
    return (
      <div className='grid gap-6'>
        <ModuleDataTableSkeleton columnCount={4} filterCount={0} />
      </div>
    );
  }

  if (questionsQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={questionsQuery.error}
          title='Erro ao carregar perguntas'
          fallbackMessage='Nao foi possivel carregar as perguntas deste formulario.'
        />
        <div>
          <Button variant='outline' onClick={() => questionsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-6'>
      <ModuleFormCard
        title='Nova pergunta'
        description='Cadastre perguntas para compor o formulario. Reordenacao e opcoes entram nas proximas tarefas.'
        footer={
          <ModuleFormActions
            mode='create'
            formId={CREATE_QUESTION_FORM_ID}
            isPending={createMutation.isPending || isFormArchived}
            submitLabel='Adicionar pergunta'
            cancelLabel='Limpar'
            onCancel={() => form.reset()}
          />
        }
      >
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline'>Formulario: {formDetails?.title ?? formId}</Badge>
          <Badge variant='outline'>Total: {questions.length} perguntas</Badge>
          {isFormArchived ? <Badge variant='outline'>Formulario arquivado</Badge> : null}
        </div>

        <form.AppForm>
          <form.Form id={CREATE_QUESTION_FORM_ID} className='space-y-8 p-0 md:p-0'>
            <ModuleFormSection
              title='Conteudo da pergunta'
              description='Defina o texto e o tipo da resposta esperada.'
            >
              <FormTextField
                name='label'
                label='Pergunta'
                required
                maxLength={255}
                placeholder='Ex.: Como voce avalia o atendimento recebido?'
                validators={{
                  onBlur: surveyQuestionCreateFieldSchemas.label
                }}
              />

              <FormSelectField
                name='question_type'
                label='Tipo'
                required
                options={surveyQuestionTypeOptions}
                placeholder='Selecione um tipo'
                validators={{
                  onBlur: surveyQuestionCreateFieldSchemas.question_type
                }}
              />
            </ModuleFormSection>

            <ModuleFormSection
              title='Regras'
              description='Marque se o respondente precisa obrigatoriamente responder esta pergunta.'
              columns={1}
              separated
            >
              <FormSwitchField
                name='is_required'
                label='Resposta obrigatoria'
                description='Quando ativado, o envio so sera permitido com esta pergunta respondida.'
                validators={{
                  onBlur: surveyQuestionCreateFieldSchemas.is_required
                }}
              />
            </ModuleFormSection>

            {isFormArchived ? (
              <ModuleErrorAlert
                title='Formulario arquivado'
                message='Nao e permitido criar, editar ou remover perguntas em formulario arquivado.'
              />
            ) : null}
          </form.Form>
        </form.AppForm>
      </ModuleFormCard>

      {questions.length === 0 ? (
        <SurveyQuestionsEmptyState />
      ) : (
        <ModuleDataTable
          table={table}
          toolbarChildren={
            <>
              {questionsQuery.isFetching ? (
                <Badge variant='outline' className='gap-1'>
                  <Icons.spinner className='h-3 w-3 animate-spin' />
                  Atualizando
                </Badge>
              ) : null}
              <Badge variant='outline'>{questions.length} perguntas</Badge>
            </>
          }
        />
      )}

      <Dialog open={Boolean(editQuestion)} onOpenChange={(open) => !open && setEditQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar pergunta</DialogTitle>
            <DialogDescription>
              Atualize o texto, tipo e obrigatoriedade da pergunta.
            </DialogDescription>
          </DialogHeader>

          <editForm.AppForm>
            <editForm.Form id={EDIT_QUESTION_FORM_ID} className='space-y-6 p-0 md:p-0'>
              <FormTextField
                name='label'
                label='Pergunta'
                required
                maxLength={255}
                validators={{
                  onBlur: surveyQuestionCreateFieldSchemas.label
                }}
              />

              <FormSelectField
                name='question_type'
                label='Tipo'
                required
                options={surveyQuestionTypeOptions}
                validators={{
                  onBlur: surveyQuestionCreateFieldSchemas.question_type
                }}
              />

              <FormSwitchField
                name='is_required'
                label='Resposta obrigatoria'
                validators={{
                  onBlur: surveyQuestionCreateFieldSchemas.is_required
                }}
              />
            </editForm.Form>
          </editForm.AppForm>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setEditQuestion(null)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type='submit' form={EDIT_QUESTION_FORM_ID} isLoading={updateMutation.isPending}>
              Salvar alteracoes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteQuestion)}
        onOpenChange={(open) => !open && setDeleteQuestion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover pergunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao remove definitivamente a pergunta selecionada do formulario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={destroyMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteQuestion) return;
                void destroyMutation.mutateAsync({ formId, questionId: deleteQuestion.id });
              }}
              disabled={destroyMutation.isPending}
            >
              {destroyMutation.isPending ? (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
