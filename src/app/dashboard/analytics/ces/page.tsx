import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Analytics CES'
};

export default function AnalyticsCesPage() {
  return (
    <ModuleShellPage
      pageTitle='Analytics CES'
      pageDescription='Acompanhamento de Customer Effort Score.'
      scope='FE-604'
      nextSteps={[
        'Implementar tendencias de esforco por periodo.',
        'Permitir corte por formulario e campanha.',
        'Destacar areas de friccao com pior nota.'
      ]}
      endpointReferences={['GET /api/analytics/ces/']}
    />
  );
}
