'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { ModuleFormCard } from '@/features/platform/components/module-form-card';
import { ModuleFormSkeleton } from '@/features/platform/components/module-form-skeleton';
import { notifyError } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  getCampaignsRetrieveQueryKey,
  getCampaignsStepsListQueryKey,
  useCampaignsRetrieve,
  useCampaignsStepsCreate,
  useCampaignsStepsDestroy,
  useCampaignsStepsList,
  useCampaignsStepsPartialUpdate,
  useEmailTemplatesList
} from '@/lib/api/generated/endpoints';
import type { Campaign } from '@/lib/api/generated/model/campaign';
import type { CampaignStep } from '@/lib/api/generated/model/campaignStep';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import { SendConditionEnum } from '@/lib/api/generated/model/sendConditionEnum';
import { Status372Enum } from '@/lib/api/generated/model/status372Enum';
import { StepTypeEnum } from '@/lib/api/generated/model/stepTypeEnum';

import {
  SEND_CONDITION_OPTIONS,
  STEP_TYPE_OPTIONS,
  getCollectionItems
} from '../lib/campaign-utils';
import { campaignStepSchema, type CampaignStepFormValues } from '../schemas/campaign';

type CampaignStepsManagerProps = {
  campaignId: string;
};

type FormMode = 'create' | 'edit';

const DEFAULT_VALUES: CampaignStepFormValues = {
  step_type: StepTypeEnum.REMINDER,
  order: 1,
  email_template: '',
  delay_days: 0,
  delay_hours: 0,
  send_condition: SendConditionEnum.IF_NOT_RESPONDED
};

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

function getStepTypeLabel(value?: CampaignStep['step_type']) {
  return STEP_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? 'Lembrete';
}

function getConditionLabel(value?: CampaignStep['send_condition']) {
  return SEND_CONDITION_OPTIONS.find((option) => option.value === value)?.label ?? 'Sempre';
}

