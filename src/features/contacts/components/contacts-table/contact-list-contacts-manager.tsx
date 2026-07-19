'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
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
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { ModuleDataTableSkeleton } from '@/features/platform/components/module-data-table-skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { useModuleTableParams } from '@/features/platform/hooks/use-module-table-params';
import { MODULE_TABLE_DEFAULT_DEBOUNCE_MS } from '@/features/platform/lib/module-table';
import { notifyError } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getContactsListsContactsListQueryKey,
  getContactsListsListQueryKey,
  getContactsListsRetrieveQueryKey,
  useContactsListsContactsDestroy,
  useContactsListsContactsList,
  useContactsListsContactsPartialUpdate
} from '@/lib/api/generated/endpoints';
import type { EmailContact } from '@/lib/api/generated/model/emailContact';
import { EmailContactStatusEnum } from '@/lib/api/generated/model/emailContactStatusEnum';
import type { ContactsListsContactsListParams } from '@/lib/api/generated/model/contactsListsContactsListParams';
import type { Option } from '@/types/data-table';
import { contactFieldSchemas, type ContactFormValues } from '../../schemas/contact';

import { getContactsByListColumns } from './columns';

type ContactListContactsManagerProps = {
  listId: string;
};

const STATUS_OPTIONS: Option[] = [
  { label: 'Ativo', value: EmailContactStatusEnum.ACTIVE },
  { label: 'Inativo', value: EmailContactStatusEnum.UNSUBSCRIBED }
];

const DEFAULT_VALUES: ContactFormValues = {
  name: '',
  email: '',
  status: EmailContactStatusEnum.ACTIVE
};

const CONTACT_FILTER_KEYS = ['email', 'status'] as const;

function normalizeSingleFilter(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getContactFormValues(contact: EmailContact): ContactFormValues {
  return {
    name: contact.name,
    email: contact.email,
    status: contact.status ?? EmailContactStatusEnum.ACTIVE
  };
}

export function ContactListContactsManager({ listId }: ContactListContactsManagerProps) {
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmailContact | null>(null);
  const [deleteContact, setDeleteContact] = useState<EmailContact | null>(null);

  const updateMutation = useContactsListsContactsPartialUpdate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getContactsListsContactsListQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsRetrieveQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() })
        ]);
        toast.success('Contato atualizado com sucesso.');
        setIsFormDialogOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível atualizar o contato.');
      }
    }
  });

  const destroyMutation = useContactsListsContactsDestroy({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getContactsListsContactsListQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsRetrieveQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() })
        ]);
        toast.success('Contato removido com sucesso.');
        setDeleteContact(null);
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível remover o contato.');
      }
    }
  });

  const hasMutationInFlight = updateMutation.isPending || destroyMutation.isPending;

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      if (!selectedContact) {
        return;
      }

      const normalized = {
        name: value.name.trim(),
        email: value.email.trim().toLowerCase(),
        status: value.status
      };

      await updateMutation.mutateAsync({
        listId,
        contactId: selectedContact.id,
        data: {
          name: normalized.name,
          email: normalized.email,
          status: normalized.status
        }
      });
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<ContactFormValues>();

  useEffect(() => {
    if (!isFormDialogOpen) {
      if (selectedContact) {
        setSelectedContact(null);
        form.reset(DEFAULT_VALUES);
      }

      return;
    }

    if (selectedContact) {
      form.reset(getContactFormValues(selectedContact));
    }
  }, [form, isFormDialogOpen, selectedContact]);

  function forceClose() {
    setConfirmDiscard(false);
    setIsFormDialogOpen(false);
  }

  const openEditDialog = useCallback(
    (contact: EmailContact) => {
      setSelectedContact(contact);
      form.reset(getContactFormValues(contact));
      setIsFormDialogOpen(true);
    },
    [form]
  );

  const columns = useMemo(
    () =>
      getContactsByListColumns({
        onEdit: openEditDialog,
        onDelete: setDeleteContact,
        disableActions: hasMutationInFlight
      }),
    [hasMutationInFlight, openEditDialog]
  );

  const { params } = useModuleTableParams<EmailContact, (typeof CONTACT_FILTER_KEYS)[number]>({
    columns,
    filterKeys: CONTACT_FILTER_KEYS
  });

  const apiParams = useMemo<ContactsListsContactsListParams>(
    () => ({
      ...(normalizeSingleFilter(params.email) && {
        email: normalizeSingleFilter(params.email)
      }),
      ...(normalizeSingleFilter(params.status) && {
        status: normalizeSingleFilter(params.status)
      })
    }),
    [params.email, params.status]
  );

  const contactsQuery = useContactsListsContactsList(listId, apiParams, {
    query: {
      placeholderData: keepPreviousData
    }
  });

  const contacts = getOrvalResponseData<EmailContact[]>(contactsQuery.data) ?? [];
  const hasFilters = Boolean(params.email || params.status);

  const { table } = useDataTable({
    data: contacts,
    columns,
    pageCount: 1,
    shallow: false,
    debounceMs: MODULE_TABLE_DEFAULT_DEBOUNCE_MS,
    initialState: {
      sorting: [],
      columnPinning: { right: ['actions'] }
    }
  });
  const dialogFormKey = selectedContact ? `edit-${selectedContact.id}` : 'edit';

  if (contactsQuery.isPending) {
    return <ModuleDataTableSkeleton columnCount={4} filterCount={0} />;
  }

  if (contactsQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={contactsQuery.error}
          title='Erro ao carregar contatos da lista'
          fallbackMessage='Não foi possível carregar os contatos desta lista.'
        />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <ModuleDataTable
        table={table}
        toolbarChildren={
          <>
            {contactsQuery.isFetching ? (
              <Badge variant='outline' className='gap-1'>
                <Icons.spinner className='h-3 w-3 animate-spin' />
                Atualizando
              </Badge>
            ) : null}
            <Badge variant='outline'>{contacts.length} contatos</Badge>
          </>
        }
      />

      <Dialog
        open={isFormDialogOpen}
        onOpenChange={(nextOpen) => {
          if (hasMutationInFlight) return;
          if (!nextOpen) {
            setConfirmDiscard(true);
            return;
          }
          setIsFormDialogOpen(nextOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar contato</DialogTitle>
            <DialogDescription>Atualize os dados do contato selecionado.</DialogDescription>
          </DialogHeader>

          <form.AppForm key={dialogFormKey}>
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
                disabled={hasMutationInFlight}
              />

              <FormTextField
                name='email'
                label='E-mail'
                required
                placeholder='contato@empresa.com'
                validators={{
                  onBlur: contactFieldSchemas.email
                }}
                disabled={hasMutationInFlight}
              />

              <FormSelectField
                name='status'
                label='Status'
                required
                options={STATUS_OPTIONS}
                validators={{
                  onBlur: contactFieldSchemas.status
                }}
                disabled={hasMutationInFlight}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setConfirmDiscard(true)}
                  disabled={hasMutationInFlight}
                >
                  Cancelar
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type='submit' disabled={!canSubmit || isSubmitting}>
                      Salvar alterações
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

      <AlertDialog
        open={Boolean(deleteContact)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteContact(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
            <AlertDialogDescription>
              O contato {deleteContact?.name ? `"${deleteContact.name}"` : ''} será removido
              permanentemente desta lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={hasMutationInFlight}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={hasMutationInFlight || !deleteContact}
              onClick={(event) => {
                event.preventDefault();

                if (!deleteContact) {
                  return;
                }

                void destroyMutation.mutateAsync({
                  listId,
                  contactId: deleteContact.id
                });
              }}
            >
              Excluir contato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
