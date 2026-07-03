'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/context';

type TenantLike = {
  id?: string;
  name?: string;
  slug?: string;
};

function formatTenantValue(value: unknown): string {
  if (!value) return 'None';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const tenant = value as TenantLike;
    if (tenant.name && tenant.slug) {
      return `${tenant.name} (${tenant.slug})`;
    }

    if (tenant.name) return tenant.name;
    if (tenant.slug) return tenant.slug;
    if (tenant.id) return tenant.id;
  }

  return 'None';
}

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
          <div className='text-sm'>Tenant: {formatTenantValue(user?.current_tenant)}</div>
          <div className='text-sm'>
            Name: {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
