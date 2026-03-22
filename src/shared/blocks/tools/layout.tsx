import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import type {
  Header as DashboardHeaderConfig,
  Sidebar as DashboardSidebar,
} from '@/shared/types/blocks/dashboard';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

import { ToolsClientShell } from './client-shell';

export default async function ToolsLayout({
  children,
  sidebar,
  header,
  footer,
}: {
  children: ReactNode;
  sidebar: DashboardSidebar;
  header: DashboardHeaderConfig;
  footer: FooterType;
}) {
  const Footer = await getThemeBlock('footer');

  return (
    <ToolsClientShell
      sidebar={sidebar}
      header={header}
      footer={<Footer footer={footer} />}
    >
      {children}
    </ToolsClientShell>
  );
}
