import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import {
  getToolNavItemFromSlug,
  getToolSidebarItems,
} from '@/shared/lib/tools';
import type { Sidebar as DashboardSidebar } from '@/shared/types/blocks/dashboard';
import type { ToolPage as ToolPageType } from '@/shared/types/blocks/tools';

export const revalidate = 3600;

async function getRegisteredTool(locale: string, slug: string) {
  const t = await getTranslations({ locale, namespace: 'tools' });
  const sidebar = t.raw('sidebar') as DashboardSidebar;
  const items = getToolSidebarItems(sidebar);

  if (!items.length) {
    throw new Error('Tools sidebar items are required.');
  }

  const item = getToolNavItemFromSlug(items, slug);

  if (!item) {
    notFound();
  }

  return item;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  await getRegisteredTool(locale, slug);

  const t = await getTranslations({ locale, namespace: `tools.${slug}` });
  const metadata = t.raw('metadata') as { title: string; description: string };
  const canonical =
    locale === envConfigs.locale ? `/${slug}` : `/${locale}/${slug}`;

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  await getRegisteredTool(locale, slug);

  try {
    const t = await getTranslations({ locale, namespace: `tools.${slug}` });
    const page = t.raw('page') as ToolPageType;
    const Page = await getThemePage('tools-dynamic-page');

    return <Page locale={locale} page={page} />;
  } catch {
    return notFound();
  }
}
