'use client';

import { ReactNode } from 'react';

import { usePathname } from '@/core/i18n/navigation';
import { Header as DashboardHeader } from '@/shared/blocks/dashboard/header';
import { Sidebar } from '@/shared/blocks/dashboard/sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import {
  getToolNavItemFromPathname,
  getToolSidebarItems,
} from '@/shared/lib/tools';
import type {
  Header as DashboardHeaderConfig,
  Sidebar as DashboardSidebar,
} from '@/shared/types/blocks/dashboard';

function ToolsHeader({
  sidebar,
  header,
}: {
  sidebar: DashboardSidebar;
  header: DashboardHeaderConfig;
}) {
  const pathname = usePathname();
  const items = getToolSidebarItems(sidebar);
  const currentItem = getToolNavItemFromPathname(items, pathname);

  if (!items.length) {
    throw new Error('Tools sidebar items are required.');
  }

  if (!currentItem) {
    throw new Error(`No tool navigation item matches pathname "${pathname}".`);
  }

  return (
    <DashboardHeader
      {...header}
      crumbs={[
        ...(header.crumbs ?? []),
        {
          title: currentItem.title,
          is_active: true,
        },
      ]}
    />
  );
}

export function ToolsClientShell({
  children,
  sidebar,
  header,
  footer,
}: {
  children: ReactNode;
  sidebar: DashboardSidebar;
  header: DashboardHeaderConfig;
  footer: ReactNode;
}) {
  return (
    <SidebarProvider
      className="bg-background text-foreground min-h-screen"
      style={
        {
          '--sidebar-width': '15rem',
          '--header-height': 'calc(var(--spacing) * 14)',
          '--sidebar': 'var(--background)',
          '--sidebar-foreground': 'var(--foreground)',
          '--sidebar-primary': 'var(--primary)',
          '--sidebar-primary-foreground': 'var(--primary-foreground)',
          '--sidebar-accent': 'var(--muted)',
          '--sidebar-accent-foreground': 'var(--foreground)',
          '--sidebar-border': 'var(--border)',
          '--sidebar-ring': 'var(--ring)',
        } as React.CSSProperties
      }
    >
      <Sidebar sidebar={sidebar} />
      <SidebarInset className="flex min-h-screen flex-col">
        <div className="flex min-h-screen flex-col">
          <ToolsHeader sidebar={sidebar} header={header} />
          <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
          {footer}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
