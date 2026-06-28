'use client';

import { keepPreviousData, useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { notifyError } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useEmailDeliveryLogsList } from '@/lib/api/generated/endpoints';
import type { EmailSendLog } from '@/lib/api/generated/model/emailSendLog';
import type { EmailDeliveryLogsListParams } from '@/lib/api/generated/model/emailDeliveryLogsListParams';
import { EmailSendLogStatusEnum } from '@/lib/api/generated/model/emailSendLogStatusEnum';
import { cn } from '@/lib/utils';

import { retryDeliveryLog } from '../api/delivery-logs';
import {
  DELIVERY_LOG_STATUS_OPTIONS,
  formatDeliveryDate,
  getDeliveryLogCount,
  getDeliveryLogItems,
  getDeliveryLogStatusClassName,
  getDeliveryLogStatusLabel,
  getDeliveryLogSummary,
  type MaybePaginatedDeliveryLogs
} from '../schemas/delivery-log';

type DeliveryLogsManagerProps = {
  initialCampaign?: string;
};

function DeliveryLogsSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='grid gap-3 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-28 rounded-lg' />
        ))}
      </div>
      <Skeleton className='h-20 rounded-lg' />
      <Skeleton className='h-96 rounded-lg' />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardDescription>{label}</CardDescription>
        <CardTitle className='text-2xl tabular-nums'>
          {new Intl.NumberFormat('pt-BR').format(value)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function DeliveryLogError({ log }: { log: EmailSendLog }) {
  if (!log.error_message) {
    return <span className='text-muted-foreground'>-</span>;
  }

  return <span className='line-clamp-2 whitespace-normal'>{log.error_message}</span>;
}

export function DeliveryLogsManager({ initialCampaign = '' }: DeliveryLogsManagerProps) {
  const [status, setStatus] = useState('ALL');
  const [campaign, setCampaign] = useState(initialCampaign);

  const apiParams = useMemo<EmailDeliveryLogsListParams>(
    () => ({
      ...(campaign.trim() ? { campaign: campaign.trim() } : {}),
      ...(status !== 'ALL' ? { status } : {})
    }),
    [campaign, status]
  );

  const logsQuery = useEmailDeliveryLogsList(apiParams, {
    query: {
      placeholderData: keepPreviousData
    }
  });

  const retryMutation = useMutation({
    mutationFn: retryDeliveryLog,
    onSuccess: async () => {
      toast.success('Retry enfileirado com sucesso.');
      await logsQuery.refetch();
    },
    onError: (error) => notifyError(error, 'Nao foi possivel reenfileirar o envio.')
  });

  const response = getOrvalResponseData<MaybePaginatedDeliveryLogs>(logsQuery.data);
  const logs = getDeliveryLogItems(response);
  const total = getDeliveryLogCount(response);
  const summary = getDeliveryLogSummary(logs);
  const hasFilters = Boolean(apiParams.campaign || apiParams.status);

  if (logsQuery.isPending) {
    return <DeliveryLogsSkeleton />;
  }

  if (logsQuery.isError) {
    return (
      <div className='space-y-4'>
        <ModuleErrorAlert
          error={logsQuery.error}
          title='Erro ao carregar logs'
          fallbackMessage='Nao foi possivel carregar os logs de entrega.'
        />
        <Button variant='outline' onClick={() => logsQuery.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
        <SummaryCard label='Total' value={summary.total} />
        <SummaryCard label='Pendentes' value={summary.pending} />
        <SummaryCard label='Enviados' value={summary.sent + summary.delivered} />
        <SummaryCard label='Falhas' value={summary.failed} />
        <SummaryCard label='Bounces' value={summary.bounced} />
      </div>

      <Card>
        <CardContent className='flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='grid gap-4 md:grid-cols-[180px_minmax(260px,420px)]'>
            <div className='space-y-2'>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_LOG_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='delivery-campaign-filter'>Campanha</Label>
              <Input
                id='delivery-campaign-filter'
                value={campaign}
                onChange={(event) => setCampaign(event.target.value)}
                placeholder='Filtrar por ID da campanha'
              />
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {logsQuery.isFetching ? (
              <Badge variant='outline' className='gap-1'>
                <Icons.spinner className='size-3 animate-spin' />
                Atualizando
              </Badge>
            ) : null}
            <Badge variant='secondary'>{total} logs</Badge>
            <Button
              type='button'
              variant='outline'
              disabled={!hasFilters}
              onClick={() => {
                setStatus('ALL');
                setCampaign('');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {logs.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhum log encontrado</AlertTitle>
          <AlertDescription>
            {hasFilters
              ? 'Ajuste os filtros para visualizar outros logs.'
              : 'Ainda nao existem registros de envio para este tenant.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Eventos de entrega</CardTitle>
          <CardDescription>Status de envio, falhas e tentativas por destinatario.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead className='text-right'>Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={cn(getDeliveryLogStatusClassName(log.status))}
                      >
                        {getDeliveryLogStatusLabel(log.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='grid gap-1'>
                        <span>{log.email_to}</span>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {log.campaign_recipient}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='max-w-[260px] whitespace-normal'>
                      {log.email_subject}
                    </TableCell>
                    <TableCell className='max-w-[320px]'>
                      <DeliveryLogError log={log} />
                    </TableCell>
                    <TableCell className='tabular-nums'>{log.retry_count}</TableCell>
                    <TableCell>{formatDeliveryDate(log.sent_at ?? log.created_at)}</TableCell>
                    <TableCell className='text-right'>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        disabled={
                          retryMutation.isPending || log.status !== EmailSendLogStatusEnum.FAILED
                        }
                        onClick={() => retryMutation.mutate(log.id)}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
