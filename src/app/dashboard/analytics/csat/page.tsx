import PageContainer from '@/components/layout/page-container';
import { AnalyticsMetricDashboard } from '@/features/analytics/components/analytics-metric-dashboard';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';

export const metadata = {
  title: 'Dashboard: Analytics CSAT'
};

export default function AnalyticsCsatPage() {
  return (
    <PageContainer
      pageTitle='Analytics CSAT'
      pageDescription='Acompanhamento de Customer Satisfaction Score.'
    >
      <AnalyticsMetricDashboard metricType={MetricTypeEnum.CSAT} />
    </PageContainer>
  );
}
