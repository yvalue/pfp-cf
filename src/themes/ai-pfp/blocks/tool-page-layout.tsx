import Image from 'next/image';
import type { ReactNode } from 'react';

import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import { LocaleSelector, SignUser, ThemeToggler } from '@/shared/blocks/common';
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
import type { UserNav } from '@/shared/types/blocks/common';

export type SidebarItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
};

export type SidebarPrimaryAction = {
  label: string;
  href?: string;
};

export type SidebarProps = {
  items: SidebarItem[];
  primaryAction?: SidebarPrimaryAction;
};

export type TopbarProps = {
  homeLabel: string;
  currentLabel: string;
  showTheme?: boolean;
  showLocale?: boolean;
  showSign?: boolean;
  userNav?: UserNav;
};

type ToolPageLayoutProps = {
  sidebar: SidebarProps;
  topbar: TopbarProps;
  children: ReactNode;
};

function Sidebar({ items, primaryAction }: SidebarProps) {
  return (
    <ToolDashboardSidebar
      brand={
        <Link className="flex items-center gap-3" href="/">
          <Image
            src={envConfigs.app_logo}
            alt={envConfigs.app_name}
            width={36}
            height={36}
          />
          <span className="text-lg font-semibold tracking-tight">
            {envConfigs.app_name}
          </span>
        </Link>
      }
      navigation={
        <div className="grid gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              className={cn(
                'flex items-center rounded-2xl px-3 py-2 text-sm font-medium text-foreground transition-colors',
                item.active && 'bg-accent/60'
              )}
              href={item.href}
            >
              {item.icon ? (
                <span className="mr-2.5 flex size-4 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
              ) : null}
              <span className="tracking-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      }
      footer={
        primaryAction ? (
          <div className="border-border/60 bg-background/95 grid gap-1.5 rounded-2xl border px-2 py-2">
            {primaryAction.href ? (
              <Button asChild className="w-full justify-center" size="sm">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button className="w-full justify-center" size="sm">
                {primaryAction.label}
              </Button>
            )}
          </div>
        ) : null
      }
    />
  );
}

function Topbar({
  homeLabel,
  currentLabel,
  showTheme,
  showLocale,
  showSign,
  userNav,
}: TopbarProps) {
  return (
    <ToolDashboardTopbar
      breadcrumbs={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{homeLabel}</Link>
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
        <>
          {showTheme ? <ThemeToggler /> : null}
          {showLocale ? <LocaleSelector type="button" /> : null}
          {showSign ? <SignUser userNav={userNav} /> : null}
        </>
      }
    />
  );
}

export function ToolPageLayout({
  sidebar,
  topbar,
  children,
}: ToolPageLayoutProps) {
  return (
    <ToolDashboardShell>
      <Sidebar {...sidebar} />
      <ToolDashboardMain>
        <Topbar {...topbar} />
        {children}
      </ToolDashboardMain>
    </ToolDashboardShell>
  );
}
