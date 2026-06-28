import PageContainer from '@/components/layout/page-container';
import { AnalyticsDetail } from '@/features/analytics/components/analytics-detail';

export const metadata = {
  title: 'Dashboard: Campaign Analytics'
};

type CampaignAnalyticsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignAnalyticsPage({ params }: CampaignAnalyticsPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Analytics da Campanha'
      pageDescription='Respostas, indicadores e histórico de métricas por campanha.'
    >
      <AnalyticsDetail id={id} scope='campaign' />
    </PageContainer>
  );
}
