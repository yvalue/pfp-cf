import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import {
  ToolSidebarConfig,
  ToolTopbarConfig,
} from '@/shared/types/blocks/tools';

export default async function ToolsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('tools');
  const Layout = await getThemeLayout('tools');

  const sidebar: ToolSidebarConfig = t.raw('sidebar');
  const topbar: ToolTopbarConfig = t.raw('topbar');

  return (
    <Layout sidebar={sidebar} topbar={topbar}>
      {children}
    </Layout>
  );
}
