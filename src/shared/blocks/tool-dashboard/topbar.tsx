import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type ToolDashboardTopbarProps = ComponentProps<'header'> & {
  breadcrumbs?: ReactNode;
  userInfo?: ReactNode;
};

export function ToolDashboardTopbar({
  breadcrumbs,
  userInfo,
  className,
  children,
  ...props
}: ToolDashboardTopbarProps) {
  return (
    <header
      data-slot="tool-dashboard-topbar"
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
