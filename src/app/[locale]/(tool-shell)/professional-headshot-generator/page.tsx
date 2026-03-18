import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { getThemePage } from '@/core/theme';
import type { ToolDashboardPage } from '@/shared/types/blocks/tool-dashboard';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'pages.professional-headshot-generator',
  });
  const metadata = t.raw('metadata') as { title: string; description: string };
  const canonical =
    locale === envConfigs.locale
      ? '/professional-headshot-generator'
      : `/${locale}/professional-headshot-generator`;

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical },
  };
}

export default async function ProfessionalHeadshotGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: 'pages.professional-headshot-generator',
  });
  const page = t.raw('page') as ToolDashboardPage;

  const Page = await getThemePage('tool-page');

  return <Page locale={locale} page={page} />;
}
