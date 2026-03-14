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
        'border-border/60 bg-card/30 rounded-[32px] border p-2',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'grid gap-2 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]',
          gridClassName
        )}
      >
        <div
          className={cn(
            'border-border/60 bg-card min-w-0 rounded-[28px] border px-6 py-6 shadow-sm lg:px-8 lg:py-8',
            leftPaneClassName
          )}
        >
          {left}
        </div>

        <div
          className={cn(
            'border-border/60 bg-card min-w-0 rounded-[28px] border px-6 py-6 shadow-sm lg:px-8 lg:py-8',
            rightPaneClassName
          )}
        >
          {right}
        </div>
      </div>
    </section>
  );
}
