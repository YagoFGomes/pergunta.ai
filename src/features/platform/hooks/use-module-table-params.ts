'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import * as React from 'react';

import { getSortingStateParser } from '@/lib/parsers';
import {
  MODULE_TABLE_DEFAULT_PAGE,
  MODULE_TABLE_DEFAULT_PER_PAGE,
  getModuleTableColumnIds
} from '@/features/platform/lib/module-table';
import type { ExtendedColumnSort } from '@/types/data-table';

const EMPTY_FILTER_KEYS: readonly never[] = [];

type UseModuleTableParamsProps<TData, TFilterKey extends string> = {
  columns: readonly ColumnDef<TData>[];
  filterKeys?: readonly TFilterKey[];
};

type ModuleTableParams<TData, TFilterKey extends string> = {
  page: number;
  perPage: number;
  sort: ExtendedColumnSort<TData>[];
} & Record<TFilterKey, string | null>;

export function useModuleTableParams<TData, TFilterKey extends string = never>({
  columns,
  filterKeys = EMPTY_FILTER_KEYS
}: UseModuleTableParamsProps<TData, TFilterKey>) {
  const columnIds = React.useMemo(() => getModuleTableColumnIds(columns), [columns]);

  const parsers = React.useMemo(
    () => ({
      page: parseAsInteger.withDefault(MODULE_TABLE_DEFAULT_PAGE),
      perPage: parseAsInteger.withDefault(MODULE_TABLE_DEFAULT_PER_PAGE),
      sort: getSortingStateParser<TData>(columnIds).withDefault([]),
      ...Object.fromEntries(filterKeys.map((filterKey) => [filterKey, parseAsString]))
    }),
    [columnIds, filterKeys]
  );

  const [params, setParams] = useQueryStates(parsers);

  return {
    params: params as ModuleTableParams<TData, TFilterKey>,
    setParams,
    columnIds
  };
}
