import ModuleShellPage from '@/features/platform/components/module-shell-page';

export const metadata = {
  title: 'Dashboard: Delivery Logs'
};

export default function DeliveryLogsPage() {
  return (
    <ModuleShellPage
      pageTitle='Logs de Entrega'
      pageDescription='Monitoramento de status de envio e falhas de entrega.'
      scope='FE-608'
      nextSteps={[
        'Implementar listagem de logs de envio com filtros.',
        'Adicionar detalhes de erro por registro.',
        'Criar acoes de investigacao para falhas recorrentes.'
      ]}
      endpointReferences={['GET /api/email-delivery/logs/']}
    />
  );
}
