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
import { useDataTable } from '@/hooks/use-data-table';
import {
  getContactsListsListQueryKey,
  useContactsListsCreate,
  useContactsListsDestroy,
  useContactsListsList,
  useContactsListsPartialUpdate
} from '@/lib/api/generated/endpoints';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import { Status372Enum } from '@/lib/api/generated/model/status372Enum';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';

import { contactListFieldSchemas, type ContactListFormValues } from '../../schemas/contact-list';
import { getContactListsColumns } from './columns';

type FormMode = 'create' | 'edit';

const STATUS_OPTIONS = [
  { label: 'Ativa', value: Status372Enum.ACTIVE },
  { label: 'Inativa', value: Status372Enum.INACTIVE }
] as const;

const DEFAULT_VALUES: ContactListFormValues = {
  name: '',
  description: '',
  status: Status372Enum.ACTIVE
};

function normalizeValues(values: ContactListFormValues): ContactListFormValues {
  return {
    name: values.name.trim(),
    description: (values.description || '').trim(),
    status: values.status
  };
}

export function ContactListsManager() {
  const queryClient = useQueryClient();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedList, setSelectedList] = useState<EmailList | null>(null);
  const [deleteList, setDeleteList] = useState<EmailList | null>(null);

  const listsQuery = useContactsListsList();
  const lists = getOrvalResponseData<EmailList[]>(listsQuery.data) ?? [];

  const createMutation = useContactsListsCreate({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() });
        toast.success('Lista criada com sucesso.');
        setIsFormDialogOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível criar a lista.');
      }
    }
  });

  const updateMutation = useContactsListsPartialUpdate({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() });
        toast.success('Lista atualizada com sucesso.');
        setIsFormDialogOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível atualizar a lista.');
      }
    }
  });

  const destroyMutation = useContactsListsDestroy({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getContactsListsListQueryKey() });
        toast.success('Lista removida com sucesso.');
        setDeleteList(null);
      },
      onError: () => {
        toast.error('Não foi possível remover a lista.');
      }
    }
  });

  const hasMutationInFlight =
    createMutation.isPending || updateMutation.isPending || destroyMutation.isPending;

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const normalized = normalizeValues(value);

      if (formMode === 'create') {
        await createMutation.mutateAsync({
          data: {
            name: normalized.name,
            description: normalized.description,
            status: normalized.status
          }
        });
        return;
      }

      if (!selectedList) {
        return;
      }

      await updateMutation.mutateAsync({
        id: selectedList.id,
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

  function openCreateDialog() {
    setFormMode('create');
    setSelectedList(null);
    form.reset(DEFAULT_VALUES);
    setIsFormDialogOpen(true);
  }

  function openEditDialog(list: EmailList) {
    setFormMode('edit');
    setSelectedList(list);
    form.reset({
      name: list.name,
      description: list.description || '',
      status: list.status || Status372Enum.ACTIVE
    });
    setIsFormDialogOpen(true);
  }

  const columns = useMemo(
    () =>
      getContactListsColumns({
        onEdit: openEditDialog,
        onDelete: setDeleteList,
        disableActions: hasMutationInFlight
      }),
    [hasMutationInFlight]
  );

  const { table } = useDataTable({
    data: lists,
    columns,
    pageCount: 1,
    shallow: false,
    initialState: {
      sorting: []
    }
  });

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold'>Listas de contatos</h2>
          <p className='text-muted-foreground text-sm'>
            Organize seus destinatários em listas para vincular nas campanhas.
          </p>
        </div>
        <Button onClick={openCreateDialog}>Nova lista</Button>
      </div>

      {listsQuery.isError ? (
        <Alert variant='destructive'>
          <AlertTitle>Erro ao carregar listas</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as listas de contatos. Atualize a página e tente novamente.
          </AlertDescription>
        </Alert>
      ) : null}

      {listsQuery.isSuccess && lists.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhuma lista encontrada</AlertTitle>
          <AlertDescription>
            Crie sua primeira lista para começar a organizar os destinatários das campanhas.
          </AlertDescription>
        </Alert>
      ) : null}

      <ModuleDataTable
        table={table}
        toolbarChildren={<Badge variant='outline'>{lists.length} listas</Badge>}
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
            <DialogTitle>{formMode === 'create' ? 'Nova lista' : 'Editar lista'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create'
                ? 'Preencha os dados para criar uma nova lista de contatos.'
                : 'Atualize os dados da lista selecionada.'}
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
                disabled={hasMutationInFlight}
              />

              <FormTextareaField
                name='description'
                label='Descricao'
                placeholder='Descreva o perfil desta lista'
                maxLength={1000}
                rows={4}
                validators={{
                  onBlur: contactListFieldSchemas.description
                }}
                disabled={hasMutationInFlight}
              />

              <FormSelectField
                name='status'
                label='Status'
                required
                options={STATUS_OPTIONS}
                validators={{
                  onBlur: contactListFieldSchemas.status
                }}
                disabled={hasMutationInFlight}
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
                      {formMode === 'create' ? 'Criar lista' : 'Salvar alterações'}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form.Form>
          </form.AppForm>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteList)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteList(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista de contatos?</AlertDialogTitle>
            <AlertDialogDescription>
              A lista {deleteList?.name ? `"${deleteList.name}"` : ''} será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={hasMutationInFlight}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={hasMutationInFlight || !deleteList}
              onClick={(event) => {
                event.preventDefault();

                if (!deleteList) {
                  return;
                }

                void destroyMutation.mutateAsync({ id: deleteList.id });
              }}
            >
              Excluir lista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
