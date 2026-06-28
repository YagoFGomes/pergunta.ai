import PageContainer from '@/components/layout/page-container';
import { AnalyticsDetail } from '@/features/analytics/components/analytics-detail';

export const metadata = {
  title: 'Dashboard: Form Analytics'
};

type FormAnalyticsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FormAnalyticsPage({ params }: FormAnalyticsPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Analytics do Formulario'
      pageDescription='Metricas agregadas, indicadores e historico por formulario.'
    >
      <AnalyticsDetail id={id} scope='form' />
    </PageContainer>
  );
}
