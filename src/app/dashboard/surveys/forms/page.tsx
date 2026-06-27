import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { SurveyFormsTable } from '@/features/surveys/components/forms-table/survey-forms-table';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Formularios'
};

export default function SurveyFormsPage() {
  return (
    <PageContainer
      pageTitle='Formularios de pesquisa'
      pageDescription='Listagem, status e filtros dos formularios do tenant.'
      pageHeaderAction={
        <Link
          href='/dashboard/surveys/forms/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Icons.add className='mr-2 h-4 w-4' />
          Novo formulario
        </Link>
      }
    >
      <SurveyFormsTable />
    </PageContainer>
  );
}
