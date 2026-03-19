import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { getThemeToolPage } from '@/core/theme';
import type { ToolPage } from '@/shared/types/blocks/tools';

export const revalidate = 3600;

function getToolNamespace(slug: string) {
  return `tools.${slug}`;
}

function getCanonicalPath(locale: string, slug: string) {
  return locale === envConfigs.locale ? `/${slug}` : `/${locale}/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  try {
    const t = await getTranslations({
      locale,
      namespace: getToolNamespace(slug),
    });
    const metadata = t.raw('metadata') as {
      title: string;
      description: string;
    };

    return {
      title: metadata.title,
      description: metadata.description,
      alternates: { canonical: getCanonicalPath(locale, slug) },
    };
  } catch {
    return {
      alternates: { canonical: getCanonicalPath(locale, slug) },
    };
  }
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  try {
    const t = await getTranslations({
      locale,
      namespace: getToolNamespace(slug),
    });
    const page = t.raw('page') as ToolPage;
    const Page = await getThemeToolPage('dynamic-page');

    return <Page locale={locale} page={page} />;
  } catch {
    notFound();
  }
}
