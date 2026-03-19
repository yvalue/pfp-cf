'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import { BrandLogo, SmartIcon } from '@/shared/blocks/common';
import { useMedia } from '@/shared/hooks/use-media';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { ToolSidebarConfig } from '@/shared/types/blocks/tools';

function SidebarNavLink({ item }: { item: any }) {
  return (
    <Link
      href={item.url}
      className={cn(
        'flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
        item.active && 'bg-accent'
      )}
    >
      {item.icon && (
        <span className="mr-2.5 flex size-4 shrink-0">
          <SmartIcon name={item.icon} size={16} />
        </span>
      )}
      <span>{item.title}</span>
    </Link>
  );
}

export function ToolSidebar({ sidebar }: { sidebar: ToolSidebarConfig }) {
  const primaryAction = sidebar?.primary_action;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isLarge = useMedia('(min-width: 64rem)');
  const menuId = 'tool-sidebar-mobile-menu';

  useEffect(() => {
    if (isLarge) setIsMobileOpen(false);
  }, [isLarge]);

  const brand = (
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
  );

  const navigation = sidebar?.nav?.items?.length ? (
    <div className="grid gap-2">
      {sidebar.nav.items.map((item) => (
        <SidebarNavLink key={item.url} item={item} />
      ))}
    </div>
  ) : null;

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
      {/* Mobile header */}
      <div className="border-border bg-background sticky top-0 z-30 border-b lg:hidden">
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
        {isMobileOpen && (
          <div id={menuId} className="border-border grid gap-3 border-t px-4 py-4">
            {navigation ? <nav className="grid gap-2">{navigation}</nav> : null}
            {footer ? <div>{footer}</div> : null}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside
        data-slot="tool-sidebar"
        className="border-border bg-card fixed inset-y-0 left-0 z-40 hidden h-screen w-[240px] border-r lg:block"
      >
        <div className="flex h-screen flex-col">
          <div className="border-border border-b px-6 py-3">{brand}</div>
          {navigation ? (
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">{navigation}</nav>
          ) : null}
          {footer ? (
            <div className="border-border border-t px-3 py-2">{footer}</div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
