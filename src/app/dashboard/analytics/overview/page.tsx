import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Analytics Overview'
};

export default function AnalyticsOverviewPage() {
  return (
    <ModuleShellPage
      pageTitle='Analytics Overview'
      pageDescription='Resumo consolidado de desempenho das pesquisas e campanhas.'
      scope='FE-601'
      nextSteps={[
        'Montar cards principais com filtros por periodo, campanha e formulario.',
        'Conectar graficos com consultas agregadas.',
        'Adicionar estados de loading, vazio e erro padronizados.'
      ]}
      endpointReferences={['GET /api/analytics/overview/']}
    />
  );
}
