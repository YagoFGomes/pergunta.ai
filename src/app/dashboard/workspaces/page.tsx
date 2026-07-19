'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/context';

export default function WorkspacesPage() {
  const { user } = useAuth();

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
    >
      <Card>
        <CardHeader>
          <CardTitle>Your tenants</CardTitle>
          <CardDescription>
            {user?.memberships.length
              ? 'Select a tenant by changing the active tenant in the API'
              : 'No tenants available for this user.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {user?.memberships.map((membership) => (
            <div
              key={membership.tenant}
              className='flex items-center justify-between rounded-lg border p-4'
            >
              <div>
                <div className='font-medium'>{membership.tenant_name}</div>
                <div className='text-muted-foreground text-sm'>
                  Role: {membership.role || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
