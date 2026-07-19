'use client';

import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModuleDataTable } from '@/features/platform/components/module-data-table';
import { ModuleDataTableSkeleton } from '@/features/platform/components/module-data-table-skeleton';
import { ModuleErrorAlert } from '@/features/platform/components/module-error-alert';
import { useModuleTableParams } from '@/features/platform/hooks/use-module-table-params';
import { MODULE_TABLE_DEFAULT_DEBOUNCE_MS } from '@/features/platform/lib/module-table';
import { notifyError } from '@/features/platform/lib/notifications';
import { getOrvalResponseData } from '@/features/platform/lib/orval-response';
import { useDataTable } from '@/hooks/use-data-table';
import {
  getCampaignsListQueryKey,
  useCampaignsDestroy,
  useCampaignsList
} from '@/lib/api/generated/endpoints';
import type { Campaign } from '@/lib/api/generated/model/campaign';
import type { CampaignsListParams } from '@/lib/api/generated/model/campaignsListParams';

import {
  getCollectionCount,
  getCollectionItems,
  type MaybePaginatedCampaigns
} from '../../schemas/campaign';
import { CampaignSetupRoadmap } from './campaign-setup-roadmap';
import { getCampaignsColumns } from './columns';

const CAMPAIGN_FILTER_KEYS = ['search', 'status'] as const;

function normalizeSingleFilter(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function CampaignsManager() {
  const queryClient = useQueryClient();
  const [deleteCampaign, setDeleteCampaign] = useState<Campaign | null>(null);

  const destroyMutation = useCampaignsDestroy({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getCampaignsListQueryKey() });
        toast.success('Campanha excluida com sucesso.');
        setDeleteCampaign(null);
      },
      onError: (error) => {
        notifyError(error, 'Não foi possível excluir a campanha.');
      }
    }
  });

  const columns = useMemo(
    () =>
      getCampaignsColumns({
        onDelete: setDeleteCampaign,
        disableActions: destroyMutation.isPending
      }),
    [destroyMutation.isPending]
  );

  const { params } = useModuleTableParams<Campaign, (typeof CAMPAIGN_FILTER_KEYS)[number]>({
    columns,
    filterKeys: CAMPAIGN_FILTER_KEYS
  });

  const apiParams = useMemo<CampaignsListParams>(
    () => ({
      ...(normalizeSingleFilter(params.search) && {
        search: normalizeSingleFilter(params.search)
      }),
      ...(normalizeSingleFilter(params.status) && {
        status: normalizeSingleFilter(params.status)
      })
    }),
    [params.search, params.status]
  );

  const campaignsQuery = useCampaignsList(apiParams, {
    query: {
      placeholderData: keepPreviousData
    }
  });

  const campaignResponse = getOrvalResponseData<MaybePaginatedCampaigns>(campaignsQuery.data);
  const campaigns = getCollectionItems(campaignResponse);
  const totalItems = getCollectionCount(campaignResponse);
  const hasFilters = Boolean(params.search || params.status);

  const { table } = useDataTable({
    data: campaigns,
    columns,
    pageCount: 1,
    shallow: false,
    debounceMs: MODULE_TABLE_DEFAULT_DEBOUNCE_MS,
    initialState: {
      sorting: [],
      columnPinning: { right: ['actions'] }
    }
  });

  if (campaignsQuery.isPending) {
    return <ModuleDataTableSkeleton columnCount={7} filterCount={2} />;
  }

  if (campaignsQuery.isError) {
    return (
      <div className='grid gap-4'>
        <ModuleErrorAlert
          error={campaignsQuery.error}
          title='Erro ao carregar campanhas'
          fallbackMessage='Não foi possível carregar as campanhas.'
        />
        <div>
          <Button variant='outline' onClick={() => campaignsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <CampaignSetupRoadmap
        existingCampaignCount={totalItems}
        isCampaignCountFiltered={hasFilters}
      />

      {totalItems === 0 && !hasFilters ? null : (
        <>
          {campaigns.length === 0 && hasFilters ? (
            <Alert>
              <AlertTitle>Nenhuma campanha encontrada</AlertTitle>
              <AlertDescription>
                Ajuste os filtros para visualizar outras campanhas.
              </AlertDescription>
            </Alert>
          ) : null}

          <ModuleDataTable
            table={table}
            toolbarChildren={
              <>
                {campaignsQuery.isFetching ? (
                  <Badge variant='outline' className='gap-1'>
                    <Icons.spinner className='h-3 w-3 animate-spin' />
                    Atualizando
                  </Badge>
                ) : null}
                <Badge variant='outline'>{totalItems} campanhas</Badge>
              </>
            }
          />
        </>
      )}

      <AlertDialog
        open={Boolean(deleteCampaign)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCampaign(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              A campanha {deleteCampaign?.name ? `"${deleteCampaign.name}"` : ''} será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={destroyMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={destroyMutation.isPending || !deleteCampaign}
              onClick={(event) => {
                event.preventDefault();

                if (!deleteCampaign) {
                  return;
                }

                void destroyMutation.mutateAsync({ id: deleteCampaign.id });
              }}
            >
              Excluir campanha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
