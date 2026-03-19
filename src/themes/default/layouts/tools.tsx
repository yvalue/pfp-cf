import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import { ToolMain, ToolShell } from '@/shared/blocks/tools';
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
    <ToolShell>
      <Sidebar sidebar={sidebar} />
      <ToolMain>
        <Topbar topbar={topbar} />
        {children}
      </ToolMain>
    </ToolShell>
  );
}
