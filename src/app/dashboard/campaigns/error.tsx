'use client';

import ModuleError from '@/features/platform/components/module-error';

type CampaignsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CampaignsError({ error, reset }: CampaignsErrorProps) {
  return (
    <ModuleError
      pageTitle='Campanhas'
      pageDescription='Nao foi possivel carregar campanhas ou steps.'
      error={error}
      reset={reset}
    />
  );
}
