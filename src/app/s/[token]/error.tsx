'use client';

import ModuleError from '@/features/platform/components/module-error';

type PublicSurveyErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicSurveyError({ error, reset }: PublicSurveyErrorProps) {
  return (
    <ModuleError
      pageTitle='Formulario Publico'
      pageDescription='Nao foi possivel carregar a pesquisa publica.'
      error={error}
      reset={reset}
    />
  );
}
