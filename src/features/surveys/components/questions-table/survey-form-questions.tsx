'use client';

import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsQuestionsCreate,
  useSurveysFormsQuestionsList,
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
  const columns = React.useMemo(() => getSurveyQuestionsColumns(), []);

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

  const { FormTextField, FormSelectField, FormSwitchField } =
    useFormFields<SurveyQuestionCreateValues>();

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

  const isFormArchived = formDetails?.status === Status37cEnum.ARCHIVED;

  return (
    <div className='grid gap-6'>
      <ModuleFormCard
        title='Nova pergunta'
        description='Cadastre perguntas para compor o formulario. Reordenacao e opcoes entram nas proximas tarefas.'
        footer={
          <ModuleFormActions
            mode='create'
            formId={CREATE_QUESTION_FORM_ID}
            isPending={createMutation.isPending}
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
    </div>
  );
}
