import * as z from 'zod';

import { createModuleFormConfig } from '@/features/platform/lib/module-form';

export const surveyFormCreateSchema = z.object({
  framework: z.string().min(1, 'Selecione um framework.'),
  title: z
    .string()
    .trim()
    .min(3, 'Informe um titulo com pelo menos 3 caracteres.')
    .max(255, 'O titulo deve ter no maximo 255 caracteres.'),
  description: z.string().trim().max(2000, 'A descricao deve ter no maximo 2000 caracteres.')
});

export type SurveyFormCreateValues = z.infer<typeof surveyFormCreateSchema>;

export const surveyFormCreateFieldSchemas = surveyFormCreateSchema.shape;

export const surveyFormCreateFormConfig = createModuleFormConfig<SurveyFormCreateValues>({
  schema: surveyFormCreateSchema,
  defaultValues: {
    framework: '',
    title: '',
    description: ''
  }
});
