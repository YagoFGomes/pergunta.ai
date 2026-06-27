'use client';

import { arrayMove } from '@dnd-kit/sortable';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  getSurveysFormsQuestionsOptionsListQueryKey,
  getSurveysFormsQuestionsRetrieveQueryKey,
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsQuestionsCreate,
  useSurveysFormsQuestionsDestroy,
  useSurveysFormsQuestionsList,
  useSurveysFormsQuestionsOptionsCreate,
  useSurveysFormsQuestionsOptionsDestroy,
  useSurveysFormsQuestionsOptionsList,
  useSurveysFormsQuestionsOptionsPartialUpdate,
  useSurveysFormsQuestionsPartialUpdate,
  useSurveysFormsQuestionsReorderCreate,
  useSurveysFormsRetrieve
} from '@/lib/api/generated/endpoints';
import type { FormQuestion } from '@/lib/api/generated/model/formQuestion';
import type { FormQuestionOption } from '@/lib/api/generated/model/formQuestionOption';
import { QuestionTypeEnum } from '@/lib/api/generated/model/questionTypeEnum';
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
const QUESTION_OPTION_TYPES: ReadonlySet<QuestionTypeEnum> = new Set([
  QuestionTypeEnum.SINGLE_CHOICE,
  QuestionTypeEnum.MULTIPLE_CHOICE
]);

