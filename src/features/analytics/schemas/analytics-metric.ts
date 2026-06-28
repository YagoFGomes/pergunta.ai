import type { MetricResult } from '@/lib/api/generated/model/metricResult';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';

import { ANALYTICS_METRIC_CARDS, formatMetricValue } from './analytics-overview';

export type AnalyticsMetricDashboardConfig = {
  type: MetricTypeEnum;
  title: string;
  description: string;
  scoreLabel: string;
  interpretation: string;
};

export const ANALYTICS_METRIC_DASHBOARD_CONFIG: Record<
  MetricTypeEnum,
  AnalyticsMetricDashboardConfig
> = {
  [MetricTypeEnum.NPS]: {
    type: MetricTypeEnum.NPS,
    title: 'Analytics NPS',
    description: 'Acompanhamento de Net Promoter Score.',
    scoreLabel: 'NPS atual',
    interpretation: 'Valores acima de 50 indicam uma base saudavel de promotores.'
  },
  [MetricTypeEnum.CSAT]: {
    type: MetricTypeEnum.CSAT,
    title: 'Analytics CSAT',
    description: 'Acompanhamento de Customer Satisfaction Score.',
    scoreLabel: 'CSAT atual',
    interpretation: 'Percentuais acima de 75% indicam boa satisfacao no recorte atual.'
  },
  [MetricTypeEnum.CES]: {
    type: MetricTypeEnum.CES,
    title: 'Analytics CES',
    description: 'Acompanhamento de Customer Effort Score.',
    scoreLabel: 'CES atual',
    interpretation: 'Percentuais maiores indicam menor friccao percebida pelo cliente.'
  },
  [MetricTypeEnum.CSI]: {
    type: MetricTypeEnum.CSI,
    title: 'Analytics CSI',
    description: 'Acompanhamento de Customer Satisfaction Index.',
    scoreLabel: 'CSI atual',
    interpretation: 'Indice composto consolidado a partir das dimensoes respondidas.'
  }
};

export function getMetricDashboardConfig(metricType: MetricTypeEnum) {
  return ANALYTICS_METRIC_DASHBOARD_CONFIG[metricType];
}

export function getMetricCardConfig(metricType: MetricTypeEnum) {
  return ANALYTICS_METRIC_CARDS.find((metric) => metric.type === metricType);
}

export function sortMetricsByPeriod(metrics: MetricResult[]) {
  return metrics.toSorted((a, b) => {
    const periodOrder = b.period.localeCompare(a.period);
    if (periodOrder !== 0) return periodOrder;
    return b.created_at.localeCompare(a.created_at);
  });
}

export function getLatestMetric(metrics: MetricResult[]) {
  return sortMetricsByPeriod(metrics)[0];
}

export function getPreviousMetric(metrics: MetricResult[]) {
  return sortMetricsByPeriod(metrics)[1];
}

export function getMetricNumericValue(metric?: MetricResult) {
  if (!metric) return undefined;

  const value = Number(metric.value);
  return Number.isFinite(value) ? value : undefined;
}

export function getMetricAverage(metrics: MetricResult[]) {
  const values = metrics
    .map((metric) => getMetricNumericValue(metric))
    .filter((value): value is number => value !== undefined);

  if (values.length === 0) return undefined;

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function getMetricDelta(current?: MetricResult, previous?: MetricResult) {
  const currentValue = getMetricNumericValue(current);
  const previousValue = getMetricNumericValue(previous);

  if (currentValue === undefined || previousValue === undefined) return undefined;

  return currentValue - previousValue;
}

export function formatMetricNumericValue(metricType: MetricTypeEnum, value?: number) {
  if (value === undefined) return '-';

  return formatMetricValue({
    campaign_id: null,
    created_at: '',
    form_id: '',
    id: '',
    metric_type: metricType,
    period: '',
    updated_at: '',
    value: value.toFixed(2)
  });
}

export function getDistinctMetricScopes(metrics: MetricResult[]) {
  const forms = new Set(metrics.map((metric) => metric.form_id).filter(Boolean));
  const campaigns = new Set(metrics.map((metric) => metric.campaign_id).filter(Boolean));

  return { campaigns: campaigns.size, forms: forms.size };
}

export function getMetricProgressValue(metric?: MetricResult) {
  const value = getMetricNumericValue(metric);
  if (value === undefined) return 0;

  if (metric?.metric_type === MetricTypeEnum.NPS) {
    return Math.max(0, Math.min(100, (value + 100) / 2));
  }

  return Math.max(0, Math.min(100, value));
}
