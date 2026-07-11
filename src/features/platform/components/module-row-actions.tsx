'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type ModuleRowActionIcon = ComponentType<{ className?: string }>;

export type ModuleRowActionItem = {
  key: string;
  label: string;
  icon?: ModuleRowActionIcon;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
};

type ModuleRowActionsProps = {
  items: ModuleRowActionItem[];
  triggerAriaLabel?: string;
  menuLabel?: string;
};

export function ModuleRowActions({
  items,
  triggerAriaLabel = 'Abrir ações da linha',
  menuLabel = 'Ações'
}: ModuleRowActionsProps) {
  const visibleItems = items.filter((item) => Boolean(item.label) && (item.href || item.onSelect));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0' aria-label={triggerAriaLabel}>
          <span className='sr-only'>{triggerAriaLabel}</span>
          <Icons.ellipsis className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-44'>
        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const itemClassName = item.destructive ? 'text-destructive focus:text-destructive' : '';
          const content = (
            <>
              {Icon ? <Icon className='mr-2 h-4 w-4' /> : null}
              {item.label}
            </>
          );

          return (
            <div key={item.key}>
              {item.separatorBefore && index > 0 ? <DropdownMenuSeparator /> : null}
              {item.href ? (
                <DropdownMenuItem asChild disabled={item.disabled} className={itemClassName}>
                  <Link href={item.href}>{content}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={item.onSelect}
                  disabled={item.disabled}
                  className={itemClassName}
                >
                  {content}
                </DropdownMenuItem>
              )}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
