import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { CampaignStepsManager } from '@/features/campaigns/components/campaign-steps-manager';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Campaign Steps'
};

type CampaignStepsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignStepsPage({ params }: CampaignStepsPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Steps da Campanha'
      pageDescription='Sequência de envios, templates, delays e condições.'
      pageHeaderAction={
        <Link
          href={`/dashboard/campaigns/${id}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
        >
          <Icons.chevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Link>
      }
    >
      <CampaignStepsManager campaignId={id} />
    </PageContainer>
  );
}
