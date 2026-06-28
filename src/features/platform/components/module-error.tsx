'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';

type ModuleErrorProps = {
  error: Error & { digest?: string };
  reset?: () => void;
  pageTitle?: string;
  pageDescription?: string;
};

export default function ModuleError({
  error,
  reset,
  pageTitle = 'Modulo',
  pageDescription = 'Não foi possível carregar esta área.'
}: ModuleErrorProps) {
  return (
    <PageContainer pageTitle={pageTitle} pageDescription={pageDescription}>
      <div className='grid gap-4'>
        <ModuleErrorAlert error={error} />
        {reset ? (
          <div>
            <Button variant='outline' onClick={reset}>
              Tentar novamente
            </Button>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
