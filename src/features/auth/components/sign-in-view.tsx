'use client';

import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { InteractiveGridPattern } from './interactive-grid';
import { useAuth } from '@/features/auth/context';
import type { Login } from '@/lib/api/generated/model';
import { useLoginCreate } from '@/lib/api/generated/endpoints';
import { setStoredAuthTokens } from '@/lib/auth/session';
import { fetchCurrentUser } from '@/features/auth/api/service';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  const { setUser } = useAuth();
  const loginMutation = useLoginCreate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard/overview';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const credentials: Login = { email, password };
      const tokenPair = await loginMutation.mutateAsync({ data: credentials });

      const hasTokenPair =
        tokenPair &&
        typeof tokenPair === 'object' &&
        'access' in tokenPair &&
        'refresh' in tokenPair;

      const accessToken = hasTokenPair ? (tokenPair as Record<string, unknown>).access : undefined;
      const refreshToken = hasTokenPair
        ? (tokenPair as Record<string, unknown>).refresh
        : undefined;

      if (!hasTokenPair || typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        throw new Error('Unable to sign in.');
      }

      setStoredAuthTokens({
        accessToken,
        refreshToken
      });

      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      router.replace(redirectTo);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
      console.log('Login error:', loginError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Login
      </Link>
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
              &ldquo;This starter template has saved me countless hours of work and helped me
              deliver projects to my clients faster than ever before.&rdquo;
            </p>
            <footer className='text-sidebar-foreground/70 text-sm'>Random Dude</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <Link
            className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex items-center gap-2')}
            target='_blank'
            href='https://github.com/kiranism/next-shadcn-dashboard-starter'
          >
            <Icons.github className='size-4' />
            <span>View on GitHub</span>
          </Link>
          <form
            className='w-full space-y-4 rounded-2xl border bg-card p-6 shadow-sm'
            onSubmit={handleSubmit}
          >
            <div className='space-y-2 text-left'>
              <h1 className='text-2xl font-semibold tracking-tight'>Sign in</h1>
              <p className='text-muted-foreground text-sm'>
                Use your API credentials to access the dashboard.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? <p className='text-sm text-red-500'>{error}</p> : null}

            <button
              className={cn(buttonVariants({ className: 'w-full' }))}
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting ? <Icons.spinner className='mr-2 size-4 animate-spin' /> : null}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className='text-muted-foreground text-center text-sm'>
            Don&após;t have an account?{' '}
            <Link href='/auth/sign-up' className='hover:text-primary underline underline-offset-4'>
              Sign up
            </Link>
          </p>

          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
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
