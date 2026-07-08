'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getSurveysFrameworksListQueryKey,
  useSurveysFrameworksCreate,
  useSurveysFrameworksList,
  useSurveysFrameworksPartialUpdate
} from '@/lib/api/generated/endpoints';
import type { SurveyFramework } from '@/lib/api/generated/model/surveyFramework';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import {
  surveyFrameworkFieldSchemas,
  type SurveyFrameworkFormValues
} from '@/features/surveys/schemas/survey-framework';

import { getSurveyFrameworksColumns } from './columns';

type Mode = 'create' | 'edit' | 'deactivate';

const DEFAULT_VALUES: SurveyFrameworkFormValues = {
  code: '',
  name: '',
  description: '',
  is_active: true
};

function normalizeValues(values: SurveyFrameworkFormValues): SurveyFrameworkFormValues {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: (values.description || '').trim(),
    is_active: values.is_active
  };
}

export function SurveyFrameworksManager() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [selectedFramework, setSelectedFramework] = useState<SurveyFramework | null>(null);

  const listQuery = useSurveysFrameworksList();
  const frameworks = getOrvalResponseData<SurveyFramework[]>(listQuery.data) ?? [];

  const createMutation = useSurveysFrameworksCreate({
    mutation: {
      onSuccess: () => {
        toast.success('Indicador criado com sucesso.');
        void queryClient.invalidateQueries({ queryKey: getSurveysFrameworksListQueryKey() });
        setIsDialogOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível criar o indicador.');
      }
    }
  });

  const updateMutation = useSurveysFrameworksPartialUpdate({
    mutation: {
      onSuccess: () => {
        toast.success('Indicador atualizado com sucesso.');
        void queryClient.invalidateQueries({ queryKey: getSurveysFrameworksListQueryKey() });
        setIsDialogOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível atualizar o indicador.');
      }
    }
  });

  const deactivateMutation = useSurveysFrameworksPartialUpdate({
    mutation: {
      onSuccess: () => {
        toast.success('Indicador desativado.');
        void queryClient.invalidateQueries({ queryKey: getSurveysFrameworksListQueryKey() });
        setIsDialogOpen(false);
      },
      onError: () => {
        toast.error('Não foi possível desativar o indicador.');
      }
    }
  });

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const normalized = normalizeValues(value);

      if (mode === 'create') {
        await createMutation.mutateAsync({
          data: {
            code: normalized.code,
            name: normalized.name,
            description: normalized.description,
            is_active: normalized.is_active
          }
        });
        return;
      }

      if (!selectedFramework) {
        return;
      }

      await updateMutation.mutateAsync({
        id: selectedFramework.id,
        data: {
          code: selectedFramework.code,
          name: normalized.name,
          description: normalized.description,
          is_active: normalized.is_active
        }
      });
    }
  });

  const hasMutationInFlight =
    createMutation.isPending || updateMutation.isPending || deactivateMutation.isPending;

  const { FormTextField, FormTextareaField, FormSwitchField } =
    useFormFields<SurveyFrameworkFormValues>();

  function openCreateDialog() {
    setMode('create');
    setSelectedFramework(null);
    form.reset(DEFAULT_VALUES);
    setIsDialogOpen(true);
  }

  function openEditDialog(framework: SurveyFramework) {
    if (framework.is_seed) {
      toast.error('Indicador de sistema não pode ser editado.');
      return;
    }

    setMode('edit');
    setSelectedFramework(framework);
    form.reset({
      code: framework.code,
      name: framework.name,
      description: framework.description || '',
      is_active: framework.is_active ?? true
    });
    setIsDialogOpen(true);
  }

  async function toggleActive(framework: SurveyFramework) {
    if (framework.is_seed) {
      toast.error('Indicador de sistema não pode ser alterado.');
      return;
    }

    await updateMutation.mutateAsync({
      id: framework.id,
      data: {
        is_active: !framework.is_active
      }
    });
  }

  function openDeactivateAsDeleteDialog(framework: SurveyFramework) {
    if (framework.is_seed) {
      toast.error('Indicador de sistema não pode ser excluído.');
      return;
    }

    setMode('deactivate');
    setSelectedFramework(framework);
    setIsDialogOpen(true);
  }

  const columns = useMemo(
    () =>
      getSurveyFrameworksColumns({
        onEdit: openEditDialog,
        onToggleActive: (framework) => {
          void toggleActive(framework);
        },
        onDeactivateAsDelete: openDeactivateAsDeleteDialog,
        disableActions: hasMutationInFlight
      }),
    [hasMutationInFlight]
  );

  const { table } = useDataTable({
    data: frameworks,
    columns,
    pageCount: 1,
    shallow: false,
    initialState: {
      sorting: []
    }
  });

  const shouldShowDialogForm = mode !== 'deactivate';

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold'>Indicadores de Satisfação</h2>
          <p className='text-muted-foreground text-sm'>
            NPS, CSI e CXI são indicadores do sistema. Você também pode criar indicadores
            customizados.
          </p>
        </div>
        <Button onClick={openCreateDialog}>Novo indicador</Button>
      </div>

      {listQuery.isError ? (
        <Alert variant='destructive'>
          <AlertTitle>Erro ao carregar indicadores</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os indicadores. Atualize a página e tente novamente.
          </AlertDescription>
        </Alert>
      ) : null}

      {listQuery.isSuccess && frameworks.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhum indicador encontrado</AlertTitle>
          <AlertDescription>Crie o primeiro indicador customizado para começar.</AlertDescription>
        </Alert>
      ) : null}

      <ModuleDataTable
        table={table}
        toolbarChildren={<Badge variant='outline'>{frameworks.length} indicadores</Badge>}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (hasMutationInFlight) {
            return;
          }

          setIsDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? 'Novo indicador'
                : mode === 'edit'
                  ? 'Editar indicador'
                  : 'Excluir indicador'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Preencha os dados para criar um indicador customizado.'
                : mode === 'edit'
                  ? 'Atualize os dados do indicador selecionado.'
                  : 'A API não possui endpoint DELETE para indicadores. Esta ação vai desativar o registro.'}
            </DialogDescription>
          </DialogHeader>

          {shouldShowDialogForm ? (
            <form.AppForm>
              <form.Form className='space-y-4 p-0 md:p-0'>
                {mode === 'create' ? (
                  <FormTextField
                    name='code'
                    label='Codigo'
                    required
                    placeholder='Ex: NPS'
                    maxLength={20}
                    validators={{
                      onBlur: surveyFrameworkFieldSchemas.code
                    }}
                    disabled={hasMutationInFlight}
                  />
                ) : (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>Codigo</p>
                    <Input value={selectedFramework?.code ?? ''} disabled readOnly />
                  </div>
                )}

                <FormTextField
                  name='name'
                  label='Nome'
                  required
                  placeholder='Nome do framework'
                  maxLength={120}
                  validators={{
                    onBlur: surveyFrameworkFieldSchemas.name
                  }}
                  disabled={hasMutationInFlight}
                />

                <FormTextareaField
                  name='description'
                  label='Descricao'
                  placeholder='Descreva o objetivo deste framework'
                  maxLength={1000}
                  rows={4}
                  validators={{
                    onBlur: surveyFrameworkFieldSchemas.description
                  }}
                  disabled={hasMutationInFlight}
                />

                <div
                  className={`rounded-lg border p-3 ${hasMutationInFlight ? 'pointer-events-none opacity-60' : ''}`}
                  aria-disabled={hasMutationInFlight}
                >
                  <FormSwitchField
                    name='is_active'
                    label='Ativo'
                    description='Frameworks inativos não ficam disponíveis na criação de formulários.'
                    validators={{
                      onBlur: surveyFrameworkFieldSchemas.is_active
                    }}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsDialogOpen(false)}
                    disabled={hasMutationInFlight}
                  >
                    Cancelar
                  </Button>
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                  >
                    {([canSubmit, isSubmitting]) => (
                      <Button type='submit' disabled={!canSubmit || isSubmitting}>
                        {mode === 'create' ? 'Criar framework' : 'Salvar alterações'}
                      </Button>
                    )}
                  </form.Subscribe>
                </DialogFooter>
              </form.Form>
            </form.AppForm>
          ) : (
            <div className='space-y-4'>
              <div className='rounded-lg border p-3 text-sm'>
                <p>
                  <span className='font-medium'>Framework:</span> {selectedFramework?.name}{' '}
                  <Badge variant='outline' className='ml-2'>
                    {selectedFramework?.code}
                  </Badge>
                </p>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                  disabled={hasMutationInFlight}
                >
                  Cancelar
                </Button>
                <Button
                  type='button'
                  variant='destructive'
                  disabled={hasMutationInFlight || !selectedFramework}
                  onClick={() => {
                    if (!selectedFramework) {
                      return;
                    }

                    void deactivateMutation.mutateAsync({
                      id: selectedFramework.id,
                      data: {
                        is_active: false
                      }
                    });
                  }}
                >
                  Excluir (desativar)
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
