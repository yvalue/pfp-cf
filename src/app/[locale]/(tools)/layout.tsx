import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
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
      <LocaleDetector />
      {topbar.topbanner?.text && (
        <TopBanner
          enabled={topbar.topbanner.enabled}
          id={topbar.topbanner.id ?? 'tools-topbanner'}
          text={topbar.topbanner.text}
          buttonText={topbar.topbanner.buttonText}
          href={topbar.topbanner.href}
          target={topbar.topbanner.target}
          closable
          rememberDismiss
          dismissedExpiryDays={topbar.topbanner.dismissedExpiryDays ?? 1}
        />
      )}
      {children}
    </Layout>
  );
}
