'use client';

import ModuleError from '@/features/platform/components/module-error';

type DeliveryErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DeliveryError({ error, reset }: DeliveryErrorProps) {
  return (
    <ModuleError
      pageTitle='Logs de Entrega'
      pageDescription='Nao foi possivel carregar os logs de entrega.'
      error={error}
      reset={reset}
    />
  );
}
