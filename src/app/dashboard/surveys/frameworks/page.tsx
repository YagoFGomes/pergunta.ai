import PageContainer from '@/components/layout/page-container';
import { SurveyFrameworksManager } from '@/features/surveys/components/frameworks-table/survey-frameworks-manager';

export const metadata = {
  title: 'Dashboard: Indicadores de Satisfação'
};

export default function SurveyFrameworksPage() {
  return (
    <PageContainer
      pageTitle='Indicadores de Satisfação'
      pageDescription='Indicadores do sistema (NPS, CSI, CXI) e indicadores customizados do seu tenant.'
    >
      <SurveyFrameworksManager />
    </PageContainer>
  );
}
