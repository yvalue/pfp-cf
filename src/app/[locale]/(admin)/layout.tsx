import { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { requireAdminAccess } from '@/core/rbac/permission';
import { LocaleDetector } from '@/shared/blocks/common';
import {
  DashboardHeaderDefaultsProvider,
  DashboardLayout,
} from '@/shared/blocks/dashboard';
import { getAllConfigs } from '@/shared/models/config';
import { UserNav } from '@/shared/types/blocks/common';
import { Sidebar as SidebarType } from '@/shared/types/blocks/dashboard';

/**
 * Admin layout to manage datas
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Check if user has admin access permission
  await requireAdminAccess({
    redirectUrl: `/no-permission`,
    locale: locale || '',
  });

  const t = await getTranslations('admin');

  const sidebar: SidebarType = t.raw('sidebar');
  const headerUserNav: UserNav | undefined = sidebar.user
    ? {
        items: sidebar.user.nav?.items ?? [],
        show_sign_out: sidebar.user.show_signout,
      }
    : undefined;

  const configs = await getAllConfigs();
  const adminSidebar: SidebarType = {
    ...sidebar,
    header: sidebar.header
      ? {
          ...sidebar.header,
          version: configs.version || sidebar.header.version,
          brand: sidebar.header.brand
            ? {
                ...sidebar.header.brand,
                title: configs.app_name || sidebar.header.brand.title,
                description:
                  configs.app_description || sidebar.header.brand.description,
                logo: sidebar.header.brand.logo
                  ? {
                      ...sidebar.header.brand.logo,
                      src: configs.app_logo || sidebar.header.brand.logo.src,
                      alt: configs.app_name || sidebar.header.brand.logo.alt,
                    }
                  : sidebar.header.brand.logo,
              }
            : sidebar.header.brand,
        }
      : sidebar.header,
    user: undefined,
    footer: sidebar.footer
      ? {
          ...sidebar.footer,
          show_theme: false,
          show_locale: false,
        }
      : sidebar.footer,
  };

  return (
    <DashboardHeaderDefaultsProvider
      value={{
        show_theme: true,
        show_locale: true,
        show_sign: true,
        user_nav: headerUserNav,
      }}
    >
      <DashboardLayout sidebar={adminSidebar}>
        <LocaleDetector />
        {children}
      </DashboardLayout>
    </DashboardHeaderDefaultsProvider>
  );
}
