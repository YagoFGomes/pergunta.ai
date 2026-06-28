'use client';

import ModuleError from '@/features/platform/components/module-error';

type EmailTemplatesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function EmailTemplatesError({ error, reset }: EmailTemplatesErrorProps) {
  return (
    <ModuleError
      pageTitle='Templates de Email'
      pageDescription='Não foi possível carregar templates de email.'
      error={error}
      reset={reset}
    />
  );
}
