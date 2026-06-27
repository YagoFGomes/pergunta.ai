import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Survey Forms'
};

export default function SurveyFormsPage() {
  return (
    <ModuleShellPage
      pageTitle='Survey Forms'
      pageDescription='Criacao e manutencao de formularios de pesquisa.'
      scope='FE-101..FE-109'
      nextSteps={[
        'Implementar tabela de formularios (status, data, framework).',
        'Criar fluxo de formulario novo em /dashboard/surveys/forms/new.',
        'Conectar CRUD de perguntas e reorder por drag-and-drop.'
      ]}
      endpointReferences={[
        'GET /api/surveys/forms/',
        'POST /api/surveys/forms/',
        'POST /api/surveys/forms/{id}/publish/',
        'POST /api/surveys/forms/{id}/archive/',
        'POST /api/surveys/forms/{id}/questions/reorder/'
      ]}
    />
  );
}
