'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

export default function OverviewError({ error }: { error: Error }) {
  return (
    <Alert variant='destructive'>
      <Icons.alertCircle className='h-4 w-4' />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Não foi possível carregar as estatísticas: {error.message}
      </AlertDescription>
    </Alert>
  );
}
