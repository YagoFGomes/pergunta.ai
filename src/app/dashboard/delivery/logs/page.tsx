import PageContainer from '@/components/layout/page-container';
import { DeliveryLogsManager } from '@/features/delivery/components/delivery-logs-manager';

export const metadata = {
  title: 'Dashboard: Delivery Logs'
};

type DeliveryLogsPageProps = {
  searchParams: Promise<{ campaign?: string }>;
};

export default async function DeliveryLogsPage({ searchParams }: DeliveryLogsPageProps) {
  const { campaign } = await searchParams;

  return (
    <PageContainer
      pageTitle='Logs de Entrega'
      pageDescription='Monitoramento de status de envio, falhas e tentativas de entrega.'
    >
      <DeliveryLogsManager initialCampaign={campaign} />
    </PageContainer>
  );
}
