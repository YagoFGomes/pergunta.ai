'use client';

import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import {
  getSurveysFrameworksListQueryKey,
  useSurveysFrameworksCreate
} from '@/lib/api/generated/endpoints';
import {
  surveyFrameworkFieldSchemas,
  type SurveyFrameworkFormValues
} from '@/features/surveys/schemas/survey-framework';

const DEFAULT_VALUES: SurveyFrameworkFormValues = {
  code: '',
  name: '',
  description: '',
  is_active: true
};

function normalizeValues(values: SurveyFrameworkFormValues): SurveyFrameworkFormValues {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: (values.description || '').trim(),
    is_active: values.is_active
  };
}

type SurveyFrameworkCreateDialogProps = {
  trigger?: React.ReactNode;
};

export function SurveyFrameworkCreateDialog({ trigger }: SurveyFrameworkCreateDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  const createMutation = useSurveysFrameworksCreate({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getSurveysFrameworksListQueryKey() });
        toast.success('Indicador criado com sucesso.');
        form.reset(DEFAULT_VALUES);
        setOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível criar o indicador.');
      }
    }
  });

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const normalized = normalizeValues(value);

      await createMutation.mutateAsync({
        data: {
          code: normalized.code,
          name: normalized.name,
          description: normalized.description,
          is_active: normalized.is_active
        }
      });
    }
  });

  const { FormTextField, FormTextareaField, FormSwitchField } =
    useFormFields<SurveyFrameworkFormValues>();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmDiscard(true);
      return;
    }

    setOpen(true);
  }

  function forceClose() {
    form.reset(DEFAULT_VALUES);
    createMutation.reset();
    setConfirmDiscard(false);
    setOpen(false);
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button size='sm' className='text-xs md:text-sm'>
            <Icons.add className='mr-2 h-4 w-4' />
            Novo indicador
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo indicador</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um indicador customizado.
            </DialogDescription>
          </DialogHeader>

          <form.AppForm>
            <form.Form className='space-y-4 p-0 md:p-0'>
              <FormTextField
                name='code'
                label='Código'
                required
                placeholder='Ex: NPS'
                maxLength={20}
                validators={{
                  onBlur: surveyFrameworkFieldSchemas.code
                }}
                disabled={createMutation.isPending}
              />

              <FormTextField
                name='name'
                label='Nome'
                required
                placeholder='Ex: Índice de lealdade'
                maxLength={120}
                validators={{
                  onBlur: surveyFrameworkFieldSchemas.name
                }}
                disabled={createMutation.isPending}
              />

              <FormTextareaField
                name='description'
                label='Descrição'
                placeholder='Descreva o objetivo deste indicador'
                maxLength={1000}
                rows={4}
                validators={{
                  onBlur: surveyFrameworkFieldSchemas.description
                }}
                disabled={createMutation.isPending}
              />

              <div
                className={`rounded-lg border p-3 ${createMutation.isPending ? 'pointer-events-none opacity-60' : ''}`}
                aria-disabled={createMutation.isPending}
              >
                <FormSwitchField
                  name='is_active'
                  label='Ativo'
                  description='Indicadores inativos não ficam disponíveis na criação de formulários.'
                  validators={{
                    onBlur: surveyFrameworkFieldSchemas.is_active
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setConfirmDiscard(true)}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type='submit' disabled={!canSubmit || isSubmitting}>
                      Criar indicador
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form.Form>
          </form.AppForm>

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
