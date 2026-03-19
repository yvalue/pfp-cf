import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type ToolWorkbenchProps = ComponentProps<'section'> & {
  left: ReactNode;
  right: ReactNode;
  leftPaneClassName?: string;
  rightPaneClassName?: string;
  gridClassName?: string;
};

export function ToolWorkbench({
  left,
  right,
  className,
  gridClassName,
  leftPaneClassName,
  rightPaneClassName,
  ...props
}: ToolWorkbenchProps) {
  return (
    <section
      data-slot="tool-workbench"
      className={cn('p-4', className)}
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
