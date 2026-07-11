'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  getSurveysFormsListQueryKey,
  useSurveysFormsList,
  useSurveysFormsTemplatesCloneCreate,
  useSurveysFormsTemplatesList
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import type { PaginatedFormList } from '@/lib/api/generated/model/paginatedFormList';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';

function TemplateCardSkeleton() {
  return (
    <Card className='flex flex-col'>
      <CardHeader className='gap-2'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </CardHeader>
      <CardContent className='flex-1' />
      <CardFooter>
        <Skeleton className='h-9 w-full' />
      </CardFooter>
    </Card>
  );
}

type TemplateCardProps = {
  template: Form;
};

function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const cloneMutation = useSurveysFormsTemplatesCloneCreate({
    mutation: {
      onSuccess: async (response) => {
        const cloned = getOrvalResponseData<Form>(response);

        await queryClient.invalidateQueries({ queryKey: getSurveysFormsListQueryKey() });

        notifySuccess(
          'Formulário criado a partir do template!',
          'Agora você pode editar e publicar seu formulário.'
        );

        if (cloned?.id) {
          router.push(`/dashboard/surveys/forms/${cloned.id}/questions`);
        }
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível clonar o template.');
      }
    }
  });

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-base leading-snug'>{template.title}</CardTitle>
          <Badge variant='outline' className='shrink-0 text-xs'>
            {template.question_count} perguntas
          </Badge>
        </div>
        {template.description ? (
          <CardDescription className='line-clamp-3 text-sm'>{template.description}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className='flex-1' />

      <CardFooter>
        <Button
          className='w-full'
          onClick={() => cloneMutation.mutate({ id: template.id, data: template as never })}
          isLoading={cloneMutation.isPending}
          disabled={cloneMutation.isPending}
        >
          {!cloneMutation.isPending && <Icons.add className='mr-2 h-4 w-4' />}
          Usar este template
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SurveyFormTemplates() {
  const templatesQuery = useSurveysFormsTemplatesList();
  const templates = getOrvalResponseData<Form[]>(templatesQuery.data) ?? [];

  const activeFormsQuery = useSurveysFormsList(
    { status: Status37cEnum.ACTIVE, page_size: '1' },
    { query: { staleTime: 30_000 } }
  );
  const activeFormsCount =
    getOrvalResponseData<PaginatedFormList>(activeFormsQuery.data)?.count ?? 0;

  const isLoading = templatesQuery.isPending || activeFormsQuery.isPending;

  // Hide suggestion once the tenant has at least 1 active form
  if (!isLoading && (activeFormsCount > 0 || templates.length === 0 || templatesQuery.isError)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <div className='space-y-1'>
          <h2 className='text-sm font-semibold'>Templates disponíveis</h2>
          <p className='text-muted-foreground text-xs'>
            Comece com um template pronto e personalize conforme sua necessidade.
          </p>
        </div>
        <div className='grid gap-4 grid-cols-1 pb-4'>
          <TemplateCardSkeleton />
        </div>
      </div>
    );
  }

  if (templatesQuery.isError || templates.length === 0) {
    return null;
  }

  return (
    <div className='space-y-3'>
      <div className='space-y-1'>
        <h2 className='text-sm font-semibold'>Templates disponíveis</h2>
        <p className='text-muted-foreground text-xs'>
          Comece com um template pronto e personalize conforme sua necessidade. Clonar cria uma
          cópia editável no seu workspace.
        </p>
      </div>

      <div className='grid gap-4 grid-cols-1'>
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
