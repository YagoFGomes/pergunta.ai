'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
import {
  getContactsListsListQueryKey,
  useContactsListsCreate
} from '@/lib/api/generated/endpoints';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import { EmailListStatusEnum } from '@/lib/api/generated/model/emailListStatusEnum';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';

import { contactListFieldSchemas, type ContactListFormValues } from '../../schemas/contact-list';

const STATUS_OPTIONS = [
  { label: 'Ativa', value: EmailListStatusEnum.ACTIVE },
  { label: 'Inativa', value: EmailListStatusEnum.INACTIVE }
] as const;

const DEFAULT_VALUES: ContactListFormValues = {
  name: '',
  description: '',
  status: EmailListStatusEnum.ACTIVE
};

const CONTACT_LIST_REDIRECT_DELAY_MS = 2000;

function normalizeValues(values: ContactListFormValues): ContactListFormValues {
  return {
    name: values.name.trim(),
    description: (values.description || '').trim(),
    status: values.status
  };
}

export function ContactListCreateDialog() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const createMutation = useContactsListsCreate({
    mutation: {
      onSuccess: async (response) => {
        const createdList = getOrvalResponseData<EmailList>(response);

        await queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() });
        toast.success('Lista criada com sucesso. Redirecionando...');
        form.reset(DEFAULT_VALUES);
        setOpen(false);

        if (createdList?.id) {
          const targetPath = `/dashboard/contacts/lists/${createdList.id}/contacts`;
          void router.prefetch(targetPath);

          redirectTimeoutRef.current = window.setTimeout(() => {
            router.push(targetPath);
          }, CONTACT_LIST_REDIRECT_DELAY_MS);
        }
      },
      onError: () => {
        toast.error('Não foi possível criar a lista.');
      }
    }
  });

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const normalized = normalizeValues(value);

      await createMutation.mutateAsync({
        data: {
          name: normalized.name,
          description: normalized.description,
          status: normalized.status
        }
      });
    }
  });

  const { FormTextField, FormTextareaField, FormSelectField } =
    useFormFields<ContactListFormValues>();

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
      <Button onClick={() => setOpen(true)} size='sm' className='text-xs md:text-sm'>
        <Icons.add className='mr-2 h-4 w-4' />
        Nova lista
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova lista</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova lista de contatos.
            </DialogDescription>
          </DialogHeader>

          <form.AppForm>
            <form.Form className='space-y-4 p-0 md:p-0'>
              <FormTextField
                name='name'
                label='Nome'
                required
                placeholder='Ex: Base clientes ativos'
                maxLength={255}
                validators={{
                  onBlur: contactListFieldSchemas.name
                }}
                disabled={createMutation.isPending}
              />

              <FormTextareaField
                name='description'
                label='Descrição'
                placeholder='Descreva o perfil desta lista'
                maxLength={1000}
                rows={4}
                validators={{
                  onBlur: contactListFieldSchemas.description
                }}
                disabled={createMutation.isPending}
              />

              <FormSelectField
                name='status'
                label='Status'
                required
                options={STATUS_OPTIONS}
                validators={{
                  onBlur: contactListFieldSchemas.status
                }}
                disabled={createMutation.isPending}
              />

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
                      Criar lista
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
