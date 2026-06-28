import { EmailTemplateEdit } from '@/features/email-templates/components/email-template-edit';

export const metadata = {
  title: 'Dashboard: Edit Email Template'
};

type EmailTemplateEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmailTemplateEditPage({ params }: EmailTemplateEditPageProps) {
  const { id } = await params;

  return <EmailTemplateEdit templateId={id} />;
}
