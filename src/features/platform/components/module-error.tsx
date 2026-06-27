'use client';

import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
  pageDescription = 'Nao foi possivel carregar esta area.'
}: ModuleErrorProps) {
  return (
    <PageContainer pageTitle={pageTitle} pageDescription={pageDescription}>
      <div className='grid gap-4'>
        <Alert variant='destructive'>
          <Icons.alertCircle className='h-4 w-4' />
          <AlertTitle>Erro ao carregar modulo</AlertTitle>
          <AlertDescription>
            {error.message || 'Ocorreu um erro inesperado ao carregar esta pagina.'}
          </AlertDescription>
        </Alert>
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
