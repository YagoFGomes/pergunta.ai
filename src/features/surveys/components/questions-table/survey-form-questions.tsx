'use client';

import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
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

import { MODULE_TABLE_DEFAULT_DEBOUNCE_MS } from '@/features/platform/lib/module-table';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getSurveysFormsQuestionsListQueryKey,
  getSurveysFormsQuestionsOptionsListQueryKey,
  getSurveysFormsQuestionsRetrieveQueryKey,
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsQuestionsDestroy,
  useSurveysFormsQuestionsList,
  useSurveysFormsQuestionsOptionsCreate,
  useSurveysFormsQuestionsOptionsDestroy,
  useSurveysFormsQuestionsOptionsList,
  useSurveysFormsQuestionsOptionsPartialUpdate,
  useSurveysFormsQuestionsPartialUpdate,
  useSurveysFormsQuestionsReorderCreate,
  useSurveysFormsRetrieve,
  useSurveysFrameworksList
} from '@/lib/api/generated/endpoints';
import type { FormQuestion } from '@/lib/api/generated/model/formQuestion';
import type { FormQuestionOption } from '@/lib/api/generated/model/formQuestionOption';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';
import { QuestionTypeEnum } from '@/lib/api/generated/model/questionTypeEnum';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';

import {
  surveyQuestionCreateFieldSchemas,
  surveyQuestionCreateSchema,
  surveyQuestionTypeOptions,
  type SurveyQuestionCreateValues
} from '../../schemas/survey-question';
import { getSurveyQuestionsColumns } from './columns';
import { SurveyQuestionCreateDialog } from './survey-question-create-dialog';

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