export function CampaignStepsManager({ campaignId }: CampaignStepsManagerProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedStep, setSelectedStep] = useState<CampaignStep | null>(null);
  const [deleteStep, setDeleteStep] = useState<CampaignStep | null>(null);
  const [values, setValues] = useState<CampaignStepFormValues>(DEFAULT_VALUES);

  const campaignQuery = useCampaignsRetrieve(campaignId);
  const stepsQuery = useCampaignsStepsList(campaignId);
  const templatesQuery = useEmailTemplatesList(
    { status: Status372Enum.ACTIVE },
    { query: { staleTime: 60_000 } }
  );

  const invalidateSteps = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getCampaignsStepsListQueryKey(campaignId) }),
      queryClient.invalidateQueries({ queryKey: getCampaignsRetrieveQueryKey(campaignId) })
    ]);
  };

  const createMutation = useCampaignsStepsCreate({
    mutation: {
      onSuccess: async () => {
        await invalidateSteps();
        toast.success('Step criado com sucesso.');
        setIsDialogOpen(false);
      },
      onError: (error) => notifyError(error, 'Nao foi possivel criar o step.')
    }
  });
  const updateMutation = useCampaignsStepsPartialUpdate({
    mutation: {
      onSuccess: async () => {
        await invalidateSteps();
        toast.success('Step atualizado com sucesso.');
        setIsDialogOpen(false);
      },
      onError: (error) => notifyError(error, 'Nao foi possivel atualizar o step.')
    }
  });
  const destroyMutation = useCampaignsStepsDestroy({
    mutation: {
      onSuccess: async () => {
        await invalidateSteps();
        toast.success('Step removido com sucesso.');
        setDeleteStep(null);
      },
      onError: (error) => notifyError(error, 'Nao foi possivel remover o step.')
    }
  });

  const campaign = getOrvalResponseData<Campaign>(campaignQuery.data);
  const steps = useMemo(
    () =>
      getCollectionItems(
        getOrvalResponseData<CampaignStep[] | { results?: CampaignStep[] }>(stepsQuery.data)
      ).toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [stepsQuery.data]
  );
  const templates = getCollectionItems(
    getOrvalResponseData<EmailTemplate[] | { results?: EmailTemplate[] }>(templatesQuery.data)
  );
  const templateMap = useMemo(
    () => new Map(templates.map((template) => [template.id, template])),
    [templates]
  );
  const isMutating =
    createMutation.isPending || updateMutation.isPending || destroyMutation.isPending;

  function updateValue<TKey extends keyof CampaignStepFormValues>(
    key: TKey,
    value: CampaignStepFormValues[TKey]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function openCreateDialog() {
    setFormMode('create');
    setSelectedStep(null);
    setValues({
      ...DEFAULT_VALUES,
      order: steps.length + 1
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(step: CampaignStep) {
    setFormMode('edit');
    setSelectedStep(step);
    setValues({
      step_type: step.step_type ?? StepTypeEnum.REMINDER,
      order: step.order ?? 1,
      email_template: step.email_template,
      delay_days: step.delay_days ?? 0,
      delay_hours: step.delay_hours ?? 0,
      send_condition: step.send_condition ?? SendConditionEnum.IF_NOT_RESPONDED
    });
    setIsDialogOpen(true);
  }

  async function submitStep() {
    const parsed = campaignStepSchema.safeParse(values);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Revise os dados do step.');
      return;
    }

    if (formMode === 'create') {
      await createMutation.mutateAsync({
        campaignId,
        data: parsed.data
      });
      return;
    }

    if (!selectedStep) {
      return;
    }

    await updateMutation.mutateAsync({
      campaignId,
      stepId: selectedStep.id,
      data: parsed.data
    });
  }

  if (campaignQuery.isPending || stepsQuery.isPending || templatesQuery.isPending) {
    return <ModuleFormSkeleton fieldCount={4} withTextarea={false} />;
  }

  if (campaignQuery.isError || stepsQuery.isError || templatesQuery.isError) {
    return (
      <ModuleErrorAlert
        error={campaignQuery.error ?? stepsQuery.error ?? templatesQuery.error}
        title='Erro ao carregar steps'
        fallbackMessage='Nao foi possivel carregar a campanha, steps ou templates.'
      />
    );
  }

  return (
    <ModuleFormCard
      title='Steps da campanha'
      description={
        campaign?.name
          ? `Sequencia de envios da campanha ${campaign.name}.`
          : 'Sequencia de envios da campanha.'
      }
      contentClassName='space-y-4'
      footer={
        <Button onClick={openCreateDialog} disabled={isMutating || templates.length === 0}>
          <Icons.add className='mr-2 h-4 w-4' />
          Novo step
        </Button>
      }
    >
      {templates.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhum template ativo</AlertTitle>
          <AlertDescription>
            Crie ou ative um template de email antes de cadastrar steps.
          </AlertDescription>
        </Alert>
      ) : null}

      {steps.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhum step cadastrado</AlertTitle>
          <AlertDescription>
            Adicione o primeiro step para definir a sequencia de envio da campanha.
          </AlertDescription>
        </Alert>
      ) : (
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Condicao</TableHead>
                <TableHead className='w-24 text-right'>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell className='font-medium'>{step.order ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{getStepTypeLabel(step.step_type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex min-w-[240px] flex-col'>
                      <span>
                        {templateMap.get(step.email_template)?.name ?? step.email_template}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        {templateMap.get(step.email_template)?.subject ?? 'Template externo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {step.delay_days ?? 0}d {step.delay_hours ?? 0}h
                  </TableCell>
                  <TableCell>{getConditionLabel(step.send_condition)}</TableCell>
                  <TableCell>
                    <div className='flex justify-end gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        aria-label='Editar step'
                        onClick={() => openEditDialog(step)}
                        disabled={isMutating}
                      >
                        <Icons.edit className='h-4 w-4' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        aria-label='Excluir step'
                        className='text-destructive hover:text-destructive'
                        onClick={() => setDeleteStep(step)}
                        disabled={isMutating}
                      >
                        <Icons.trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isMutating) {
            setIsDialogOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Novo step' : 'Editar step'}</DialogTitle>
            <DialogDescription>
              Defina template, ordem, delay e condicao de envio.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Tipo</Label>
              <NativeSelect
                value={values.step_type}
                onChange={(value) =>
                  updateValue('step_type', value as CampaignStepFormValues['step_type'])
                }
                disabled={isMutating}
              >
                {STEP_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className='space-y-2'>
              <Label>Ordem</Label>
              <Input
                type='number'
                min={0}
                value={values.order}
                onChange={(event) => updateValue('order', Number(event.target.value))}
                disabled={isMutating}
              />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Template</Label>
              <NativeSelect
                value={values.email_template}
                onChange={(value) => updateValue('email_template', value)}
                disabled={isMutating}
              >
                <option value=''>Selecione um template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.subject}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className='space-y-2'>
              <Label>Delay em dias</Label>
              <Input
                type='number'
                min={0}
                value={values.delay_days}
                onChange={(event) => updateValue('delay_days', Number(event.target.value))}
                disabled={isMutating}
              />
            </div>
            <div className='space-y-2'>
              <Label>Delay em horas</Label>
              <Input
                type='number'
                min={0}
                value={values.delay_hours}
                onChange={(event) => updateValue('delay_hours', Number(event.target.value))}
                disabled={isMutating}
              />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Condicao</Label>
              <NativeSelect
                value={values.send_condition}
                onChange={(value) =>
                  updateValue('send_condition', value as CampaignStepFormValues['send_condition'])
                }
                disabled={isMutating}
              >
                {SEND_CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)} disabled={isMutating}>
              Cancelar
            </Button>
            <Button onClick={() => void submitStep()} disabled={isMutating}>
              {isMutating ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : null}
              {formMode === 'create' ? 'Criar step' : 'Salvar alteracoes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteStep)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteStep(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir step?</AlertDialogTitle>
            <AlertDialogDescription>
              O step selecionado sera removido da sequencia desta campanha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isMutating || !deleteStep}
              onClick={(event) => {
                event.preventDefault();

                if (!deleteStep) {
                  return;
                }

                void destroyMutation.mutateAsync({
                  campaignId,
                  stepId: deleteStep.id
                });
              }}
            >
              Excluir step
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModuleFormCard>
  );
}
