import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Edit Email Template'
};

type EmailTemplateEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmailTemplateEditPage({ params }: EmailTemplateEditPageProps) {
  const { id } = await params;

  return (
    <ModuleShellPage
      pageTitle='Editar Template de Email'
      pageDescription={`Template ${id}: assunto, corpo, placeholders e preview.`}
      scope='FE-303..FE-305'
      nextSteps={[
        'Carregar template para edicao.',
        'Validar placeholders usados no assunto e corpo.',
        'Exibir preview com payload de exemplo.'
      ]}
      endpointReferences={[
        'GET /api/email-templates/{id}/',
        'PATCH /api/email-templates/{id}/',
        'POST /api/email-templates/{id}/preview/',
        'DELETE /api/email-templates/{id}/'
      ]}
    />
  );
}
