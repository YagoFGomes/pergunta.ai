import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { SurveyFormEdit } from '@/features/surveys/components/survey-form-create';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Editar formulario'
};

type SurveyFormPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SurveyFormPage({ params }: SurveyFormPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Editar formulario'
      pageDescription='Atualize framework, titulo e descricao do formulario.'
      pageHeaderAction={
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <Link
            href={`/dashboard/surveys/forms/${id}/questions`}
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
          >
            <Icons.forms className='mr-2 h-4 w-4' />
            Perguntas
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
      <SurveyFormEdit formId={id} />
    </PageContainer>
  );
}
