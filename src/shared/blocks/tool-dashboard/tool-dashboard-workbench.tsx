import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type ToolDashboardWorkbenchProps = ComponentProps<'section'> & {
  left: ReactNode;
  right: ReactNode;
  leftPaneClassName?: string;
  rightPaneClassName?: string;
  gridClassName?: string;
};

export function ToolDashboardWorkbench({
  left,
  right,
  className,
  gridClassName,
  leftPaneClassName,
  rightPaneClassName,
  ...props
}: ToolDashboardWorkbenchProps) {
  return (
    <section
      data-slot="tool-dashboard-workbench"
      className={cn(
        'border-border bg-card rounded-3xl border p-4 shadow-sm',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'grid gap-4 xl:grid-cols-2',
          gridClassName
        )}
      >
        <div
          className={cn(
            'border-border bg-card min-w-0 rounded-3xl border p-6 shadow-sm',
            leftPaneClassName
          )}
        >
          {left}
        </div>

        <div
          className={cn(
            'border-border bg-card min-w-0 rounded-3xl border p-6 shadow-sm',
            rightPaneClassName
          )}
        >
          {right}
        </div>
      </div>
    </section>
  );
}
