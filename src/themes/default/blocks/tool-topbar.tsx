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
import type { ToolTopbarConfig } from '@/shared/types/blocks/tools';

export function ToolTopbar({ topbar }: { topbar: ToolTopbarConfig }) {
  const pathname = usePathname();
  const slug = pathname.split('/').filter(Boolean).pop() || '';

  // Convert slug to title: professional-headshot-generator -> Professional Headshot Generator
  const currentLabel = topbar?.current_label ||
    slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <header
      data-slot="tool-topbar"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
    >
      <div className="min-w-0 flex-1">
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
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-4 sm:gap-6">
          {topbar?.show_theme ? <ThemeToggler /> : null}
          {topbar?.show_locale ? <LocaleSelector /> : null}
          {topbar?.show_sign ? <SignUser userNav={topbar.user_nav} /> : null}
        </div>
      </div>
    </header>
  );
}
