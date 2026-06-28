'use client';

import ModuleError from '@/features/platform/components/module-error';

type SurveysErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SurveysError({ error, reset }: SurveysErrorProps) {
  return (
    <ModuleError
      pageTitle='Surveys'
      pageDescription='Não foi possível carregar formulários, perguntas ou frameworks.'
      error={error}
      reset={reset}
    />
  );
}
