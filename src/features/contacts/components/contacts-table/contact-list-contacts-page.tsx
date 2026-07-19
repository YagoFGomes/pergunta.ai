'use client';

import PageContainer from '@/components/layout/page-container';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useContactsListsRetrieve } from '@/lib/api/generated/endpoints';
import type { EmailList } from '@/lib/api/generated/model/emailList';

import { ContactListContactCreateDialog } from './contact-list-contact-create-dialog';
import { ContactListContactsManager } from './contact-list-contacts-manager';

type ContactListContactsPageContentProps = {
  listId: string;
};

export function ContactListContactsPageContent({ listId }: ContactListContactsPageContentProps) {
  const listQuery = useContactsListsRetrieve(listId, {
    query: {
      staleTime: 30_000
    }
  });

  const listData = getOrvalResponseData<EmailList>(listQuery.data);
  const pageTitle = listData?.name ?? 'Contatos da Lista';
  const pageDescription = 'Contatos disponíveis para campanhas de pesquisa.';

  return (
    <PageContainer
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      isLoading={listQuery.isPending}
      pageHeaderAction={<ContactListContactCreateDialog listId={listId} />}
    >
      {listQuery.isError ? (
        <ModuleErrorAlert
          error={listQuery.error}
          title='Erro ao carregar lista de contatos'
          fallbackMessage='Não foi possível carregar os dados desta lista.'
        />
      ) : (
        <ContactListContactsManager listId={listId} />
      )}
    </PageContainer>
  );
}
