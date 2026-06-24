'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/context';
import { teamInfoContent } from '@/config/infoconfig';

export default function TeamPage() {
  const { user } = useAuth();
  const activeMembership = user?.memberships.find(
    (membership) => membership.tenant === user.current_tenant
  );

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <Card>
        <CardHeader>
          <CardTitle>Team management</CardTitle>
          <CardDescription>Backend tenant role management is not wired yet.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='text-sm'>Active tenant: {activeMembership?.tenant_name ?? 'None'}</div>
          <div className='text-sm'>Role: {activeMembership?.role ?? 'N/A'}</div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
