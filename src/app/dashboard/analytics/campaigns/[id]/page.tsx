import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Campaign Analytics'
};

type CampaignAnalyticsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignAnalyticsPage({ params }: CampaignAnalyticsPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Analytics da Campanha'
      pageDescription={`Campanha ${id}: respostas, metricas e desempenho de envio.`}
      scope='FE-606'
      nextSteps={[
        'Carregar metricas consolidadas por campanha.',
        'Exibir distribuicao de respostas e indicadores de satisfacao.',
        'Relacionar resultados com entregas e falhas de email.'
      ]}
      endpointReferences={['GET /api/analytics/campaigns/{campaignId}/']}
    />
  );
}