function SurveyQuestionsEmptyState({
  formId,
  isFormArchived
}: {
  formId: string;
  isFormArchived: boolean;
}) {
  return (
    <div className='flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center'>
      <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
        <Icons.forms className='text-muted-foreground size-6' />
      </div>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>Nenhuma pergunta cadastrada</h2>
        <p className='text-muted-foreground max-w-md text-sm'>
          Adicione a primeira pergunta para começar a montar este formulário de pesquisa.
        </p>
      </div>
      <SurveyQuestionCreateDialog formId={formId} isFormArchived={isFormArchived} />
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
  const [editIndicators, setEditIndicators] = React.useState<string[]>([]);

  const formQuery = useSurveysFormsRetrieve(formId, {
    query: {
      staleTime: 30_000
    }
  });

  const questionsQuery = useSurveysFormsQuestionsList(formId);
  const indicatorsQuery = useSurveysFrameworksList(
    { is_active: 'true' },
    { query: { staleTime: 60_000 } }
  );
  const indicators = getOrvalResponseData<SurveyFramework[]>(indicatorsQuery.data) ?? [];
  const selectedQuestionId = manageOptionsQuestion?.id ?? '';
  const optionsQuery = useSurveysFormsQuestionsOptionsList(formId, selectedQuestionId, {
    query: {
      enabled: Boolean(selectedQuestionId)
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
        notifyError(error, 'Não foi possível atualizar a pergunta.');
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
        notifyError(error, 'Não foi possível remover a pergunta.');
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
        notifyError(error, 'Não foi possível reordenar as perguntas.');
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
        notifySuccess('Opção criada.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível criar a opção.');
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
        notifySuccess('Opção atualizada.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível atualizar a opção.');
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
        notifySuccess('Opção removida.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível remover a opção.');
      }
    }
  });

  const formDetails = getOrvalResponseData(formQuery.data);
  const questions = getOrvalResponseData<FormQuestion[]>(questionsQuery.data) ?? [];
  const questionOptions = React.useMemo(() => {
    const raw = getOrvalResponseData<FormQuestionOption[]>(optionsQuery.data) ?? [];
    return [...raw].sort((a, b) => a.order - b.order);
  }, [optionsQuery.data]);

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
          is_required: value.is_required,
          indicators: editIndicators
        } as never
      });
    }
  });

  const { FormTextField, FormSelectField, FormSwitchField } =
    useFormFields<SurveyQuestionCreateValues>();

  const isFormArchived = formDetails?.status === Status37cEnum.ARCHIVED;
  const isMutating =
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
      notifyError(new Error('Opção inválida.'), 'Informe label e value da opção.');
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
      notifyError(new Error('Opção inválida.'), 'Informe label e value da opção.');
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
    setEditIndicators(
      ((editQuestion as unknown as Record<string, unknown>).indicators as string[] | undefined) ??
        []
    );
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
          fallbackMessage='Não foi possível carregar as perguntas deste formulário.'
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
      {questions.length === 0 ? (
        <SurveyQuestionsEmptyState formId={formId} isFormArchived={isFormArchived} />
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
              {isFormArchived ? <Badge variant='outline'>Reordenação bloqueada</Badge> : null}
              <Badge variant='outline'>{questions.length} perguntas</Badge>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full sm:w-auto'
                onClick={() => setOrderedQuestionIds(currentOrderIds)}
                disabled={!hasOrderChanges || isMutating}
              >
                Descartar alterações
              </Button>
              <Button
                type='button'
                size='sm'
                className='w-full sm:w-auto'
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
            <DialogTitle>Gerenciar opções da pergunta</DialogTitle>
            <DialogDescription>
              {manageOptionsQuestion
                ? `Pergunta: ${manageOptionsQuestion.label}`
                : 'Selecione uma pergunta para gerenciar opções.'}
            </DialogDescription>
          </DialogHeader>

          {!supportsQuestionOptions(manageOptionsQuestion) ? (
            <ModuleErrorAlert
              title='Pergunta sem opções'
              message='Somente perguntas de escolha única ou múltipla possuem opções.'
            />
          ) : (
            <div className='grid gap-4'>
              <h4 className='text-sm font-semibold'>Nova opção</h4>
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
                  className='w-full sm:w-auto'
                  onClick={() => void handleCreateOption()}
                  isLoading={optionCreateMutation.isPending}
                  disabled={isFormArchived}
                >
                  Adicionar opção
                </Button>
              </div>

              {editingOption ? (
                <div className='grid gap-3 '>
                  <h4 className='text-sm font-semibold'>Editar opção</h4>
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
                  <div className='flex flex-col justify-end gap-2 sm:flex-row [&_button]:w-full sm:[&_button]:w-auto'>
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
                      Salvar opção
                    </Button>
                  </div>
                </div>
              ) : null}

              {optionsQuery.isPending ? (
                <ModuleDataTableSkeleton columnCount={3} filterCount={0} />
              ) : optionsQuery.isError ? (
                <ModuleErrorAlert
                  error={optionsQuery.error}
                  title='Erro ao carregar opções'
                  fallbackMessage='Não foi possível carregar as opções desta pergunta.'
                />
              ) : questionOptions.length === 0 ? (
                <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
                  Nenhuma opção cadastrada para esta pergunta.
                </div>
              ) : (
                <ul className='space-y-2'>
                  {questionOptions.map((option) => (
                    <li
                      key={option.id}
                      className='bg-background flex min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2'
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
                          aria-label='Editar opção'
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
                          aria-label='Remover opção'
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
                  title='Formulário arquivado'
                  message='Não é permitido criar, editar ou remover opções em formulário arquivado.'
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
        <DialogContent className='sm:max-w-2xl'>
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

              <div className='flex items-end pb-1'>
                <FormSwitchField
                  name='is_required'
                  label='Resposta obrigatória?'
                  validators={{
                    onBlur: surveyQuestionCreateFieldSchemas.is_required
                  }}
                />
              </div>
            </editForm.Form>
          </editForm.AppForm>

          {indicators.length > 0 ? (
            <div className='space-y-2'>
              <p className='text-md font-medium'>Indicadores</p>
              <p className='text-muted-foreground text-xs'>
                Quais indicadores de satisfação esta pergunta alimenta.
              </p>
              <div className='grid grid-cols-2 gap-2'>
                {indicators.map((indicator) => (
                  <Label
                    key={indicator.id}
                    htmlFor={`edit-ind-${indicator.code}`}
                    className='flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2'
                  >
                    <Checkbox
                      id={`edit-ind-${indicator.code}`}
                      checked={editIndicators.includes(indicator.code)}
                      onCheckedChange={(checked) =>
                        setEditIndicators((prev) =>
                          checked
                            ? [...prev, indicator.code]
                            : prev.filter((c) => c !== indicator.code)
                        )
                      }
                    />
                    <span className='font-medium'>{indicator.code}</span>
                    {indicator.name ? (
                      <span className='text-muted-foreground truncate font-normal text-xs'>
                        — {indicator.name}
                      </span>
                    ) : null}
                  </Label>
                ))}
              </div>
            </div>
          ) : null}

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
              Salvar alterações
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
              Esta ação remove definitivamente a pergunta selecionada do formulário.
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
            <AlertDialogTitle>Remover opção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove a opção selecionada desta pergunta.
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
