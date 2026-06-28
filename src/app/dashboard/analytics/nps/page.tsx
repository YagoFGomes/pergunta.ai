import PageContainer from '@/components/layout/page-container';
import { AnalyticsMetricDashboard } from '@/features/analytics/components/analytics-metric-dashboard';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';

export const metadata = {
  title: 'Dashboard: Analytics NPS'
};

export default function AnalyticsNpsPage() {
  return (
    <PageContainer
      pageTitle='Analytics NPS'
      pageDescription='Acompanhamento de Net Promoter Score.'
    >
      <AnalyticsMetricDashboard metricType={MetricTypeEnum.NPS} />
    </PageContainer>
  );
}
