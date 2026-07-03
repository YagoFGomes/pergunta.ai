import { redirect } from 'next/navigation';

export default function OverViewLayout({ children }: { children: React.ReactNode }) {
  // Legacy template route kept in codebase for future v2 work, but blocked for end users.
  redirect('/dashboard/analytics/overview');

  return children;
}
