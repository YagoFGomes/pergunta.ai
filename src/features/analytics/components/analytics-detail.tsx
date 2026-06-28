'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { MetricResult } from '@/lib/api/generated/model/metricResult';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';
import { cn } from '@/lib/utils';

import {
  analyticsCampaignDetailQueryKey,
  analyticsFormDetailQueryKey,
  retrieveAnalyticsCampaignDetail,
  retrieveAnalyticsFormDetail
} from '../api/analytics-detail';
import {
  ANALYTICS_METRIC_CARDS,
  formatAnalyticsNumber,
  formatMetricPeriod,
  formatMetricValue,
  getMetricTone
} from '../schemas/analytics-overview';
import {
  getAnalyticsDetailEntityId,
  getAnalyticsDetailTitle,
  getMetricHistoryByType,
  getMetricLatestPeriod,
  type AnalyticsCampaignDetail,
  type AnalyticsDetailScope,
  type AnalyticsFormDetail
} from '../schemas/analytics-detail';

type AnalyticsDetailProps = {
  id: string;
  scope: AnalyticsDetailScope;
};

type AnalyticsDetailData = AnalyticsCampaignDetail | AnalyticsFormDetail;

function AnalyticsDetailSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-28 rounded-lg' />
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-44 rounded-lg' />
        ))}
      </div>
      <Skeleton className='h-80 rounded-lg' />
    </div>
  );
}

function getFilteredMetrics(metrics: MetricResult[], period: string) {
  if (!period) return metrics;
  return metrics.filter((metric) => metric.period === period);
}

function getLatestMetric(metrics: MetricResult[], type: MetricTypeEnum, fallback?: MetricResult) {
  return getMetricHistoryByType(metrics, type)[0] ?? fallback;
}

function MetricCard({
  fallback,
  metrics,
  type
}: {
  fallback?: MetricResult;
  metrics: MetricResult[];
  type: MetricTypeEnum;
}) {
  const config = ANALYTICS_METRIC_CARDS.find((item) => item.type === type);
  const latest = getLatestMetric(metrics, type, fallback);

  if (!config) return null;

  return (
    <Card>
      <CardHeader className='space-y-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-1'>
            <CardTitle className='text-base'>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Badge variant='outline'>{latest ? formatMetricPeriod(latest) : 'Sem dados'}</Badge>
        </div>
        <div className={cn('text-3xl font-semibold tabular-nums', getMetricTone(latest))}>
          {latest ? formatMetricValue(latest) : config.emptyLabel}
        </div>
      </CardHeader>
      <CardContent className='border-t pt-4'>
        <p className='text-muted-foreground text-xs'>
          {getMetricHistoryByType(metrics, type).length} registros no histórico filtrado
        </p>
      </CardContent>
    </Card>
  );
}

