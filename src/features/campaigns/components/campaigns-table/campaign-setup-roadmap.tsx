'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useCampaignsList,
  useContactsListsList,
  useEmailTemplatesList,
  useSurveysFormsList
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import type { Campaign } from '@/lib/api/generated/model/campaign';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  deriveCampaignSetupProgress,
  isValidContactList,
  isValidEmailTemplate,
  isValidSurveyForm,
  resolveCampaignSetupQueryState,
  type CampaignSetupStep,
  type CampaignSetupStepStatus
} from '@/features/campaigns/lib/campaign-setup-progress';
import {
  getCollectionItems,
  type MaybePaginatedCampaigns
} from '@/features/campaigns/schemas/campaign';

type CampaignSetupRoadmapProps = {
  existingCampaignCount?: number;
  isCampaignCountFiltered?: boolean;
};

function StepStatusBadge({ status }: { status: CampaignSetupStepStatus }) {
  if (status === 'completed') {
    return (
      <Badge variant='outline' className='gap-1 border-emerald-500/30 text-emerald-700'>
        <Icons.check className='h-3 w-3' />
        Concluído
      </Badge>
    );
  }

  if (status === 'current') {
    return (
      <Badge className='gap-1'>
        <Icons.chevronRight className='h-3 w-3' />
        Próximo passo
      </Badge>
    );
  }

  if (status === 'blocked') {
    return (
      <Badge variant='outline' className='gap-1 border-amber-500/30 text-amber-700'>
        <Icons.lock className='h-3 w-3' />
        Bloqueado
      </Badge>
    );
  }

  return (
    <Badge variant='outline' className='gap-1'>
      <Icons.clock className='h-3 w-3' />
      Pendente
    </Badge>
  );
}

