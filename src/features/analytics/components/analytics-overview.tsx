'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useCampaignsList, useEmailDeliveryLogsList } from '@/lib/api/generated/endpoints';
import type { Campaign } from '@/lib/api/generated/model/campaign';
import type { EmailSendLog } from '@/lib/api/generated/model/emailSendLog';
import { cn } from '@/lib/utils';

import { analyticsOverviewQueryKey, retrieveAnalyticsOverview } from '../api/analytics-overview';
import {
  ANALYTICS_METRIC_CARDS,
  formatAnalyticsNumber,
  formatMetricPeriod,
  formatMetricValue,
  formatRate,
  getAnsweredMetricsCount,
  getCampaignResponseSummary,
  getCollectionCount,
  getCollectionItems,
  getDeliverySummary,
  getMetricTone,
  type AnalyticsOverview as AnalyticsOverviewData,
  type MaybePaginated
} from '../schemas/analytics-overview';

function OverviewSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className='space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-8 w-20' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-3 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid gap-4 lg:grid-cols-[1fr_0.6fr]'>
        <Skeleton className='h-80 rounded-lg' />
        <Skeleton className='h-80 rounded-lg' />
      </div>
    </div>
  );
}

function StatCard({
  description,
  icon: Icon,
  label,
  value
}: {
  description: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <div className='space-y-1'>
          <CardDescription>{label}</CardDescription>
          <CardTitle className='text-2xl tabular-nums'>{value}</CardTitle>
        </div>
        <div className='bg-muted flex size-9 items-center justify-center rounded-md'>
          <Icon className='text-muted-foreground size-5' />
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-xs'>{description}</p>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  overview,
  metric
}: {
  overview?: AnalyticsOverviewData;
  metric: (typeof ANALYTICS_METRIC_CARDS)[number];
}) {
  const latest = overview?.latest[metric.type];

  return (
    <Card>
      <CardHeader className='space-y-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-1'>
            <CardTitle className='text-base'>{metric.title}</CardTitle>
            <CardDescription>{metric.description}</CardDescription>
          </div>
          <Badge variant='outline'>{latest ? formatMetricPeriod(latest) : 'Sem dados'}</Badge>
        </div>
        <div className={cn('text-3xl font-semibold tabular-nums', getMetricTone(latest))}>
          {latest ? formatMetricValue(latest) : metric.emptyLabel}
        </div>
      </CardHeader>
      <CardContent className='flex items-center justify-between gap-3 border-t pt-4'>
        <span className='text-muted-foreground text-xs'>
          {latest?.campaign_id
            ? 'Campanha vinculada'
            : latest
              ? 'Formulário consolidado'
              : 'Aguardando calculo'}
        </span>
        <Link
          href={metric.href}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 px-2 text-xs')}
        >
          Ver série
          <Icons.arrowRight className='ml-1 size-3.5' />
        </Link>
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverview() {
  const [period, setPeriod] = useState('');

  const overviewParams = useMemo(() => (period ? { period } : undefined), [period]);

  const overviewQuery = useQuery({
    queryKey: analyticsOverviewQueryKey(overviewParams),
    queryFn: () => retrieveAnalyticsOverview(overviewParams),
    placeholderData: keepPreviousData
  });

  const campaignsQuery = useCampaignsList(undefined, {
    query: {
      placeholderData: keepPreviousData
    }
  });
  const deliveryLogsQuery = useEmailDeliveryLogsList(undefined, {
    query: {
      placeholderData: keepPreviousData
    }
  });

  const overview = overviewQuery.data;
  const campaignResponse = getOrvalResponseData<MaybePaginated<Campaign>>(campaignsQuery.data);
  const deliveryResponse = getOrvalResponseData<MaybePaginated<EmailSendLog>>(
    deliveryLogsQuery.data
  );
  const campaigns = getCollectionItems(campaignResponse);
  const deliveryLogs = getCollectionItems(deliveryResponse);
  const campaignCount =
    overview?.operational_campaigns_count ?? getCollectionCount(campaignResponse);
  const responseSummary = getCampaignResponseSummary(campaigns, overview);
  const deliverySummary = getDeliverySummary(deliveryLogs, overview);
  const metricCoverage = getAnsweredMetricsCount(overview);
  const metricCoveragePercent = (metricCoverage / ANALYTICS_METRIC_CARDS.length) * 100;

  const isLoading =
    overviewQuery.isPending || campaignsQuery.isPending || deliveryLogsQuery.isPending;
  const hasError = overviewQuery.isError || campaignsQuery.isError || deliveryLogsQuery.isError;
  const isEmpty =
    !isLoading &&
    !hasError &&
    (overview?.metrics_count ?? 0) === 0 &&
    campaignCount === 0 &&
    responseSummary.responded === 0 &&
    deliverySummary.total === 0;

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (hasError) {
    return (
      <div className='space-y-4'>
        {overviewQuery.isError ? (
          <ModuleErrorAlert
            error={overviewQuery.error}
            title='Erro ao carregar analytics'
            fallbackMessage='Não foi possível carregar o resumo de analytics.'
          />
        ) : null}
        {campaignsQuery.isError ? (
          <ModuleErrorAlert
            error={campaignsQuery.error}
            title='Erro ao carregar campanhas'
            fallbackMessage='Não foi possível carregar o resumo de campanhas.'
          />
        ) : null}
        {deliveryLogsQuery.isError ? (
          <ModuleErrorAlert
            error={deliveryLogsQuery.error}
            title='Erro ao carregar entregas'
            fallbackMessage='Não foi possível carregar o resumo de entregas.'
          />
        ) : null}
        <Button
          variant='outline'
          onClick={() => {
            void overviewQuery.refetch();
            void campaignsQuery.refetch();
            void deliveryLogsQuery.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className='flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center'>
        <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
          <Icons.trendingUp className='text-muted-foreground size-6' />
        </div>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>Sem dados de analytics</h2>
          <p className='text-muted-foreground max-w-md text-sm'>
            Crie uma campanha, envie respostas e calcule métricas para acompanhar o desempenho.
          </p>
        </div>
        <div className='flex flex-wrap justify-center gap-2'>
          <Link href='/dashboard/campaigns' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
            <Icons.add className='mr-2 h-4 w-4' />
            Nova campanha
          </Link>
          <Link
            href='/dashboard/surveys/forms'
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
          >
            <Icons.forms className='mr-2 h-4 w-4' />
            Formulários
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between'>
          <div className='grid gap-2'>
            <Label htmlFor='analytics-period'>Período</Label>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Input
                id='analytics-period'
                type='date'
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className='sm:w-[220px]'
              />
              <Button
                type='button'
                variant='outline'
                disabled={!period}
                onClick={() => setPeriod('')}
              >
                Limpar
              </Button>
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {overviewQuery.isFetching ||
            campaignsQuery.isFetching ||
            deliveryLogsQuery.isFetching ? (
              <Badge variant='outline' className='gap-1'>
                <Icons.spinner className='size-3 animate-spin' />
                Atualizando
              </Badge>
            ) : null}
            <Badge variant='secondary'>{metricCoverage}/4 indicadores</Badge>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          icon={Icons.send}
          label='Campanhas'
          value={formatAnalyticsNumber(campaignCount)}
          description={`${formatAnalyticsNumber(overview?.campaigns_count ?? 0)} com métricas vinculadas`}
        />
        <StatCard
          icon={Icons.checks}
          label='Respostas'
          value={formatAnalyticsNumber(responseSummary.responded)}
          description={`${formatAnalyticsNumber(responseSummary.sent)} destinatários enviados`}
        />
        <StatCard
          icon={Icons.trendingUp}
          label='Taxa de resposta'
          value={formatRate(responseSummary.rate)}
          description='Respostas registradas sobre destinatários enviados'
        />
        <StatCard
          icon={Icons.notification}
          label='Entregas'
          value={formatAnalyticsNumber(deliverySummary.sent)}
          description={`${formatAnalyticsNumber(deliverySummary.failed)} falhas, ${formatAnalyticsNumber(
            deliverySummary.pending
          )} pendentes`}
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-[1fr_0.45fr]'>
        <div className='grid gap-4 md:grid-cols-2'>
          {ANALYTICS_METRIC_CARDS.map((metric) => (
            <MetricCard key={metric.type} overview={overview} metric={metric} />
          ))}
        </div>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Cobertura</CardTitle>
              <CardDescription>Indicadores com valor calculado no período atual.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Métricas ativas</span>
                  <span className='font-medium'>{metricCoverage}/4</span>
                </div>
                <Progress value={metricCoveragePercent} />
              </div>
              <div className='grid gap-2 rounded-md border p-3 text-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Registros de métrica</span>
                  <span className='font-medium'>
                    {formatAnalyticsNumber(overview?.metrics_count ?? 0)}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Formulários medidos</span>
                  <span className='font-medium'>
                    {formatAnalyticsNumber(overview?.forms_count ?? 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Atalhos</CardTitle>
              <CardDescription>Ir direto para operação e análise detalhada.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-2'>
              <Link
                href='/dashboard/campaigns'
                className={cn(buttonVariants({ variant: 'outline' }), 'justify-start')}
              >
                <Icons.send className='mr-2 size-4' />
                Campanhas
              </Link>
              <Link
                href='/dashboard/delivery/logs'
                className={cn(buttonVariants({ variant: 'outline' }), 'justify-start')}
              >
                <Icons.notification className='mr-2 size-4' />
                Logs de entrega
              </Link>
              <Link
                href='/dashboard/surveys/forms'
                className={cn(buttonVariants({ variant: 'outline' }), 'justify-start')}
              >
                <Icons.forms className='mr-2 size-4' />
                Formulários
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {overview?.metrics_count === 0 ? (
        <Alert>
          <AlertTitle>Métricas ainda não calculadas</AlertTitle>
          <AlertDescription>
            O painel operacional já mostra campanhas e entregas, mas NPS, CSAT, CES e CSI dependem
            dos registros de analytics gerados no backend.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
