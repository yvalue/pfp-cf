import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type ToolDashboardShellProps = ComponentProps<'div'>;

type ToolDashboardSidebarProps = ComponentProps<'aside'> & {
  brand?: ReactNode;
  navigation?: ReactNode;
  footer?: ReactNode;
};

type ToolDashboardMainProps = ComponentProps<'main'> & {
  innerClassName?: string;
};

export function ToolDashboardShell({
  className,
  ...props
}: ToolDashboardShellProps) {
  return (
    <div
      data-slot="tool-dashboard-shell"
      className={cn('bg-background text-foreground min-h-screen', className)}
      {...props}
    />
  );
}

export function ToolDashboardSidebar({
  brand,
  navigation,
  footer,
  className,
  children,
  ...props
}: ToolDashboardSidebarProps) {
  return (
    <aside
      data-slot="tool-dashboard-sidebar"
      className={cn(
        'border-border/60 bg-card/70 fixed inset-y-0 left-0 z-40 hidden h-screen w-[240px] border-r lg:block',
        className
      )}
      {...props}
    >
      <div className="flex h-screen flex-col">
        {brand ? (
          <div className="border-border/60 border-b px-6 py-5">{brand}</div>
        ) : null}

        {navigation ? (
          <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {navigation}
          </nav>
        ) : null}

        {children}

        {footer ? (
          <div className="border-border/60 border-t px-4 py-4">{footer}</div>
        ) : null}
      </div>
    </aside>
  );
}

export function ToolDashboardMain({
  className,
  innerClassName,
  children,
  ...props
}: ToolDashboardMainProps) {
  return (
    <main
      data-slot="tool-dashboard-main"
      className={cn('min-w-0 lg:pl-[240px]', className)}
      {...props}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-6 md:px-6 lg:px-8',
          innerClassName
        )}
      >
        {children}
      </div>
    </main>
  );
}
