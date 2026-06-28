'use client';

import { useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  buildEmailTemplatePreviewVariables,
  getEmailTemplateRequiredVariables
} from '@/features/email-templates/schemas/email-template';
import { getErrorMessage, isAppApiError } from '@/features/platform/lib/api-error';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useEmailTemplatesPreviewCreate } from '@/lib/api/generated/endpoints';
import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';

type RenderedEmailTemplatePreview = {
  subject?: string;
  html_content?: string;
  plain_text_content?: string;
};

type EmailTemplatePreviewProps = {
  template: EmailTemplate;
};

function getMissingVariables(error: unknown) {
  if (!isAppApiError(error)) return [];

  const body = error.body;
  if (!body || typeof body !== 'object') return [];

  const missingVariables = (body as { missing_variables?: unknown }).missing_variables;
  return Array.isArray(missingVariables)
    ? missingVariables.filter((item): item is string => typeof item === 'string')
    : [];
}

export function EmailTemplatePreview({ template }: EmailTemplatePreviewProps) {
  const requiredVariables = useMemo(() => getEmailTemplateRequiredVariables(template), [template]);
  const [variables, setVariables] = useState<Record<string, string>>(() =>
    buildEmailTemplatePreviewVariables(requiredVariables)
  );
  const [preview, setPreview] = useState<RenderedEmailTemplatePreview | null>(null);

  const previewMutation = useEmailTemplatesPreviewCreate({
    mutation: {
      onSuccess: (response) => {
        setPreview(
          getOrvalResponseData<RenderedEmailTemplatePreview>(
            response as unknown as RenderedEmailTemplatePreview
          ) ?? null
        );
      }
    }
  });

  function updateVariable(variableName: string, value: string) {
    setVariables((currentVariables) => ({
      ...currentVariables,
      [variableName]: value
    }));
  }

  function resetVariables() {
    setVariables(buildEmailTemplatePreviewVariables(requiredVariables));
    setPreview(null);
  }

  async function renderPreview() {
    await previewMutation.mutateAsync({
      id: template.id,
      data: { variables }
    });
  }

  const isPending = previewMutation.isPending;
  const missingVariables = getMissingVariables(previewMutation.error);

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          Renderize o template com valores de exemplo antes de usar em campanhas.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {requiredVariables.length === 0 ? (
          <Alert>
            <Icons.info className='h-4 w-4' />
            <AlertTitle>Sem variáveis obrigatórias</AlertTitle>
            <AlertDescription>
              Este template não declarou variáveis. O preview pode ser renderizado diretamente.
            </AlertDescription>
          </Alert>
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            {requiredVariables.map((variableName) => (
              <div key={variableName} className='space-y-2'>
                <Label htmlFor={`preview-variable-${variableName}`}>{variableName}</Label>
                <Input
                  id={`preview-variable-${variableName}`}
                  value={variables[variableName] ?? ''}
                  onChange={(event) => updateVariable(variableName, event.target.value)}
                  disabled={isPending}
                />
              </div>
            ))}
          </div>
        )}

        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' onClick={resetVariables} disabled={isPending}>
            Restaurar exemplos
          </Button>
          <Button type='button' onClick={renderPreview} disabled={isPending}>
            {isPending ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : null}
            Gerar preview
          </Button>
        </div>

        {previewMutation.isError ? (
          <Alert variant='destructive'>
            <Icons.warning className='h-4 w-4' />
            <AlertTitle>Erro ao gerar preview</AlertTitle>
            <AlertDescription>
              {missingVariables.length > 0
                ? `Preencha as variáveis: ${missingVariables.join(', ')}.`
                : getErrorMessage(previewMutation.error, 'Não foi possível renderizar o preview.')}
            </AlertDescription>
          </Alert>
        ) : null}

        {preview ? (
          <div className='space-y-5'>
            <Separator />
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>Assunto</h3>
              <div className='bg-muted rounded-md px-3 py-2 text-sm'>
                {preview.subject || 'Sem assunto renderizado'}
              </div>
            </div>
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>HTML renderizado</h3>
              <div
                className='bg-background min-h-32 rounded-md border p-4 text-sm'
                // Backend sanitizes template HTML before saving; preview reflects saved content.
                dangerouslySetInnerHTML={{
                  __html: preview.html_content || '<p>Sem conteúdo HTML renderizado</p>'
                }}
              />
            </div>
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>Texto puro</h3>
              <pre className='bg-muted text-muted-foreground min-h-24 overflow-auto rounded-md p-3 text-sm whitespace-pre-wrap'>
                {preview.plain_text_content || 'Sem texto puro renderizado'}
              </pre>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
