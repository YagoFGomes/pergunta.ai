import type { PublicForm } from '@/lib/api/generated/model/publicForm';
import type { PublicFormQuestion } from '@/lib/api/generated/model/publicFormQuestion';
import type { PublicSurveyAnswerInput } from '@/lib/api/generated/model/publicSurveyAnswerInput';
import type { PublicSurveySubmit } from '@/lib/api/generated/model/publicSurveySubmit';
import { QuestionTypeEnum } from '@/lib/api/generated/model/questionTypeEnum';

export type PublicSurveyAnswersState = Record<string, string | string[] | undefined>;

export type PublicSurveyValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function getMultipleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value : [];
}

export function getOrderedPublicQuestions(form: PublicForm) {
  return [...form.questions].toSorted((a, b) => a.order - b.order);
}

export function getOrderedPublicOptions(question: PublicFormQuestion) {
  return [...question.options].toSorted((a, b) => a.order - b.order);
}

export function isPublicChoiceQuestion(question: PublicFormQuestion) {
  return (
    question.question_type === QuestionTypeEnum.SINGLE_CHOICE ||
    question.question_type === QuestionTypeEnum.MULTIPLE_CHOICE
  );
}

export function isPublicQuestionMissingOptions(question: PublicFormQuestion) {
  return isPublicChoiceQuestion(question) && question.options.length === 0;
}

export function getPublicQuestionRequiredMessage(question: PublicFormQuestion) {
  if (isPublicQuestionMissingOptions(question)) {
    return 'Esta pergunta obrigatoria ainda nao tem opcoes cadastradas.';
  }

  if (question.question_type === QuestionTypeEnum.TEXT) return 'Preencha esta resposta.';
  if (question.question_type === QuestionTypeEnum.MULTIPLE_CHOICE)
    return 'Selecione ao menos uma opcao.';
  if (question.question_type === QuestionTypeEnum.SINGLE_CHOICE) return 'Selecione uma opcao.';
  return 'Selecione uma nota.';
}

export function validatePublicSurveyAnswers(
  questions: PublicFormQuestion[],
  answers: PublicSurveyAnswersState
): PublicSurveyValidationResult {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    if (!question.is_required) continue;

    const value = answers[question.id];

    if (isPublicQuestionMissingOptions(question)) {
      errors[question.id] = getPublicQuestionRequiredMessage(question);
      continue;
    }

    if (question.question_type === QuestionTypeEnum.MULTIPLE_CHOICE) {
      if (getMultipleValue(value).length === 0) {
        errors[question.id] = getPublicQuestionRequiredMessage(question);
      }
      continue;
    }

    if (!getSingleValue(value).trim()) {
      errors[question.id] = getPublicQuestionRequiredMessage(question);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function getAnsweredRequiredCount(
  questions: PublicFormQuestion[],
  answers: PublicSurveyAnswersState
) {
  return questions.filter((question) => {
    if (!question.is_required) return false;

    const value = answers[question.id];
    if (question.question_type === QuestionTypeEnum.MULTIPLE_CHOICE) {
      return getMultipleValue(value).length > 0;
    }

    return Boolean(getSingleValue(value).trim());
  }).length;
}

export function buildPublicSurveySubmitPayload(
  questions: PublicFormQuestion[],
  answers: PublicSurveyAnswersState
): PublicSurveySubmit {
  const payloadAnswers: PublicSurveyAnswerInput[] = [];

  for (const question of questions) {
    const value = answers[question.id];

    if (question.question_type === QuestionTypeEnum.TEXT) {
      const answerText = getSingleValue(value).trim();
      if (answerText) {
        payloadAnswers.push({
          question_id: question.id,
          answer_text: answerText
        });
      }
      continue;
    }

    if (
      question.question_type === QuestionTypeEnum.SCALE_1_5 ||
      question.question_type === QuestionTypeEnum.SCALE_0_10
    ) {
      const rating = Number(getSingleValue(value));
      if (Number.isFinite(rating)) {
        payloadAnswers.push({
          question_id: question.id,
          answer_rating: rating,
          answer_number: rating
        });
      }
      continue;
    }

    if (question.question_type === QuestionTypeEnum.MULTIPLE_CHOICE) {
      for (const optionId of getMultipleValue(value)) {
        payloadAnswers.push({
          question_id: question.id,
          answer_choice_id: optionId
        });
      }
      continue;
    }

    const optionId = getSingleValue(value);
    if (optionId) {
      payloadAnswers.push({
        question_id: question.id,
        answer_choice_id: optionId
      });
    }
  }

  return { answers: payloadAnswers };
}
