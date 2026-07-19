'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

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
  useContactsListsContactsCreate,
  useContactsListsCreate,
  useContactsListsPartialUpdate
} from '@/lib/api/generated/endpoints';
import { EmailContactStatusEnum } from '@/lib/api/generated/model/emailContactStatusEnum';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import { EmailListStatusEnum } from '@/lib/api/generated/model/emailListStatusEnum';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';

import { contactListFieldSchemas, type ContactListFormValues } from '../../schemas/contact-list';

const STATUS_OPTIONS = [
  { label: 'Ativa', value: EmailListStatusEnum.ACTIVE },
  { label: 'Inativa', value: EmailListStatusEnum.INACTIVE }
] as const;

type ContactListCreateValues = ContactListFormValues & {
  contactsInput: string;
};

const DEFAULT_VALUES: ContactListCreateValues = {
  name: '',
  description: '',
  status: EmailListStatusEnum.INACTIVE,
  contactsInput: ''
};

const CONTACT_LIST_REDIRECT_DELAY_MS = 2000;

const contactsInputSchema = z.string().trim().max(20_000, 'Máximo de 20000 caracteres.');

type ParsedContactInput = {
  name: string;
  email: string;
};

function parseContactsInput(value: string): ParsedContactInput[] {
  const normalizedLines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return normalizedLines.map((line, index) => {
    const parts = line.split(/[;,\t]+/).map((part) => part.trim());

    if (parts.length < 2) {
      throw new Error(`Linha ${index + 1}: informe nome e e-mail separados por vírgula.`);
    }

    const [name, email] = parts;

    if (name.length < 3) {
      throw new Error(`Linha ${index + 1}: o nome deve ter ao menos 3 caracteres.`);
    }

    if (!z.string().email().safeParse(email).success) {
      throw new Error(`Linha ${index + 1}: informe um e-mail válido.`);
    }

    return {
      name,
      email: email.toLowerCase()
    };
  });
}

function normalizeValues(values: ContactListCreateValues): ContactListCreateValues {
  return {
    name: values.name.trim(),
    description: (values.description || '').trim(),
    status: values.status,
    contactsInput: values.contactsInput.trim()
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

  const createMutation = useContactsListsCreate();
  const createContactMutation = useContactsListsContactsCreate();
  const activateListMutation = useContactsListsPartialUpdate();

  const isPending =
    createMutation.isPending || createContactMutation.isPending || activateListMutation.isPending;

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const normalized = normalizeValues(value);

      const contacts = normalized.contactsInput ? parseContactsInput(normalized.contactsInput) : [];
      const shouldCreateInitialContacts = contacts.length > 0;

      if (normalized.status === EmailListStatusEnum.ACTIVE && !shouldCreateInitialContacts) {
        toast.error('Uma lista ativa precisa ser criada com ao menos 1 contato.');
        return;
      }

      try {
        const createResponse = await createMutation.mutateAsync({
          data: {
            name: normalized.name,
            description: normalized.description,
            status: EmailListStatusEnum.INACTIVE
          }
        });

        const createdList = getOrvalResponseData<EmailList>(createResponse);

        if (!createdList?.id) {
          throw new Error('Lista criada sem identificador retornado.');
        }

        for (const contact of contacts) {
          await createContactMutation.mutateAsync({
            listId: createdList.id,
            data: {
              name: contact.name,
              email: contact.email,
              status: EmailContactStatusEnum.ACTIVE,
              consent: true
            }
          });
        }

        if (normalized.status === EmailListStatusEnum.ACTIVE) {
          await activateListMutation.mutateAsync({
            id: createdList.id,
            data: {
              status: EmailListStatusEnum.ACTIVE
            }
          });
        }

        await queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() });
        toast.success('Lista criada com sucesso. Redirecionando...');
        form.reset(DEFAULT_VALUES);
        setOpen(false);

        const targetPath = `/dashboard/contacts/lists/${createdList.id}/contacts`;
        void router.prefetch(targetPath);

        redirectTimeoutRef.current = window.setTimeout(() => {
          router.push(targetPath);
        }, CONTACT_LIST_REDIRECT_DELAY_MS);
      } catch {
        toast.error('Não foi possível criar a lista.');
      }
    }
  });

  const { FormTextField, FormTextareaField, FormSelectField } =
    useFormFields<ContactListCreateValues>();

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
    createContactMutation.reset();
    activateListMutation.reset();
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
                disabled={isPending}
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
                disabled={isPending}
              />

              <FormSelectField
                name='status'
                label='Status'
                required
                options={STATUS_OPTIONS}
                validators={{
                  onBlur: contactListFieldSchemas.status
                }}
                disabled={isPending}
              />

              <div className='space-y-1'>
                <p className='text-sm font-medium'>Contatos opcionais</p>
                <p className='text-muted-foreground text-xs'>
                  Cole um contato por linha no formato Nome, email. Você também pode usar ponto e
                  vírgula ou tab entre as colunas.
                </p>
              </div>

              <FormTextareaField
                name='contactsInput'
                label='Contatos'
                placeholder={'Maria Souza, maria@empresa.com\nJoão Lima, joao@empresa.com'}
                rows={6}
                validators={{
                  onBlur: contactsInputSchema
                }}
                disabled={isPending}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setConfirmDiscard(true)}
                  disabled={isPending}
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
