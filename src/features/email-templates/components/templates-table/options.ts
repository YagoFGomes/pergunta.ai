import { Icons } from '@/components/icons';
import { Status372Enum } from '@/lib/api/generated/model/status372Enum';
import { TemplateTypeEnum } from '@/lib/api/generated/model/templateTypeEnum';
import type { Option } from '@/types/data-table';

export const EMAIL_TEMPLATE_STATUS_OPTIONS = [
  { label: 'Ativo', value: Status372Enum.ACTIVE, icon: Icons.circleCheck },
  { label: 'Inativo', value: Status372Enum.INACTIVE, icon: Icons.slash }
] satisfies Option[];

export const EMAIL_TEMPLATE_TYPE_OPTIONS = [
  { label: 'Boas-vindas', value: TemplateTypeEnum.WELCOME },
  { label: 'Lembrete', value: TemplateTypeEnum.REMINDER },
  { label: 'Follow-up', value: TemplateTypeEnum.FOLLOWUP },
  { label: 'Obrigado', value: TemplateTypeEnum.THANK_YOU }
] satisfies Option[];

export function getEmailTemplateStatusLabel(status?: string) {
  return EMAIL_TEMPLATE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Ativo';
}

export function getEmailTemplateTypeLabel(templateType?: string) {
  return (
    EMAIL_TEMPLATE_TYPE_OPTIONS.find((option) => option.value === templateType)?.label ?? 'Sem tipo'
  );
}
