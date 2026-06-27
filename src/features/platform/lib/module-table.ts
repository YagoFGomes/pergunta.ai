import type { ColumnDef } from '@tanstack/react-table';
import type { ExtendedColumnSort } from '@/types/data-table';

export const MODULE_TABLE_DEFAULT_PAGE = 1;
export const MODULE_TABLE_DEFAULT_PER_PAGE = 10;
export const MODULE_TABLE_DEFAULT_DEBOUNCE_MS = 500;

export type ModuleTableFilterValue = string | string[] | null | undefined;
export type ModuleTableFilters = Record<string, ModuleTableFilterValue>;
export type ModuleTableApiFilters = Record<string, string | string[] | number>;

export function getModuleTableColumnIds<TData>(columns: readonly ColumnDef<TData>[]) {
  return columns
    .map((column) => {
      const columnRef = column as { id?: unknown; accessorKey?: unknown };

      if (typeof columnRef.id === 'string') return columnRef.id;
      if (typeof columnRef.accessorKey === 'string') return columnRef.accessorKey;

      return null;
    })
    .filter((columnId): columnId is string => Boolean(columnId));
}

export function getModuleTablePageCount(totalItems: number, perPage: number) {
  if (!Number.isFinite(totalItems) || !Number.isFinite(perPage) || perPage <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(totalItems / perPage));
}

export function serializeModuleTableSort<TData>(sort: ExtendedColumnSort<TData>[]) {
  return sort.length > 0 ? JSON.stringify(sort) : undefined;
}

export function compactModuleTableFilters<TFilters extends ModuleTableFilters>(filters: TFilters) {
  const compactFilters: ModuleTableApiFilters = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;

    compactFilters[key] = value;
  }

  return compactFilters;
}

export function buildModuleTableQueryFilters<TData, TFilters extends ModuleTableFilters>({
  page,
  perPage,
  sort,
  filters = {} as TFilters
}: {
  page: number;
  perPage: number;
  sort: ExtendedColumnSort<TData>[];
  filters?: TFilters;
}) {
  return {
    page,
    limit: perPage,
    ...compactModuleTableFilters(filters),
    ...(sort.length > 0 && { sort: JSON.stringify(sort) })
  };
}
