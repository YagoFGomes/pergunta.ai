import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Contact Lists'
};

export default function ContactListsPage() {
  return (
    <ModuleShellPage
      pageTitle='Listas de Contatos'
      pageDescription='Base de destinatarios para campanhas de pesquisa.'
      scope='FE-201..FE-204'
      nextSteps={[
        'Implementar CRUD de listas com contagem de contatos.',
        'Implementar tela de contatos por lista com busca e filtros.',
        'Preparar contrato para importacao em lote (fase posterior).'
      ]}
      endpointReferences={[
        'GET /api/contacts/lists/',
        'POST /api/contacts/lists/',
        'GET /api/contacts/lists/{listId}/contacts/',
        'POST /api/contacts/lists/{listId}/contacts/'
      ]}
    />
  );
}
