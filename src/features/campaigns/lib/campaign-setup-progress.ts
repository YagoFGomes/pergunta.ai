import type { EmailList } from '@/lib/api/generated/model/emailList';
import { EmailListStatusEnum } from '@/lib/api/generated/model/emailListStatusEnum';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import { EmailTemplateStatusEnum } from '@/lib/api/generated/model/emailTemplateStatusEnum';
import type { Form } from '@/lib/api/generated/model/form';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';

export type CampaignSetupStepKey = 'contact-list' | 'survey-form' | 'email-template' | 'campaign';

export type CampaignSetupStepStatus = 'completed' | 'current' | 'pending' | 'blocked';

export type CampaignSetupCounts = {
  validContactListsCount: number;
  validSurveyFormsCount: number;
  validEmailTemplatesCount: number;
  campaignsCount: number;
};

export type CampaignSetupStep = {
  key: CampaignSetupStepKey;
  title: string;
  description: string;
  href: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  status: CampaignSetupStepStatus;
  helperText: string;
};

export type CampaignSetupProgress = {
  steps: CampaignSetupStep[];
  progressPercent: number;
  completedSteps: number;
  totalSteps: number;
  currentStepKey: CampaignSetupStepKey | null;
  hasContactList: boolean;
  hasSurveyForm: boolean;
  hasEmailTemplate: boolean;
  hasCampaign: boolean;
  canCreateCampaign: boolean;
  missingDependencies: string[];
  isRoadmapCompleted: boolean;
};

export type CampaignSetupQueryStateInput = {
  isListsLoading: boolean;
  isFormsLoading: boolean;
  isTemplatesLoading: boolean;
  isCampaignsLoading: boolean;
  listsError: unknown;
  formsError: unknown;
  templatesError: unknown;
  campaignsError: unknown;
};

export type CampaignSetupQueryState = {
  isLoading: boolean;
  hasError: boolean;
};

const TOTAL_STEPS = 4;

export function isValidContactList(list: EmailList): boolean {
  return (list.status ?? EmailListStatusEnum.ACTIVE) === EmailListStatusEnum.ACTIVE;
}

export function isValidSurveyForm(form: Form): boolean {
  return form.status === Status37cEnum.ACTIVE;
}

export function isValidEmailTemplate(template: EmailTemplate): boolean {
  return (template.status ?? EmailTemplateStatusEnum.DRAFT) === EmailTemplateStatusEnum.ACTIVE;
}

export function resolveCampaignSetupQueryState(
  input: CampaignSetupQueryStateInput
): CampaignSetupQueryState {
  const isLoading =
    input.isListsLoading ||
    input.isFormsLoading ||
    input.isTemplatesLoading ||
    input.isCampaignsLoading;

  const hasError = Boolean(
    input.listsError || input.formsError || input.templatesError || input.campaignsError
  );

  return {
    isLoading,
    hasError
  };
}

export function deriveCampaignSetupProgress(counts: CampaignSetupCounts): CampaignSetupProgress {
  const hasContactList = counts.validContactListsCount > 0;
  const hasSurveyForm = counts.validSurveyFormsCount > 0;
  const hasEmailTemplate = counts.validEmailTemplatesCount > 0;
  const hasCampaign = counts.campaignsCount > 0;

  const canCreateCampaign = hasContactList && hasSurveyForm && hasEmailTemplate;

  const missingDependencies = [
    ...(hasContactList ? [] : ['Lista de contatos']),
    ...(hasSurveyForm ? [] : ['Formulário de perguntas']),
    ...(hasEmailTemplate ? [] : ['Template de e-mail'])
  ];

  const completedStepSet = new Set<CampaignSetupStepKey>();
  if (hasContactList) completedStepSet.add('contact-list');
  if (hasSurveyForm) completedStepSet.add('survey-form');
  if (hasEmailTemplate) completedStepSet.add('email-template');
  if (hasCampaign) completedStepSet.add('campaign');

  const firstIncompleteStep = (
    ['contact-list', 'survey-form', 'email-template', 'campaign'] as const
  )
    .filter((step) => step !== 'campaign')
    .find((step) => !completedStepSet.has(step));

  const currentStepKey: CampaignSetupStepKey | null = firstIncompleteStep
    ? firstIncompleteStep
    : hasCampaign
      ? null
      : 'campaign';

  const steps: CampaignSetupStep[] = [
    {
      key: 'contact-list',
      title: 'Criar lista de contatos',
      description: 'Adicione ou importe os contatos que receberão sua pesquisa.',
      href: '/dashboard/contacts/lists',
      primaryActionLabel: 'Criar lista de contatos',
      status: hasContactList
        ? 'completed'
        : currentStepKey === 'contact-list'
          ? 'current'
          : 'pending',
      helperText: hasContactList
        ? `${counts.validContactListsCount} lista(s) ativa(s) disponível(is).`
        : 'Você precisa de ao menos uma lista ativa para iniciar envios.'
    },
    {
      key: 'survey-form',
      title: 'Escolher formulário de pesquisa',
      description: 'Comece por um template pronto, adapte um formulário existente ou crie do zero.',
      href: '/dashboard/surveys/forms',
      primaryActionLabel: 'Usar template de formulário',
      status: hasSurveyForm
        ? 'completed'
        : currentStepKey === 'survey-form'
          ? 'current'
          : 'pending',
      helperText: hasSurveyForm
        ? `${counts.validSurveyFormsCount} formulário(s) ativo(s) disponível(is).`
        : 'Somente formulários ativos entram no cálculo do roadmap.'
    },
    {
      key: 'email-template',
      title: 'Preparar template de e-mail',
      description: 'Use ou personalize um template pronto para o convite da pesquisa.',
      href: '/dashboard/email-templates',
      primaryActionLabel: 'Usar template de e-mail',
      status: hasEmailTemplate
        ? 'completed'
        : currentStepKey === 'email-template'
          ? 'current'
          : 'pending',
      helperText: hasEmailTemplate
        ? `${counts.validEmailTemplatesCount} template(s) ativo(s) disponível(is).`
        : 'Tenha ao menos um template de e-mail ativo para avançar.'
    },
    {
      key: 'campaign',
      title: 'Criar campanha',
      description:
        'Selecione contatos, formulário, template, workflow de envio e janela de execução.',
      href: '/dashboard/campaigns/new',
      primaryActionLabel: 'Criar campanha',
      status: hasCampaign ? 'completed' : canCreateCampaign ? 'current' : 'blocked',
      helperText: hasCampaign
        ? `${counts.campaignsCount} campanha(s) já criada(s).`
        : canCreateCampaign
          ? 'Pré-requisitos concluídos. Você já pode criar uma campanha.'
          : `Conclua antes: ${missingDependencies.join(', ')}.`
    }
  ];

  const completedSteps = steps.filter((step) => step.status === 'completed').length;
  const progressPercent = Math.round((completedSteps / TOTAL_STEPS) * 100);

  return {
    steps,
    progressPercent,
    completedSteps,
    totalSteps: TOTAL_STEPS,
    currentStepKey,
    hasContactList,
    hasSurveyForm,
    hasEmailTemplate,
    hasCampaign,
    canCreateCampaign,
    missingDependencies,
    isRoadmapCompleted: completedSteps === TOTAL_STEPS
  };
}
