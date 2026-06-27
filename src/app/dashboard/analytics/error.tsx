'use client';

import ModuleError from '@/features/platform/components/module-error';

type AnalyticsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AnalyticsError({ error, reset }: AnalyticsErrorProps) {
  return (
    <ModuleError
      pageTitle='Analytics'
      pageDescription='Nao foi possivel carregar dashboards ou metricas.'
      error={error}
      reset={reset}
    />
  );
}
