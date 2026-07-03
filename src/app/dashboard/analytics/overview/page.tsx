import PageContainer from '@/components/layout/page-container';
import { AnalyticsOverview } from '@/features/analytics/components/analytics-overview';

export const metadata = {
  title: 'Dashboard: Dashboard'
};

export default function AnalyticsOverviewPage() {
  return (
    <PageContainer
      pageTitle='Dashboard'
      pageDescription='Resumo consolidado de campanhas, respostas, entregas e indicadores.'
    >
      <AnalyticsOverview />
    </PageContainer>
  );
}
