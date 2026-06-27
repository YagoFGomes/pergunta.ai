import PageContainer from '@/components/layout/page-container';
import { SurveyFrameworksManager } from '@/features/surveys/components/frameworks-table/survey-frameworks-manager';

export const metadata = {
  title: 'Dashboard: Survey Frameworks'
};

export default function SurveyFrameworksPage() {
  return (
    <PageContainer
      pageTitle='Survey Frameworks'
      pageDescription='Gerencie frameworks base e customizaveis para os formularios de pesquisa.'
    >
      <SurveyFrameworksManager />
    </PageContainer>
  );
}
