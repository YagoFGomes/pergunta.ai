import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Email Templates'
};

export default function EmailTemplatesPage() {
  return (
    <ModuleShellPage
      pageTitle='Templates de Email'
      pageDescription='Templates de envio com placeholders dinamicos e preview.'
      scope='FE-301..FE-305'
      nextSteps={[
        'Implementar listagem e CRUD de templates.',
        'Implementar editor com validacao de placeholders.',
        'Conectar preview de template com payload de exemplo.'
      ]}
      endpointReferences={[
        'GET /api/email-templates/',
        'POST /api/email-templates/',
        'PATCH /api/email-templates/{id}/',
        'POST /api/email-templates/{id}/preview/'
      ]}
    />
  );
}
