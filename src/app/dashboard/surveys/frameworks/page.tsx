import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Survey Frameworks'
};

export default function SurveyFrameworksPage() {
  return (
    <ModuleShellPage
      pageTitle='Survey Frameworks'
      pageDescription='Modelos NPS, CSAT, CES, CSI e customizacoes.'
      scope='FE-110'
      nextSteps={[
        'Implementar listagem de frameworks disponiveis.',
        'Implementar criacao e edicao de frameworks custom.',
        'Adicionar validacao de escala e regras de calculo por tipo.'
      ]}
      endpointReferences={[
        'GET /api/surveys/frameworks/',
        'POST /api/surveys/frameworks/',
        'PATCH /api/surveys/frameworks/{id}/'
      ]}
    />
  );
}
