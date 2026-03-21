import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import type {
  ToolSidebarConfig,
  ToolTopbarConfig,
} from '@/shared/types/blocks/tools';

export default async function ToolsLayout({
  children,
  sidebar,
  topbar,
}: {
  children: ReactNode;
  sidebar: ToolSidebarConfig;
  topbar: ToolTopbarConfig;
}) {
  const Sidebar = await getThemeBlock('tools-sidebar');
  const Topbar = await getThemeBlock('tools-topbar');

  return (
    <div
      data-slot="tools-shell"
      className="bg-background text-foreground min-h-screen"
    >
      <Sidebar sidebar={sidebar} />
      <main data-slot="tools-main" className="min-w-0 lg:pl-[240px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
          <Topbar sidebar={sidebar} topbar={topbar} />
          {children}
        </div>
      </main>
    </div>
  );
}
