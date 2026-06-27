import { Icons } from '@/components/icons';
import { MetricTypeEnum } from '@/lib/api/generated/model/metricTypeEnum';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import type { Option } from '@/types/data-table';

export const SURVEY_FORM_STATUS_OPTIONS = [
  {
    label: 'Rascunho',
    value: Status37cEnum.DRAFT,
    icon: Icons.clock
  },
  {
    label: 'Ativo',
    value: Status37cEnum.ACTIVE,
    icon: Icons.circleCheck
  },
  {
    label: 'Arquivado',
    value: Status37cEnum.ARCHIVED,
    icon: Icons.slash
  }
] satisfies Option[];

export const SURVEY_FORM_FRAMEWORK_OPTIONS = [
  {
    label: 'NPS',
    value: MetricTypeEnum.NPS
  },
  {
    label: 'CSAT',
    value: MetricTypeEnum.CSAT
  },
  {
    label: 'CES',
    value: MetricTypeEnum.CES
  },
  {
    label: 'CSI',
    value: MetricTypeEnum.CSI
  }
] satisfies Option[];

export function getSurveyFormStatusLabel(status?: string) {
  return (
    SURVEY_FORM_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Sem status'
  );
}
