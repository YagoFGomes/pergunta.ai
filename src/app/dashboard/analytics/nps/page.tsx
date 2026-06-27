import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Analytics NPS'
};

export default function AnalyticsNpsPage() {
  return (
    <ModuleShellPage
      pageTitle='Analytics NPS'
      pageDescription='Acompanhamento de Net Promoter Score.'
      scope='FE-602'
      nextSteps={[
        'Implementar serie temporal de NPS.',
        'Permitir filtros por campanha e formulario.',
        'Exibir distribuicao promotores/neutros/detratores.'
      ]}
      endpointReferences={['GET /api/analytics/nps/']}
    />
  );
}
