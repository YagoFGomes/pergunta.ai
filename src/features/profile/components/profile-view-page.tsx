'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/context';

export default function ProfileViewPage() {
  const { user } = useAuth();

  return (
    <div className='flex w-full flex-col p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Current user profile loaded from your API.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='text-sm'>Email: {user?.email ?? 'Unknown'}</div>
          <div className='text-sm'>Tenant: {user?.current_tenant ?? 'None'}</div>
          <div className='text-sm'>
            Name: {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
