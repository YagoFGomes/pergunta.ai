'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/components/ui/tanstack-form';
import { EmailTemplateFormFields } from '@/features/email-templates/components/email-template-form-fields';
import { EmailTemplatePreview } from '@/features/email-templates/components/email-template-preview';
import {
  emailTemplateFormSchema,
  getEmailTemplateFormValues,
  getMissingRequiredVariableDeclarations,
  normalizeEmailTemplateValues
} from '@/features/email-templates/schemas/email-template';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { ModuleFormActions } from '@/features/platform/components/module-form-actions';
import { ModuleFormCard } from '@/features/platform/components/module-form-card';
import { ModuleFormSkeleton } from '@/features/platform/components/module-form-skeleton';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  getEmailTemplatesListQueryKey,
  getEmailTemplatesRetrieveQueryKey,
  useEmailTemplatesPartialUpdate,
  useEmailTemplatesRetrieve
} from '@/lib/api/generated/endpoints';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';

const EDIT_EMAIL_TEMPLATE_FORM_ID = 'email-template-edit';

function formatDateTime(value?: string) {
  if (!value) return 'Data indisponível';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

type EmailTemplateEditorProps = {
  template: EmailTemplate;
};

function EmailTemplateEditor({ template }: EmailTemplateEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateMutation = useEmailTemplatesPartialUpdate({
    mutation: {
      onSuccess: async (response) => {
        const updatedTemplate = getOrvalResponseData<EmailTemplate>(response);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getEmailTemplatesListQueryKey() }),
          queryClient.invalidateQueries({
            queryKey: getEmailTemplatesRetrieveQueryKey(updatedTemplate?.id ?? template.id)
          })
        ]);

        notifySuccess('Template atualizado.');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível atualizar o template.');
      }
    }
  });

  const form = useAppForm({
    defaultValues: getEmailTemplateFormValues(template),
    validators: {
      onSubmit: emailTemplateFormSchema
    },
    onSubmit: async ({ value }) => {
      const parsed = emailTemplateFormSchema.safeParse(value);

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? 'Revise os campos do template.');
        return;
      }

      const normalized = normalizeEmailTemplateValues(parsed.data);
      const missingVariables = getMissingRequiredVariableDeclarations(normalized);

      if (missingVariables.length > 0) {
        toast.error(`Declare as variáveis usadas no template: ${missingVariables.join(', ')}.`);
        return;
      }

      await updateMutation.mutateAsync({
        id: template.id,
        data: normalized
      });
    }
  });

  const isPending = updateMutation.isPending;

  return (
    <div className='space-y-6'>
      <ModuleFormCard
        title='Editar template'
        description='Atualize assunto, conteúdo e variáveis obrigatórias do template.'
        footer={
          <ModuleFormActions
            mode='edit'
            formId={EDIT_EMAIL_TEMPLATE_FORM_ID}
            isPending={isPending}
            submitLabel='Salvar alterações'
            onCancel={() => router.push('/dashboard/email-templates')}
          />
        }
      >
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertTitle>
            {template.is_default ? 'Template padrao' : 'Template customizado'}
          </AlertTitle>
          <AlertDescription>
            Criado em {formatDateTime(template.created_at)}. Última atualização em{' '}
            {formatDateTime(template.updated_at)}.
          </AlertDescription>
        </Alert>

        <form.AppForm>
          <form.Form id={EDIT_EMAIL_TEMPLATE_FORM_ID} className='space-y-4 p-0 md:p-0'>
            <EmailTemplateFormFields disabled={isPending} />
          </form.Form>
        </form.AppForm>
      </ModuleFormCard>

      <EmailTemplatePreview template={template} />
    </div>
  );
}

type EmailTemplateEditProps = {
  templateId: string;
};

export function EmailTemplateEdit({ templateId }: EmailTemplateEditProps) {
  const templateQuery = useEmailTemplatesRetrieve(templateId);
  const template = getOrvalResponseData<EmailTemplate>(templateQuery.data);

  if (templateQuery.isPending) {
    return <ModuleFormSkeleton fieldCount={6} />;
  }

  if (templateQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={templateQuery.error}
          title='Erro ao carregar template'
          fallbackMessage='Não foi possível carregar os dados deste template.'
        />
        <div>
          <Button variant='outline' onClick={() => templateQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <ModuleErrorAlert
        title='Template não encontrado'
        message='Não encontramos dados para este template.'
      />
    );
  }

  return <EmailTemplateEditor key={template.id} template={template} />;
}
