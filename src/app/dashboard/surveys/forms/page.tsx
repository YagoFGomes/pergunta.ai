import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { SurveyFormCreateDialog } from '@/features/surveys/components/forms-table/survey-form-create-dialog';
import { SurveyFormTemplates } from '@/features/surveys/components/forms-table/survey-form-templates';
import { SurveyFormsTable } from '@/features/surveys/components/forms-table/survey-forms-table';

export const metadata = {
  title: 'Dashboard: Formulários'
};

export default function SurveyFormsPage() {
  return (
    <PageContainer
      pageTitle='Formulários de pesquisa'
      pageDescription='Listagem, status e filtros dos formulários do tenant.'
      pageHeaderAction={<SurveyFormCreateDialog />}
    >
      <SurveyFormTemplates />
      <Separator />
      <SurveyFormsTable />
    </PageContainer>
  );
}
