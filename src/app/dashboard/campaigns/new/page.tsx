import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Nova Campanha'
};

export default function NewCampaignPage() {
  return (
    <ModuleShellPage
      pageTitle='Nova Campanha'
      pageDescription='Wizard para criacao de campanha (formulario, lista e template).'
      scope='FE-402'
      nextSteps={[
        'Implementar stepper com 5 etapas.',
        'Persistir dados parciais entre etapas.',
        'Publicar campanha ao finalizar com validacao completa.'
      ]}
      endpointReferences={[
        'POST /api/campaigns/',
        'GET /api/surveys/forms/',
        'GET /api/contacts/lists/',
        'GET /api/email-templates/'
      ]}
    />
  );
}
