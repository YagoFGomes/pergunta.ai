import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type ModuleShellPageProps = {
  pageTitle: string;
  pageDescription: string;
  scope: string;
  nextSteps: string[];
  endpointReferences?: string[];
};

export default function ModuleShellPage({
  pageTitle,
  pageDescription,
  scope,
  nextSteps,
  endpointReferences = []
}: ModuleShellPageProps) {
  return (
    <PageContainer pageTitle={pageTitle} pageDescription={pageDescription}>
      <div className='grid min-w-0 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Módulo em implementação</CardTitle>
            <CardDescription>
              Esta página já faz parte da estrutura do MVP e será evoluída nas próximas tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center'>
              <Badge variant='outline' className='w-fit shrink-0'>
                Fase 1
              </Badge>
              <span className='text-muted-foreground min-w-0 break-words text-sm'>
                Escopo: {scope}
              </span>
            </div>

            <div>
              <p className='mb-2 text-sm font-medium'>Próximos passos:</p>
              <ul className='text-muted-foreground list-disc space-y-1 pl-5 text-sm'>
                {nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            {endpointReferences.length > 0 && (
              <div>
                <p className='mb-2 text-sm font-medium'>Endpoints alvo (Orval):</p>
                <ul className='text-muted-foreground list-disc space-y-1 pl-5 text-sm'>
                  {endpointReferences.map((endpoint) => (
                    <li key={endpoint}>{endpoint}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
