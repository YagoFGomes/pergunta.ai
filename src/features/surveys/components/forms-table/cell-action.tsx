'use client';

import { useRouter } from 'next/navigation';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Form } from '@/lib/api/generated/model/form';

type SurveyFormCellActionProps = {
  data: Form;
};

export function SurveyFormCellAction({ data }: SurveyFormCellActionProps) {
  const router = useRouter();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Abrir acoes do formulario</span>
          <Icons.ellipsis className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Acoes</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/surveys/forms/${data.id}`)}>
          <Icons.edit className='mr-2 h-4 w-4' />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/surveys/forms/${data.id}/questions`)}
        >
          <Icons.forms className='mr-2 h-4 w-4' />
          Perguntas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
