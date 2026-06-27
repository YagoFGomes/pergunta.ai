import * as z from 'zod';

import { Status372Enum } from '@/lib/api/generated/model/status372Enum';

export const contactListFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Maximo de 255 caracteres.'),
  description: z.string().trim().max(1000, 'Maximo de 1000 caracteres.').optional(),
  status: z.nativeEnum(Status372Enum)
});

export type ContactListFormValues = z.infer<typeof contactListFormSchema>;

export const contactListFieldSchemas = {
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Maximo de 255 caracteres.'),
  description: z.string().trim().max(1000, 'Maximo de 1000 caracteres.'),
  status: z.nativeEnum(Status372Enum)
};
