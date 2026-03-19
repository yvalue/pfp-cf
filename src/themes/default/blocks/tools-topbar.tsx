'use client';

import { usePathname } from 'next/navigation';

import { Link } from '@/core/i18n/navigation';
import { LocaleSelector, SignUser, ThemeToggler } from '@/shared/blocks/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { getToolNavItemFromPathname } from '@/shared/lib/tools';
import type {
  ToolSidebarConfig,
  ToolTopbarConfig,
} from '@/shared/types/blocks/tools';

export function ToolsTopbar({
  sidebar,
  topbar,
}: {
  sidebar: ToolSidebarConfig;
  topbar: ToolTopbarConfig;
}) {
  const pathname = usePathname();
  const items = sidebar.nav?.items ?? [];
  const currentItem = getToolNavItemFromPathname(items, pathname);

  if (!items.length) {
    throw new Error('Tools sidebar items are required.');
  }

  if (!currentItem) {
    throw new Error(`No tool navigation item matches pathname "${pathname}".`);
  }

  return (
    <header
      data-slot="tools-topbar"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
    >
      <div className="min-w-0 flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{topbar.breadcrumb_home ?? 'Home'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentItem.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
        {topbar.show_theme ? <ThemeToggler /> : null}
        {topbar.show_locale ? <LocaleSelector /> : null}
        {topbar.show_sign ? <SignUser userNav={topbar.user_nav} /> : null}
      </div>
    </header>
  );
}
