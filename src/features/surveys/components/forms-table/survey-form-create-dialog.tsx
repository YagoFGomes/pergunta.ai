'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Icons } from '@/components/icons';
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
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import {
  getSurveysFormsListQueryKey,
  useSurveysFormsCreate,
  type SurveysFormsCreateMutationBody
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import {
  surveyFormCreateFieldSchemas,
  surveyFormCreateFormConfig,
  type SurveyFormCreateValues
} from '../../schemas/survey-form';
import { resolveModuleFormDefaults } from '@/features/platform/lib/module-form';

const DIALOG_FORM_ID = 'survey-form-create-dialog';

const DEFAULT_VALUES: SurveyFormCreateValues = resolveModuleFormDefaults(
  surveyFormCreateFormConfig.defaultValues
);

function toCreatePayload(values: SurveyFormCreateValues): SurveysFormsCreateMutationBody {
  const description = values.description.trim();

  return {
    title: values.title.trim(),
    ...(description && { description })
  } as SurveysFormsCreateMutationBody;
}

type SurveyFormCreateDialogProps = {
  trigger?: React.ReactNode;
};

export function SurveyFormCreateDialog({ trigger }: SurveyFormCreateDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const createMutation = useSurveysFormsCreate({
    mutation: {
      onSuccess: async (response) => {
        const createdForm = getOrvalResponseData<Form>(response);

        await queryClient.invalidateQueries({
          queryKey: getSurveysFormsListQueryKey()
        });

        notifySuccess('Formulário criado.', 'Agora configure as perguntas da pesquisa.');
        setOpen(false);
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

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onSubmit: surveyFormCreateFormConfig.schema
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({ data: toCreatePayload(value) });
    }
  });

  const { FormTextField, FormTextareaField } = useFormFields<SurveyFormCreateValues>();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset(DEFAULT_VALUES);
      createMutation.reset();
    }
    setOpen(nextOpen);
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button size='sm' className='text-xs md:text-sm'>
            <Icons.add className='mr-2 h-4 w-4' />
            Novo formulário
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Novo formulário</DialogTitle>
            <DialogDescription>
              Crie o rascunho inicial. As perguntas serão configuradas na próxima tela.
            </DialogDescription>
          </DialogHeader>

          <form.AppForm>
            <form.Form id={DIALOG_FORM_ID} className='space-y-4 py-2'>
              <FormTextField
                name='title'
                label='Título'
                required
                placeholder='Ex.: Pesquisa de satisfação pós-atendimento'
                maxLength={255}
                validators={{
                  onBlur: surveyFormCreateFieldSchemas.title
                }}
              />
              <FormTextareaField
                name='description'
                label='Descrição'
                placeholder='Explique o objetivo deste formulário.'
                maxLength={2000}
                rows={4}
                validators={{
                  onBlur: surveyFormCreateFieldSchemas.description
                }}
              />
            </form.Form>
          </form.AppForm>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type='submit' form={DIALOG_FORM_ID} isLoading={createMutation.isPending}>
              Criar formulário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
