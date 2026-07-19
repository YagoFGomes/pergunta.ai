'use client';

import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' size='sm' className='text-xs md:text-sm'>
            <Link href='/dashboard/contacts/lists'>
              <Icons.chevronLeft className='mr-2 h-4 w-4' />
              Voltar para listas
            </Link>
          </Button>
          <ContactListContactCreateDialog listId={listId} />
        </div>
      }
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
