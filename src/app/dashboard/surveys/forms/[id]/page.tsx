import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Survey Form'
};

type SurveyFormPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SurveyFormPage({ params }: SurveyFormPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Editar Survey Form'
      pageDescription={`Formulario ${id}: metadados, status e informacoes de uso.`}
      scope='FE-103..FE-105'
      nextSteps={[
        'Implementar edicao de metadados do formulario.',
        'Exibir status atual e informacoes de uso em campanhas.',
        'Conectar acoes de publicar e arquivar formulario.'
      ]}
      endpointReferences={[
        'GET /api/surveys/forms/{id}/',
        'PATCH /api/surveys/forms/{id}/',
        'POST /api/surveys/forms/{id}/publish/',
        'POST /api/surveys/forms/{id}/archive/'
      ]}
    />
  );
}
