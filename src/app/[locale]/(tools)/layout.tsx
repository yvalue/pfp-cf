import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { envConfigs } from '@/config';
import { LocaleDetector } from '@/shared/blocks/common';
import type {
  Header as DashboardHeaderConfig,
  Sidebar as DashboardSidebar,
} from '@/shared/types/blocks/dashboard';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

export default async function ToolsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('tools');
  const landingT = await getTranslations('landing');
  const Layout = await getThemeLayout('tools');
  const sidebar = t.raw('sidebar') as DashboardSidebar;
  const header = t.raw('header') as DashboardHeaderConfig;
  const footer = landingT.raw('footer') as FooterType;

  if (sidebar.header?.brand) {
    sidebar.header.brand.title =
      envConfigs.app_name || sidebar.header.brand.title;
    if (sidebar.header.brand.logo) {
      sidebar.header.brand.logo.alt =
        envConfigs.app_name || sidebar.header.brand.logo.alt;
      sidebar.header.brand.logo.src =
        envConfigs.app_logo || sidebar.header.brand.logo.src;
    }
  }

  return (
    <Layout sidebar={sidebar} header={header} footer={footer}>
      <LocaleDetector />
      {children}
    </Layout>
  );
}
