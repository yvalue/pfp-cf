import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import {
  ToolSidebarConfig as SidebarType,
  ToolTopbarConfig as TopbarType,
} from '@/shared/types/blocks/tools';

export default async function ToolsLayout({
  children,
  sidebar,
  topbar,
}: {
  children: ReactNode;
  sidebar: SidebarType;
  topbar: TopbarType;
}) {
  const Sidebar = await getThemeBlock('tool-sidebar');
  const Topbar = await getThemeBlock('tool-topbar');

  return (
    <div data-slot="tool-shell" className="bg-background text-foreground min-h-screen">
      <Sidebar sidebar={sidebar} />
      <main data-slot="tool-main" className="min-w-0 lg:pl-[240px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
          <Topbar topbar={topbar} />
          {children}
        </div>
      </main>
    </div>
  );
}
