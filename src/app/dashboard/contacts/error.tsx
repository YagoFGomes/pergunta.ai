'use client';

import ModuleError from '@/features/platform/components/module-error';

type ContactsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ContactsError({ error, reset }: ContactsErrorProps) {
  return (
    <ModuleError
      pageTitle='Contatos'
      pageDescription='Nao foi possivel carregar listas ou contatos.'
      error={error}
      reset={reset}
    />
  );
}
