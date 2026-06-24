import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { CurrentUser } from '@/lib/api/generated/model';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: CurrentUser | null;
}

function getDisplayName(user: CurrentUser | null): string {
  if (!user) {
    return 'Guest';
  }

  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.email;
}

function getInitials(displayName: string): string {
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'CN';
}

export function UserAvatarProfile({ className, showInfo = false, user }: UserAvatarProfileProps) {
  const displayName = getDisplayName(user);
  const email = user?.email ?? '';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Avatar className='h-9 w-9 rounded-lg'>
        <AvatarFallback className='rounded-lg'>{getInitials(displayName)}</AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{displayName}</span>
          <span className='truncate text-xs'>{email}</span>
        </div>
      )}
    </div>
  );
}
