import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage } from '@/features/platform/lib/api-error';

type ModuleErrorAlertProps = {
  error?: unknown;
  title?: string;
  message?: string;
  fallbackMessage?: string;
};

export function ModuleErrorAlert({
  error,
  title = 'Erro ao carregar módulo',
  message,
  fallbackMessage = 'Ocorreu um erro inesperado ao carregar esta página.'
}: ModuleErrorAlertProps) {
  return (
    <Alert variant='destructive'>
      <Icons.alertCircle className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message ?? getErrorMessage(error, fallbackMessage)}</AlertDescription>
    </Alert>
  );
}
