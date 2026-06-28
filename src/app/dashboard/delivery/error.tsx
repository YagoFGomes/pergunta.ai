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
      pageDescription='Não foi possível carregar os logs de entrega.'
      error={error}
      reset={reset}
    />
  );
}