function supportsQuestionOptions(question?: FormQuestion | null): boolean {
  if (!question?.question_type) return false;
  return QUESTION_OPTION_TYPES.has(question.question_type);
}

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
  const [manageOptionsQuestion, setManageOptionsQuestion] = React.useState<FormQuestion | null>(
    null
  );
  const [editingOption, setEditingOption] = React.useState<FormQuestionOption | null>(null);
  const [deleteOption, setDeleteOption] = React.useState<FormQuestionOption | null>(null);
  const [newOptionLabel, setNewOptionLabel] = React.useState('');
  const [newOptionValue, setNewOptionValue] = React.useState('');
  const [editOptionLabel, setEditOptionLabel] = React.useState('');
  const [editOptionValue, setEditOptionValue] = React.useState('');
  const [orderedQuestionIds, setOrderedQuestionIds] = React.useState<string[]>([]);

  const formQuery = useSurveysFormsRetrieve(formId, {
    query: {
      staleTime: 30_000
    }
  });

  const questionsQuery = useSurveysFormsQuestionsList(formId);
  const selectedQuestionId = manageOptionsQuestion?.id ?? '';
  const optionsQuery = useSurveysFormsQuestionsOptionsList(formId, selectedQuestionId, {
    query: {
      enabled: Boolean(selectedQuestionId)
    }
  });

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

  const reorderMutation = useSurveysFormsQuestionsReorderCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getSurveysFormsQuestionsListQueryKey(formId) }),
          queryClient.invalidateQueries({ queryKey: getSurveysFormsRetrieveQueryKey(formId) })
        ]);
        notifySuccess('Ordem das perguntas atualizada.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel reordenar as perguntas.');
      }
    }
  });

  const optionCreateMutation = useSurveysFormsQuestionsOptionsCreate({
    mutation: {
      onSuccess: async () => {
        if (!selectedQuestionId) return;

        await queryClient.invalidateQueries({
          queryKey: getSurveysFormsQuestionsOptionsListQueryKey(formId, selectedQuestionId)
        });
        setNewOptionLabel('');
        setNewOptionValue('');
        notifySuccess('Opcao criada.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel criar a opcao.');
      }
    }
  });

  const optionUpdateMutation = useSurveysFormsQuestionsOptionsPartialUpdate({
    mutation: {
      onSuccess: async () => {
        if (!selectedQuestionId) return;

        await queryClient.invalidateQueries({
          queryKey: getSurveysFormsQuestionsOptionsListQueryKey(formId, selectedQuestionId)
        });
        setEditingOption(null);
        notifySuccess('Opcao atualizada.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel atualizar a opcao.');
      }
    }
  });

  const optionDeleteMutation = useSurveysFormsQuestionsOptionsDestroy({
    mutation: {
      onSuccess: async () => {
        if (!selectedQuestionId) return;

        await queryClient.invalidateQueries({
          queryKey: getSurveysFormsQuestionsOptionsListQueryKey(formId, selectedQuestionId)
        });
        setDeleteOption(null);
        notifySuccess('Opcao removida.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel remover a opcao.');
      }
    }
  });

  const formDetails = getOrvalResponseData(formQuery.data);
  const questions = getOrvalResponseData<FormQuestion[]>(questionsQuery.data) ?? [];
  const questionOptions = React.useMemo(() => {
    const raw = getOrvalResponseData<FormQuestionOption[]>(optionsQuery.data) ?? [];
    return [...raw].sort((a, b) => a.order - b.order);
  }, [optionsQuery.data]);

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
    createMutation.isPending ||
    updateMutation.isPending ||
    destroyMutation.isPending ||
    reorderMutation.isPending ||
    optionCreateMutation.isPending ||
    optionUpdateMutation.isPending ||
    optionDeleteMutation.isPending;

  const currentOrderIds = React.useMemo(
    () => [...questions].sort((a, b) => a.order - b.order).map((question) => question.id),
    [questions]
  );

  React.useEffect(() => {
    setOrderedQuestionIds((previous) => {
      if (
        previous.length === currentOrderIds.length &&
        previous.every((id, index) => id === currentOrderIds[index])
      ) {
        return previous;
      }

      return currentOrderIds;
    });
  }, [currentOrderIds]);

  const hasOrderChanges = React.useMemo(() => {
    if (orderedQuestionIds.length !== currentOrderIds.length) return false;
    return orderedQuestionIds.some((id, index) => id !== currentOrderIds[index]);
  }, [orderedQuestionIds, currentOrderIds]);

  const questionsById = React.useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions]
  );

  const orderedQuestions = React.useMemo(
    () => orderedQuestionIds.map((id) => questionsById.get(id)).filter(Boolean) as FormQuestion[],
    [orderedQuestionIds, questionsById]
  );

  const handleSaveReorder = React.useCallback(async () => {
    if (!hasOrderChanges || isFormArchived) return;

    await reorderMutation.mutateAsync({
      id: formId,
      data: {
        question_ids: orderedQuestionIds
      }
    });
  }, [formId, hasOrderChanges, isFormArchived, orderedQuestionIds, reorderMutation]);

  const handleCreateOption = React.useCallback(async () => {
    if (!manageOptionsQuestion?.id) return;

    const label = newOptionLabel.trim();
    const value = newOptionValue.trim();

    if (!label || !value) {
      notifyError(new Error('Opcao invalida.'), 'Informe label e value da opcao.');
      return;
    }

    await optionCreateMutation.mutateAsync({
      formId,
      questionId: manageOptionsQuestion.id,
      data: {
        label,
        value
      } as never
    });
  }, [formId, manageOptionsQuestion?.id, newOptionLabel, newOptionValue, optionCreateMutation]);

  const handleUpdateOption = React.useCallback(async () => {
    if (!manageOptionsQuestion?.id || !editingOption?.id) return;

    const label = editOptionLabel.trim();
    const value = editOptionValue.trim();

    if (!label || !value) {
      notifyError(new Error('Opcao invalida.'), 'Informe label e value da opcao.');
      return;
    }

    await optionUpdateMutation.mutateAsync({
      formId,
      questionId: manageOptionsQuestion.id,
      optionId: editingOption.id,
      data: {
        label,
        value
      }
    });
  }, [
    editOptionLabel,
    editOptionValue,
    editingOption?.id,
    formId,
    manageOptionsQuestion?.id,
    optionUpdateMutation
  ]);

  const moveQuestionByOffset = React.useCallback((questionId: string, offset: -1 | 1) => {
    setOrderedQuestionIds((previous) => {
      const currentIndex = previous.indexOf(questionId);
      if (currentIndex === -1) return previous;

      const targetIndex = currentIndex + offset;
      if (targetIndex < 0 || targetIndex >= previous.length) return previous;

      return arrayMove(previous, currentIndex, targetIndex);
    });
  }, []);

  const questionIndexMap = React.useMemo(() => {
    return orderedQuestionIds.reduce<Record<string, number>>((acc, id, index) => {
      acc[id] = index;
      return acc;
    }, {});
  }, [orderedQuestionIds]);

  const columns = React.useMemo(
    () =>
      getSurveyQuestionsColumns({
        onMoveUp: (question) => moveQuestionByOffset(question.id, -1),
        onMoveDown: (question) => moveQuestionByOffset(question.id, 1),
        canMoveUp: (question) => (questionIndexMap[question.id] ?? 0) > 0,
        canMoveDown: (question) =>
          (questionIndexMap[question.id] ?? -1) < orderedQuestionIds.length - 1,
        onManageOptions: (question) => {
          setManageOptionsQuestion(question);
          setEditingOption(null);
        },
        canManageOptions: (question) => supportsQuestionOptions(question),
        onEdit: (question) => setEditQuestion(question),
        onDelete: (question) => setDeleteQuestion(question),
        disableActions: isFormArchived || isMutating
      }),
    [isFormArchived, isMutating, moveQuestionByOffset, orderedQuestionIds.length, questionIndexMap]
  );

  React.useEffect(() => {
    if (!editQuestion) return;

    editForm.reset({
      label: editQuestion.label,
      question_type: editQuestion.question_type,
      is_required: Boolean(editQuestion.is_required)
    });
  }, [editForm, editQuestion]);

  React.useEffect(() => {
    if (!editingOption) return;

    setEditOptionLabel(editingOption.label);
    setEditOptionValue(editingOption.value);
  }, [editingOption]);

  const { table } = useDataTable({
    data: orderedQuestions,
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
                options={[...surveyQuestionTypeOptions]}
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
              {questionsQuery.isFetching || reorderMutation.isPending ? (
                <Badge variant='outline' className='gap-1'>
                  <Icons.spinner className='h-3 w-3 animate-spin' />
                  Atualizando
                </Badge>
              ) : null}
              {hasOrderChanges ? <Badge variant='outline'>Ordem alterada</Badge> : null}
              {isFormArchived ? <Badge variant='outline'>Reordenacao bloqueada</Badge> : null}
              <Badge variant='outline'>{questions.length} perguntas</Badge>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setOrderedQuestionIds(currentOrderIds)}
                disabled={!hasOrderChanges || isMutating}
              >
                Descartar alteracoes
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={() => void handleSaveReorder()}
                isLoading={reorderMutation.isPending}
                disabled={!hasOrderChanges || isFormArchived}
              >
                Salvar ordem
              </Button>
            </>
          }
        />
      )}

      <Dialog
        open={Boolean(manageOptionsQuestion)}
        onOpenChange={(open) => {
          if (!open) {
            setManageOptionsQuestion(null);
            setEditingOption(null);
            setDeleteOption(null);
            setNewOptionLabel('');
            setNewOptionValue('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar opcoes da pergunta</DialogTitle>
            <DialogDescription>
              {manageOptionsQuestion
                ? `Pergunta: ${manageOptionsQuestion.label}`
                : 'Selecione uma pergunta para gerenciar opcoes.'}
            </DialogDescription>
          </DialogHeader>

          {!supportsQuestionOptions(manageOptionsQuestion) ? (
            <ModuleErrorAlert
              title='Pergunta sem opcoes'
              message='Somente perguntas de escolha unica ou multipla possuem opcoes.'
            />
          ) : (
            <div className='grid gap-4'>
              <div className='grid gap-3 rounded-md border p-3'>
                <h4 className='text-sm font-semibold'>Nova opcao</h4>
                <div className='grid gap-2'>
                  <Label htmlFor='option-label'>Label</Label>
                  <Input
                    id='option-label'
                    placeholder='Ex.: Muito satisfeito'
                    value={newOptionLabel}
                    onChange={(event) => setNewOptionLabel(event.target.value)}
                    disabled={optionCreateMutation.isPending || isFormArchived}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='option-value'>Value</Label>
                  <Input
                    id='option-value'
                    placeholder='Ex.: very_satisfied'
                    value={newOptionValue}
                    onChange={(event) => setNewOptionValue(event.target.value)}
                    disabled={optionCreateMutation.isPending || isFormArchived}
                  />
                </div>
                <div className='flex justify-end'>
                  <Button
                    type='button'
                    size='sm'
                    onClick={() => void handleCreateOption()}
                    isLoading={optionCreateMutation.isPending}
                    disabled={isFormArchived}
                  >
                    Adicionar opcao
                  </Button>
                </div>
              </div>

              {editingOption ? (
                <div className='grid gap-3 rounded-md border p-3'>
                  <h4 className='text-sm font-semibold'>Editar opcao</h4>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-option-label'>Label</Label>
                    <Input
                      id='edit-option-label'
                      value={editOptionLabel}
                      onChange={(event) => setEditOptionLabel(event.target.value)}
                      disabled={optionUpdateMutation.isPending}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-option-value'>Value</Label>
                    <Input
                      id='edit-option-value'
                      value={editOptionValue}
                      onChange={(event) => setEditOptionValue(event.target.value)}
                      disabled={optionUpdateMutation.isPending}
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setEditingOption(null)}
                      disabled={optionUpdateMutation.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type='button'
                      size='sm'
                      onClick={() => void handleUpdateOption()}
                      isLoading={optionUpdateMutation.isPending}
                    >
                      Salvar opcao
                    </Button>
                  </div>
                </div>
              ) : null}

              {optionsQuery.isPending ? (
                <ModuleDataTableSkeleton columnCount={3} filterCount={0} />
              ) : optionsQuery.isError ? (
                <ModuleErrorAlert
                  error={optionsQuery.error}
                  title='Erro ao carregar opcoes'
                  fallbackMessage='Nao foi possivel carregar as opcoes desta pergunta.'
                />
              ) : questionOptions.length === 0 ? (
                <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
                  Nenhuma opcao cadastrada para esta pergunta.
                </div>
              ) : (
                <ul className='space-y-2'>
                  {questionOptions.map((option) => (
                    <li
                      key={option.id}
                      className='bg-background flex items-center justify-between gap-3 rounded-md border px-3 py-2'
                    >
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>
                          #{option.order} {option.label}
                        </p>
                        <p className='text-muted-foreground truncate text-xs'>{option.value}</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => setEditingOption(option)}
                          disabled={isFormArchived || optionDeleteMutation.isPending}
                          aria-label='Editar opcao'
                        >
                          <Icons.edit className='h-4 w-4' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='text-destructive hover:text-destructive'
                          onClick={() => setDeleteOption(option)}
                          disabled={isFormArchived || optionDeleteMutation.isPending}
                          aria-label='Remover opcao'
                        >
                          <Icons.trash className='h-4 w-4' />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {isFormArchived ? (
                <ModuleErrorAlert
                  title='Formulario arquivado'
                  message='Nao e permitido criar, editar ou remover opcoes em formulario arquivado.'
                />
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setManageOptionsQuestion(null);
                setEditingOption(null);
                setDeleteOption(null);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                options={[...surveyQuestionTypeOptions]}
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

      <AlertDialog
        open={Boolean(deleteOption)}
        onOpenChange={(open) => !open && setDeleteOption(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover opcao?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao remove a opcao selecionada desta pergunta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={optionDeleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteOption || !manageOptionsQuestion) return;

                void optionDeleteMutation.mutateAsync({
                  formId,
                  questionId: manageOptionsQuestion.id,
                  optionId: deleteOption.id
                });
              }}
              disabled={optionDeleteMutation.isPending}
            >
              {optionDeleteMutation.isPending ? (
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
