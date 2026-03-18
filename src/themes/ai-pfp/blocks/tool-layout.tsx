import type { ReactNode } from 'react';

import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import {
  BrandLogo,
  LocaleSelector,
  SignUser,
  SmartIcon,
  ThemeToggler,
} from '@/shared/blocks/common';
import {
  ToolDashboardMain,
  ToolDashboardShell,
  ToolDashboardSidebar,
  ToolDashboardTopbar,
} from '@/shared/blocks/tool-dashboard';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type {
  ToolDashboardLayoutConfig,
  ToolDashboardNavItem,
} from '@/shared/types/blocks/tool-dashboard';

type ToolPageLayoutProps = {
  layout: ToolDashboardLayoutConfig;
  children: ReactNode;
};

function SidebarNavLink({ item }: { item: ToolDashboardNavItem }) {
  return (
    <Link
      href={item.url}
      className={cn(
        'flex items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent',
        item.active && 'bg-accent'
      )}
    >
      {item.icon && (
        <span className="mr-2.5 flex size-4 shrink-0 items-center justify-center">
          <SmartIcon name={item.icon} size={16} />
        </span>
      )}
      <span className="tracking-tight">{item.title}</span>
    </Link>
  );
}

function Sidebar({ layout }: { layout: ToolDashboardLayoutConfig }) {
  const { sidebar } = layout;
  const primaryAction = sidebar?.primary_action;

  return (
    <ToolDashboardSidebar
      brand={
        <BrandLogo
          brand={{
            url: '/',
            title: envConfigs.app_name,
            logo: {
              src: envConfigs.app_logo,
              alt: envConfigs.app_name,
              width: 100,
              height: 100,
            },
          }}
        />
      }
      navigation={
        sidebar?.nav?.items?.length ? (
          <div className="grid gap-2">
            {sidebar.nav.items.map((item) => (
              <SidebarNavLink key={item.url} item={item} />
            ))}
          </div>
        ) : null
      }
      footer={
        primaryAction ? (
          <div className="border-border bg-background grid gap-2 rounded-3xl border p-3">
            {primaryAction.url ? (
              <Button asChild className="w-full justify-center" size="sm">
                <Link href={primaryAction.url}>{primaryAction.title}</Link>
              </Button>
            ) : (
              <Button className="w-full justify-center" size="sm">
                {primaryAction.title}
              </Button>
            )}
          </div>
        ) : null
      }
    />
  );
}

function Topbar({ layout }: { layout: ToolDashboardLayoutConfig }) {
  const { topbar, sidebar } = layout;

  const currentLabel =
    topbar?.current_label ??
    sidebar?.nav?.items?.find((item) => item.active)?.title ??
    sidebar?.nav?.items?.[0]?.title ??
    '';

  return (
    <ToolDashboardTopbar
      breadcrumbs={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{topbar?.breadcrumb_home ?? 'Home'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      userInfo={
        <div className="flex items-center gap-4 sm:gap-6">
          {topbar?.show_theme ? <ThemeToggler /> : null}
          {topbar?.show_locale ? <LocaleSelector /> : null}
          {topbar?.show_sign ? <SignUser userNav={topbar.user_nav} /> : null}
        </div>
      }
    />
  );
}

export function ToolPageLayout({ layout, children }: ToolPageLayoutProps) {
  return (
    <ToolDashboardShell>
      <Sidebar layout={layout} />
      <ToolDashboardMain>
        <Topbar layout={layout} />
        {children}
      </ToolDashboardMain>
    </ToolDashboardShell>
  );
}
