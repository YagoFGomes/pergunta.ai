import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { EmailTemplateEdit } from '@/features/email-templates/components/email-template-edit';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Edit Email Template'
};

type EmailTemplateEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmailTemplateEditPage({ params }: EmailTemplateEditPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Editar template de email'
      pageDescription='Atualize conteudo, variaveis e preview do template.'
      pageHeaderAction={
        <Link
          href='/dashboard/email-templates'
          className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
        >
          <Icons.chevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Link>
      }
    >
      <EmailTemplateEdit templateId={id} />
    </PageContainer>
  );
}
