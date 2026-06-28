'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { ModuleFormCard } from '@/features/platform/components/module-form-card';
import { ModuleFormSkeleton } from '@/features/platform/components/module-form-skeleton';
import { notifyError } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  useCampaignsCreate,
  useCampaignsScheduleCreate,
  useCampaignsStepsCreate,
  useContactsListsList,
  useEmailTemplatesList,
  useSurveysFormsList
} from '@/lib/api/generated/endpoints';
import type { Campaign } from '@/lib/api/generated/model/campaign';
import { DeliveryChannelEnum } from '@/lib/api/generated/model/deliveryChannelEnum';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import type { Form } from '@/lib/api/generated/model/form';
import { SendConditionEnum } from '@/lib/api/generated/model/sendConditionEnum';
import { StepTypeEnum } from '@/lib/api/generated/model/stepTypeEnum';
import { cn } from '@/lib/utils';
import {
  DELIVERY_CHANNEL_OPTIONS,
  SEND_CONDITION_OPTIONS,
  STEP_TYPE_OPTIONS
} from '../lib/campaign-utils';
import {
  campaignWizardSchema,
  getCollectionItems,
  type CampaignWizardValues
} from '../schemas/campaign';

const DEFAULT_VALUES: CampaignWizardValues = {
  name: '',
  description: '',
  form: '',
  delivery_channel: DeliveryChannelEnum.EMAIL,
  email_list: '',
  webhook_url: '',
  email_template: '',
  start_date: '',
  start_time: '',
  timezone: 'America/Sao_Paulo',
  step_type: StepTypeEnum.INITIAL,
  delay_days: 0,
  delay_hours: 0,
  send_condition: SendConditionEnum.ALWAYS
};

const STEPS = ['Base', 'Público', 'Template', 'Agendamento', 'Revisao'] as const;

type FieldProps = {
  label: string;
  children: React.ReactNode;
  description?: string;
};

function Field({ label, children, description }: FieldProps) {
  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      {children}
      {description ? <p className='text-muted-foreground text-xs'>{description}</p> : null}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  disabled,
  children
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className='border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
    >
      {children}
    </select>
  );
}

function getFormLabel(form: Form) {
  return `${form.title}${form.framework_code ? ` (${form.framework_code})` : ''} - ${form.status ?? 'DRAFT'}`;
}

