'use client';

import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsArchiveCreate,
  useSurveysFormsPartialUpdate,
  useSurveysFormsPublishCreate,
  type SurveysFormsPartialUpdateMutationBody
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import {
  surveyFormCreateFieldSchemas,
  surveyFormCreateFormConfig,
  type SurveyFormCreateValues
} from '../../schemas/survey-form';

const EDIT_DIALOG_FORM_ID = 'survey-form-edit-dialog';

function toUpdatePayload(values: SurveyFormCreateValues): SurveysFormsPartialUpdateMutationBody {
  return {
    title: values.title.trim(),
    description: values.description.trim()
  };
}

function getDefaultValues(form: Form): SurveyFormCreateValues {
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

type SurveyFormEditDialogProps = {
  form: Form;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SurveyFormEditDialog({ form, open, onOpenChange }: SurveyFormEditDialogProps) {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = React.useState<'publish' | 'archive' | null>(null);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  const invalidateQueries = React.useCallback(
    async (updatedId?: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getSurveysFormsListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: getSurveysFormsRetrieveQueryKey(updatedId ?? form.id)
        })
      ]);
    },
    [queryClient, form.id]
  );

  const updateMutation = useSurveysFormsPartialUpdate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<Form>(response);
        await invalidateQueries(updated?.id);
        notifySuccess('Formulário atualizado.');
        onOpenChange(false);
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível atualizar o formulário.');
      }
    }
  });

  const publishMutation = useSurveysFormsPublishCreate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<Form>(response);
        await invalidateQueries(updated?.id);
        setConfirmAction(null);
        onOpenChange(false);
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
        await invalidateQueries(updated?.id);
        notifySuccess('Formulário arquivado.');
        setConfirmAction(null);
        onOpenChange(false);
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível arquivar o formulário.');
      }
    }
  });

  const isPending =
    updateMutation.isPending || publishMutation.isPending || archiveMutation.isPending;

  const tanstackForm = useAppForm({
    defaultValues: getDefaultValues(form),
    validators: {
      onSubmit: surveyFormCreateFormConfig.schema
    },
    onSubmit: async ({ value }) => {
      if (!form.id) return;
      await updateMutation.mutateAsync({ id: form.id, data: toUpdatePayload(value) });
    }
  });

  const { FormTextField, FormTextareaField } = useFormFields<SurveyFormCreateValues>();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmDiscard(true);
      return; // intercept — don't actually close
    }
    onOpenChange(true);
  }

  function forceClose() {
    tanstackForm.reset(getDefaultValues(form));
    updateMutation.reset();
    setConfirmAction(null);
    setConfirmDiscard(false);
    onOpenChange(false);
  }

  const handleConfirmAction = async () => {
    if (!form.id) return;
    if (confirmAction === 'publish') {
      await publishMutation.mutateAsync({ id: form.id, data: form as never });
    } else if (confirmAction === 'archive') {
      await archiveMutation.mutateAsync({ id: form.id, data: form as never });
    }
  };

  const isDraft = form.status === Status37cEnum.DRAFT;
  const isActive = form.status === Status37cEnum.ACTIVE;
  const isArchivable = isDraft || isActive;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Editar formulário</DialogTitle>
            <DialogDescription>Atualize o título e a descrição do formulário.</DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4 items-start'>
            <Alert className='flex-1'>
              <Icons.info className='h-4 w-4' />
              <AlertTitle>Status: {form.status ?? 'Sem status'}</AlertTitle>
              <AlertDescription className='text-xs'>
                Criado em {formatDateTime(form.created_at)}. Atualizado em{' '}
                {formatDateTime(form.updated_at)}.
              </AlertDescription>
            </Alert>
            {(isDraft || isArchivable) && (
              <div className='flex shrink-0 gap-2'>
                {isDraft && (
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
                {isArchivable && (
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
            )}
          </div>

          <tanstackForm.AppForm>
            <tanstackForm.Form id={EDIT_DIALOG_FORM_ID} className='space-y-4'>
              <FormTextField
                name='title'
                label='Título'
                required
                placeholder='Ex.: Pesquisa de satisfação pós-atendimento'
                maxLength={255}
                validators={{ onBlur: surveyFormCreateFieldSchemas.title }}
              />
              <FormTextareaField
                name='description'
                label='Descrição'
                placeholder='Explique o objetivo deste formulário.'
                maxLength={2000}
                rows={4}
                validators={{ onBlur: surveyFormCreateFieldSchemas.description }}
              />
            </tanstackForm.Form>
          </tanstackForm.AppForm>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setConfirmDiscard(true)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              form={EDIT_DIALOG_FORM_ID}
              isLoading={updateMutation.isPending}
              disabled={isPending}
            >
              Salvar alterações
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

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(nextOpen) => !nextOpen && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'publish' ? 'Publicar formulário?' : 'Arquivar formulário?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'publish'
                ? 'O formulário será publicado e ficará disponível para uso em campanhas. O formulário deve ter ao menos uma pergunta para ser publicado.'
                : 'O formulário será arquivado e não poderá mais ser usado em novas campanhas. Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isPending}>
              {isPending ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : null}
              {confirmAction === 'publish' ? 'Publicar' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
