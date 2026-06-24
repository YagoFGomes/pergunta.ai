import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies();
  const hasAuthToken = Boolean(
    cookieStore.get('pergunta_access_token')?.value ||
    cookieStore.get('pergunta_refresh_token')?.value
  );

  if (!hasAuthToken) {
    return redirect('/auth/sign-in');
  }

  redirect('/dashboard/overview');
}
