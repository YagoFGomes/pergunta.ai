'use client';

import ModuleError from '@/features/platform/components/module-error';

type PublicSurveyErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicSurveyError({ error, reset }: PublicSurveyErrorProps) {
  return (
    <ModuleError
      pageTitle='Formulário Público'
      pageDescription='Não foi possível carregar a pesquisa pública.'
      error={error}
      reset={reset}
    />
  );
}
