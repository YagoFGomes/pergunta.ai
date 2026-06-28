import { PublicSurveyResponse } from '@/features/public-survey/components/public-survey-response';

export const metadata = {
  title: 'Pesquisa Publica'
};

type PublicSurveyPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicSurveyPage({ params }: PublicSurveyPageProps) {
  const { token } = await params;

  return <PublicSurveyResponse token={token} />;
}
