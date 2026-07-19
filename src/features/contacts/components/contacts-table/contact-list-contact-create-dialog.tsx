'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
  getContactsListsContactsListQueryKey,
  getContactsListsListQueryKey,
  getContactsListsRetrieveQueryKey,
  useContactsListsContactsCreate
} from '@/lib/api/generated/endpoints';
import { EmailContactStatusEnum } from '@/lib/api/generated/model/emailContactStatusEnum';
import { contactFieldSchemas, type ContactFormValues } from '../../schemas/contact';

type ContactListContactCreateDialogProps = {
  listId: string;
};

const DEFAULT_VALUES: ContactFormValues = {
  name: '',
  email: '',
  status: EmailContactStatusEnum.ACTIVE
};

function normalizeValues(values: ContactFormValues): ContactFormValues {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    status: values.status
  };
}

export function ContactListContactCreateDialog({ listId }: ContactListContactCreateDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const createMutation = useContactsListsContactsCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getContactsListsContactsListQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsRetrieveQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() })
        ]);
        toast.success('Contato criado com sucesso.');
        form.reset(DEFAULT_VALUES);
        setOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível criar o contato.');
      }
    }
  });

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const normalized = normalizeValues(value);

      await createMutation.mutateAsync({
        listId,
        data: {
          name: normalized.name,
          email: normalized.email,
          status: EmailContactStatusEnum.ACTIVE,
          consent: true
        }
      });
    }
  });

  const { FormTextField } = useFormFields<ContactFormValues>();

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
        Novo contato
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo contato</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um contato nesta lista.
            </DialogDescription>
          </DialogHeader>

          <form.AppForm>
            <form.Form className='space-y-4 p-0 md:p-0'>
              <FormTextField
                name='name'
                label='Nome'
                required
                placeholder='Ex: Maria Souza'
                maxLength={255}
                validators={{
                  onBlur: contactFieldSchemas.name
                }}
                disabled={createMutation.isPending}
              />

              <FormTextField
                name='email'
                label='E-mail'
                required
                placeholder='contato@empresa.com'
                validators={{
                  onBlur: contactFieldSchemas.email
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
                      Criar contato
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
