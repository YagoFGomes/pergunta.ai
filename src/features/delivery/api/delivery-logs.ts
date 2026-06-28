import { customFetch } from '@/lib/api/orval-fetcher';

type RetryDeliveryLogResponse = {
  detail?: string;
};

export async function retryDeliveryLog(logId: string) {
  return customFetch<RetryDeliveryLogResponse>(`/api/email-delivery/logs/${logId}/retry`, {
    method: 'POST'
  });
}
