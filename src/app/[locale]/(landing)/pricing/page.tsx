import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { getMetadata } from '@/shared/lib/seo';
import { getCurrentSubscription } from '@/shared/models/subscription';
import { getUserInfo } from '@/shared/models/user';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.pricing.metadata',
  canonicalUrl: '/pricing',
});

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // get current subscription
  let currentSubscription;
  try {
    const user = await getUserInfo();
    if (user) {
      currentSubscription = await getCurrentSubscription(user.id);
    }
  } catch (error) {
    console.log('getting current subscription failed:', error);
  }

  // get pricing data
  const t = await getTranslations('pages.pricing');

  // build page sections
  const page: DynamicPage = {
    show_sections: ['pricing', 'faq'],
    sections: {
      pricing: {
        ...t.raw('page.sections.pricing'),
        className: '!bg-slate-50 dark:!bg-slate-950',
        data: {
          currentSubscription,
        },
      },
      faq: {
        ...t.raw('page.sections.faq'),
        className: 'bg-slate-50 dark:bg-slate-950',
      },
    },
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <Page locale={locale} page={page} />
    </div>
  );
}
