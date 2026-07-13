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
import { SurveyFormEditDialog } from './survey-form-edit-dialog';

type SurveyFormCellActionProps = {
  data: Form;
};

export function SurveyFormCellAction({ data }: SurveyFormCellActionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<'publish' | 'archive' | null>(null);
  const [editOpen, setEditOpen] = useState(false);

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
        notifySuccess('Formulário publicado.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível publicar o formulário.');
      }
    }
  });

  const archiveMutation = useSurveysFormsArchiveCreate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<Form>(response);
        await invalidateQueries(updated?.id);
        notifySuccess('Formulário arquivado.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível arquivar o formulário.');
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
      <SurveyFormEditDialog form={data} open={editOpen} onOpenChange={setEditOpen} />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0' disabled={isPending}>
            <span className='sr-only'>Abrir ações do formulário</span>
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
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
              {confirmAction === 'publish' ? 'Publicar formulário?' : 'Arquivar formulário?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'publish'
                ? 'O formulário será publicado e ficara disponível para uso em campanhas. O formulário deve ter ao menos uma pergunta para ser publicado.'
                : 'O formulário será arquivado e não podera mais ser usado em novas campanhas. Esta ação não pode ser desfeita.'}
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
