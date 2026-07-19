import { ContactListContactsPageContent } from '@/features/contacts/components/contacts-table/contact-list-contacts-page';

export const metadata = {
  title: 'Dashboard: Contacts'
};

type ContactListContactsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactListContactsPage({ params }: ContactListContactsPageProps) {
  const { id } = await params;

  return <ContactListContactsPageContent listId={id} />;
}
