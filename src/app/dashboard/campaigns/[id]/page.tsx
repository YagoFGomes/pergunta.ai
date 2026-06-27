import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Campaign Details'
};

type CampaignDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Detalhes da Campanha'
      pageDescription={`Campanha ${id}: funil de execucao, timeline e acoes operacionais.`}
      scope='FE-403, FE-406..FE-409'
      nextSteps={[
        'Exibir detalhes, status e funil de execucao da campanha.',
        'Adicionar timeline de steps e eventos principais.',
        'Conectar acoes de agendar, pausar, retomar e cancelar.'
      ]}
      endpointReferences={[
        'GET /api/campaigns/{id}/',
        'PATCH /api/campaigns/{id}/',
        'POST /api/campaigns/{id}/schedule/',
        'POST /api/campaigns/{id}/pause/',
        'POST /api/campaigns/{id}/resume/',
        'POST /api/campaigns/{id}/cancel/'
      ]}
    />
  );
}
