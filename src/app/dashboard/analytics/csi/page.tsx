import PageContainer from '@/components/layout/page-container';
import { AnalyticsMetricDashboard } from '@/features/analytics/components/analytics-metric-dashboard';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';

export const metadata = {
  title: 'Dashboard: Analytics CSI'
};

export default function AnalyticsCsiPage() {
  return (
    <PageContainer
      pageTitle='Analytics CSI'
      pageDescription='Acompanhamento de Customer Satisfaction Index.'
    >
      <AnalyticsMetricDashboard metricType={MetricTypeEnum.CSI} />
    </PageContainer>
  );
}
