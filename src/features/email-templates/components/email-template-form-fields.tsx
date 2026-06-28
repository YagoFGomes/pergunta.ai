'use client';

import { useFormFields } from '@/components/ui/tanstack-form';
import {
  emailTemplateFieldSchemas,
  type EmailTemplateFormValues
} from '@/features/email-templates/schemas/email-template';

import {
  EMAIL_TEMPLATE_STATUS_OPTIONS,
  EMAIL_TEMPLATE_TYPE_OPTIONS
} from './templates-table/options';

type EmailTemplateFormFieldsProps = {
  disabled?: boolean;
};

export function EmailTemplateFormFields({ disabled = false }: EmailTemplateFormFieldsProps) {
  const { FormTextField, FormTextareaField, FormSelectField } =
    useFormFields<EmailTemplateFormValues>();

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2'>
        <FormTextField
          name='name'
          label='Nome'
          required
          placeholder='Ex: Convite NPS'
          maxLength={255}
          validators={{
            onBlur: emailTemplateFieldSchemas.name
          }}
          disabled={disabled}
        />

        <FormTextField
          name='slug'
          label='Slug'
          required
          placeholder='convite-nps'
          maxLength={100}
          validators={{
            onBlur: emailTemplateFieldSchemas.slug
          }}
          disabled={disabled}
        />

        <FormSelectField
          name='template_type'
          label='Tipo'
          required
          options={EMAIL_TEMPLATE_TYPE_OPTIONS}
          validators={{
            onBlur: emailTemplateFieldSchemas.template_type
          }}
          disabled={disabled}
        />

        <FormSelectField
          name='status'
          label='Status'
          required
          options={EMAIL_TEMPLATE_STATUS_OPTIONS}
          validators={{
            onBlur: emailTemplateFieldSchemas.status
          }}
          disabled={disabled}
        />
      </div>

      <FormTextField
        name='subject'
        label='Assunto'
        required
        placeholder='Sua pesquisa esta pronta, {{ contact_name }}'
        maxLength={255}
        validators={{
          onBlur: emailTemplateFieldSchemas.subject
        }}
        disabled={disabled}
      />

      <FormTextareaField
        name='html_content'
        label='Conteudo HTML'
        required
        rows={7}
        validators={{
          onBlur: emailTemplateFieldSchemas.html_content
        }}
        disabled={disabled}
      />

      <FormTextareaField
        name='plain_text_content'
        label='Conteudo texto'
        rows={4}
        validators={{
          onBlur: emailTemplateFieldSchemas.plain_text_content
        }}
        disabled={disabled}
      />

      <div className='grid gap-4 md:grid-cols-[1fr_160px]'>
        <FormTextField
          name='requiredVariablesText'
          label='Variaveis obrigatorias'
          placeholder='contact_name, survey_link'
          validators={{
            onBlur: emailTemplateFieldSchemas.requiredVariablesText
          }}
          disabled={disabled}
        />

        <FormTextField
          name='language'
          label='Idioma'
          required
          placeholder='pt-BR'
          maxLength={10}
          validators={{
            onBlur: emailTemplateFieldSchemas.language
          }}
          disabled={disabled}
        />
      </div>
    </>
  );
}
