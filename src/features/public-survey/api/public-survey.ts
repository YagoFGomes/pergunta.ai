import type { PublicForm } from '@/lib/api/generated/model/publicForm';
import type { PublicSurveySubmit } from '@/lib/api/generated/model/publicSurveySubmit';
import { customFetch } from '@/lib/api/orval-fetcher';

type SubmitResponse = {
  detail?: string;
};

export function publicSurveyQueryKey(token: string) {
  return ['/api/public/surveys', token] as const;
}

export async function retrievePublicSurvey(token: string) {
  return customFetch<PublicForm>(`/api/public/surveys/${token}`);
}

export async function submitPublicSurvey(token: string, data: PublicSurveySubmit) {
  return customFetch<SubmitResponse>(`/api/public/surveys/${token}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}
