import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { LocaleDetector } from '@/shared/blocks/common';
import type {
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
  const sidebar = t.raw('sidebar') as ToolSidebarConfig;
  const topbar = t.raw('topbar') as ToolTopbarConfig;

  return (
    <Layout sidebar={sidebar} topbar={topbar}>
      <LocaleDetector />
      {children}
    </Layout>
  );
}
