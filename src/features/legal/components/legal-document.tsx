import Link from 'next/link';
import type { ReactNode } from 'react';

interface LegalSectionLink {
  id: string;
  label: string;
}

interface LegalDocumentProps {
  children: ReactNode;
  description: string;
  eyebrow: string;
  sections: LegalSectionLink[];
  title: string;
  updatedAt: string;
}

export function LegalDocument({
  children,
  description,
  eyebrow,
  sections,
  title,
  updatedAt
}: LegalDocumentProps) {
  return (
    <div className='bg-background text-foreground min-h-screen'>
      <header className='border-border/70 bg-background/95 sticky top-0 z-10 border-b backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6'>
          <Link href='/' className='font-semibold tracking-tight' aria-label='Ir para o início'>
            Pergunta.ai
          </Link>
          <nav
            className='text-muted-foreground flex items-center gap-4 text-sm'
            aria-label='Documentos legais'
          >
            <Link className='hover:text-foreground transition-colors' href='/terms-of-service'>
              Termos
            </Link>
            <Link className='hover:text-foreground transition-colors' href='/privacy-policy'>
              Privacidade
            </Link>
          </nav>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16'>
        <div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]'>
          <article className='min-w-0'>
            <div className='border-border mb-10 border-b pb-8'>
              <p className='text-primary mb-3 text-sm font-semibold tracking-wider uppercase'>
                {eyebrow}
              </p>
              <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>{title}</h1>
              <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7 sm:text-lg'>
                {description}
              </p>
              <p className='text-muted-foreground mt-5 text-sm'>Última atualização: {updatedAt}</p>
            </div>

            <div className='legal-content space-y-10'>{children}</div>
          </article>

          <aside className='hidden lg:block'>
            <div className='sticky top-24'>
              <p className='mb-4 text-sm font-semibold'>Neste documento</p>
              <nav aria-label='Seções deste documento'>
                <ol className='border-border space-y-3 border-l pl-4'>
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        className='text-muted-foreground hover:text-foreground text-sm transition-colors'
                        href={`#${section.id}`}
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>
        </div>
      </main>

      <footer className='border-border border-t'>
        <div className='text-muted-foreground mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          <p>© {new Date().getFullYear()} Pergunta.ai</p>
          <p>
            Dúvidas sobre privacidade?{' '}
            <a
              className='text-foreground font-medium hover:underline'
              href='mailto:privacidade@pergunta.ai'
            >
              privacidade@pergunta.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

interface LegalSectionProps {
  children: ReactNode;
  id: string;
  title: string;
}

export function LegalSection({ children, id, title }: LegalSectionProps) {
  return (
    <section id={id} className='scroll-mt-24'>
      <h2 className='mb-4 text-xl font-semibold tracking-tight sm:text-2xl'>{title}</h2>
      <div className='text-muted-foreground space-y-4 leading-7 [&_a]:text-foreground [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_strong]:text-foreground [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2'>
        {children}
      </div>
    </section>
  );
}
