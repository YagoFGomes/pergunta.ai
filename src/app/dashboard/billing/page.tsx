'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';
import { useAuth } from '@/features/auth/context';

export default function BillingPage() {
  const { user } = useAuth();
  const activeTenant = user?.memberships.find(
    (membership) => membership.tenant === user.current_tenant
  );

  return (
    <PageContainer
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription={`Manage your subscription and usage limits for ${activeTenant?.tenant_name ?? 'your tenant'}`}
    >
      <div className='space-y-6'>
        {/* Info Alert */}
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Billing is not wired yet to the backend. This section is ready for tenant-based plan
            management once the API exposes it.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose a plan that fits your tenant's needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground rounded-lg border border-dashed p-6 text-sm'>
              Once your backend exposes billing endpoints, we can render plans here.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
