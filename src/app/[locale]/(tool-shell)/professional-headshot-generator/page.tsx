import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { User } from 'lucide-react';

import { envConfigs } from '@/config';

import {
  ToolDashboardMain,
  ToolDashboardShell,
  ToolDashboardSidebar,
  ToolDashboardTopbar,
  ToolDashboardWorkbench,
} from '@/shared/blocks/tool-dashboard';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { FeaturesGuide } from '@/themes/ai-pfp/blocks/features-guide';
import { Faq } from '@/themes/ai-pfp/blocks/faq';

import { ProfessionalHeadshotControls } from './professional-headshot-controls';
import { ProfessionalHeadshotMobileNav } from './professional-headshot-mobile-nav';
import { ProfessionalHeadshotResultPanel } from './professional-headshot-result-panel';

export const revalidate = 3600;

export const generateMetadata = async () => ({
  title: 'Professional Headshot Generator',
  description: 'Professional headshot generator dashboard preview.',
  alternates: {
    canonical: '/professional-headshot-generator',
  },
});

const faqItems = [
  {
    value: 'faq-upload-photo',
    question: 'What kind of photo should I upload?',
    answer:
      'Upload a clear front-facing portrait with even lighting and visible shoulders. A simple background and sharp facial details will usually produce a better professional headshot.',
  },
  {
    value: 'faq-description',
    question: 'Do I need to write a description?',
    answer:
      'No. You can generate a result with the default style settings. If you want more control, add a short description for outfit, background, lighting, or expression.',
  },
  {
    value: 'faq-generation-time',
    question: 'How long does it take to generate a headshot?',
    answer:
      'Generation usually takes a few seconds to a short wait, depending on image size, selected settings, and current traffic.',
  },
  {
    value: 'faq-usage',
    question: 'Where can I use the generated headshot?',
    answer:
      'You can use it for LinkedIn, resumes, personal websites, team profile pages, business cards, and other professional profile placements.',
  },
  {
    value: 'faq-better-results',
    question: 'What should I do if the result does not look right?',
    answer:
      'Try uploading a clearer photo, choosing a different style, or refining the description. Small changes to lighting, background, and expression instructions can improve the final result.',
  },
];

const faqSection = {
  title: 'Professional headshot questions',
  description:
    'Common questions about uploading, generating, and using your professional headshot.',
  tip: 'Start with a clear portrait, then adjust style or description only if you need a more specific result.',
  items: faqItems,
};

const baseImageGuideSection = {
  title: 'How to Create an Upload-Ready Professional Headshot Base Image',
  description:
    'To generate a high-quality result, the base photo matters. Follow the steps below to prepare a clear portrait image for better AI output.',
  className: 'border-border/60 border-t mt-8',
  image: {
    src: '/imgs/tool-dashboard/professional-headshot-generator/how-to-create-professional%20headshot.jpg',
    alt: 'Professional headshot preparation guide illustration',
  },
  items: [
    {
      title: '1. Outfit and Appearance',
      description:
        'Choose clean, business-style clothing such as a light shirt with a dark jacket. Keep your hair neat, makeup and accessories simple, reduce facial shine, and avoid strong glare on glasses. The goal is a clean, natural look.',
      image: {
        src: '/imgs/tool-dashboard/professional-headshot-generator/before.jpg',
        alt: 'Professional headshot base image example',
      },
    },
    {
      title: '2. Choose the Right Light',
      description:
        'Stand in front of a window and face soft natural light. Overcast daylight or filtered window light works best. Avoid direct sun, harsh shadows, and mixed indoor lighting that can make skin tones look uneven.',
      image: {
        src: '/imgs/tool-dashboard/professional-headshot-generator/before.jpg',
        alt: 'Professional headshot base image example',
      },
    },
    {
      title: '3. Keep the Background Simple',
      description:
        'Use a plain wall or a simple indoor background with some contrast from your clothing. Avoid cluttered spaces or backgrounds that blend into your hair and outfit. A simple background helps the AI read your outline more accurately.',
      image: {
        src: '/imgs/tool-dashboard/professional-headshot-generator/before.jpg',
        alt: 'Professional headshot base image example',
      },
    },
    {
      title: '4. Use the Right Shooting Angle',
      description:
        'Use the main camera on your phone or camera and keep it at eye level. Relax your shoulders, lean slightly forward, and keep a natural expression. Frame your head, shoulders, and upper body with a little space above the head and no cropped shoulders.',
      image: {
        src: '/imgs/tool-dashboard/professional-headshot-generator/before.jpg',
        alt: 'Professional headshot base image example',
      },
    },
    {
      title: '5. Take Multiple Options',
      description:
        'Take at least ten photos before choosing one to upload. Try a soft smile, a neutral expression, small angle changes, and slightly different light positions. More options give you a better chance of finding the ideal base image.',
      image: {
        src: '/imgs/tool-dashboard/professional-headshot-generator/before.jpg',
        alt: 'Professional headshot base image example',
      },
    },
    {
      title: '6. Check Before Upload',
      description:
        'Make sure the image is sharp, evenly lit, centered, and clean in the background. Confirm the shoulders are visible and the face is clearly in focus. A photo that meets these conditions is a strong base image for generation.',
      image: {
        src: '/imgs/tool-dashboard/professional-headshot-generator/before.jpg',
        alt: 'Professional headshot base image example',
      },
    },
  ],
};

