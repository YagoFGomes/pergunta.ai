import PageContainer from '@/components/layout/page-container';
import { AnalyticsOverview } from '@/features/analytics/components/analytics-overview';

export const metadata = {
  title: 'Dashboard: Analytics Overview'
};

export default function AnalyticsOverviewPage() {
  return (
    <PageContainer
      pageTitle='Analytics Overview'
      pageDescription='Resumo consolidado de campanhas, respostas, entregas e indicadores.'
    >
      <AnalyticsOverview />
    </PageContainer>
  );
}
