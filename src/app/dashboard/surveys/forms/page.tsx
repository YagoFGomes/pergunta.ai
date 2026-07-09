import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SurveyFormTemplates } from '@/features/surveys/components/forms-table/survey-form-templates';
import { SurveyFormsTable } from '@/features/surveys/components/forms-table/survey-forms-table';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Formulários'
};

export default function SurveyFormsPage() {
  return (
    <PageContainer
      pageTitle='Formulários de pesquisa'
      pageDescription='Listagem, status e filtros dos formulários do tenant.'
      pageHeaderAction={
        <Link
          href='/dashboard/surveys/forms/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Icons.add className='mr-2 h-4 w-4' />
          Novo formulário
        </Link>
      }
    >
      <SurveyFormTemplates />
      <Separator />
      <SurveyFormsTable />
    </PageContainer>
  );
}
