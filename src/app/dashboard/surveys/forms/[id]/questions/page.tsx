import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { SurveyFormQuestions } from '@/features/surveys/components/questions-table/survey-form-questions';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Survey Questions'
};

type SurveyQuestionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SurveyQuestionsPage({ params }: SurveyQuestionsPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Perguntas do formulario'
      pageDescription='Liste e crie perguntas associadas a este formulario.'
      pageHeaderAction={
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <Link
            href={`/dashboard/surveys/forms/${id}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
          >
            <Icons.edit className='mr-2 h-4 w-4' />
            Editar formulario
          </Link>
          <Link
            href='/dashboard/surveys/forms'
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
          >
            <Icons.chevronLeft className='mr-2 h-4 w-4' />
            Voltar
          </Link>
        </div>
      }
    >
      <SurveyFormQuestions formId={id} />
    </PageContainer>
  );
}
