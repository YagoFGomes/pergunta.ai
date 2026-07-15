'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import type { EditorRef } from 'react-email-editor';
import type { JSONTemplate } from '@unlayer/types';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
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
import { EmailTemplateStatusEnum } from '@/lib/api/generated/model/emailTemplateStatusEnum';
import { TemplateTypeEnum } from '@/lib/api/generated/model/templateTypeEnum';
import { cn } from '@/lib/utils';

// SSR-safe — Unlayer uses browser APIs
const EmailEditor = dynamic(() => import('react-email-editor'), {
  ssr: false,
  loading: () => (
    <div className='flex flex-1 items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-3'>
        <Icons.spinner className='text-muted-foreground h-5 w-5 animate-spin' />
        <span className='text-muted-foreground text-sm'>Carregando editor...</span>
      </div>
    </div>
  )
});

// Variables
const VARIABLES = [
  { key: 'contact_name', label: 'Nome do contato', sample: 'Mariana Silva' },
  {
    key: 'survey_link',
    label: 'Link da pesquisa',
    sample: 'https://pesquisa.exemplo.com/s/abc123'
  },
  {
    key: 'unsubscribe_link',
    label: 'Link de descadastro',
    sample: 'https://pesquisa.exemplo.com/u/abc'
  }
] as const;

const MERGE_TAGS = Object.fromEntries(
  VARIABLES.map(({ key, label, sample }) => [key, { name: label, value: `{{${key}}}`, sample }])
);

const SAMPLE_DATA: Record<string, string> = Object.fromEntries(
  VARIABLES.map(({ key, sample }) => [key, sample])
);

const VAR_RE = /{{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}}/g;

function extractVariables(text: string): string[] {
  const vars = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(VAR_RE.source, 'g');
  while ((m = re.exec(text)) !== null) vars.add(m[1]);
  return [...vars];
}

function applyPreviewData(html: string): string {
  return html.replace(VAR_RE, (_, key: string) => SAMPLE_DATA[key] ?? `{{${key}}}`);
}

// Status helpers
const STATUS_LABEL: Record<EmailTemplateStatusEnum, string> = {
  [EmailTemplateStatusEnum.DRAFT]: 'Rascunho',
  [EmailTemplateStatusEnum.ACTIVE]: 'Ativo',
  [EmailTemplateStatusEnum.INACTIVE]: 'Inativo'
};

// Left column — variable chips
function VariablesPanel() {
  const [copied, setCopied] = useState<string | null>(null);

  function copyVar(key: string) {
    void navigator.clipboard.writeText(`{{${key}}}`).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <aside className='flex w-52 shrink-0 flex-col gap-3 overflow-y-auto border-r bg-background p-4'>
      <h3 className='text-sm font-semibold'>Variáveis dinâmicas</h3>

      <div className='flex flex-col gap-2'>
        {VARIABLES.map(({ key }) => (
          <button
            key={key}
            onClick={() => copyVar(key)}
            title={`Copiar {{${key}}}`}
            className='group flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-left text-xs transition-colors hover:border-foreground/30 hover:bg-muted/60'
          >
            <span className='flex-1 font-mono text-muted-foreground group-hover:text-foreground'>
              {`{{${key}}}`}
            </span>
            {copied === key ? (
              <Icons.check className='h-3.5 w-3.5 text-green-600' />
            ) : (
              <Icons.copy className='h-3.5 w-3.5 opacity-0 group-hover:opacity-50' />
            )}
          </button>
        ))}
      </div>

      <p className='text-muted-foreground text-xs leading-relaxed'>
        Clique para copiar e cole no editor ou no campo de assunto.
      </p>

      <Separator />

      <p className='text-muted-foreground text-xs leading-relaxed'>
        Dentro do editor, digite{' '}
        <span className='rounded bg-muted px-1 font-mono text-[11px]'>{'{'}</span> para abrir o menu
        de variáveis.
      </p>
    </aside>
  );
}

// Right column live preview

// Settings sheet

