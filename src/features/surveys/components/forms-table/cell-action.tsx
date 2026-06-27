'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import {
  getSurveysFormsListQueryKey,
  getSurveysFormsRetrieveQueryKey,
  useSurveysFormsArchiveCreate,
  useSurveysFormsPublishCreate
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';

type SurveyFormCellActionProps = {
  data: Form;
};

export function SurveyFormCellAction({ data }: SurveyFormCellActionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<'publish' | 'archive' | null>(null);

  const invalidateQueries = async (id?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getSurveysFormsListQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getSurveysFormsRetrieveQueryKey(id ?? data.id) })
    ]);
  };

  const publishMutation = useSurveysFormsPublishCreate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<Form>(response);
        await invalidateQueries(updated?.id);
        notifySuccess('Formulario publicado.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel publicar o formulario.');
      }
    }
  });

  const archiveMutation = useSurveysFormsArchiveCreate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<Form>(response);
        await invalidateQueries(updated?.id);
        notifySuccess('Formulario arquivado.');
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel arquivar o formulario.');
      }
    }
  });

  const isPending = publishMutation.isPending || archiveMutation.isPending;

  const handleConfirm = async () => {
    if (!data.id) return;
    if (confirmAction === 'publish') {
      await publishMutation.mutateAsync({ id: data.id, data: data as never });
    } else if (confirmAction === 'archive') {
      await archiveMutation.mutateAsync({ id: data.id, data: data as never });
    }
    setConfirmAction(null);
  };

  const isDraft = data.status === Status37cEnum.DRAFT;
  const isActive = data.status === Status37cEnum.ACTIVE;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0' disabled={isPending}>
            <span className='sr-only'>Abrir acoes do formulario</span>
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acoes</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/surveys/forms/${data.id}`)}>
            <Icons.edit className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/surveys/forms/${data.id}/questions`)}
          >
            <Icons.forms className='mr-2 h-4 w-4' />
            Perguntas
          </DropdownMenuItem>

          {(isDraft || isActive) && <DropdownMenuSeparator />}

          {isDraft && (
            <DropdownMenuItem onClick={() => setConfirmAction('publish')}>
              <Icons.upload className='mr-2 h-4 w-4' />
              Publicar
            </DropdownMenuItem>
          )}
          {isActive && (
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={() => setConfirmAction('archive')}
            >
              <Icons.lock className='mr-2 h-4 w-4' />
              Arquivar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'publish' ? 'Publicar formulario?' : 'Arquivar formulario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'publish'
                ? 'O formulario sera publicado e ficara disponivel para uso em campanhas. O formulario deve ter ao menos uma pergunta para ser publicado.'
                : 'O formulario sera arquivado e nao podera mais ser usado em novas campanhas. Esta acao nao pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : null}
              {confirmAction === 'publish' ? 'Publicar' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