function StepCard({ step }: { step: CampaignSetupStep }) {
  const isCurrent = step.status === 'current';
  const isCompleted = step.status === 'completed';

  return (
    <article
      className={cn(
        'rounded-lg border p-4',
        isCurrent && 'border-primary bg-primary/5',
        isCompleted && 'bg-muted/30'
      )}
      aria-current={isCurrent ? 'step' : undefined}
    >
      <div className='flex items-start justify-between gap-2'>
        <h3 className='text-sm font-semibold'>{step.title}</h3>
        <StepStatusBadge status={step.status} />
      </div>
      <p className='text-muted-foreground mt-2 text-sm'>{step.description}</p>
      <p className='text-muted-foreground mt-3 text-xs'>{step.helperText}</p>

      <div className='mt-4 flex flex-wrap gap-2'>
        <Link
          href={step.href}
          aria-disabled={step.status === 'blocked'}
          className={cn(
            buttonVariants({ size: 'sm', variant: isCurrent ? 'default' : 'outline' }),
            step.status === 'blocked' && 'pointer-events-none opacity-60'
          )}
        >
          {step.primaryActionLabel}
        </Link>

        {step.secondaryActionLabel ? (
          <Link href={step.href} className={buttonVariants({ size: 'sm', variant: 'ghost' })}>
            {step.secondaryActionLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function RoadmapSkeleton() {
  return (
    <Card>
      <CardHeader className='space-y-3'>
        <Skeleton className='h-5 w-44' />
        <Skeleton className='h-4 w-80 max-w-full' />
        <Skeleton className='h-2 w-full' />
      </CardHeader>
      <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-44 w-full rounded-lg' />
        ))}
      </CardContent>
    </Card>
  );
}

export function CampaignSetupRoadmap({
  existingCampaignCount,
  isCampaignCountFiltered = false
}: CampaignSetupRoadmapProps) {
  const [isOpen, setIsOpen] = useState(false);

  const listsQuery = useContactsListsList(undefined, {
    query: { staleTime: 60_000 }
  });
  const formsQuery = useSurveysFormsList({ page_size: '100' }, { query: { staleTime: 60_000 } });
  const templatesQuery = useEmailTemplatesList(undefined, {
    query: { staleTime: 60_000 }
  });

  const needsCampaignCountQuery = existingCampaignCount === undefined || isCampaignCountFiltered;
  const campaignsQuery = useCampaignsList(undefined, {
    query: {
      enabled: needsCampaignCountQuery,
      staleTime: 60_000
    }
  });

  const lists =
    getCollectionItems(
      getOrvalResponseData<EmailList[] | { results?: EmailList[] }>(listsQuery.data)
    ) ?? [];
  const forms =
    getCollectionItems(getOrvalResponseData<Form[] | { results?: Form[] }>(formsQuery.data)) ?? [];
  const templates =
    getCollectionItems(
      getOrvalResponseData<EmailTemplate[] | { results?: EmailTemplate[] }>(templatesQuery.data)
    ) ?? [];
  const validLists = useMemo(() => lists.filter(isValidContactList), [lists]);
  const validForms = useMemo(() => forms.filter(isValidSurveyForm), [forms]);
  const validTemplates = useMemo(() => templates.filter(isValidEmailTemplate), [templates]);

  const campaignCountFromQuery = useMemo(() => {
    if (!needsCampaignCountQuery) {
      return existingCampaignCount ?? 0;
    }

    const response = getOrvalResponseData<MaybePaginatedCampaigns>(campaignsQuery.data);
    return getCollectionItems<Campaign>(response).length;
  }, [campaignsQuery.data, existingCampaignCount, needsCampaignCountQuery]);

  const queryState = resolveCampaignSetupQueryState({
    isListsLoading: listsQuery.isPending,
    isFormsLoading: formsQuery.isPending,
    isTemplatesLoading: templatesQuery.isPending,
    isCampaignsLoading: needsCampaignCountQuery ? campaignsQuery.isPending : false,
    listsError: listsQuery.error,
    formsError: formsQuery.error,
    templatesError: templatesQuery.error,
    campaignsError: needsCampaignCountQuery ? campaignsQuery.error : null
  });

  const progress = useMemo(
    () =>
      deriveCampaignSetupProgress({
        validContactListsCount: validLists.length,
        validSurveyFormsCount: validForms.length,
        validEmailTemplatesCount: validTemplates.length,
        campaignsCount: campaignCountFromQuery
      }),
    [campaignCountFromQuery, validForms.length, validLists.length, validTemplates.length]
  );

  const showCompactMode = progress.hasCampaign;
  const shouldExpandByDefault = !showCompactMode;

  if (queryState.isLoading) {
    return <RoadmapSkeleton />;
  }

  if (queryState.hasError) {
    return (
      <Alert>
        <Icons.alertCircle className='h-4 w-4' />
        <AlertTitle>Não foi possível carregar o roadmap</AlertTitle>
        <AlertDescription>
          Tente novamente para atualizar o progresso de preparação da campanha.
        </AlertDescription>
        <div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              void listsQuery.refetch();
              void formsQuery.refetch();
              void templatesQuery.refetch();
              if (needsCampaignCountQuery) {
                void campaignsQuery.refetch();
              }
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </Alert>
    );
  }

  const roadmapContent = (
    <>
      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-base font-semibold'>Roadmap de criação de campanha</h2>
          <Badge variant='outline'>
            {progress.completedSteps}/{progress.totalSteps} concluídos
          </Badge>
        </div>
        <p className='text-muted-foreground text-sm'>
          Progresso baseado nos recursos reais do tenant atual. O próximo passo é destacado
          automaticamente.
        </p>
        <Progress value={progress.progressPercent} aria-label='Progresso do roadmap de campanha' />
      </div>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        {progress.steps.map((step) => (
          <StepCard key={step.key} step={step} />
        ))}
      </div>
    </>
  );

  if (!showCompactMode) {
    return (
      <Card>
        <CardContent className='space-y-5'>{roadmapContent}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} defaultOpen={shouldExpandByDefault}>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div className='space-y-1'>
              <CardTitle className='text-base'>Roadmap de criação de campanha</CardTitle>
              <CardDescription>
                Você já possui campanhas. Use o roadmap para preparar novos recursos quando
                necessário.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                {isOpen ? 'Ocultar roadmap' : 'Mostrar roadmap'}
                <Icons.chevronDown
                  className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <Progress
            value={progress.progressPercent}
            aria-label='Progresso do roadmap de campanha'
          />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className='space-y-5'>{roadmapContent}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
