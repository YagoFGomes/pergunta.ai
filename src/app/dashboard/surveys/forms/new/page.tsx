import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { SurveyFormCreate } from '@/features/surveys/components/survey-form-create';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Novo formulário'
};

export default function NewSurveyFormPage() {
  return (
    <PageContainer
      pageTitle='Novo formulário'
      pageDescription='Crie um rascunho inicial para configurar perguntas e publicar depois.'
      pageHeaderAction={
        <Link
          href='/dashboard/surveys/forms'
          className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
        >
          <Icons.chevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Link>
      }
    >
      <SurveyFormCreate />
    </PageContainer>
  );
}
