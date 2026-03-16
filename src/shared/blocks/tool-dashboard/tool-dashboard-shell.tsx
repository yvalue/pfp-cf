'use client';

import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

import { useMedia } from '@/shared/hooks/use-media';
import { cn } from '@/shared/lib/utils';

type ToolDashboardShellProps = ComponentProps<'div'>;

type ToolDashboardSidebarProps = ComponentProps<'aside'> & {
  brand?: ReactNode;
  navigation?: ReactNode;
  footer?: ReactNode;
  mobileActions?: ReactNode;
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
  mobileActions,
  className,
  children,
  ...props
}: ToolDashboardSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isLarge = useMedia('(min-width: 64rem)');
  const menuId = 'tool-dashboard-sidebar-mobile-menu';

  useEffect(() => {
    if (isLarge) {
      setIsMobileOpen(false);
    }
  }, [isLarge]);

  return (
    <>
      <div className="border-border/60 bg-background/80 sticky top-0 z-30 border-b backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="min-w-0 flex-1">{brand}</div>

          <button
            type="button"
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? 'Close Menu' : 'Open Menu'}
            aria-controls={menuId}
            onClick={() => setIsMobileOpen((open) => !open)}
            className="relative -m-2.5 -mr-2 block cursor-pointer p-2.5"
          >
            <Menu
              className={cn(
                'size-5 transition duration-200',
                isMobileOpen && 'scale-0 rotate-180 opacity-0'
              )}
            />
            <X
              className={cn(
                'absolute inset-0 m-auto size-5 scale-0 -rotate-180 opacity-0 transition duration-200',
                isMobileOpen && 'scale-100 rotate-0 opacity-100'
              )}
            />
          </button>
        </div>

        {isMobileOpen ? (
          <div
            id={menuId}
            className="border-border/60 grid gap-3 border-t px-4 py-4"
          >
            {navigation ? <nav className="grid gap-2">{navigation}</nav> : null}
            {children}
            {mobileActions ? mobileActions : null}
            {footer ? <div>{footer}</div> : null}
          </div>
        ) : null}
      </div>

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
            <div className="border-border/60 border-b px-6 py-3">{brand}</div>
          ) : null}

          {navigation ? (
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {navigation}
            </nav>
          ) : null}

          {children}

          {footer ? (
            <div className="border-border/60 border-t px-3 py-2">{footer}</div>
          ) : null}
        </div>
      </aside>
    </>
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
          'mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 md:px-6 lg:px-8',
          innerClassName
        )}
      >
        {children}
      </div>
    </main>
  );
}