function ResourcePreview({
  title,
  description,
  children,
  actions
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Card className='md:col-span-2'>
      <CardHeader className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div className='space-y-1'>
          <CardTitle className='text-base'>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className='flex flex-wrap gap-2'>{actions}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function CampaignCreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<CampaignWizardValues>(DEFAULT_VALUES);

  const formsQuery = useSurveysFormsList({ page_size: '100' }, { query: { staleTime: 60_000 } });
  const listsQuery = useContactsListsList(undefined, { query: { staleTime: 60_000 } });
  const templatesQuery = useEmailTemplatesList(undefined, { query: { staleTime: 60_000 } });

  const forms = getCollectionItems(
    getOrvalResponseData<Form[] | { results?: Form[] }>(formsQuery.data)
  );
  const lists = getCollectionItems(
    getOrvalResponseData<EmailList[] | { results?: EmailList[] }>(listsQuery.data)
  );
  const templates = getCollectionItems(
    getOrvalResponseData<EmailTemplate[] | { results?: EmailTemplate[] }>(templatesQuery.data)
  );

  const prerequisites = useMemo(
    () => ({
      forms: forms.length > 0,
      lists: values.delivery_channel === DeliveryChannelEnum.WEBHOOK || lists.length > 0,
      templates: values.delivery_channel === DeliveryChannelEnum.WEBHOOK || templates.length > 0
    }),
    [forms.length, lists.length, templates.length, values.delivery_channel]
  );
  const selectedForm = useMemo(
    () => forms.find((form) => form.id === values.form),
    [forms, values.form]
  );
  const selectedList = useMemo(
    () => lists.find((list) => list.id === values.email_list),
    [lists, values.email_list]
  );
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === values.email_template),
    [templates, values.email_template]
  );

  const createMutation = useCampaignsCreate();
  const createStepMutation = useCampaignsStepsCreate();
  const scheduleMutation = useCampaignsScheduleCreate();
  const isSubmitting =
    createMutation.isPending || createStepMutation.isPending || scheduleMutation.isPending;

  const isLoading = formsQuery.isPending || listsQuery.isPending || templatesQuery.isPending;
  const error = formsQuery.error ?? listsQuery.error ?? templatesQuery.error;

  function updateValue<TKey extends keyof CampaignWizardValues>(
    key: TKey,
    value: CampaignWizardValues[TKey]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (!values.name.trim() || !values.form) {
        toast.error('Informe nome e formulário para continuar.');
        return false;
      }
    }

    if (step === 1 && values.delivery_channel === DeliveryChannelEnum.EMAIL && !values.email_list) {
      toast.error('Selecione uma lista de contatos.');
      return false;
    }

    if (
      step === 2 &&
      values.delivery_channel === DeliveryChannelEnum.EMAIL &&
      !values.email_template
    ) {
      toast.error('Selecione um template de email.');
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    const parsed = campaignWizardSchema.safeParse(values);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Revise os dados da campanha.');
      return;
    }

    try {
      const campaignResponse = await createMutation.mutateAsync({
        data: {
          name: parsed.data.name.trim(),
          description: parsed.data.description?.trim() ?? '',
          form: parsed.data.form,
          delivery_channel: parsed.data.delivery_channel,
          email_list:
            parsed.data.delivery_channel === DeliveryChannelEnum.EMAIL
              ? parsed.data.email_list
              : null,
          webhook_url:
            parsed.data.delivery_channel === DeliveryChannelEnum.WEBHOOK
              ? parsed.data.webhook_url
              : '',
          timezone: parsed.data.timezone
        }
      });

      const campaign = getOrvalResponseData<Campaign>(campaignResponse);

      if (!campaign?.id) {
        throw new Error('Campanha criada sem id retornado.');
      }

      if (
        parsed.data.delivery_channel === DeliveryChannelEnum.EMAIL &&
        parsed.data.email_template
      ) {
        await createStepMutation.mutateAsync({
          campaignId: campaign.id,
          data: {
            step_type: parsed.data.step_type,
            order: 1,
            email_template: parsed.data.email_template,
            delay_days: parsed.data.delay_days,
            delay_hours: parsed.data.delay_hours,
            send_condition: parsed.data.send_condition
          }
        });
      }

      if (parsed.data.start_date && parsed.data.start_time) {
        await scheduleMutation.mutateAsync({
          id: campaign.id,
          data: {
            start_date: parsed.data.start_date,
            start_time: parsed.data.start_time,
            timezone: parsed.data.timezone
          }
        });
      }

      toast.success('Campanha criada com sucesso.');
      router.push(`/dashboard/campaigns/${campaign.id}`);
    } catch (mutationError) {
      notifyError(mutationError, 'Não foi possível criar a campanha.');
    }
  }

  if (isLoading) {
    return <ModuleFormSkeleton fieldCount={4} />;
  }

  if (error) {
    return (
      <ModuleErrorAlert
        error={error}
        title='Erro ao carregar pré-requisitos'
        fallbackMessage='Não foi possível carregar formulários, listas ou templates.'
      />
    );
  }

  return (
    <ModuleFormCard
      title='Nova campanha'
      description='Configure o envio em cinco etapas antes de criar a campanha.'
      contentClassName='space-y-6'
    >
      <div className='grid gap-2 md:grid-cols-5'>
        {STEPS.map((item, index) => (
          <button
            key={item}
            type='button'
            onClick={() => setStep(index)}
            className={cn(
              'rounded-md border px-3 py-2 text-left text-sm transition-colors',
              step === index
                ? 'border-primary bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <span className='block text-xs opacity-80'>Etapa {index + 1}</span>
            <span className='font-medium'>{item}</span>
          </button>
        ))}
      </div>

      {!prerequisites.forms || !prerequisites.lists || !prerequisites.templates ? (
        <Alert>
          <AlertTitle>Pre-requisitos incompletos</AlertTitle>
          <AlertDescription>
            Para campanhas por email, tenha ao menos um formulário, uma lista e um template
            cadastrados no tenant atual.
          </AlertDescription>
        </Alert>
      ) : null}

      {step === 0 ? (
        <div className='grid gap-4 md:grid-cols-2'>
          <Field label='Nome'>
            <Input
              value={values.name}
              onChange={(event) => updateValue('name', event.target.value)}
              placeholder='Ex: Pesquisa NPS Julho'
              maxLength={255}
            />
          </Field>
          <Field label='Formulário'>
            <NativeSelect value={values.form} onChange={(value) => updateValue('form', value)}>
              <option value=''>Selecione um formulário</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {getFormLabel(form)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label='Descricao'>
            <textarea
              value={values.description}
              onChange={(event) => updateValue('description', event.target.value)}
              className='border-input bg-background min-h-28 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2'
              placeholder='Objetivo, segmento ou observações internas.'
            />
          </Field>
          <Field label='Canal de entrega'>
            <NativeSelect
              value={values.delivery_channel}
              onChange={(value) =>
                updateValue('delivery_channel', value as CampaignWizardValues['delivery_channel'])
              }
            >
              {DELIVERY_CHANNEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          {selectedForm ? (
            <ResourcePreview
              title={selectedForm.title}
              description={selectedForm.description || 'Formulário selecionado para a campanha.'}
              actions={
                <Link
                  href={`/dashboard/surveys/forms/${selectedForm.id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <Icons.edit className='mr-2 h-4 w-4' />
                  Editar formulário
                </Link>
              }
            >
              <div className='grid gap-3 text-sm md:grid-cols-3'>
                <div>
                  <span className='text-muted-foreground block'>Framework</span>
                  <Badge variant='outline'>{selectedForm.framework_code || 'Custom'}</Badge>
                </div>
                <div>
                  <span className='text-muted-foreground block'>Status</span>
                  <Badge variant='outline'>{selectedForm.status ?? 'DRAFT'}</Badge>
                </div>
                <div>
                  <span className='text-muted-foreground block'>ID</span>
                  <span className='font-mono text-xs'>{selectedForm.id}</span>
                </div>
              </div>
            </ResourcePreview>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className='grid gap-4 md:grid-cols-2'>
          {values.delivery_channel === DeliveryChannelEnum.EMAIL ? (
            <Field label='Lista de contatos'>
              <NativeSelect
                value={values.email_list ?? ''}
                onChange={(value) => updateValue('email_list', value)}
              >
                <option value=''>Selecione uma lista</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.contact_count} contatos) - {list.status ?? 'ACTIVE'}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          ) : (
            <Field label='URL do webhook'>
              <Input
                value={values.webhook_url ?? ''}
                onChange={(event) => updateValue('webhook_url', event.target.value)}
                placeholder='https://api.exemplo.com/webhooks/survey'
              />
            </Field>
          )}
          <div className='rounded-md border p-4'>
            <h3 className='font-medium'>Resumo do público</h3>
            <p className='text-muted-foreground mt-1 text-sm'>
              O backend segmenta os dados pelo tenant autenticado. A seleção exibida aqui já vem do
              tenant atual.
            </p>
          </div>
          {selectedList ? (
            <ResourcePreview
              title={selectedList.name}
              description={selectedList.description || 'Lista selecionada para envio por email.'}
              actions={
                <>
                  <Link
                    href={`/dashboard/contacts/lists/${selectedList.id}/contacts`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    <Icons.teams className='mr-2 h-4 w-4' />
                    Ver contatos
                  </Link>
                  <Link
                    href='/dashboard/contacts/lists'
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    <Icons.edit className='mr-2 h-4 w-4' />
                    Editar listas
                  </Link>
                </>
              }
            >
              <div className='grid gap-3 text-sm md:grid-cols-3'>
                <div>
                  <span className='text-muted-foreground block'>Contatos</span>
                  <span className='text-lg font-semibold tabular-nums'>
                    {selectedList.contact_count}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground block'>Status</span>
                  <Badge variant='outline'>{selectedList.status ?? 'ACTIVE'}</Badge>
                </div>
                <div>
                  <span className='text-muted-foreground block'>ID</span>
                  <span className='font-mono text-xs'>{selectedList.id}</span>
                </div>
              </div>
            </ResourcePreview>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className='grid gap-4 md:grid-cols-2'>
          <Field label='Template de email'>
            <NativeSelect
              value={values.email_template ?? ''}
              onChange={(value) => updateValue('email_template', value)}
              disabled={values.delivery_channel === DeliveryChannelEnum.WEBHOOK}
            >
              <option value=''>Selecione um template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.subject} - {template.status ?? 'ACTIVE'}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label='Tipo do step'>
            <NativeSelect
              value={values.step_type}
              onChange={(value) =>
                updateValue('step_type', value as CampaignWizardValues['step_type'])
              }
              disabled={values.delivery_channel === DeliveryChannelEnum.WEBHOOK}
            >
              {STEP_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label='Delay em dias'>
            <Input
              type='number'
              min={0}
              value={values.delay_days}
              onChange={(event) => updateValue('delay_days', Number(event.target.value))}
              disabled={values.delivery_channel === DeliveryChannelEnum.WEBHOOK}
            />
          </Field>
          <Field label='Condicao de envio'>
            <NativeSelect
              value={values.send_condition}
              onChange={(value) =>
                updateValue('send_condition', value as CampaignWizardValues['send_condition'])
              }
              disabled={values.delivery_channel === DeliveryChannelEnum.WEBHOOK}
            >
              {SEND_CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          {selectedTemplate ? (
            <ResourcePreview
              title={selectedTemplate.name}
              description={selectedTemplate.subject}
              actions={
                <Link
                  href={`/dashboard/email-templates/${selectedTemplate.id}/edit`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <Icons.edit className='mr-2 h-4 w-4' />
                  Editar template
                </Link>
              }
            >
              <div className='grid gap-3 text-sm md:grid-cols-3'>
                <div>
                  <span className='text-muted-foreground block'>Tipo</span>
                  <Badge variant='outline'>{selectedTemplate.template_type ?? 'WELCOME'}</Badge>
                </div>
                <div>
                  <span className='text-muted-foreground block'>Status</span>
                  <Badge variant='outline'>{selectedTemplate.status ?? 'ACTIVE'}</Badge>
                </div>
                <div>
                  <span className='text-muted-foreground block'>Idioma</span>
                  <span className='uppercase'>{selectedTemplate.language ?? '-'}</span>
                </div>
              </div>
            </ResourcePreview>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className='grid gap-4 md:grid-cols-3'>
          <Field label='Data de início' description='Opcional. Se vazio, a campanha fica rascunho.'>
            <Input
              type='date'
              value={values.start_date ?? ''}
              onChange={(event) => updateValue('start_date', event.target.value)}
            />
          </Field>
          <Field label='Horario'>
            <Input
              type='time'
              value={values.start_time ?? ''}
              onChange={(event) => updateValue('start_time', event.target.value)}
            />
          </Field>
          <Field label='Timezone'>
            <Input
              value={values.timezone}
              onChange={(event) => updateValue('timezone', event.target.value)}
              placeholder='America/Sao_Paulo'
            />
          </Field>
        </div>
      ) : null}

      {step === 4 ? (
        <div className='grid gap-3 rounded-md border p-4 text-sm md:grid-cols-2'>
          <div>
            <span className='text-muted-foreground block'>Campanha</span>
            <span className='font-medium'>{values.name || '-'}</span>
          </div>
          <div>
            <span className='text-muted-foreground block'>Canal</span>
            <Badge variant='outline'>{values.delivery_channel}</Badge>
          </div>
          <div>
            <span className='text-muted-foreground block'>Formulário</span>
            <span>{selectedForm?.title ?? '-'}</span>
          </div>
          <div>
            <span className='text-muted-foreground block'>Lista</span>
            <span>{selectedList?.name ?? '-'}</span>
          </div>
          <div>
            <span className='text-muted-foreground block'>Template</span>
            <span>{selectedTemplate?.name ?? '-'}</span>
          </div>
          <div>
            <span className='text-muted-foreground block'>Agendamento</span>
            <span>
              {values.start_date && values.start_time
                ? `${values.start_date} ${values.start_time} (${values.timezone})`
                : 'Sem agendamento'}
            </span>
          </div>
        </div>
      ) : null}

      <div className='flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between'>
        <Button
          type='button'
          variant='outline'
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0 || isSubmitting}
        >
          Voltar
        </Button>
        <div className='flex justify-end gap-2'>
          {step < STEPS.length - 1 ? (
            <Button
              type='button'
              onClick={() => {
                if (validateCurrentStep()) {
                  setStep((current) => Math.min(current + 1, STEPS.length - 1));
                }
              }}
              disabled={isSubmitting}
            >
              Proxima etapa
              <Icons.chevronRight className='ml-2 h-4 w-4' />
            </Button>
          ) : (
            <Button
              type='button'
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !prerequisites.forms}
            >
              {isSubmitting ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : null}
              Criar campanha
            </Button>
          )}
        </div>
      </div>
    </ModuleFormCard>
  );
}
