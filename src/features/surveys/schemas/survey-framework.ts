import * as z from 'zod';

export const surveyFrameworkFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Informe ao menos 2 caracteres.')
    .max(20, 'Máximo de 20 caracteres.'),
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(120, 'Máximo de 120 caracteres.'),
  description: z.string().trim().max(1000, 'Máximo de 1000 caracteres.').optional(),
  is_active: z.boolean()
});

export type SurveyFrameworkFormValues = z.infer<typeof surveyFrameworkFormSchema>;

export const surveyFrameworkFieldSchemas = {
  code: z
    .string()
    .trim()
    .min(2, 'Informe ao menos 2 caracteres.')
    .max(20, 'Máximo de 20 caracteres.'),
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(120, 'Máximo de 120 caracteres.'),
  description: z.string().trim().max(1000, 'Máximo de 1000 caracteres.'),
  is_active: z.boolean()
};
