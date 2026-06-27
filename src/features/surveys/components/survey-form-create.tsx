'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { ModuleFormActions } from '@/features/platform/components/module-form-actions';
import { ModuleFormCard } from '@/features/platform/components/module-form-card';
import { ModuleFormSection } from '@/features/platform/components/module-form-section';
import { ModuleFormSkeleton } from '@/features/platform/components/module-form-skeleton';
import { resolveModuleFormDefaults } from '@/features/platform/lib/module-form';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { notifyError, notifySuccess } from '@/features/platform/lib/notifications';
import {
  getSurveysFormsListQueryKey,
  useSurveysFormsCreate,
  useSurveysFrameworksList,
  type SurveysFormsCreateMutationBody
} from '@/lib/api/generated/endpoints';
import type { Form } from '@/lib/api/generated/model/form';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';
import { cn } from '@/lib/utils';

import { buildSurveyFrameworkSelectOptions } from './forms-table/options';
import {
  surveyFormCreateFieldSchemas,
  surveyFormCreateFormConfig,
  type SurveyFormCreateValues
} from '../schemas/survey-form';

const CREATE_SURVEY_FORM_ID = 'survey-form-create';
const EMPTY_FRAMEWORKS: SurveyFramework[] = [];

function toCreatePayload(values: SurveyFormCreateValues): SurveysFormsCreateMutationBody {
  const description = values.description.trim();

  return {
    framework: values.framework,
    title: values.title.trim(),
    ...(description && { description })
  } as SurveysFormsCreateMutationBody;
}

export function SurveyFormCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const frameworksQuery = useSurveysFrameworksList(
    { is_active: 'true' },
    {
      query: {
        staleTime: 60_000
      }
    }
  );

  const frameworks =
    getOrvalResponseData<SurveyFramework[]>(frameworksQuery.data) ?? EMPTY_FRAMEWORKS;
  const frameworkOptions = React.useMemo(
    () => buildSurveyFrameworkSelectOptions(frameworks),
    [frameworks]
  );

  const createMutation = useSurveysFormsCreate({
    mutation: {
      onSuccess: async (response) => {
        const createdForm = getOrvalResponseData<Form>(response);

        await queryClient.invalidateQueries({
          queryKey: getSurveysFormsListQueryKey()
        });

        notifySuccess('Formulario criado.', 'Agora configure as perguntas da pesquisa.');
        router.push(
          createdForm?.id
            ? `/dashboard/surveys/forms/${createdForm.id}/questions`
            : '/dashboard/surveys/forms'
        );
      },
      onError: (error) => {
        notifyError(error, 'Nao foi possivel criar o formulario.');
      }
    }
  });

  const form = useAppForm({
    defaultValues: resolveModuleFormDefaults(surveyFormCreateFormConfig.defaultValues),
    validators: {
      onSubmit: surveyFormCreateFormConfig.schema
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        data: toCreatePayload(value)
      });
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } =
    useFormFields<SurveyFormCreateValues>();

  if (frameworksQuery.isPending) {
    return <ModuleFormSkeleton />;
  }

  if (frameworksQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={frameworksQuery.error}
          title='Erro ao carregar frameworks'
          fallbackMessage='Nao foi possivel carregar os frameworks disponiveis para este tenant.'
        />
        <div>
          <Button variant='outline' onClick={() => frameworksQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (frameworkOptions.length === 0) {
    return (
      <Alert>
        <Icons.info className='h-4 w-4' />
        <AlertTitle>Nenhum framework ativo</AlertTitle>
        <AlertDescription className='space-y-3'>
          <p>
            Este tenant ainda nao possui frameworks ativos para criar formularios. Ative ou crie um
            framework antes de iniciar um novo formulario.
          </p>
          <Link
            href='/dashboard/surveys/frameworks'
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Abrir frameworks
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ModuleFormCard
      title='Dados do formulario'
      description='Crie o rascunho inicial. As perguntas serao configuradas na proxima tela.'
      footer={
        <ModuleFormActions
          formId={CREATE_SURVEY_FORM_ID}
          isPending={createMutation.isPending}
          submitLabel='Criar formulario'
          onCancel={() => router.push('/dashboard/surveys/forms')}
        />
      }
    >
      <form.AppForm>
        <form.Form id={CREATE_SURVEY_FORM_ID} className='space-y-8 p-0 md:p-0'>
          <ModuleFormSection
            title='Configuracao base'
            description='Escolha o framework e defina como este formulario aparecera no dashboard.'
          >
            <FormSelectField
              name='framework'
              label='Framework'
              required
              options={frameworkOptions}
              placeholder='Selecione um framework'
              validators={{
                onBlur: surveyFormCreateFieldSchemas.framework
              }}
            />

            <FormTextField
              name='title'
              label='Titulo'
              required
              placeholder='Ex.: Pesquisa de satisfacao pos-atendimento'
              maxLength={255}
              validators={{
                onBlur: surveyFormCreateFieldSchemas.title
              }}
            />
          </ModuleFormSection>

          <ModuleFormSection
            title='Descricao'
            description='Use uma descricao curta para orientar operadores internos.'
            columns={1}
            separated
          >
            <FormTextareaField
              name='description'
              label='Descricao'
              placeholder='Explique o objetivo deste formulario.'
              maxLength={2000}
              rows={5}
              validators={{
                onBlur: surveyFormCreateFieldSchemas.description
              }}
            />
          </ModuleFormSection>
        </form.Form>
      </form.AppForm>
    </ModuleFormCard>
  );
}
