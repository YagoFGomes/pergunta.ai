import * as z from 'zod';

import { QuestionTypeEnum } from '@/lib/api/generated/model/questionTypeEnum';

export const surveyQuestionCreateSchema = z.object({
  label: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Maximo de 255 caracteres.'),
  question_type: z.nativeEnum(QuestionTypeEnum, {
    error: 'Selecione um tipo de pergunta.'
  }),
  is_required: z.boolean().default(false)
});

export type SurveyQuestionCreateValues = z.infer<typeof surveyQuestionCreateSchema>;

export const surveyQuestionCreateFieldSchemas = {
  label: z
    .string()
    .trim()
    .min(3, 'Informe ao menos 3 caracteres.')
    .max(255, 'Maximo de 255 caracteres.'),
  question_type: z.nativeEnum(QuestionTypeEnum, {
    error: 'Selecione um tipo de pergunta.'
  }),
  is_required: z.boolean()
};

export const surveyQuestionTypeOptions = [
  { value: QuestionTypeEnum.TEXT, label: 'Texto livre' },
  { value: QuestionTypeEnum.SINGLE_CHOICE, label: 'Escolha unica' },
  { value: QuestionTypeEnum.MULTIPLE_CHOICE, label: 'Multiplas escolhas' },
  { value: QuestionTypeEnum.SCALE_1_5, label: 'Escala 1 a 5' },
  { value: QuestionTypeEnum.SCALE_0_10, label: 'Escala 0 a 10' }
] as const;

export function getQuestionTypeLabel(type?: string): string {
  const found = surveyQuestionTypeOptions.find((option) => option.value === type);
  return found?.label ?? type ?? 'Tipo indefinido';
}
