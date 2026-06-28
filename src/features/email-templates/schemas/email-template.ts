import * as z from 'zod';

import type { EmailTemplate } from '@/lib/api/generated/model/emailTemplate';
import { Status372Enum } from '@/lib/api/generated/model/status372Enum';
import { TemplateTypeEnum } from '@/lib/api/generated/model/templateTypeEnum';

const slugRegex = /^[-a-zA-Z0-9_]+$/;
const variableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const templateVariableRegex = /{{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}}/g;

export const emailTemplateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Maximo de 255 caracteres.'),
  slug: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(100, 'Maximo de 100 caracteres.')
    .regex(slugRegex, 'Use apenas letras, numeros, hifen e underscore.'),
  template_type: z.nativeEnum(TemplateTypeEnum),
  subject: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Maximo de 255 caracteres.'),
  html_content: z.string().trim().min(1, 'Informe o conteudo HTML.'),
  plain_text_content: z.string().trim().optional(),
  requiredVariablesText: z
    .string()
    .trim()
    .refine(
      (value) => parseRequiredVariables(value).every((item) => variableNameRegex.test(item)),
      {
        message: 'Use nomes de variavel validos, como contact_name ou survey_link.'
      }
    )
    .refine(
      (value) => {
        const variables = parseRequiredVariables(value);
        return new Set(variables).size === variables.length;
      },
      { message: 'Remova variaveis duplicadas.' }
    ),
  language: z.string().trim().min(2, 'Informe o idioma.').max(10, 'Maximo de 10 caracteres.'),
  status: z.nativeEnum(Status372Enum)
});

export type EmailTemplateFormValues = z.infer<typeof emailTemplateFormSchema>;

export const emailTemplateFieldSchemas = emailTemplateFormSchema.shape;

export type EmailTemplatePayload = {
  name: string;
  slug: string;
  template_type: TemplateTypeEnum;
  subject: string;
  html_content: string;
  plain_text_content: string;
  required_variables: string[];
  language: string;
  status: Status372Enum;
  is_default?: boolean;
};

export function parseRequiredVariables(value: string) {
  return value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractTemplateVariables(value: string) {
  return Array.from(value.matchAll(templateVariableRegex), (match) => match[1]);
}

export function normalizeEmailTemplateValues(
  values: EmailTemplateFormValues,
  options: { isDefault?: boolean } = {}
): EmailTemplatePayload {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    template_type: values.template_type,
    subject: values.subject.trim(),
    html_content: values.html_content.trim(),
    plain_text_content: (values.plain_text_content || '').trim(),
    required_variables: parseRequiredVariables(values.requiredVariablesText),
    language: values.language.trim(),
    status: values.status,
    ...(options.isDefault !== undefined && { is_default: options.isDefault })
  };
}

export function getEmailTemplateFormValues(template: EmailTemplate): EmailTemplateFormValues {
  return {
    name: template.name,
    slug: template.slug,
    template_type: template.template_type ?? TemplateTypeEnum.WELCOME,
    subject: template.subject,
    html_content: template.html_content,
    plain_text_content: template.plain_text_content ?? '',
    requiredVariablesText: Array.isArray(template.required_variables)
      ? template.required_variables.join(', ')
      : '',
    language: template.language ?? 'pt-BR',
    status: template.status ?? Status372Enum.ACTIVE
  };
}

export function getMissingRequiredVariableDeclarations(payload: EmailTemplatePayload) {
  const declaredVariables = new Set(payload.required_variables);
  const variablesInTemplate = new Set([
    ...extractTemplateVariables(payload.subject),
    ...extractTemplateVariables(payload.html_content),
    ...extractTemplateVariables(payload.plain_text_content)
  ]);

  return Array.from(variablesInTemplate)
    .filter((variableName) => !declaredVariables.has(variableName))
    .toSorted();
}

export function getEmailTemplateRequiredVariables(template: EmailTemplate) {
  return Array.isArray(template.required_variables)
    ? template.required_variables.filter((item): item is string => typeof item === 'string')
    : [];
}

function getPreviewVariableFallback(variableName: string) {
  const lowerName = variableName.toLowerCase();

  if (lowerName.includes('name')) return 'Ana Souza';
  if (lowerName.includes('link') || lowerName.includes('url')) return 'https://pergunta.ai/s/demo';
  if (lowerName.includes('email')) return 'ana@example.com';
  if (lowerName.includes('company') || lowerName.includes('empresa')) return 'Pergunta.ai';

  return `Valor de ${variableName}`;
}

export function buildEmailTemplatePreviewVariables(requiredVariables: string[]) {
  return Object.fromEntries(
    requiredVariables.map((variableName) => [
      variableName,
      getPreviewVariableFallback(variableName)
    ])
  );
}