type SettingsSheetProps = {
  slug: string;
  onSlugChange: (v: string) => void;
  templateType: TemplateTypeEnum;
  onTemplateTypeChange: (v: TemplateTypeEnum) => void;
  language: string;
  onLanguageChange: (v: string) => void;
};

function SettingsSheet({
  slug,
  onSlugChange,
  templateType,
  onTemplateTypeChange,
  language,
  onLanguageChange
}: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' title='Configurações'>
          <Icons.settings className='h-4 w-4' />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configurações</SheetTitle>
          <SheetDescription>Slug, tipo e idioma do template.</SheetDescription>
        </SheetHeader>
        <div className='mt-6 space-y-4'>
          <div className='space-y-1.5'>
            <label htmlFor='settings-slug' className='text-sm font-medium'>
              Slug
            </label>
            <Input
              id='settings-slug'
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder='meu-template'
              className='font-mono text-sm'
            />
            <p className='text-muted-foreground text-xs'>Letras, números, hífen e underscore.</p>
          </div>
          <div className='space-y-1.5'>
            <label htmlFor='settings-type' className='text-sm font-medium'>
              Tipo
            </label>
            <Select
              value={templateType}
              onValueChange={(v) => onTemplateTypeChange(v as TemplateTypeEnum)}
            >
              <SelectTrigger id='settings-type'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TemplateTypeEnum.WELCOME}>Welcome</SelectItem>
                <SelectItem value={TemplateTypeEnum.REMINDER}>Reminder</SelectItem>
                <SelectItem value={TemplateTypeEnum.FOLLOWUP}>Follow-up</SelectItem>
                <SelectItem value={TemplateTypeEnum.THANK_YOU}>Thank You</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'>
            <label htmlFor='settings-language' className='text-sm font-medium'>
              Idioma
            </label>
            <Input
              id='settings-language'
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              placeholder='pt-BR'
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main editor

type VisualEditorProps = { template: EmailTemplate };

