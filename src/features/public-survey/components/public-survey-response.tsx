'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/features/platform/lib/api-error';
import type { PublicFormQuestion } from '@/lib/api/generated/model/publicFormQuestion';
import { QuestionTypeEnum } from '@/lib/api/generated/model/questionTypeEnum';
import { cn } from '@/lib/utils';

import {
  publicSurveyQueryKey,
  retrievePublicSurvey,
  submitPublicSurvey
} from '../api/public-survey';
import {
  buildPublicSurveySubmitPayload,
  getAnsweredRequiredCount,
  getOrderedPublicOptions,
  getOrderedPublicQuestions,
  isPublicQuestionMissingOptions,
  validatePublicSurveyAnswers,
  type PublicSurveyAnswersState
} from '../schemas/public-survey';

type PublicSurveyResponseProps = {
  token: string;
};

function PublicSurveySkeleton() {
  return (
    <main className='bg-muted/30 flex min-h-svh items-center justify-center p-4'>
      <Card className='w-full max-w-3xl animate-pulse'>
        <CardHeader className='space-y-3'>
          <div className='bg-muted h-8 w-2/3 rounded' />
          <div className='bg-muted h-4 w-full max-w-lg rounded' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='bg-muted h-24 rounded' />
          <div className='bg-muted h-24 rounded' />
          <div className='bg-muted h-10 w-36 rounded' />
        </CardContent>
      </Card>
    </main>
  );
}

function PublicSurveyMessage({
  title,
  description,
  variant = 'default',
  action
}: {
  title: string;
  description: string;
  variant?: 'default' | 'success' | 'error';
  action?: React.ReactNode;
}) {
  return (
    <main className='bg-muted/30 flex min-h-svh items-center justify-center p-4'>
      <Card className='w-full max-w-xl text-center'>
        <CardHeader className='items-center'>
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full',
              variant === 'success' && 'bg-emerald-50 text-emerald-700',
              variant === 'error' && 'bg-destructive/10 text-destructive',
              variant === 'default' && 'bg-muted text-muted-foreground'
            )}
          >
            {variant === 'success' ? (
              <Icons.check className='size-6' />
            ) : variant === 'error' ? (
              <Icons.warning className='size-6' />
            ) : (
              <Icons.forms className='size-6' />
            )}
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {action ? <CardContent>{action}</CardContent> : null}
      </Card>
    </main>
  );
}

function QuestionShell({
  question,
  error,
  children
}: {
  question: PublicFormQuestion;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-3 rounded-lg border p-4'>
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div className='space-y-1'>
          <Label className='text-base font-medium'>{question.label}</Label>
          {question.is_required ? (
            <p className='text-muted-foreground text-xs'>Obrigatória</p>
          ) : (
            <p className='text-muted-foreground text-xs'>Opcional</p>
          )}
        </div>
        <Badge variant='outline'>{question.question_type}</Badge>
      </div>
      {children}
      {error ? <p className='text-destructive text-sm'>{error}</p> : null}
    </div>
  );
}

function ScaleQuestion({
  question,
  value,
  onChange,
  max
}: {
  question: PublicFormQuestion;
  value: string;
  onChange: (value: string) => void;
  max: number;
}) {
  const min = max === 10 ? 0 : 1;

  return (
    <div className='grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(44px,1fr))]'>
      {Array.from({ length: max - min + 1 }, (_, index) => String(index + min)).map((rating) => (
        <Button
          key={`${question.id}-${rating}`}
          type='button'
          variant={value === rating ? 'default' : 'outline'}
          className='h-11'
          onClick={() => onChange(rating)}
        >
          {rating}
        </Button>
      ))}
    </div>
  );
}

function MissingOptionsNotice({ isRequired }: { isRequired: boolean }) {
  return (
    <Alert variant={isRequired ? 'destructive' : 'default'}>
      <AlertTitle>Pergunta sem opções</AlertTitle>
      <AlertDescription>
        {isRequired
          ? 'Esta pergunta e obrigatória, mas ainda não possui opções cadastradas.'
          : 'Esta pergunta ainda não possui opções cadastradas.'}
      </AlertDescription>
    </Alert>
  );
}

function PublicQuestion({
  question,
  value,
  error,
  onChange
}: {
  question: PublicFormQuestion;
  value: string | string[] | undefined;
  error?: string;
  onChange: (value: string | string[]) => void;
}) {
  const options = getOrderedPublicOptions(question);

  if (question.question_type === QuestionTypeEnum.TEXT) {
    return (
      <QuestionShell question={question} error={error}>
        <Textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder='Digite sua resposta'
          rows={5}
        />
      </QuestionShell>
    );
  }

  if (question.question_type === QuestionTypeEnum.SCALE_1_5) {
    return (
      <QuestionShell question={question} error={error}>
        <ScaleQuestion
          question={question}
          max={5}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      </QuestionShell>
    );
  }

  if (question.question_type === QuestionTypeEnum.SCALE_0_10) {
    return (
      <QuestionShell question={question} error={error}>
        <ScaleQuestion
          question={question}
          max={10}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      </QuestionShell>
    );
  }

  if (question.question_type === QuestionTypeEnum.MULTIPLE_CHOICE) {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <QuestionShell question={question} error={error}>
        {options.length === 0 ? <MissingOptionsNotice isRequired={question.is_required} /> : null}
        <div className='grid gap-3'>
          {options.map((option) => (
            <label
              key={option.id}
              className='hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors'
            >
              <Checkbox
                checked={selectedValues.includes(option.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedValues, option.id]);
                    return;
                  }

                  onChange(selectedValues.filter((item) => item !== option.id));
                }}
              />
              <span className='text-sm'>{option.label}</span>
            </label>
          ))}
        </div>
      </QuestionShell>
    );
  }

  return (
    <QuestionShell question={question} error={error}>
      {options.length === 0 ? <MissingOptionsNotice isRequired={question.is_required} /> : null}
      <RadioGroup value={typeof value === 'string' ? value : ''} onValueChange={onChange}>
        {options.map((option) => (
          <label
            key={option.id}
            className='hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors'
          >
            <RadioGroupItem value={option.id} />
            <span className='text-sm'>{option.label}</span>
          </label>
        ))}
      </RadioGroup>
    </QuestionShell>
  );
}

