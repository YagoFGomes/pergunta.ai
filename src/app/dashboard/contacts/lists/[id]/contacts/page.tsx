import PageContainer from '@/components/layout/page-container';
import { ContactListContactsManager } from '@/features/contacts/components/contacts-table/contact-list-contacts-manager';

export const metadata = {
  title: 'Dashboard: Contacts'
};

type ContactListContactsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactListContactsPage({ params }: ContactListContactsPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Contatos da Lista'
      pageDescription={`Lista ${id}: contatos disponiveis para campanhas de pesquisa.`}
    >
      <ContactListContactsManager listId={id} />
    </PageContainer>
  );
}