function VisualEditor({ template }: VisualEditorProps) {
  const queryClient = useQueryClient();
  const editorRef = useRef<EditorRef>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [slug, setSlug] = useState(template.slug);
  const [templateType, setTemplateType] = useState<TemplateTypeEnum>(
    (template.template_type as TemplateTypeEnum) ?? TemplateTypeEnum.WELCOME
  );
  const [language, setLanguage] = useState(template.language ?? 'pt-BR');
  const [currentStatus, setCurrentStatus] = useState<EmailTemplateStatusEnum>(
    (template.status as EmailTemplateStatusEnum) ?? EmailTemplateStatusEnum.DRAFT
  );
  const [isSaving, setIsSaving] = useState(false);

  const updateMutation = useEmailTemplatesPartialUpdate({
    mutation: {
      onSuccess: async (response) => {
        const updated = getOrvalResponseData<EmailTemplate>(response);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getEmailTemplatesListQueryKey() }),
          queryClient.invalidateQueries({
            queryKey: getEmailTemplatesRetrieveQueryKey(updated?.id ?? template.id)
          })
        ]);
        notifySuccess('Template salvo!');
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível salvar o template.');
      }
    }
  });

  const handleReady = useCallback(
    (unlayer: NonNullable<EditorRef['editor']>) => {
      if (template.design_json) {
        unlayer.loadDesign(template.design_json as JSONTemplate);
      }
    },
    [template.design_json]
  );

  const save = useCallback(
    (targetStatus: EmailTemplateStatusEnum) => {
      const editor = editorRef.current?.editor;
      if (!editor) return;

      setIsSaving(true);

      editor.exportHtml(async (data) => {
        try {
          const { html, design } = data;
          const vars = extractVariables(html + ' ' + subject);

          await updateMutation.mutateAsync({
            id: template.id,
            data: {
              name,
              slug,
              subject,
              template_type: templateType,
              language,
              html_content: html || '<p></p>',
              plain_text_content: '',
              required_variables: vars,
              design_json: design as never,
              status: targetStatus as never
            }
          });

          setCurrentStatus(targetStatus);
        } finally {
          setIsSaving(false);
        }
      });
    },
    [name, slug, subject, templateType, language, template.id, updateMutation]
  );

  const isActive = currentStatus === EmailTemplateStatusEnum.ACTIVE;

  return (
    <div className='flex h-[calc(100svh-3.5rem)] w-full flex-col '>
      {/* Top bar */}
      <div className='flex flex-wrap items-center gap-2 border-b bg-background px-4 py-2'>
        <Link
          href='/dashboard/email-templates'
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'shrink-0')}
          title='Voltar'
        >
          <Icons.chevronLeft className='h-4 w-4' />
        </Link>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Nome do template'
          className='h-8 w-44 shrink-0 text-sm'
        />

        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder='Assunto do email — ex: Olá, {{contact_name}}!'
          className='h-8 min-w-50 flex-1 text-sm'
        />

        <Badge
          variant={
            isActive
              ? 'default'
              : currentStatus === EmailTemplateStatusEnum.DRAFT
                ? 'secondary'
                : 'outline'
          }
          className='shrink-0'
        >
          {STATUS_LABEL[currentStatus]}
        </Badge>

        <SettingsSheet
          slug={slug}
          onSlugChange={setSlug}
          templateType={templateType}
          onTemplateTypeChange={setTemplateType}
          language={language}
          onLanguageChange={setLanguage}
        />

        {isActive ? (
          <>
            <Button
              size='sm'
              isLoading={isSaving}
              disabled={isSaving}
              onClick={() => save(EmailTemplateStatusEnum.ACTIVE)}
            >
              Salvar
            </Button>
            <Button
              size='sm'
              variant='outline'
              isLoading={isSaving}
              disabled={isSaving}
              onClick={() => save(EmailTemplateStatusEnum.INACTIVE)}
            >
              Desativar
            </Button>
          </>
        ) : (
          <>
            <Button
              size='sm'
              variant='outline'
              isLoading={isSaving}
              disabled={isSaving}
              onClick={() => save(EmailTemplateStatusEnum.DRAFT)}
            >
              Salvar rascunho
            </Button>
            <Button
              size='sm'
              isLoading={isSaving}
              disabled={isSaving}
              onClick={() => save(EmailTemplateStatusEnum.ACTIVE)}
            >
              {currentStatus === EmailTemplateStatusEnum.INACTIVE ? 'Ativar' : 'Publicar'}
            </Button>
          </>
        )}
      </div>

      {/* Three-column body */}
      <div className='flex flex-1 overflow-hidden'>
        <VariablesPanel />

        <div className='relative min-w-0 flex-1'>
          <EmailEditor
            ref={editorRef}
            onReady={handleReady}
            style={{ position: 'absolute', inset: 0 }}
            options={{
              mergeTags: MERGE_TAGS,
              mergeTagsConfig: { autocompleteTriggerChar: '{' },
              features: {
                sendTestEmail: false,
                smartMergeTags: true
              },
              tools: {
                video: { enabled: false },
                timer: { enabled: false },
                social: { enabled: false },
                menu: { enabled: false },
                html: { enabled: false },
                form: { enabled: false }
              },
              appearance: { theme: 'modern_light' }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Public export with data loading ──────────────────────────────────────────

type EmailTemplateVisualEditorProps = { templateId: string };

export function EmailTemplateVisualEditor({ templateId }: EmailTemplateVisualEditorProps) {
  const templateQuery = useEmailTemplatesRetrieve(templateId);
  const template = getOrvalResponseData<EmailTemplate>(templateQuery.data);

  if (templateQuery.isPending) return <ModuleFormSkeleton fieldCount={4} />;

  if (templateQuery.isError) {
    return (
      <ModuleErrorAlert
        error={templateQuery.error}
        title='Erro ao carregar template'
        fallbackMessage='Não foi possível carregar os dados deste template.'
      />
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

  return <VisualEditor key={template.id} template={template} />;
}
