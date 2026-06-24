'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context';

export default function ExclusivePage() {
  const { user } = useAuth();
  const activeTenant = user?.memberships.find(
    (membership) => membership.tenant === user.current_tenant
  );
  const canSeeExclusiveArea = activeTenant?.role === 'OWNER' || activeTenant?.role === 'ADMIN';

  return (
    <PageContainer>
      {!canSeeExclusiveArea ? (
        <div className='flex h-full items-center justify-center'>
          <Alert>
            <Icons.lock className='h-5 w-5 text-yellow-600' />
            <AlertDescription>
              <div className='mb-1 text-lg font-semibold'>Admin role required</div>
              <div className='text-muted-foreground'>
                This page is reserved for owner/admin roles on the active tenant.
                <br />
                Use the billing section and tenant roles to manage access.
              </div>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className='space-y-6'>
          <div>
            <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
              <Icons.badgeCheck className='h-7 w-7 text-green-600' />
              Exclusive Area
            </h1>
            <p className='text-muted-foreground'>
              Welcome, <span className='font-semibold'>{activeTenant?.tenant_name}</span>! This page
              contains exclusive features for privileged roles.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Thank You for Checking Out the Exclusive Page</CardTitle>
              <CardDescription>
                This means your active tenant has the required role access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-lg'>Have a wonderful day!</div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
