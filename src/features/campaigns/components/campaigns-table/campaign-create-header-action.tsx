'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  useContactsListsList,
  useEmailTemplatesList,
  useSurveysFormsList
} from '@/lib/api/generated/endpoints';
import type { EmailList } from '@/lib/api/generated/model/emailList';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import type { Form } from '@/lib/api/generated/model/form';
import {
  deriveCampaignSetupProgress,
  isValidContactList,
  isValidEmailTemplate,
  isValidSurveyForm
} from '@/features/campaigns/lib/campaign-setup-progress';
import { getCollectionItems } from '@/features/campaigns/schemas/campaign';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';

export function CampaignCreateHeaderAction() {
  const listsQuery = useContactsListsList(undefined, {
    query: { staleTime: 60_000 }
  });
  const formsQuery = useSurveysFormsList({ page_size: '100' }, { query: { staleTime: 60_000 } });
  const templatesQuery = useEmailTemplatesList(undefined, {
    query: { staleTime: 60_000 }
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

  const progress = useMemo(
    () =>
      deriveCampaignSetupProgress({
        validContactListsCount: validLists.length,
        validSurveyFormsCount: validForms.length,
        validEmailTemplatesCount: validTemplates.length,
        campaignsCount: 0
      }),
    [validForms.length, validLists.length, validTemplates.length]
  );

  const hasError = Boolean(listsQuery.error || formsQuery.error || templatesQuery.error);
  const isLoading = listsQuery.isPending || formsQuery.isPending || templatesQuery.isPending;
  const isDisabled = isLoading || hasError || !progress.canCreateCampaign;

  const disabledReason = hasError
    ? 'Não foi possível validar os pré-requisitos do roadmap.'
    : isLoading
      ? 'Validando pré-requisitos para criação de campanha...'
      : 'Conclua os passos do roadmap para habilitar a criação de campanhas.';

  if (isDisabled) {
    return (
      <Button size='sm' className='text-xs md:text-sm' disabled title={disabledReason}>
        <Icons.add className='mr-2 h-4 w-4' />
        Nova campanha
      </Button>
    );
  }

  return (
    <Button asChild size='sm' className='text-xs md:text-sm'>
      <Link href='/dashboard/campaigns/new'>
        <Icons.add className='mr-2 h-4 w-4' />
        Nova campanha
      </Link>
    </Button>
  );
}
