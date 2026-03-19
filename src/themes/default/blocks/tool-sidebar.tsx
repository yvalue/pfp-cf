'use client';

import { envConfigs } from '@/config';
import { Link } from '@/core/i18n/navigation';
import { BrandLogo, SmartIcon } from '@/shared/blocks/common';
import { ToolSidebar as ToolSidebarShell } from '@/shared/blocks/tools';
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

  return (
    <ToolSidebarShell
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
