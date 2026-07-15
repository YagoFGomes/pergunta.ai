import * as z from 'zod';

import { EmailListStatusEnum } from '@/lib/api/generated/model/emailListStatusEnum';

export const contactListFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Máximo de 255 caracteres.'),
  description: z.string().trim().max(1000, 'Máximo de 1000 caracteres.').optional(),
  status: z.nativeEnum(EmailListStatusEnum)
});

export type ContactListFormValues = z.infer<typeof contactListFormSchema>;

export const contactListFieldSchemas = {
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Máximo de 255 caracteres.'),
  description: z.string().trim().max(1000, 'Máximo de 1000 caracteres.'),
  status: z.nativeEnum(EmailListStatusEnum)
};
