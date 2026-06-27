import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Form Analytics'
};

type FormAnalyticsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FormAnalyticsPage({ params }: FormAnalyticsPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Analytics do Formulario'
      pageDescription={`Formulario ${id}: metricas agregadas e resultados por pergunta.`}
      scope='FE-607'
      nextSteps={[
        'Carregar metricas consolidadas por formulario.',
        'Exibir resultados por pergunta e tipo de metrica.',
        'Permitir filtros por periodo e campanha quando aplicavel.'
      ]}
      endpointReferences={['GET /api/analytics/forms/{formId}/']}
    />
  );
}
