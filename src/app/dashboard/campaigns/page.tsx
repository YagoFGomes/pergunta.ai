import PageContainer from '@/components/layout/page-container';
import { CampaignCreateHeaderAction } from '@/features/campaigns/components/campaigns-table/campaign-create-header-action';
import { CampaignsManager } from '@/features/campaigns/components/campaigns-table/campaigns-manager';

export const metadata = {
  title: 'Dashboard: Campanhas'
};

export default function CampaignsPage() {
  return (
    <PageContainer
      pageTitle='Campanhas'
      pageDescription='Gestao de campanhas de envio de pesquisa.'
      pageHeaderAction={<CampaignCreateHeaderAction />}
    >
      <CampaignsManager />
    </PageContainer>
  );
}
