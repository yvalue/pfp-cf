import { User } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import type { UserNav } from '@/shared/types/blocks/common';
import type { Section } from '@/shared/types/blocks/landing';
import { Faq } from '@/themes/ai-pfp/blocks/faq';
import { FeaturesAccordion } from '@/themes/ai-pfp/blocks/features-accordion';
import { FeaturesGuide } from '@/themes/ai-pfp/blocks/features-guide';
import { ToolPageLayout } from '@/themes/ai-pfp/blocks/tool-page-layout';
import {
  ProfessionalHeadshotGenerator,
  type ProfessionalHeadshotGeneratorSection,
} from '@/shared/blocks/generator';

export const revalidate = 3600;

type PageMetadata = {
  title: string;
  description: string;
};

type ToolPageContent = {
  navigation: {
    label: string;
  };
  sidebar: {
    upgrade_title: string;
  };
  topbar: {
    breadcrumb_home: string;
    show_theme?: boolean;
    show_locale?: boolean;
    show_sign?: boolean;
    user_nav?: UserNav;
  };
  sections: {
    generator: ProfessionalHeadshotGeneratorSection;
    guide: Section;
    base_image_guide: Section;
    faq: Section;
  };
};

async function getToolPageMessages(locale: string) {
  const t = await getTranslations({
    locale,
    namespace: 'pages.professional-headshot-generator',
  });

  return {
    metadata: t.raw('metadata') as PageMetadata,
    page: t.raw('page') as ToolPageContent,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { metadata } = await getToolPageMessages(locale);
  const canonical =
    locale === envConfigs.locale
      ? '/professional-headshot-generator'
      : `/${locale}/professional-headshot-generator`;

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical,
    },
  };
}

export default async function ProfessionalHeadshotGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page } = await getToolPageMessages(locale);

  return (
    <ToolPageLayout
      sidebar={{
        items: [
          {
            href: '/professional-headshot-generator',
            label: page.navigation.label,
            icon: <User className="size-4" />,
          },
        ],
        primaryAction: {
          label: page.sidebar.upgrade_title,
        },
      }}
      topbar={{
        homeLabel: page.topbar.breadcrumb_home,
        currentLabel: page.navigation.label,
        showTheme: page.topbar.show_theme,
        showLocale: page.topbar.show_locale,
        showSign: page.topbar.show_sign,
        userNav: page.topbar.user_nav,
      }}
    >
        <ProfessionalHeadshotGenerator section={page.sections.generator} />

        <FeaturesGuide section={page.sections.guide} />

        <FeaturesAccordion section={page.sections.base_image_guide} />

        <Faq section={page.sections.faq} />
    </ToolPageLayout>
  );
}
