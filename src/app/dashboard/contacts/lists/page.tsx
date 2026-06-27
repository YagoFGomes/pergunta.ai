import PageContainer from '@/components/layout/page-container';
import { ContactListsManager } from '@/features/contacts/components/lists-table/contact-lists-manager';

export const metadata = {
  title: 'Dashboard: Contact Lists'
};

export default function ContactListsPage() {
  return (
    <PageContainer
      pageTitle='Listas de Contatos'
      pageDescription='Gerencie as listas de destinatarios para uso nas campanhas de pesquisa.'
    >
      <ContactListsManager />
    </PageContainer>
  );
}
