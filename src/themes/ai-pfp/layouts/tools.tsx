import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import { Footer as FooterType } from '@/shared/types/blocks/landing';
import type {
  ToolSidebarConfig,
  ToolTopbarConfig,
} from '@/shared/types/blocks/tools';

export default async function ToolsLayout({
  children,
  sidebar,
  topbar,
  footer,
}: {
  children: ReactNode;
  sidebar: ToolSidebarConfig;
  topbar: ToolTopbarConfig;
  footer: FooterType;
}) {
  const Sidebar = await getThemeBlock('tools-sidebar');
  const Topbar = await getThemeBlock('tools-topbar');
  const Footer = await getThemeBlock('footer');

  return (
    <div
      data-slot="tools-shell"
      className="bg-background text-foreground min-h-screen"
    >
      <Sidebar sidebar={sidebar} />
      <main
        data-slot="tools-main"
        className="flex min-h-screen min-w-0 flex-col lg:pl-[240px]"
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
          <Topbar sidebar={sidebar} topbar={topbar} />
          {children}
        </div>
        <Footer footer={footer} />
      </main>
    </div>
  );
}
