import Link from 'next/link';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { CampaignCreateWizard } from '@/features/campaigns/components/campaign-create-wizard';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Nova Campanha'
};

export default function NewCampaignPage() {
  return (
    <PageContainer
      pageTitle='Nova Campanha'
      pageDescription='Wizard para criacao de campanha com formulario, lista, template e agendamento.'
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
      <CampaignCreateWizard />
    </PageContainer>
  );
}
