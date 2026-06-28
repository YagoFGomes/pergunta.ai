import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { CampaignDetail } from '@/features/campaigns/components/campaign-detail';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Campaign Details'
};

type CampaignDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Detalhes da Campanha'
      pageDescription='Status, funil de execucao e ações operacionais da campanha.'
      pageHeaderAction={
        <Link
          href='/dashboard/campaigns'
          className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
        >
          <Icons.chevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Link>
      }
    >
      <CampaignDetail campaignId={id} />
    </PageContainer>
  );
}
