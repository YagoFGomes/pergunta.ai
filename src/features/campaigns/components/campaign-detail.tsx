'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
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
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { ModuleFormSkeleton } from '@/features/platform/components/module-form-skeleton';
import { notifyError } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  getCampaignsListQueryKey,
  getCampaignsRetrieveQueryKey,
  getCampaignsStepsListQueryKey,
  useCampaignsCancelCreate,
  useCampaignsPauseCreate,
  useCampaignsResumeCreate,
  useCampaignsRetrieve,
  useCampaignsScheduleCreate,
  useCampaignsStepsList
} from '@/lib/api/generated/endpoints';
import type { Campaign } from '@/lib/api/generated/model/campaign';
import type { CampaignStep } from '@/lib/api/generated/model/campaignStep';
import { CampaignStatusEnum } from '@/lib/api/generated/model/campaignStatusEnum';
import { cn } from '@/lib/utils';

import {
  formatModuleDate,
  getCampaignStatusClassName,
  getCampaignStatusLabel,
  getCollectionItems,
  getDeliveryChannelLabel
} from '../lib/campaign-utils';

type CampaignDetailProps = {
  campaignId: string;
};

function StatItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='rounded-md border p-4'>
      <span className='text-muted-foreground block text-sm'>{label}</span>
      <span className='mt-1 block text-2xl font-semibold tabular-nums'>{value}</span>
    </div>
  );
}

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const campaignQuery = useCampaignsRetrieve(campaignId);
  const stepsQuery = useCampaignsStepsList(campaignId);

  const invalidateCampaign = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getCampaignsRetrieveQueryKey(campaignId) }),
      queryClient.invalidateQueries({ queryKey: getCampaignsListQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getCampaignsStepsListQueryKey(campaignId) })
    ]);
  };

  const scheduleMutation = useCampaignsScheduleCreate({
    mutation: {
      onSuccess: async () => {
        await invalidateCampaign();
        toast.success('Campanha agendada com sucesso.');
      },
      onError: (error) => notifyError(error, 'Não foi possível agendar a campanha.')
    }
  });
  const pauseMutation = useCampaignsPauseCreate({
    mutation: {
      onSuccess: async () => {
        await invalidateCampaign();
        toast.success('Campanha pausada.');
      },
      onError: (error) => notifyError(error, 'Não foi possível pausar a campanha.')
    }
  });
  const resumeMutation = useCampaignsResumeCreate({
    mutation: {
      onSuccess: async () => {
        await invalidateCampaign();
        toast.success('Campanha retomada.');
      },
      onError: (error) => notifyError(error, 'Não foi possível retomar a campanha.')
    }
  });
  const cancelMutation = useCampaignsCancelCreate({
    mutation: {
      onSuccess: async () => {
        await invalidateCampaign();
        toast.success('Campanha cancelada.');
        setConfirmCancelOpen(false);
      },
      onError: (error) => notifyError(error, 'Não foi possível cancelar a campanha.')
    }
  });

  const campaign = getOrvalResponseData<Campaign>(campaignQuery.data);
  const steps = getCollectionItems(
    getOrvalResponseData<CampaignStep[] | { results?: CampaignStep[] }>(stepsQuery.data)
  );
  const isMutating =
    scheduleMutation.isPending ||
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    cancelMutation.isPending;

  async function scheduleCampaign() {
    if (!startDate || !startTime || !timezone) {
      toast.error('Informe data, horario e timezone para agendar.');
      return;
    }

    await scheduleMutation.mutateAsync({
      id: campaignId,
      data: {
        start_date: startDate,
        start_time: startTime,
        timezone
      }
    });
  }

  if (campaignQuery.isPending) {
    return <ModuleFormSkeleton fieldCount={6} withTextarea={false} />;
  }

  if (campaignQuery.isError || !campaign) {
    return (
      <ModuleErrorAlert
        error={campaignQuery.error}
        title='Erro ao carregar campanha'
        fallbackMessage='Não foi possível carregar os detalhes da campanha.'
      />
    );
  }

  const canPause = campaign.status === CampaignStatusEnum.RUNNING;
  const canResume = campaign.status === CampaignStatusEnum.PAUSED;
  const canCancel =
    campaign.status !== CampaignStatusEnum.CANCELED &&
    campaign.status !== CampaignStatusEnum.COMPLETED;

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-xl'>{campaign.name}</CardTitle>
            <CardDescription>{campaign.description || 'Sem descricao'}</CardDescription>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline' className={cn(getCampaignStatusClassName(campaign.status))}>
              {getCampaignStatusLabel(campaign.status)}
            </Badge>
            <Badge variant='outline'>{getDeliveryChannelLabel(campaign.delivery_channel)}</Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-3 md:grid-cols-4'>
            <StatItem label='Enviados' value={campaign.recipients_sent} />
            <StatItem label='Respostas' value={campaign.recipients_responded} />
            <StatItem label='Limite' value={campaign.max_recipients ?? '-'} />
            <StatItem label='Steps' value={steps.length} />
          </div>

          <div className='grid gap-3 rounded-md border p-4 text-sm md:grid-cols-3'>
            <div>
              <span className='text-muted-foreground block'>Formulário</span>
              <span className='font-mono text-xs'>{campaign.form}</span>
            </div>
            <div>
              <span className='text-muted-foreground block'>Lista</span>
              <span className='font-mono text-xs'>{campaign.email_list ?? '-'}</span>
            </div>
            <div>
              <span className='text-muted-foreground block'>Início</span>
              <span>
                {formatModuleDate(campaign.start_date)} {campaign.start_time || ''}
              </span>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Link
              href={`/dashboard/campaigns/${campaign.id}/steps`}
              className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
            >
              <Icons.forms className='mr-2 h-4 w-4' />
              Gerenciar steps
            </Link>
            <Link
              href={`/dashboard/analytics/campaigns/${campaign.id}`}
              className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
            >
              <Icons.trendingUp className='mr-2 h-4 w-4' />
              Analytics
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Agendamento</CardTitle>
            <CardDescription>Define data e horario de início da campanha.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label>Data</Label>
              <Input
                type='date'
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={isMutating}
              />
            </div>
            <div className='space-y-2'>
              <Label>Horario</Label>
              <Input
                type='time'
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                disabled={isMutating}
              />
            </div>
            <div className='space-y-2'>
              <Label>Timezone</Label>
              <Input
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                disabled={isMutating}
              />
            </div>
            <div className='md:col-span-3'>
              <Button
                type='button'
                onClick={() => void scheduleCampaign()}
                disabled={isMutating || campaign.status === CampaignStatusEnum.CANCELED}
              >
                {scheduleMutation.isPending ? (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Agendar campanha
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Operação</CardTitle>
            <CardDescription>Pausar, retomar ou cancelar a execucao.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => void pauseMutation.mutateAsync({ id: campaignId })}
              disabled={isMutating || !canPause}
            >
              Pausar
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => void resumeMutation.mutateAsync({ id: campaignId })}
              disabled={isMutating || !canResume}
            >
              Retomar
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={() => setConfirmCancelOpen(true)}
              disabled={isMutating || !canCancel}
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação cancela a campanha atual e deve interromper novas tentativas de envio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isMutating}
              onClick={(event) => {
                event.preventDefault();
                void cancelMutation.mutateAsync({ id: campaignId });
              }}
            >
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
