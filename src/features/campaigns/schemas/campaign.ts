import * as z from 'zod';

import type { Campaign } from '@/lib/api/generated/model/campaign';
import { DeliveryChannelEnum } from '@/lib/api/generated/model/deliveryChannelEnum';
import { SendConditionEnum } from '@/lib/api/generated/model/sendConditionEnum';
import { StepTypeEnum } from '@/lib/api/generated/model/stepTypeEnum';

export type MaybePaginatedCampaigns = Campaign[] | { count?: number; results?: Campaign[] };

export function getCollectionItems<TItem>(value: TItem[] | { results?: TItem[] } | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.results ?? [];
}

export function getCollectionCount<TItem>(
  value: TItem[] | { count?: number; results?: TItem[] } | undefined
) {
  if (!value) return 0;
  if (Array.isArray(value)) return value.length;
  return value.count ?? value.results?.length ?? 0;
}

export const campaignWizardSchema = z
  .object({
    name: z.string().trim().min(3, 'Informe ao menos 3 caracteres.').max(255),
    description: z.string().trim().max(1000).optional(),
    form: z.string().trim().min(1, 'Selecione um formulario.'),
    delivery_channel: z.nativeEnum(DeliveryChannelEnum),
    email_list: z.string().trim().optional(),
    webhook_url: z.string().trim().optional(),
    email_template: z.string().trim().optional(),
    start_date: z.string().trim().optional(),
    start_time: z.string().trim().optional(),
    timezone: z.string().trim().min(1, 'Informe o timezone.'),
    step_type: z.nativeEnum(StepTypeEnum),
    delay_days: z.coerce.number().int().min(0),
    delay_hours: z.coerce.number().int().min(0),
    send_condition: z.nativeEnum(SendConditionEnum)
  })
  .superRefine((values, ctx) => {
    if (values.delivery_channel === DeliveryChannelEnum.EMAIL && !values.email_list) {
      ctx.addIssue({
        code: 'custom',
        path: ['email_list'],
        message: 'Selecione uma lista de contatos.'
      });
    }

    if (values.delivery_channel === DeliveryChannelEnum.EMAIL && !values.email_template) {
      ctx.addIssue({
        code: 'custom',
        path: ['email_template'],
        message: 'Selecione um template de email.'
      });
    }

    if (values.delivery_channel === DeliveryChannelEnum.WEBHOOK && !values.webhook_url) {
      ctx.addIssue({
        code: 'custom',
        path: ['webhook_url'],
        message: 'Informe a URL do webhook.'
      });
    }

    if (Boolean(values.start_date) !== Boolean(values.start_time)) {
      ctx.addIssue({
        code: 'custom',
        path: ['start_date'],
        message: 'Informe data e horario para agendar.'
      });
    }
  });

export type CampaignWizardValues = z.infer<typeof campaignWizardSchema>;

export const campaignStepSchema = z.object({
  step_type: z.nativeEnum(StepTypeEnum),
  order: z.coerce.number().int().min(0),
  email_template: z.string().trim().min(1, 'Selecione um template.'),
  delay_days: z.coerce.number().int().min(0),
  delay_hours: z.coerce.number().int().min(0),
  send_condition: z.nativeEnum(SendConditionEnum)
});

export type CampaignStepFormValues = z.infer<typeof campaignStepSchema>;
