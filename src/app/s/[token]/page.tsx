import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Pesquisa Publica'
};

type PublicSurveyPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicSurveyPage({ params }: PublicSurveyPageProps) {
  const { token } = await params;

  return (
    <ModuleShellPage
      pageTitle='Formulario Publico'
      pageDescription={`Token de resposta: ${token}`}
      scope='FE-501..FE-504'
      nextSteps={[
        'Carregar formulario publico pelo token.',
        'Renderizar perguntas dinamicas com validacao.',
        'Enviar resposta publica e exibir confirmacao.'
      ]}
      endpointReferences={[
        'GET /api/public/surveys/{token}/',
        'POST /api/public/surveys/{token}/submit/'
      ]}
    />
  );
}
