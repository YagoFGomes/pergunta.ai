import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Analytics CSAT'
};

export default function AnalyticsCsatPage() {
  return (
    <ModuleShellPage
      pageTitle='Analytics CSAT'
      pageDescription='Acompanhamento de Customer Satisfaction Score.'
      scope='FE-603'
      nextSteps={[
        'Implementar visao de media e distribuicao de CSAT.',
        'Aplicar filtros por periodo e campanha.',
        'Adicionar comparativo com periodo anterior.'
      ]}
      endpointReferences={['GET /api/analytics/csat/']}
    />
  );
}
