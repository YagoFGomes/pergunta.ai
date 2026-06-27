import { Icons } from '@/components/icons';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';
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

export function getSurveyFormStatusLabel(status?: string) {
  return (
    SURVEY_FORM_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Sem status'
  );
}

function getFrameworkOptionLabel(framework: SurveyFramework) {
  if (!framework.name || framework.name === framework.code) {
    return framework.code;
  }

  return `${framework.code} - ${framework.name}`;
}

export function buildSurveyFrameworkOptions(frameworks: SurveyFramework[] = []): Option[] {
  const uniqueOptions = new Map<string, Option>();

  for (const framework of frameworks) {
    if (!framework.code || framework.is_active === false) continue;

    uniqueOptions.set(framework.code, {
      label: getFrameworkOptionLabel(framework),
      value: framework.code
    });
  }

  return Array.from(uniqueOptions.values()).toSorted((currentOption, nextOption) =>
    currentOption.label.localeCompare(nextOption.label)
  );
}

export function buildSurveyFrameworkSelectOptions(frameworks: SurveyFramework[] = []): Option[] {
  const uniqueOptions = new Map<string, Option>();

  for (const framework of frameworks) {
    if (!framework.id || framework.is_active === false) continue;

    uniqueOptions.set(framework.id, {
      label: getFrameworkOptionLabel(framework),
      value: framework.id
    });
  }

  return Array.from(uniqueOptions.values()).toSorted((currentOption, nextOption) =>
    currentOption.label.localeCompare(nextOption.label)
  );
}
