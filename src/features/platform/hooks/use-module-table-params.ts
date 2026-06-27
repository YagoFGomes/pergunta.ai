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

const EMPTY_FILTER_KEYS: readonly string[] = [];

type UseModuleTableParamsProps<TData> = {
  columns: readonly ColumnDef<TData>[];
  filterKeys?: readonly string[];
};

export function useModuleTableParams<TData>({
  columns,
  filterKeys = EMPTY_FILTER_KEYS
}: UseModuleTableParamsProps<TData>) {
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
    params,
    setParams,
    columnIds
  };
}
