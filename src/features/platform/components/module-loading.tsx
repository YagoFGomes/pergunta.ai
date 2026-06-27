import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type ModuleLoadingProps = {
  pageTitle?: string;
  pageDescription?: string;
};

export default function ModuleLoading({ pageTitle, pageDescription }: ModuleLoadingProps) {
  return (
    <PageContainer pageTitle={pageTitle} pageDescription={pageDescription}>
      <Card>
        <CardHeader className='space-y-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-full max-w-md' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-16 rounded-full' />
            <Skeleton className='h-4 w-40' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-full max-w-lg' />
            <Skeleton className='h-4 w-full max-w-xl' />
            <Skeleton className='h-4 w-full max-w-md' />
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
