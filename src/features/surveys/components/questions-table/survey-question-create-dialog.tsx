'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  getSurveysFormsQuestionsListQueryKey,
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsQuestionsCreate,
  useSurveysFrameworksList
} from '@/lib/api/generated/endpoints';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import {
  surveyQuestionCreateFieldSchemas,
  surveyQuestionCreateSchema,
  surveyQuestionTypeOptions,
  type SurveyQuestionCreateValues
} from '../../schemas/survey-question';

const CREATE_QUESTION_DIALOG_FORM_ID = 'survey-question-create-dialog';

const DEFAULT_VALUES: SurveyQuestionCreateValues = {
  label: '',
  question_type: surveyQuestionTypeOptions[0].value,
  is_required: false
};

type SurveyQuestionCreateDialogProps = {
  formId: string;
  isFormArchived?: boolean;
};

export function SurveyQuestionCreateDialog({
  formId,
  isFormArchived = false
}: SurveyQuestionCreateDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const [selectedIndicators, setSelectedIndicators] = React.useState<string[]>([]);

  const indicatorsQuery = useSurveysFrameworksList(
    { is_active: 'true' },
    { query: { staleTime: 60_000 } }
  );
  const indicators = getOrvalResponseData<SurveyFramework[]>(indicatorsQuery.data) ?? [];

  const createMutation = useSurveysFormsQuestionsCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getSurveysFormsQuestionsListQueryKey(formId)
          }),
          queryClient.invalidateQueries({
            queryKey: getSurveysFormsRetrieveQueryKey(formId)
          })
        ]);
        notifySuccess('Pergunta criada.');
        form.reset(DEFAULT_VALUES);
        setSelectedIndicators([]);
        setOpen(false);
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível criar a pergunta.');
      }
    }
  });

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onSubmit: surveyQuestionCreateSchema },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        formId,
        data: {
          label: value.label.trim(),
          question_type: value.question_type,
          is_required: value.is_required,
          indicators: selectedIndicators
        } as never
      });
    }
  });

  const { FormTextField, FormSelectField, FormSwitchField } =
    useFormFields<SurveyQuestionCreateValues>();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmDiscard(true);
      return; // intercept — don't actually close
    }
    setOpen(true);
  }

  function forceClose() {
    form.reset(DEFAULT_VALUES);
    setSelectedIndicators([]);
    createMutation.reset();
    setConfirmDiscard(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        size='sm'
        className='text-xs md:text-sm'
        disabled={isFormArchived}
        onClick={() => setOpen(true)}
      >
        <Icons.add className='mr-2 h-4 w-4' />
        Nova pergunta
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Nova pergunta</DialogTitle>
            <DialogDescription>
              Defina o texto, tipo e indicadores desta pergunta.
            </DialogDescription>
          </DialogHeader>

          <form.AppForm>
            <form.Form id={CREATE_QUESTION_DIALOG_FORM_ID} className='space-y-6 py-1'>
              <FormTextField
                name='label'
                label='Pergunta'
                required
                maxLength={255}
                placeholder='Ex.: Como você avalia o atendimento recebido?'
                validators={{ onBlur: surveyQuestionCreateFieldSchemas.label }}
              />

              <FormSelectField
                name='question_type'
                label='Tipo'
                required
                options={[...surveyQuestionTypeOptions]}
                placeholder='Selecione um tipo'
                validators={{ onBlur: surveyQuestionCreateFieldSchemas.question_type }}
              />
              <div className='flex items-end pb-1'>
                <FormSwitchField
                  name='is_required'
                  label='Resposta obrigatória?'
                  validators={{ onBlur: surveyQuestionCreateFieldSchemas.is_required }}
                />
              </div>

              {indicators.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-md font-medium'>Indicadores</p>
                  <p className='text-muted-foreground text-xs'>
                    Quais indicadores de satisfação esta pergunta vai alimentar (opcional).
                  </p>
                  <div className='grid grid-cols-2 gap-2'>
                    {indicators.map((indicator) => (
                      <Label
                        key={indicator.id}
                        htmlFor={`dlg-ind-${indicator.code}`}
                        className='flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2'
                      >
                        <Checkbox
                          id={`dlg-ind-${indicator.code}`}
                          checked={selectedIndicators.includes(indicator.code)}
                          onCheckedChange={(checked) => {
                            setSelectedIndicators((prev) =>
                              checked
                                ? prev.includes(indicator.code)
                                  ? prev
                                  : [...prev, indicator.code]
                                : prev.filter((code) => code !== indicator.code)
                            );
                          }}
                        />
                        <span className='font-medium'>{indicator.code}</span>
                        {indicator.name ? (
                          <span className='text-muted-foreground font-normal text-xs truncate'>
                            — {indicator.name}
                          </span>
                        ) : null}
                      </Label>
                    ))}
                  </div>
                </div>
              )}
            </form.Form>
          </form.AppForm>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setConfirmDiscard(true)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              form={CREATE_QUESTION_DIALOG_FORM_ID}
              isLoading={createMutation.isPending}
            >
              Adicionar pergunta
            </Button>
          </DialogFooter>

          <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os dados preenchidos serão perdidos. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                <AlertDialogAction onClick={forceClose}>Descartar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </>
  );
}
