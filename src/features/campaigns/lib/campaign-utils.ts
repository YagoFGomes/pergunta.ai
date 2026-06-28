import type { Campaign } from '@/lib/api/generated/model/campaign';
import { CampaignStatusEnum } from '@/lib/api/generated/model/campaignStatusEnum';
import { DeliveryChannelEnum } from '@/lib/api/generated/model/deliveryChannelEnum';
import { SendConditionEnum } from '@/lib/api/generated/model/sendConditionEnum';
import { StepTypeEnum } from '@/lib/api/generated/model/stepTypeEnum';
import type { Option } from '@/types/data-table';

type MaybePaginated<TItem> = TItem[] | { count?: number; results?: TItem[] };

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

export const CAMPAIGN_STATUS_OPTIONS: Option[] = [
  { label: 'Rascunho', value: CampaignStatusEnum.DRAFT },
  { label: 'Agendada', value: CampaignStatusEnum.SCHEDULED },
  { label: 'Em execucao', value: CampaignStatusEnum.RUNNING },
  { label: 'Pausada', value: CampaignStatusEnum.PAUSED },
  { label: 'Concluida', value: CampaignStatusEnum.COMPLETED },
  { label: 'Cancelada', value: CampaignStatusEnum.CANCELED }
];

export const DELIVERY_CHANNEL_OPTIONS: Option[] = [
  { label: 'Email', value: DeliveryChannelEnum.EMAIL },
  { label: 'Webhook', value: DeliveryChannelEnum.WEBHOOK }
];

export const STEP_TYPE_OPTIONS: Option[] = [
  { label: 'Inicial', value: StepTypeEnum.INITIAL },
  { label: 'Lembrete', value: StepTypeEnum.REMINDER },
  { label: 'Follow-up', value: StepTypeEnum.FOLLOWUP }
];

export const SEND_CONDITION_OPTIONS: Option[] = [
  { label: 'Sempre', value: SendConditionEnum.ALWAYS },
  { label: 'Se não respondeu', value: SendConditionEnum.IF_NOT_RESPONDED }
];

export function getCampaignStatusLabel(status?: Campaign['status']) {
  return CAMPAIGN_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Rascunho';
}

export function getDeliveryChannelLabel(channel?: Campaign['delivery_channel']) {
  return DELIVERY_CHANNEL_OPTIONS.find((option) => option.value === channel)?.label ?? 'Email';
}

export function getCampaignStatusClassName(status?: Campaign['status']) {
  if (status === CampaignStatusEnum.RUNNING) return 'border-emerald-500/30 text-emerald-700';
  if (status === CampaignStatusEnum.SCHEDULED) return 'border-sky-500/30 text-sky-700';
  if (status === CampaignStatusEnum.PAUSED) return 'border-amber-500/30 text-amber-700';
  if (status === CampaignStatusEnum.CANCELED) return 'border-destructive/30 text-destructive';
  if (status === CampaignStatusEnum.COMPLETED) return 'border-violet-500/30 text-violet-700';
  return 'text-muted-foreground';
}

export function formatModuleDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}
