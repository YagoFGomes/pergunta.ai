import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Campaign Steps'
};

type CampaignStepsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignStepsPage({ params }: CampaignStepsPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Steps da Campanha'
      pageDescription={`Campanha ${id}: sequencia de envios e regras de step.`}
      scope='FE-404..FE-405'
      nextSteps={[
        'Listar steps vinculados a campanha.',
        'Criar e editar regras de envio por step.',
        'Remover steps com confirmacao e feedback visual.'
      ]}
      endpointReferences={[
        'GET /api/campaigns/{campaignId}/steps/',
        'POST /api/campaigns/{campaignId}/steps/',
        'PATCH /api/campaigns/{campaignId}/steps/{stepId}/',
        'DELETE /api/campaigns/{campaignId}/steps/{stepId}/'
      ]}
    />
  );
}
