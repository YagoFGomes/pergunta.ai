import { customFetch } from '@/lib/api/orval-fetcher';

import type { AnalyticsCampaignDetail, AnalyticsFormDetail } from '../schemas/analytics-detail';

export function analyticsCampaignDetailQueryKey(campaignId: string) {
  return ['/api/analytics/campaigns', campaignId] as const;
}

export function analyticsFormDetailQueryKey(formId: string) {
  return ['/api/analytics/forms', formId] as const;
}

export async function retrieveAnalyticsCampaignDetail(campaignId: string) {
  return customFetch<AnalyticsCampaignDetail>(`/api/analytics/campaigns/${campaignId}`);
}

export async function retrieveAnalyticsFormDetail(formId: string) {
  return customFetch<AnalyticsFormDetail>(`/api/analytics/forms/${formId}`);
}
