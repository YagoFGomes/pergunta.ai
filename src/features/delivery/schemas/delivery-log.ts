import type { EmailSendLog } from '@/lib/api/generated/model/emailSendLog';
import { EmailSendLogStatusEnum } from '@/lib/api/generated/model/emailSendLogStatusEnum';

export type MaybePaginatedDeliveryLogs =
  | EmailSendLog[]
  | { count?: number; results?: EmailSendLog[] };

export const DELIVERY_LOG_STATUS_OPTIONS = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendente', value: EmailSendLogStatusEnum.PENDING },
  { label: 'Enviado', value: EmailSendLogStatusEnum.SENT },
  { label: 'Entregue', value: EmailSendLogStatusEnum.DELIVERED },
  { label: 'Falhou', value: EmailSendLogStatusEnum.FAILED },
  { label: 'Bounce', value: EmailSendLogStatusEnum.BOUNCED }
] as const;

export function getDeliveryLogItems(value: MaybePaginatedDeliveryLogs | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.results ?? [];
}

export function getDeliveryLogCount(value: MaybePaginatedDeliveryLogs | undefined) {
  if (!value) return 0;
  if (Array.isArray(value)) return value.length;
  return value.count ?? value.results?.length ?? 0;
}

export function getDeliveryLogStatusLabel(status: EmailSendLog['status']) {
  return DELIVERY_LOG_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getDeliveryLogStatusClassName(status: EmailSendLog['status']) {
  if (status === EmailSendLogStatusEnum.DELIVERED) return 'border-emerald-500/30 text-emerald-700';
  if (status === EmailSendLogStatusEnum.SENT) return 'border-sky-500/30 text-sky-700';
  if (status === EmailSendLogStatusEnum.PENDING) return 'border-amber-500/30 text-amber-700';
  if (status === EmailSendLogStatusEnum.FAILED) return 'border-destructive/30 text-destructive';
  if (status === EmailSendLogStatusEnum.BOUNCED) return 'border-violet-500/30 text-violet-700';
  return 'text-muted-foreground';
}

export function formatDeliveryDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function getDeliveryLogSummary(logs: EmailSendLog[]) {
  return logs.reduce(
    (summary, log) => {
      summary.total += 1;

      if (log.status === EmailSendLogStatusEnum.PENDING) summary.pending += 1;
      if (log.status === EmailSendLogStatusEnum.SENT) summary.sent += 1;
      if (log.status === EmailSendLogStatusEnum.DELIVERED) summary.delivered += 1;
      if (log.status === EmailSendLogStatusEnum.FAILED) summary.failed += 1;
      if (log.status === EmailSendLogStatusEnum.BOUNCED) summary.bounced += 1;

      return summary;
    },
    { bounced: 0, delivered: 0, failed: 0, pending: 0, sent: 0, total: 0 }
  );
}
