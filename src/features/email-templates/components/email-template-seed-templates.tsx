'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  getEmailTemplatesListQueryKey,
  useEmailTemplatesCloneCreate,
  useEmailTemplatesGlobalList
} from '@/lib/api/generated/endpoints';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';

import { getEmailTemplateTypeLabel } from './templates-table/options';

function TemplateCardSkeleton() {
  return (
    <Card className='flex flex-col'>
      <CardHeader className='gap-2'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </CardHeader>
      <CardFooter>
        <Skeleton className='h-9 w-full' />
      </CardFooter>
    </Card>
  );
}

type SeedTemplateCardProps = {
  template: EmailTemplate;
  onCloned: () => void;
};

function SeedTemplateCard({ template, onCloned }: SeedTemplateCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const cloneMutation = useEmailTemplatesCloneCreate({
    mutation: {
      onSuccess: async (response) => {
        const cloned = getOrvalResponseData<EmailTemplate>(response);
        await queryClient.invalidateQueries({ queryKey: getEmailTemplatesListQueryKey() });
        notifySuccess(
          'Template criado a partir do modelo!',
          'Agora você pode editar e personalizar seu template.'
        );
        onCloned();
        if (cloned?.id) {
          router.push(`/dashboard/email-templates/${cloned.id}/edit`);
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
          <CardTitle className='text-base leading-snug'>{template.name}</CardTitle>
          <Badge variant='outline' className='shrink-0 text-xs'>
            {getEmailTemplateTypeLabel(template.template_type)}
          </Badge>
        </div>
        {template.subject ? (
          <CardDescription className='line-clamp-2 text-sm'>{template.subject}</CardDescription>
        ) : null}
      </CardHeader>

      <CardFooter className='mt-auto'>
        <Button
          className='w-full'
          onClick={() => cloneMutation.mutate({ id: template.id, data: template as never })}
          isLoading={cloneMutation.isPending}
          disabled={cloneMutation.isPending}
        >
          {!cloneMutation.isPending && <Icons.add className='mr-2 h-4 w-4' />}
          Usar este modelo
        </Button>
      </CardFooter>
    </Card>
  );
}

type EmailTemplateSeedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EmailTemplateSeedDialog({ open, onOpenChange }: EmailTemplateSeedDialogProps) {
  const globalTemplatesQuery = useEmailTemplatesGlobalList({
    query: { enabled: open, staleTime: 60_000 }
  });
  const globalTemplates = getOrvalResponseData<EmailTemplate[]>(globalTemplatesQuery.data) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Escolher modelo</DialogTitle>
          <DialogDescription>
            Selecione um modelo pronto. Uma cópia editável será criada no seu workspace.
          </DialogDescription>
        </DialogHeader>

        {globalTemplatesQuery.isPending ? (
          <div className='grid gap-4 sm:grid-cols-2'>
            <TemplateCardSkeleton />
            <TemplateCardSkeleton />
            <TemplateCardSkeleton />
          </div>
        ) : globalTemplatesQuery.isError || globalTemplates.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            Nenhum modelo disponível no momento.
          </p>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2'>
            {globalTemplates.map((template) => (
              <SeedTemplateCard
                key={template.id}
                template={template}
                onCloned={() => onOpenChange(false)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
