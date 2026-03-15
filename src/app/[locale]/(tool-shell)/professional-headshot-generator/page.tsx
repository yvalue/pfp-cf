import Link from 'next/link';
import {
  Briefcase,
  Check,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  ToolDashboardFaq,
  ToolDashboardIntro,
  ToolDashboardMain,
  ToolDashboardSection,
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

import { ProfessionalHeadshotControls } from './professional-headshot-controls';
import { ProfessionalHeadshotResultPanel } from './professional-headshot-result-panel';

export const revalidate = 3600;

export const generateMetadata = async () => ({
  title: 'Professional Headshot Generator',
  description: 'Professional headshot generator dashboard preview.',
  alternates: {
    canonical: '/professional-headshot-generator',
  },
});

const featureHighlights = [
  'Turn casual portraits into polished business-ready headshots.',
  'Keep the interaction surface focused while long-form content stays below.',
  'Reuse the same dashboard shell for future portrait or profile tools.',
];

const faqItems = [
  {
    value: 'faq-photo',
    question: 'What kind of source photo works best?',
    answer:
      'Use a clear front-facing portrait with even lighting and minimal blur. The better the source image, the more natural the generated headshot looks.',
  },
  {
    value: 'faq-style',
    question: 'Can I request a specific professional style?',
    answer:
      'Yes. Use the instruction field to describe wardrobe, expression, background, and lighting direction so the final portrait matches your use case.',
  },
  {
    value: 'faq-usage',
    question: 'Where can I use the generated result?',
    answer:
      'This type of image is suitable for LinkedIn, personal websites, resumes, team pages, and internal company directories.',
  },
];

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
  const sidebarItems = [
    { label: 'Professional Headshot', href: routeHref, active: true },
  ];

  return (
    <ToolDashboardShell>
      <ToolDashboardSidebar
        brand={
          <Link className="flex items-center gap-3" href={routeHref}>
            <div className="bg-primary/12 text-primary flex size-10 items-center justify-center rounded-2xl">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold tracking-tight">
                AI_PFP
              </span>
            </div>
          </Link>
        }
        navigation={
          <div className="grid gap-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                className={[
                  'flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                ].join(' ')}
                href={item.href}
              >
                <span>{item.label}</span>
                {item.active ? (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold">
                    Live
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        }
        footer={
          <div className="border-border/60 bg-background/80 grid gap-3 rounded-[24px] border p-4">
            <Button className="w-full justify-center" size="sm">
              Upgrade
            </Button>
          </div>
        }
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
            <Button asChild size="sm">
              <Link href={`/${locale}/sign-in`}>{t('sign.sign_in_title')}</Link>
            </Button>
          }
        />

        <ToolDashboardWorkbench
          className="border-0 bg-transparent px-0 py-2"
          gridClassName="gap-4 lg:grid-cols-12 xl:grid-cols-12"
          leftPaneClassName="rounded-[20px] border-primary/10 bg-white/85 backdrop-blur-xl lg:col-span-4 lg:px-7 lg:py-6"
          rightPaneClassName="rounded-[20px] border-primary/10 bg-white/85 backdrop-blur-xl lg:col-span-8 lg:px-7 lg:py-6"
          left={<ProfessionalHeadshotControls />}
          right={<ProfessionalHeadshotResultPanel />}
        />

        <ToolDashboardIntro
          description="Keep descriptive product content below the workbench so the upper area stays focused on upload, generation, and review."
          eyebrow="Overview"
          highlights={
            <div className="border-border/60 bg-background/70 grid gap-3 rounded-[26px] border p-5">
              <div className="text-sm font-semibold">
                Why it fits this shell
              </div>
              <div className="grid gap-3">
                {featureHighlights.map((item) => (
                  <div
                    key={item}
                    className="border-border/50 bg-card grid grid-cols-[auto_1fr] items-start gap-3 rounded-2xl border px-4 py-3"
                  >
                    <div className="bg-primary/12 text-primary mt-0.5 flex size-5 items-center justify-center rounded-full">
                      <Check className="size-3.5" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-6">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }
          title="Professional Headshot Generator"
        >
          <div className="text-muted-foreground grid gap-4 text-sm leading-7 md:text-base">
            <p>
              This page uses the same dashboard shell as the demo route, but the
              content now reflects a real portrait tool. The top area handles
              image input and result review, while secondary content lives below
              in full-width sections.
            </p>
            <p>
              That split keeps the workflow efficient. Users can upload, refine,
              and evaluate the portrait without losing context, then scroll into
              product explanation and support only when they need it.
            </p>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="border-border/60 bg-background/70 rounded-[22px] border p-4">
                <div className="text-foreground mb-2 flex items-center gap-2 font-medium">
                  <Wand2 className="text-primary size-4" />
                  Guided Form
                </div>
                <p className="text-sm leading-6">
                  Input area stays compact and task-specific.
                </p>
              </div>
              <div className="border-border/60 bg-background/70 rounded-[22px] border p-4">
                <div className="text-foreground mb-2 flex items-center gap-2 font-medium">
                  <Briefcase className="text-primary size-4" />
                  Business Output
                </div>
                <p className="text-sm leading-6">
                  The preview pane reads like a final professional asset.
                </p>
              </div>
              <div className="border-border/60 bg-background/70 rounded-[22px] border p-4">
                <div className="text-foreground mb-2 flex items-center gap-2 font-medium">
                  <ShieldCheck className="text-primary size-4" />
                  Support Content
                </div>
                <p className="text-sm leading-6">
                  FAQ and guidance remain separate from the workbench.
                </p>
              </div>
            </div>
          </div>
        </ToolDashboardIntro>

        <ToolDashboardFaq
          description="These questions sit below the workbench so the top interaction area stays uncluttered."
          eyebrow="FAQ"
          items={faqItems.map((item) => ({
            ...item,
            answer: <p>{item.answer}</p>,
          }))}
          tip="When you wire real generation, this FAQ can move to route-level JSON while the left and right panes stay component-based."
          title="Professional headshot questions"
        />

        <ToolDashboardSection
          className="bg-background/70 border-dashed"
          description="The next implementation step is to connect the upload and generate controls to the actual image pipeline."
          title="Next Step"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={routeHref}>Stay on this page</Link>
            </Button>
          </div>
        </ToolDashboardSection>
      </ToolDashboardMain>
    </ToolDashboardShell>
  );
}
