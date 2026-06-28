'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { ReactNode } from 'react';
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
  analyticsMetricQueryKey,
  retrieveAnalyticsMetric,
  type AnalyticsMetricParams
} from '../api/analytics-metric';
import {
  formatAnalyticsNumber,
  formatMetricPeriod,
  formatMetricValue,
  getMetricTone
} from '../schemas/analytics-overview';
import {
  formatMetricNumericValue,
  getDistinctMetricScopes,
  getLatestMetric,
  getMetricAverage,
  getMetricCardConfig,
  getMetricDashboardConfig,
  getMetricDelta,
  getMetricProgressValue,
  getPreviousMetric,
  sortMetricsByPeriod
} from '../schemas/analytics-metric';

type AnalyticsMetricDashboardProps = {
  metricType: MetricTypeEnum;
};

function MetricDashboardSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-24 rounded-lg' />
      <div className='grid gap-3 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-32 rounded-lg' />
        ))}
      </div>
      <Skeleton className='h-80 rounded-lg' />
    </div>
  );
}

function StatCard({
  description,
  label,
  value
}: {
  description: string;
  label: string;
  value: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardDescription>{label}</CardDescription>
        <CardTitle className='text-2xl tabular-nums'>{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-xs'>{description}</p>
      </CardContent>
    </Card>
  );
}

function Timeline({ metrics }: { metrics: MetricResult[] }) {
  const chronologicalMetrics = metrics.toReversed().slice(-12);

  if (chronologicalMetrics.length === 0) {
    return (
      <div className='flex min-h-[180px] items-center justify-center rounded-md border border-dashed p-6 text-center'>
        <p className='text-muted-foreground text-sm'>Sem série temporal para exibir.</p>
      </div>
    );
  }

  return (
    <div className='grid gap-3'>
      {chronologicalMetrics.map((metric) => (
        <div key={metric.id} className='grid gap-2'>
          <div className='flex items-center justify-between gap-3 text-sm'>
            <span className='text-muted-foreground'>{formatMetricPeriod(metric)}</span>
            <span className={cn('font-medium tabular-nums', getMetricTone(metric))}>
              {formatMetricValue(metric)}
            </span>
          </div>
          <Progress value={getMetricProgressValue(metric)} />
        </div>
      ))}
    </div>
  );
}

function MetricsTable({ metrics }: { metrics: MetricResult[] }) {
  if (metrics.length === 0) {
    return (
      <div className='flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-md border border-dashed p-8 text-center'>
        <Icons.trendingUp className='text-muted-foreground size-8' />
        <div className='space-y-1'>
          <h3 className='font-medium'>Nenhum registro encontrado</h3>
          <p className='text-muted-foreground max-w-md text-sm'>
            Ajuste filtros por período, formulário ou campanha para visualizar outros registros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Formulário</TableHead>
            <TableHead>Campanha</TableHead>
            <TableHead>Atualizado em</TableHead>
            <TableHead className='text-right'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.id}>
              <TableCell>{formatMetricPeriod(metric)}</TableCell>
              <TableCell className={cn('font-medium tabular-nums', getMetricTone(metric))}>
                {formatMetricValue(metric)}
              </TableCell>
              <TableCell className='font-mono text-xs whitespace-normal'>
                {metric.form_id}
              </TableCell>
              <TableCell className='font-mono text-xs whitespace-normal'>
                {metric.campaign_id ?? '-'}
              </TableCell>
              <TableCell>
                {formatMetricPeriod({ ...metric, period: metric.updated_at.slice(0, 10) })}
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <Link
                    href={`/dashboard/analytics/forms/${metric.form_id}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 px-2')}
                  >
                    Form
                  </Link>
                  {metric.campaign_id ? (
                    <Link
                      href={`/dashboard/analytics/campaigns/${metric.campaign_id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 px-2')}
                    >
                      Campanha
                    </Link>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AnalyticsMetricDashboard({ metricType }: AnalyticsMetricDashboardProps) {
  const [campaign, setCampaign] = useState('');
  const [form, setForm] = useState('');
  const [period, setPeriod] = useState('');

  const params = useMemo<AnalyticsMetricParams>(
    () => ({
      ...(campaign.trim() ? { campaign: campaign.trim() } : {}),
      ...(form.trim() ? { form: form.trim() } : {}),
      ...(period ? { period } : {})
    }),
    [campaign, form, period]
  );

  const metricsQuery = useQuery({
    queryKey: analyticsMetricQueryKey(metricType, params),
    queryFn: () => retrieveAnalyticsMetric(metricType, params),
    placeholderData: keepPreviousData
  });

  const config = getMetricDashboardConfig(metricType);
  const cardConfig = getMetricCardConfig(metricType);
  const metrics = sortMetricsByPeriod(metricsQuery.data ?? []);
  const latest = getLatestMetric(metrics);
  const previous = getPreviousMetric(metrics);
  const average = getMetricAverage(metrics);
  const delta = getMetricDelta(latest, previous);
  const formattedDelta =
    delta === undefined
      ? undefined
      : `${delta >= 0 ? '+' : ''}${formatMetricNumericValue(metricType, Math.abs(delta))}`;
  const deltaTone =
    delta === undefined
      ? 'text-muted-foreground'
      : delta >= 0
        ? 'text-emerald-600'
        : 'text-destructive';
  const scopes = getDistinctMetricScopes(metrics);
  const hasFilters = Boolean(campaign || form || period);

  if (metricsQuery.isPending) {
    return <MetricDashboardSkeleton />;
  }

  if (metricsQuery.isError) {
    return (
      <div className='space-y-4'>
        <ModuleErrorAlert
          error={metricsQuery.error}
          title={`Erro ao carregar ${metricType}`}
          fallbackMessage='Não foi possível carregar os registros deste indicador.'
        />
        <Button variant='outline' onClick={() => metricsQuery.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='flex flex-col gap-4 p-4 xl:flex-row xl:items-end xl:justify-between'>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='analytics-metric-period'>Período</Label>
              <Input
                id='analytics-metric-period'
                type='date'
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='analytics-metric-form'>Formulário</Label>
              <Input
                id='analytics-metric-form'
                value={form}
                onChange={(event) => setForm(event.target.value)}
                placeholder='ID do formulário'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='analytics-metric-campaign'>Campanha</Label>
              <Input
                id='analytics-metric-campaign'
                value={campaign}
                onChange={(event) => setCampaign(event.target.value)}
                placeholder='ID da campanha'
              />
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {metricsQuery.isFetching ? (
              <Badge variant='outline' className='gap-1'>
                <Icons.spinner className='size-3 animate-spin' />
                Atualizando
              </Badge>
            ) : null}
            <Badge variant='secondary'>{formatAnalyticsNumber(metrics.length)} registros</Badge>
            <Button
              type='button'
              variant='outline'
              disabled={!hasFilters}
              onClick={() => {
                setCampaign('');
                setForm('');
                setPeriod('');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {metrics.length === 0 ? (
        <Alert>
          <AlertTitle>{cardConfig?.emptyLabel ?? 'Sem dados calculados'}</AlertTitle>
          <AlertDescription>
            {hasFilters
              ? 'Ajuste os filtros para visualizar outros registros.'
              : 'Este indicador ainda não possui métricas geradas no backend.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label={config.scoreLabel}
          value={
            <span className={cn(getMetricTone(latest))}>
              {latest ? formatMetricValue(latest) : '-'}
            </span>
          }
          description={latest ? `Período ${formatMetricPeriod(latest)}` : config.interpretation}
        />
        <StatCard
          label='Média'
          value={formatMetricNumericValue(metricType, average)}
          description='Média simples dos registros filtrados'
        />
        <StatCard
          label='Variação'
          value={
            formattedDelta === undefined ? '-' : <span className={deltaTone}>{formattedDelta}</span>
          }
          description='Comparação entre os dois períodos mais recentes'
        />
        <StatCard
          label='Escopo'
          value={`${formatAnalyticsNumber(scopes.forms)} / ${formatAnalyticsNumber(scopes.campaigns)}`}
          description='Formulários / campanhas no recorte atual'
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[0.45fr_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Tendência</CardTitle>
            <CardDescription>{config.interpretation}</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline metrics={metrics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div>
              <CardTitle className='text-base'>Histórico de {metricType}</CardTitle>
              <CardDescription>Registros retornados pelo backend para o indicador.</CardDescription>
            </div>
            <Link
              href='/dashboard/analytics/overview'
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-fit')}
            >
              Overview
            </Link>
          </CardHeader>
          <CardContent>
            <MetricsTable metrics={metrics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
