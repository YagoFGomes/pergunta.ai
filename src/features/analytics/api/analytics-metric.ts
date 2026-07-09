import type { AnalyticsCesListParams } from '@/lib/api/generated/model/analyticsCesListParams';
import type { AnalyticsCsatListParams } from '@/lib/api/generated/model/analyticsCsatListParams';
import type { AnalyticsCsiListParams } from '@/lib/api/generated/model/analyticsCsiListParams';
import type { AnalyticsNpsListParams } from '@/lib/api/generated/model/analyticsNpsListParams';
import type { MetricResult } from '@/lib/api/generated/model/metricResult';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';
import { customFetch } from '@/lib/api/orval-fetcher';

export type AnalyticsMetricParams =
  | AnalyticsCesListParams
  | AnalyticsCsatListParams
  | AnalyticsCsiListParams
  | AnalyticsNpsListParams;

const METRIC_ENDPOINTS: Record<MetricTypeEnum, string> = {
  [MetricTypeEnum.CES]: '/api/analytics/ces',
  [MetricTypeEnum.CSAT]: '/api/analytics/csat',
  [MetricTypeEnum.CSI]: '/api/analytics/csi',
  [MetricTypeEnum.NPS]: '/api/analytics/nps',
  [MetricTypeEnum.CXI]: '/api/analytics/cxi'
};

export function analyticsMetricQueryKey(
  metricType: MetricTypeEnum,
  params?: AnalyticsMetricParams
) {
  return [METRIC_ENDPOINTS[metricType], params ?? {}] as const;
}

export async function retrieveAnalyticsMetric(
  metricType: MetricTypeEnum,
  params?: AnalyticsMetricParams
) {
  const searchParams = new URLSearchParams();

  if (params?.campaign) searchParams.set('campaign', params.campaign);
  if (params?.form) searchParams.set('form', params.form);
  if (params?.period) searchParams.set('period', params.period);

  const queryString = searchParams.toString();
  const endpoint = METRIC_ENDPOINTS[metricType];

  return customFetch<MetricResult[]>(queryString ? `${endpoint}?${queryString}` : endpoint);
}
