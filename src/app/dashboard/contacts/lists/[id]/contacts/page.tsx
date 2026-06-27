import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Contacts'
};

type ContactListContactsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactListContactsPage({ params }: ContactListContactsPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Contatos da Lista'
      pageDescription={`Lista ${id}: contatos, busca, filtros e paginacao.`}
      scope='FE-202..FE-204'
      nextSteps={[
        'Implementar tabela de contatos por lista.',
        'Adicionar busca, filtros e paginacao sincronizados com URL.',
        'Conectar criacao, edicao e remocao de contatos.'
      ]}
      endpointReferences={[
        'GET /api/contacts/lists/{listId}/contacts/',
        'POST /api/contacts/lists/{listId}/contacts/',
        'PATCH /api/contacts/lists/{listId}/contacts/{contactId}/',
        'DELETE /api/contacts/lists/{listId}/contacts/{contactId}/'
      ]}
    />
  );
}