function MetricsHistoryTable({ metrics }: { metrics: MetricResult[] }) {
  if (metrics.length === 0) {
    return (
      <div className='flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center'>
        <Icons.trendingUp className='text-muted-foreground size-8' />
        <div className='space-y-1'>
          <h3 className='font-medium'>Sem histórico para o filtro atual</h3>
          <p className='text-muted-foreground max-w-md text-sm'>
            Ajuste o período ou aguarde novos calculos de métricas para este escopo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Indicador</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Formulário</TableHead>
            <TableHead>Campanha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.id}>
              <TableCell>
                <Badge variant='outline'>{metric.metric_type}</Badge>
              </TableCell>
              <TableCell className={cn('font-medium tabular-nums', getMetricTone(metric))}>
                {formatMetricValue(metric)}
              </TableCell>
              <TableCell>{formatMetricPeriod(metric)}</TableCell>
              <TableCell className='font-mono text-xs whitespace-normal'>
                {metric.form_id}
              </TableCell>
              <TableCell className='font-mono text-xs whitespace-normal'>
                {metric.campaign_id ?? '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AnalyticsDetail({ id, scope }: AnalyticsDetailProps) {
  const [period, setPeriod] = useState('');

  const detailQuery = useQuery<AnalyticsDetailData>({
    queryKey:
      scope === 'campaign' ? analyticsCampaignDetailQueryKey(id) : analyticsFormDetailQueryKey(id),
    queryFn: () =>
      scope === 'campaign' ? retrieveAnalyticsCampaignDetail(id) : retrieveAnalyticsFormDetail(id),
    retry: false
  });

  const detail = detailQuery.data;
  const metrics = useMemo(
    () => getFilteredMetrics(detail?.results ?? [], period),
    [detail?.results, period]
  );
  const latestPeriod = getMetricLatestPeriod(metrics);
  const title = getAnalyticsDetailTitle(scope, detail);
  const entityId = getAnalyticsDetailEntityId(scope, detail);
  const totalMetrics = detail?.metrics_count ?? 0;

  if (detailQuery.isPending) {
    return <AnalyticsDetailSkeleton />;
  }

  if (detailQuery.isError || !detail) {
    return (
      <div className='space-y-4'>
        <ModuleErrorAlert
          error={detailQuery.error}
          title='Erro ao carregar analytics'
          fallbackMessage='Não foi possível carregar os detalhes de analytics.'
        />
        <Button variant='outline' onClick={() => detailQuery.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='secondary'>{scope === 'campaign' ? 'Campanha' : 'Formulário'}</Badge>
              {latestPeriod ? <Badge variant='outline'>Último período {latestPeriod}</Badge> : null}
            </div>
            <CardTitle className='text-xl'>{title}</CardTitle>
            <CardDescription className='font-mono text-xs'>{entityId ?? id}</CardDescription>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Link
              href={
                scope === 'campaign'
                  ? `/dashboard/campaigns/${id}`
                  : `/dashboard/surveys/forms/${id}`
              }
              className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
            >
              {scope === 'campaign' ? 'Ver campanha' : 'Ver formulário'}
            </Link>
            {scope === 'campaign' ? (
              <Link
                href={`/dashboard/delivery/logs?campaign=${id}`}
                className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
              >
                Logs de entrega
              </Link>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className='grid gap-3 md:grid-cols-3'>
          <div className='rounded-md border p-4'>
            <span className='text-muted-foreground block text-sm'>Registros</span>
            <span className='mt-1 block text-2xl font-semibold tabular-nums'>
              {formatAnalyticsNumber(totalMetrics)}
            </span>
          </div>
          <div className='rounded-md border p-4'>
            <span className='text-muted-foreground block text-sm'>Filtrados</span>
            <span className='mt-1 block text-2xl font-semibold tabular-nums'>
              {formatAnalyticsNumber(metrics.length)}
            </span>
          </div>
          <div className='rounded-md border p-4'>
            <span className='text-muted-foreground block text-sm'>Indicadores</span>
            <span className='mt-1 block text-2xl font-semibold tabular-nums'>
              {formatAnalyticsNumber(Object.keys(detail.latest).length)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between'>
          <div className='grid gap-2'>
            <Label htmlFor='analytics-detail-period'>Período</Label>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Input
                id='analytics-detail-period'
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
          {detailQuery.isFetching ? (
            <Badge variant='outline' className='gap-1'>
              <Icons.spinner className='size-3 animate-spin' />
              Atualizando
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      {totalMetrics === 0 ? (
        <Alert>
          <AlertTitle>Sem métricas calculadas</AlertTitle>
          <AlertDescription>
            Este escopo ainda não possui NPS, CSAT, CES ou CSI gerados no backend.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {ANALYTICS_METRIC_CARDS.map((metric) => (
          <MetricCard
            key={metric.type}
            type={metric.type}
            metrics={metrics}
            fallback={detail.latest[metric.type]}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Histórico de métricas</CardTitle>
          <CardDescription>
            Registros retornados pelo backend para{' '}
            {scope === 'campaign' ? 'esta campanha' : 'este formulário'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetricsHistoryTable metrics={metrics} />
        </CardContent>
      </Card>
    </div>
  );
}
