import type { StandardSchemaV1 } from '@standard-schema/spec';

export type ModuleFormMode = 'create' | 'edit';

export type ModuleFormSubmitResult = void | Promise<void>;

export type ModuleFormSubmitHandler<TValues> = (values: TValues) => ModuleFormSubmitResult;

export type ModuleFormDefaults<TValues extends Record<string, unknown>> = TValues | (() => TValues);

export type ModuleFormSchema<TValues extends Record<string, unknown>> = StandardSchemaV1<
  TValues,
  TValues
>;

export type ModuleFormConfig<TValues extends Record<string, unknown>> = {
  schema: ModuleFormSchema<TValues>;
  defaultValues: ModuleFormDefaults<TValues>;
};

export function resolveModuleFormDefaults<TValues extends Record<string, unknown>>(
  defaultValues: ModuleFormDefaults<TValues>
) {
  return typeof defaultValues === 'function' ? defaultValues() : defaultValues;
}

export function createModuleFormConfig<TValues extends Record<string, unknown>>(
  config: ModuleFormConfig<TValues>
) {
  return config;
}
