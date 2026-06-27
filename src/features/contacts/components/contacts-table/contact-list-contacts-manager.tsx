'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getContactsListsContactsListQueryKey,
  getContactsListsListQueryKey,
  getContactsListsRetrieveQueryKey,
  useContactsListsContactsCreate,
  useContactsListsContactsDestroy,
  useContactsListsContactsList,
  useContactsListsContactsPartialUpdate,
  useContactsListsRetrieve
} from '@/lib/api/generated/endpoints';
import type { EmailContact } from '@/lib/api/generated/model/emailContact';
import { EmailContactStatusEnum } from '@/lib/api/generated/model/emailContactStatusEnum';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import type { Option } from '@/types/data-table';
import { contactFieldSchemas, type ContactFormValues } from '../../schemas/contact';

import { getContactsByListColumns } from './columns';

type ContactListContactsManagerProps = {
  listId: string;
};

type FormMode = 'create' | 'edit';

const STATUS_OPTIONS: Option[] = [
  { label: 'Ativo', value: EmailContactStatusEnum.ACTIVE },
  { label: 'Descadastrado', value: EmailContactStatusEnum.UNSUBSCRIBED },
  { label: 'Bounced', value: EmailContactStatusEnum.BOUNCED }
];

const DEFAULT_VALUES: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  status: EmailContactStatusEnum.ACTIVE
};

function normalizeValues(values: ContactFormValues): ContactFormValues {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: (values.phone || '').trim(),
    status: values.status
  };
}

export function ContactListContactsManager({ listId }: ContactListContactsManagerProps) {
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedContact, setSelectedContact] = useState<EmailContact | null>(null);
  const [deleteContact, setDeleteContact] = useState<EmailContact | null>(null);

  const listQuery = useContactsListsRetrieve(listId, {
    query: {
      staleTime: 30_000
    }
  });
  const contactsQuery = useContactsListsContactsList(listId);

  const createMutation = useContactsListsContactsCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getContactsListsContactsListQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsRetrieveQueryKey(listId) }),
          queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() })
        ]);
        toast.success('Contato criado com sucesso.');
        setIsFormDialogOpen(false);
      },
      onError: () => {
        toast.error('Nao foi possivel criar o contato.');
      }
    }
  });

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
        toast.error('Nao foi possivel atualizar o contato.');
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
      onError: () => {
        toast.error('Nao foi possivel remover o contato.');
      }
    }
  });

  const hasMutationInFlight =
    createMutation.isPending || updateMutation.isPending || destroyMutation.isPending;

  const listData = getOrvalResponseData<EmailList>(listQuery.data);
  const contacts = getOrvalResponseData<EmailContact[]>(contactsQuery.data) ?? [];

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const normalized = normalizeValues(value);

      if (formMode === 'create') {
        await createMutation.mutateAsync({
          listId,
          data: {
            name: normalized.name,
            email: normalized.email,
            phone: normalized.phone,
            status: normalized.status,
            consent: true
          }
        });
        return;
      }

      if (!selectedContact) {
        return;
      }

      await updateMutation.mutateAsync({
        listId,
        contactId: selectedContact.id,
        data: {
          name: normalized.name,
          email: normalized.email,
          phone: normalized.phone,
          status: normalized.status
        }
      });
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<ContactFormValues>();

  function openCreateDialog() {
    setFormMode('create');
    setSelectedContact(null);
    form.reset(DEFAULT_VALUES);
    setIsFormDialogOpen(true);
  }

  function openEditDialog(contact: EmailContact) {
    setFormMode('edit');
    setSelectedContact(contact);
    form.reset({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      status: contact.status || EmailContactStatusEnum.ACTIVE
    });
    setIsFormDialogOpen(true);
  }

  const columns = useMemo(
    () =>
      getContactsByListColumns({
        onEdit: openEditDialog,
        onDelete: setDeleteContact,
        disableActions: hasMutationInFlight
      }),
    [hasMutationInFlight]
  );

  const { table } = useDataTable({
    data: contacts,
    columns,
    pageCount: 1,
    shallow: false,
    initialState: {
      sorting: []
    }
  });

  if (listQuery.isPending || contactsQuery.isPending) {
    return <ModuleDataTableSkeleton columnCount={4} filterCount={0} />;
  }

  if (listQuery.isError || contactsQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={listQuery.error ?? contactsQuery.error}
          title='Erro ao carregar contatos da lista'
          fallbackMessage='Nao foi possivel carregar os contatos desta lista.'
        />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold'>Contatos da lista</h2>
          <p className='text-muted-foreground text-sm'>
            {listData?.name
              ? `Lista ${listData.name}: contatos disponiveis para campanhas.`
              : 'Contatos vinculados a esta lista.'}
          </p>
        </div>
        <Button onClick={openCreateDialog}>Novo contato</Button>
      </div>

      {contacts.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhum contato cadastrado</AlertTitle>
          <AlertDescription>
            Esta lista ainda nao possui contatos. Crie o primeiro contato para habilitar campanhas.
          </AlertDescription>
        </Alert>
      ) : null}

      <ModuleDataTable
        table={table}
        showToolbar={false}
        toolbarChildren={<Badge variant='outline'>{contacts.length} contatos</Badge>}
      />

      <Dialog
        open={isFormDialogOpen}
        onOpenChange={(open) => {
          if (hasMutationInFlight) {
            return;
          }

          setIsFormDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Novo contato' : 'Editar contato'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create'
                ? 'Preencha os dados para cadastrar um contato nesta lista.'
                : 'Atualize os dados do contato selecionado.'}
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
                disabled={hasMutationInFlight}
              />

              <FormTextField
                name='email'
                label='Email'
                required
                placeholder='contato@empresa.com'
                validators={{
                  onBlur: contactFieldSchemas.email
                }}
                disabled={hasMutationInFlight}
              />

              <FormTextField
                name='phone'
                label='Telefone'
                placeholder='(11) 99999-9999'
                maxLength={30}
                validators={{
                  onBlur: contactFieldSchemas.phone
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
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsFormDialogOpen(false)}
                  disabled={hasMutationInFlight}
                >
                  Cancelar
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type='submit' disabled={!canSubmit || isSubmitting}>
                      {formMode === 'create' ? 'Criar contato' : 'Salvar alteracoes'}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form.Form>
          </form.AppForm>
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
              O contato {deleteContact?.name ? `"${deleteContact.name}"` : ''} sera removido
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
