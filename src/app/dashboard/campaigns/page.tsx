import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Campanhas'
};

export default function CampaignsPage() {
  return (
    <ModuleShellPage
      pageTitle='Campanhas'
      pageDescription='Gestao de campanhas de envio de pesquisa.'
      scope='FE-401..FE-409'
      nextSteps={[
        'Implementar listagem com filtros por status.',
        'Criar wizard de campanha em /dashboard/campaigns/new.',
        'Adicionar acoes operacionais (schedule, pause, resume, cancel).'
      ]}
      endpointReferences={[
        'GET /api/campaigns/',
        'POST /api/campaigns/',
        'POST /api/campaigns/{id}/schedule/',
        'POST /api/campaigns/{id}/pause/',
        'POST /api/campaigns/{id}/resume/',
        'POST /api/campaigns/{id}/cancel/'
      ]}
    />
  );
}
