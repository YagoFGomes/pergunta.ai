import PageContainer from '@/components/layout/page-container';
import { AnalyticsMetricDashboard } from '@/features/analytics/components/analytics-metric-dashboard';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';

export const metadata = {
  title: 'Dashboard: Analytics CES'
};

export default function AnalyticsCesPage() {
  return (
    <PageContainer
      pageTitle='Analytics CES'
      pageDescription='Acompanhamento de Customer Effort Score.'
    >
      <AnalyticsMetricDashboard metricType={MetricTypeEnum.CES} />
    </PageContainer>
  );
}
