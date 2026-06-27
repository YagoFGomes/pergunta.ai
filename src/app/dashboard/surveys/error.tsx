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
      pageDescription='Nao foi possivel carregar formularios, perguntas ou frameworks.'
      error={error}
      reset={reset}
    />
  );
}