export function PublicSurveyResponse({ token }: PublicSurveyResponseProps) {
  const [answers, setAnswers] = useState<PublicSurveyAnswersState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const surveyQuery = useQuery({
    queryKey: publicSurveyQueryKey(token),
    queryFn: () => retrievePublicSurvey(token),
    retry: false
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!surveyQuery.data) {
        throw new Error('Formulário indisponível.');
      }

      const questions = getOrderedPublicQuestions(surveyQuery.data);
      return submitPublicSurvey(token, buildPublicSurveySubmitPayload(questions, answers));
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Resposta enviada com sucesso.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Não foi possível enviar suas respostas.'));
    }
  });

  const questions = useMemo(
    () => (surveyQuery.data ? getOrderedPublicQuestions(surveyQuery.data) : []),
    [surveyQuery.data]
  );
  const requiredQuestions = questions.filter((question) => question.is_required);
  const requiredQuestionsMissingOptions = requiredQuestions.filter(isPublicQuestionMissingOptions);
  const answeredRequiredCount = getAnsweredRequiredCount(questions, answers);
  const progress =
    requiredQuestions.length > 0 ? (answeredRequiredCount / requiredQuestions.length) * 100 : 100;
  const hasRequiredQuestionsMissingOptions = requiredQuestionsMissingOptions.length > 0;

  function updateAnswer(questionId: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => {
      if (!current[questionId]) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  function handleSubmit() {
    const validation = validatePublicSurveyAnswers(questions, answers);

    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Revise as perguntas obrigatórias.');
      return;
    }

    submitMutation.mutate();
  }

  if (surveyQuery.isPending) {
    return <PublicSurveySkeleton />;
  }

  if (surveyQuery.isError) {
    return (
      <PublicSurveyMessage
        variant='error'
        title='Pesquisa indisponível'
        description={getErrorMessage(
          surveyQuery.error,
          'Não foi possível carregar esta pesquisa. O link pode ter expirado ou já ter sido respondido.'
        )}
        action={
          <Button variant='outline' onClick={() => surveyQuery.refetch()}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  if (submitted) {
    return (
      <PublicSurveyMessage
        variant='success'
        title='Obrigado pela resposta'
        description='Suas respostas foram registradas com sucesso. Você já pode fechar esta página.'
      />
    );
  }

  if (!surveyQuery.data || questions.length === 0) {
    return (
      <PublicSurveyMessage
        title='Pesquisa sem perguntas'
        description='Este formulário ainda não possui perguntas disponíveis para resposta.'
      />
    );
  }

  return (
    <main className='bg-muted/30 min-h-svh px-4 py-6 md:py-10'>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-4'>
        <Card>
          <CardHeader className='space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <Badge variant='outline'>Pergunta.ai</Badge>
              <Badge variant='secondary'>{questions.length} perguntas</Badge>
            </div>
            <div className='space-y-1'>
              <CardTitle className='text-2xl'>{surveyQuery.data.title}</CardTitle>
              {surveyQuery.data.description ? (
                <CardDescription>{surveyQuery.data.description}</CardDescription>
              ) : null}
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Obrigatorias respondidas</span>
                <span className='font-medium'>
                  {answeredRequiredCount}/{requiredQuestions.length}
                </span>
              </div>
              <Progress value={progress} />
            </div>
          </CardHeader>
        </Card>

        {Object.keys(errors).length > 0 ? (
          <Alert variant='destructive'>
            <AlertTitle>Campos obrigatorios pendentes</AlertTitle>
            <AlertDescription>Responda as perguntas marcadas antes de enviar.</AlertDescription>
          </Alert>
        ) : null}

        {hasRequiredQuestionsMissingOptions ? (
          <Alert variant='destructive'>
            <AlertTitle>Formulário precisa de ajuste</AlertTitle>
            <AlertDescription>
              Há perguntas obrigatórias de escolha sem opções cadastradas. Edite o formulário antes
              de compartilhar este link.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardContent className='space-y-4 pt-6'>
            {questions.map((question) => (
              <PublicQuestion
                key={question.id}
                question={question}
                value={answers[question.id]}
                error={errors[question.id]}
                onChange={(value) => updateAnswer(question.id, value)}
              />
            ))}

            <div className='flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-muted-foreground text-xs'>
                Ao enviar, este link será marcado como respondido.
              </p>
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || hasRequiredQuestionsMissingOptions}
              >
                {submitMutation.isPending ? (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Enviar respostas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
