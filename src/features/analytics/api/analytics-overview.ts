import type { AnalyticsOverviewRetrieveParams } from '@/lib/api/generated/model/analyticsOverviewRetrieveParams';
import { customFetch } from '@/lib/api/orval-fetcher';

import type { AnalyticsOverview } from '../schemas/analytics-overview';

export function analyticsOverviewQueryKey(params?: AnalyticsOverviewRetrieveParams) {
  return ['/api/analytics/overview', params ?? {}] as const;
}

export async function retrieveAnalyticsOverview(params?: AnalyticsOverviewRetrieveParams) {
  const searchParams = new URLSearchParams();

  if (params?.period) {
    searchParams.set('period', params.period);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/api/analytics/overview?${queryString}` : '/api/analytics/overview';

  return customFetch<AnalyticsOverview>(url);
}
