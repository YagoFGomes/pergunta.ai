import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Survey Questions'
};

type SurveyQuestionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SurveyQuestionsPage({ params }: SurveyQuestionsPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Perguntas do Survey'
      pageDescription={`Formulario ${id}: perguntas, opcoes e ordenacao.`}
      scope='FE-106..FE-109'
      nextSteps={[
        'Listar e criar perguntas do formulario.',
        'Editar, remover e reordenar perguntas por drag-and-drop.',
        'Gerenciar opcoes de perguntas objetivas.'
      ]}
      endpointReferences={[
        'GET /api/surveys/forms/{formId}/questions/',
        'POST /api/surveys/forms/{formId}/questions/',
        'POST /api/surveys/forms/{id}/questions/reorder/',
        'GET /api/surveys/forms/{formId}/questions/{questionId}/options/'
      ]}
    />
  );
}
