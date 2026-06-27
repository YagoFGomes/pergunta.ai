'use client';

import * as React from 'react';
import type { AnyFormApi } from '@tanstack/react-form';
import { revalidateLogic } from '@tanstack/react-form';
import { AnimatePresence, motion } from 'motion/react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAppForm, withFieldGroup } from '@/components/ui/tanstack-form';
import {
  useLoginCreate,
  useOnboardingTrialTenantCreate,
  useRegisterCreate
} from '@/lib/api/generated/endpoints';
import { setStoredAuthTokens } from '@/lib/auth/session';
import { useFormStepper } from '@/hooks/use-stepper';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { InteractiveGridPattern } from './interactive-grid';

// --- Schemas ---

const accountStepSchema = z
  .object({
    email: z.email('Invalid email address'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password')
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password']
  });

const workspaceStepSchema = z.object({});

const stepSchemas = [accountStepSchema, workspaceStepSchema];

// --- Field groups ---

const AccountFieldsGroup = withFieldGroup({
  defaultValues: {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: ''
  },
  render: function AccountRender({ group }) {
    return (
      <div className='space-y-4'>
        <div className='space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Create your account</h1>
          <p className='text-muted-foreground text-sm'>Enter your details below to get started.</p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <group.AppField name='first_name'>
            {(field) => (
              <div className='space-y-2'>
                <Label htmlFor={field.name}>First Name *</Label>
                <Input
                  id={field.name}
                  placeholder='John'
                  value={(field.state.value as string) ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <field.FieldError />
              </div>
            )}
          </group.AppField>

          <group.AppField name='last_name'>
            {(field) => (
              <div className='space-y-2'>
                <Label htmlFor={field.name}>Last Name *</Label>
                <Input
                  id={field.name}
                  placeholder='Doe'
                  value={(field.state.value as string) ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <field.FieldError />
              </div>
            )}
          </group.AppField>
        </div>

        <group.AppField name='email'>
          {(field) => (
            <div className='space-y-2'>
              <Label htmlFor={field.name}>Email *</Label>
              <Input
                id={field.name}
                type='email'
                placeholder='john@example.com'
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <field.FieldError />
            </div>
          )}
        </group.AppField>

        <group.AppField name='password'>
          {(field) => (
            <div className='space-y-2'>
              <Label htmlFor={field.name}>Password *</Label>
              <Input
                id={field.name}
                type='password'
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <field.FieldError />
            </div>
          )}
        </group.AppField>

        <group.AppField name='confirm_password'>
          {(field) => (
            <div className='space-y-2'>
              <Label htmlFor={field.name}>Confirm Password *</Label>
              <Input
                id={field.name}
                type='password'
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <field.FieldError />
            </div>
          )}
        </group.AppField>
      </div>
    );
  }
});

const WorkspaceFieldsGroup = withFieldGroup({
  defaultValues: {
    workspace_name: '',
    workspace_domain: ''
  },
  render: function WorkspaceRender({ group }) {
    return (
      <div className='space-y-4'>
        <div className='space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Set up your workspace</h1>
          <p className='text-muted-foreground text-sm'>
            Give your workspace a name. You can skip this and do it later.
          </p>
        </div>

        <group.AppField name='workspace_name'>
          {(field) => (
            <div className='space-y-2'>
              <Label htmlFor={field.name}>Workspace Name</Label>
              <Input
                id={field.name}
                placeholder='My Company'
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <field.FieldError />
            </div>
          )}
        </group.AppField>

        <group.AppField name='workspace_domain'>
          {(field) => (
            <div className='space-y-2'>
              <Label htmlFor={field.name}>Domain</Label>
              <Input
                id={field.name}
                placeholder='mycompany.com'
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <field.FieldError />
            </div>
          )}
        </group.AppField>
      </div>
    );
  }
});

// --- Main component ---

type SignUpFormValues = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  workspace_name: string;
  workspace_domain: string;
};

export default function SignUpViewPage() {
  const registerMutation = useRegisterCreate();
  const loginMutation = useLoginCreate();
  const onboardingMutation = useOnboardingTrialTenantCreate();
  const [serverError, setServerError] = useState<string | null>(null);
  const skipOnboarding = useRef(false);
  const router = useRouter();

  const {
    currentValidator,
    currentStep,
    isFirstStep,
    handleCancelOrBack,
    handleNextStepOrSubmit,
    step
  } = useFormStepper(stepSchemas);

  const form = useAppForm({
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
      workspace_name: '',
      workspace_domain: ''
    } as SignUpFormValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: currentValidator as never,
      onDynamicAsyncDebounceMs: 500
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await registerMutation.mutateAsync({
          data: {
            email: value.email,
            first_name: value.first_name,
            last_name: value.last_name,
            password: value.password
          } as never
        });

        const tokenPair = await loginMutation.mutateAsync({
          data: { email: value.email, password: value.password }
        });

        const hasTokenPair =
          tokenPair &&
          typeof tokenPair === 'object' &&
          'access' in tokenPair &&
          'refresh' in tokenPair;

        const accessToken = hasTokenPair
          ? (tokenPair as Record<string, unknown>).access
          : undefined;
        const refreshToken = hasTokenPair
          ? (tokenPair as Record<string, unknown>).refresh
          : undefined;

        if (!hasTokenPair || typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
          throw new Error('Unable to sign in after registration.');
        }

        setStoredAuthTokens({ accessToken, refreshToken });

        if (!skipOnboarding.current) {
          await onboardingMutation.mutateAsync({
            data: {
              name: value.workspace_name || undefined,
              domain: value.workspace_domain || undefined
            }
          });
        }

        router.replace('/dashboard/overview');
      } catch (error) {
        skipOnboarding.current = false;
        setServerError(
          error instanceof Error ? error.message : 'Registration failed. Please try again.'
        );
      }
    }
  });

  const groups: Record<number, React.ReactNode> = {
    1: (
      <AccountFieldsGroup
        form={form}
        fields={{
          email: 'email',
          first_name: 'first_name',
          last_name: 'last_name',
          password: 'password',
          confirm_password: 'confirm_password'
        }}
      />
    ),
    2: (
      <WorkspaceFieldsGroup
        form={form}
        fields={{ workspace_name: 'workspace_name', workspace_domain: 'workspace_domain' }}
      />
    )
  };

  const handleNext = async () => {
    await handleNextStepOrSubmit(form as unknown as AnyFormApi);
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='text-sidebar-foreground relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Logo
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='text-sidebar-foreground relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;This platform has transformed how we collect and act on customer
              feedback.&rdquo;
            </p>
            <footer className='text-sidebar-foreground/70 text-sm'>Product Team</footer>
          </blockquote>
        </div>
      </div>

      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <div className='w-full rounded-2xl border bg-card p-6 shadow-sm'>
            <form.AppForm>
              <form.Form className='p-0 md:p-0'>
                <div className='flex flex-col gap-4'>
                  <Progress value={(currentStep / stepSchemas.length) * 100} className='h-1' />

                  <AnimatePresence mode='popLayout'>
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.4, type: 'spring' }}
                    >
                      {groups[currentStep]}
                    </motion.div>
                  </AnimatePresence>

                  {serverError ? <p className='text-sm text-red-500'>{serverError}</p> : null}

                  <div className='flex items-center justify-between gap-3 pt-2'>
                    <form.StepButton
                      label='← Back'
                      disabled={isFirstStep}
                      handleMovement={() => handleCancelOrBack({})}
                      variant='ghost'
                    />

                    {step.isCompleted ? (
                      <div className='flex flex-1 justify-end gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => {
                            skipOnboarding.current = true;
                            void form.handleSubmit();
                          }}
                        >
                          Skip for now
                        </Button>
                        <form.SubmitButton>Continue →</form.SubmitButton>
                      </div>
                    ) : (
                      <form.StepButton label='Next →' handleMovement={handleNext} />
                    )}
                  </div>
                </div>
              </form.Form>
            </form.AppForm>
          </div>

          {currentStep === 1 && (
            <p className='text-muted-foreground text-center text-sm'>
              Already have an account?{' '}
              <Link
                href='/auth/sign-in'
                className='hover:text-primary underline underline-offset-4'
              >
                Sign in
              </Link>
            </p>
          )}

          <p className='text-muted-foreground px-8 text-center text-sm'>
            By creating an account, you agree to our{' '}
            <Link
              href='/terms-of-service'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy-policy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
