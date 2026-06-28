import type { Campaign } from '@/lib/api/generated/model/campaign';
import type { EmailSendLog } from '@/lib/api/generated/model/emailSendLog';
import { EmailSendLogStatusEnum } from '@/lib/api/generated/model/emailSendLogStatusEnum';
import type { MetricResult } from '@/lib/api/generated/model/metricResult';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';

export type AnalyticsOverview = {
  metrics_count: number;
  forms_count: number;
  campaigns_count: number;
  latest: Partial<Record<MetricTypeEnum, MetricResult>>;
};

export type AnalyticsMetricCard = {
  type: MetricTypeEnum;
  title: string;
  description: string;
  href: string;
  emptyLabel: string;
};

export type MaybePaginated<TItem> = TItem[] | { count?: number; results?: TItem[] };

export const ANALYTICS_METRIC_CARDS: AnalyticsMetricCard[] = [
  {
    type: MetricTypeEnum.NPS,
    title: 'NPS',
    description: 'Lealdade e recomendacao',
    href: '/dashboard/analytics/nps',
    emptyLabel: 'Sem NPS calculado'
  },
  {
    type: MetricTypeEnum.CSAT,
    title: 'CSAT',
    description: 'Satisfacao com a experiencia',
    href: '/dashboard/analytics/csat',
    emptyLabel: 'Sem CSAT calculado'
  },
  {
    type: MetricTypeEnum.CES,
    title: 'CES',
    description: 'Esforco percebido pelo cliente',
    href: '/dashboard/analytics/ces',
    emptyLabel: 'Sem CES calculado'
  },
  {
    type: MetricTypeEnum.CSI,
    title: 'CSI',
    description: 'Indice composto de satisfacao',
    href: '/dashboard/analytics/csi',
    emptyLabel: 'Sem CSI calculado'
  }
];

export function getCollectionItems<TItem>(value: MaybePaginated<TItem> | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.results ?? [];
}

export function getCollectionCount<TItem>(value: MaybePaginated<TItem> | undefined) {
  if (!value) return 0;
  if (Array.isArray(value)) return value.length;
  return value.count ?? value.results?.length ?? 0;
}

export function formatAnalyticsNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatMetricValue(metric?: MetricResult) {
  if (!metric) return '-';

  const numericValue = Number(metric.value);
  if (!Number.isFinite(numericValue)) return metric.value;

  if (metric.metric_type === MetricTypeEnum.NPS) {
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 1,
      signDisplay: 'exceptZero'
    }).format(numericValue);
  }

  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    style: 'percent'
  }).format(numericValue / 100);
}

export function formatMetricPeriod(metric?: MetricResult) {
  if (!metric) return 'Sem periodo';

  const date = new Date(`${metric.period}T00:00:00`);
  if (Number.isNaN(date.getTime())) return metric.period;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function getMetricTone(metric?: MetricResult) {
  if (!metric) return 'text-muted-foreground';

  const value = Number(metric.value);
  if (!Number.isFinite(value)) return 'text-foreground';

  if (metric.metric_type === MetricTypeEnum.NPS) {
    if (value >= 50) return 'text-emerald-600';
    if (value >= 0) return 'text-amber-600';
    return 'text-destructive';
  }

  if (value >= 75) return 'text-emerald-600';
  if (value >= 50) return 'text-amber-600';
  return 'text-destructive';
}

export function getAnsweredMetricsCount(overview?: AnalyticsOverview) {
  if (!overview) return 0;

  return ANALYTICS_METRIC_CARDS.filter((metric) => Boolean(overview.latest[metric.type])).length;
}

export function getCampaignResponseSummary(campaigns: Campaign[]) {
  const sent = campaigns.reduce((total, campaign) => total + campaign.recipients_sent, 0);
  const responded = campaigns.reduce((total, campaign) => total + campaign.recipients_responded, 0);
  const rate = sent > 0 ? (responded / sent) * 100 : 0;

  return { sent, responded, rate };
}

export function getDeliverySummary(logs: EmailSendLog[]) {
  return logs.reduce(
    (summary, log) => {
      if (
        log.status === EmailSendLogStatusEnum.SENT ||
        log.status === EmailSendLogStatusEnum.DELIVERED
      ) {
        summary.sent += 1;
      }

      if (
        log.status === EmailSendLogStatusEnum.FAILED ||
        log.status === EmailSendLogStatusEnum.BOUNCED
      ) {
        summary.failed += 1;
      }

      if (log.status === EmailSendLogStatusEnum.PENDING) {
        summary.pending += 1;
      }

      return summary;
    },
    { failed: 0, pending: 0, sent: 0 }
  );
}

export function formatRate(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    style: 'percent'
  }).format(value / 100);
}
