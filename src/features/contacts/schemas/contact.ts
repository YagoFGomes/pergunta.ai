import * as z from 'zod';

import { EmailContactStatusEnum } from '@/lib/api/generated/model/emailContactStatusEnum';

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Máximo de 255 caracteres.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  phone: z.string().trim().max(30, 'Máximo de 30 caracteres.').optional(),
  status: z.nativeEnum(EmailContactStatusEnum)
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactFieldSchemas = {
  name: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Máximo de 255 caracteres.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  phone: z.string().trim().max(30, 'Máximo de 30 caracteres.'),
  status: z.nativeEnum(EmailContactStatusEnum)
};