export default async function ProfessionalHeadshotGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');
  const homeHref = `/${locale}`;
  const routeHref = `/${locale}/professional-headshot-generator`;
  const signInHref = `/${locale}/sign-in`;
  const sidebarItems = [
    {
      label: 'Professional Headshot',
      href: routeHref,
      active: true,
      icon: 'user' as const,
    },
  ];

  return (
    <ToolDashboardShell>
      <ToolDashboardSidebar
        brand={
          <Link className="flex items-center gap-3" href={homeHref}>
            <Image
              src={envConfigs.app_logo}
              alt={envConfigs.app_name}
              width={36}
              height={36}
              className=""
            />
            <span className="text-lg font-semibold tracking-tight">
              {envConfigs.app_name}
            </span>
          </Link>
        }
        navigation={
          <div className="grid gap-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                className={[
                  'flex items-center rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                ].join(' ')}
                href={item.href}
              >
                {item.icon === 'user' ? (
                  <User className="mr-2.5 size-4 shrink-0" />
                ) : null}
                <span className="tracking-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        }
        footer={
          <div className="bg-background/70 grid gap-1.5 rounded-2xl px-2 py-2">
            <Button className="w-full justify-center" size="sm">
              Upgrade
            </Button>
          </div>
        }
      />

      <ProfessionalHeadshotMobileNav
        appLogo={envConfigs.app_logo}
        appName={envConfigs.app_name}
        homeHref={homeHref}
        items={sidebarItems}
        signInHref={signInHref}
        signInLabel={t('sign.sign_in_title')}
      />

      <ToolDashboardMain>
        <ToolDashboardTopbar
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={homeHref}>Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Professional Headshot</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          userInfo={
            <div className="hidden lg:flex">
              <Button asChild size="sm">
                <Link href={signInHref}>{t('sign.sign_in_title')}</Link>
              </Button>
            </div>
          }
        />

        <ToolDashboardWorkbench
          className="border-0 bg-transparent px-0 py-2"
          gridClassName="gap-4 lg:grid-cols-12 xl:grid-cols-12"
          leftPaneClassName="rounded-[20px] border-primary/10 bg-white/85 backdrop-blur-xl lg:col-span-4 lg:px-5 lg:py-5 xl:px-7 xl:py-6"
          rightPaneClassName="rounded-[20px] border-primary/10 bg-white/85 backdrop-blur-xl lg:col-span-8 lg:px-7 lg:py-6"
          left={<ProfessionalHeadshotControls />}
          right={<ProfessionalHeadshotResultPanel />}
        />

        <FeaturesGuide section={baseImageGuideSection} />

        <Faq className="border-border/60 border-t" section={faqSection} />
      </ToolDashboardMain>
    </ToolDashboardShell>
  );
}
