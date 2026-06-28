import type { MetricResult } from '@/lib/api/generated/model/metricResult';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';

export type AnalyticsScopeEntity = {
  id: string;
  name?: string;
  title?: string;
};

export type AnalyticsDetailBase = {
  metrics_count: number;
  latest: Partial<Record<MetricTypeEnum, MetricResult>>;
  results: MetricResult[];
};

export type AnalyticsCampaignDetail = AnalyticsDetailBase & {
  campaign: AnalyticsScopeEntity;
};

export type AnalyticsFormDetail = AnalyticsDetailBase & {
  form: AnalyticsScopeEntity;
};

export type AnalyticsDetailScope = 'campaign' | 'form';

export function getAnalyticsDetailTitle(
  scope: AnalyticsDetailScope,
  detail?: AnalyticsCampaignDetail | AnalyticsFormDetail
) {
  if (!detail) return scope === 'campaign' ? 'Campanha' : 'Formulário';

  if (scope === 'campaign') {
    return (detail as AnalyticsCampaignDetail).campaign.name ?? 'Campanha';
  }

  return (detail as AnalyticsFormDetail).form.title ?? 'Formulário';
}

export function getAnalyticsDetailEntityId(
  scope: AnalyticsDetailScope,
  detail?: AnalyticsCampaignDetail | AnalyticsFormDetail
) {
  if (!detail) return undefined;

  if (scope === 'campaign') {
    return (detail as AnalyticsCampaignDetail).campaign.id;
  }

  return (detail as AnalyticsFormDetail).form.id;
}

export function getMetricHistoryByType(metrics: MetricResult[], metricType: MetricTypeEnum) {
  return metrics
    .filter((metric) => metric.metric_type === metricType)
    .toSorted((a, b) => {
      const periodOrder = b.period.localeCompare(a.period);
      if (periodOrder !== 0) return periodOrder;
      return b.created_at.localeCompare(a.created_at);
    });
}

export function getMetricLatestPeriod(metrics: MetricResult[]) {
  const latest = metrics.toSorted((a, b) => b.period.localeCompare(a.period))[0];
  return latest?.period;
}
