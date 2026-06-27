import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Novo Survey Form'
};

export default function NewSurveyFormPage() {
  return (
    <ModuleShellPage
      pageTitle='Novo Survey Form'
      pageDescription='Cadastro inicial de formulario para campanhas de pesquisa.'
      scope='FE-102'
      nextSteps={[
        'Implementar formulario base (nome, descricao, framework).',
        'Salvar draft e redirecionar para edicao de perguntas.',
        'Adicionar validacoes conforme schema da API.'
      ]}
      endpointReferences={['POST /api/surveys/forms/']}
    />
  );
}
