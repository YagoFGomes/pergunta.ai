import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Analytics CSI'
};

export default function AnalyticsCsiPage() {
  return (
    <ModuleShellPage
      pageTitle='Analytics CSI'
      pageDescription='Acompanhamento de Customer Satisfaction Index.'
      scope='FE-605'
      nextSteps={[
        'Implementar score consolidado por dimensao.',
        'Permitir comparacao entre campanhas.',
        'Adicionar cortes por periodo e formulario.'
      ]}
      endpointReferences={['GET /api/analytics/csi/']}
    />
  );
}
