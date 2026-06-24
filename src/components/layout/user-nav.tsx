'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useAuth } from '@/features/auth/context';
import { useRouter } from 'next/navigation';

export function UserNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

  async function handleSignOut() {
    try {
      await logout();
    } finally {
      router.push('/auth/sign-in');
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <UserAvatarProfile user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' sideOffset={10} forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>{displayName}</p>
            <p className='text-muted-foreground text-xs leading-none'>{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/workspaces')}>
          Workspaces
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
