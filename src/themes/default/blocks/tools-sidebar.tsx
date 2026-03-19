'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { BrandLogo, SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { useMedia } from '@/shared/hooks/use-media';
import {
  getToolNavItemFromPathname,
  isToolNavItemActive,
} from '@/shared/lib/tools';
import { cn } from '@/shared/lib/utils';
import type { ToolSidebarConfig } from '@/shared/types/blocks/tools';

function SidebarNavLink({
  item,
  pathname,
}: {
  item: NonNullable<ToolSidebarConfig['nav']>['items'][number];
  pathname: string;
}) {
  const isActive = isToolNavItemActive(item, pathname);

  return (
    <Link
      href={item.url}
      className={cn(
        'text-foreground hover:bg-accent flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        isActive && 'bg-accent'
      )}
    >
      {item.icon ? (
        <span className="mr-2.5 flex size-4 shrink-0 items-center justify-center">
          <SmartIcon name={item.icon} size={16} />
        </span>
      ) : null}
      <span className="tracking-tight">{item.title}</span>
    </Link>
  );
}

export function ToolsSidebar({ sidebar }: { sidebar: ToolSidebarConfig }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isLarge = useMedia('(min-width: 64rem)');
  const pathname = usePathname();
  const items = sidebar.nav?.items ?? [];
  const primaryAction = sidebar.primary_action;
  const currentItem = getToolNavItemFromPathname(items, pathname);
  const menuId = 'tools-sidebar-mobile-menu';

  if (!items.length) {
    throw new Error('Tools sidebar items are required.');
  }

  if (!currentItem) {
    throw new Error(`No tool navigation item matches pathname "${pathname}".`);
  }

  useEffect(() => {
    if (isLarge) {
      setIsMobileOpen(false);
    }
  }, [isLarge]);

  const navigation = (
    <div className="grid gap-2">
      {items.map((item) => (
        <SidebarNavLink key={item.url} item={item} pathname={pathname} />
      ))}
    </div>
  );

  const footer = primaryAction ? (
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
  ) : null;

  return (
    <>
      <div className="border-border bg-background sticky top-0 z-30 border-b lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="min-w-0 flex-1">
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
          </div>

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
            className="border-border grid gap-3 border-t px-4 py-4"
          >
            <nav className="grid gap-2">{navigation}</nav>
            {footer ? <div>{footer}</div> : null}
          </div>
        ) : null}
      </div>

      <aside
        data-slot="tools-sidebar"
        className="border-border bg-card fixed inset-y-0 left-0 z-40 hidden h-screen w-[240px] border-r lg:block"
      >
        <div className="flex h-screen flex-col">
          <div className="border-border border-b px-6 py-3">
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
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {navigation}
          </nav>

          {footer ? (
            <div className="border-border border-t px-3 py-2">{footer}</div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
