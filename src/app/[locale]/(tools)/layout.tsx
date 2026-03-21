import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { LocaleDetector } from '@/shared/blocks/common';
import { Footer as FooterType } from '@/shared/types/blocks/landing';
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
  const landingT = await getTranslations('landing');
  const Layout = await getThemeLayout('tools');
  const sidebar = t.raw('sidebar') as ToolSidebarConfig;
  const topbar = t.raw('topbar') as ToolTopbarConfig;
  const footer = landingT.raw('footer') as FooterType;

  return (
    <Layout sidebar={sidebar} topbar={topbar} footer={footer}>
      <LocaleDetector />
      {children}
    </Layout>
  );
}
