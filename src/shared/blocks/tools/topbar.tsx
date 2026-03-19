import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type ToolTopbarProps = ComponentProps<'header'> & {
  breadcrumbs?: ReactNode;
  userInfo?: ReactNode;
};

export function ToolTopbar({
  breadcrumbs,
  userInfo,
  className,
  children,
  ...props
}: ToolTopbarProps) {
  return (
    <header
      data-slot="tool-topbar"
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-3',
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">{breadcrumbs}</div>
      <div className="flex shrink-0 items-center gap-3">{userInfo}</div>
      {children}
    </header>
  );
}
