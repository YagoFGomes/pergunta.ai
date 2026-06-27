'use client';

import { useMemo } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { ModuleDataTableSkeleton } from '@/features/platform/components/module-data-table-skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  useContactsListsContactsList,
  useContactsListsRetrieve
} from '@/lib/api/generated/endpoints';
import type { EmailContact } from '@/lib/api/generated/model/emailContact';
import type { EmailList } from '@/lib/api/generated/model/emailList';

import { getContactsByListColumns } from './columns';

type ContactListContactsManagerProps = {
  listId: string;
};

export function ContactListContactsManager({ listId }: ContactListContactsManagerProps) {
  const listQuery = useContactsListsRetrieve(listId, {
    query: {
      staleTime: 30_000
    }
  });
  const contactsQuery = useContactsListsContactsList(listId);

  const listData = getOrvalResponseData<EmailList>(listQuery.data);
  const contacts = getOrvalResponseData<EmailContact[]>(contactsQuery.data) ?? [];

  const columns = useMemo(() => getContactsByListColumns(), []);

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
      <div className='space-y-1'>
        <h2 className='text-xl font-semibold'>Contatos da lista</h2>
        <p className='text-muted-foreground text-sm'>
          {listData?.name
            ? `Lista ${listData.name}: contatos disponiveis para campanhas.`
            : 'Contatos vinculados a esta lista.'}
        </p>
      </div>

      {contacts.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhum contato cadastrado</AlertTitle>
          <AlertDescription>
            Esta lista ainda nao possui contatos. A criacao/edicao de contatos segue em FE-203.
          </AlertDescription>
        </Alert>
      ) : null}

      <ModuleDataTable
        table={table}
        showToolbar={false}
        toolbarChildren={<Badge variant='outline'>{contacts.length} contatos</Badge>}
      />
    </div>
  );
}
