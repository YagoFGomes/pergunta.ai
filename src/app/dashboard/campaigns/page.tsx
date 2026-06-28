import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { CampaignsManager } from '@/features/campaigns/components/campaigns-table/campaigns-manager';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Campanhas'
};

export default function CampaignsPage() {
  return (
    <PageContainer
      pageTitle='Campanhas'
      pageDescription='Gestao de campanhas de envio de pesquisa.'
      pageHeaderAction={
        <Link
          href='/dashboard/campaigns/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Icons.add className='mr-2 h-4 w-4' />
          Nova campanha
        </Link>
      }
    >
      <CampaignsManager />
    </PageContainer>
  );
}
