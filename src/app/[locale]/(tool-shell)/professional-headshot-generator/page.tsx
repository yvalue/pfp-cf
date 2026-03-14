import Link from 'next/link';
import {
  ArrowUpRight,
  Briefcase,
  Check,
  Download,
  ImagePlus,
  RefreshCw,
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

export const revalidate = 3600;

export const generateMetadata = async () => ({
  title: 'Professional Headshot Generator',
  description: 'Professional headshot generator dashboard preview.',
  alternates: {
    canonical: '/professional-headshot-generator',
  },
});

const promptSuggestions = [
  'Corporate office background',
  'Soft studio lighting',
  'Clean navy blazer',
];

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
  const toolShellHref = `/${locale}/tool-shell`;
  const routeHref = `/${locale}/professional-headshot-generator`;
  const sidebarItems = [
    { label: 'Tool Shell', href: toolShellHref },
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
                Img-FX
              </span>
              <span className="text-muted-foreground text-xs">
                Professional Headshot
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
            <div className="grid gap-1">
              <div className="text-sm font-semibold">Professional Pack</div>
              <p className="text-muted-foreground text-xs leading-5">
                Keep credits, usage notes, or an upgrade CTA in this fixed slot.
              </p>
            </div>
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
          left={
            <div className="grid gap-6">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Professional Headshot Generator
                  </h1>
                  <p className="text-muted-foreground max-w-sm text-sm leading-6">
                    Transform casual portraits into studio-style professional
                    headshots for resumes, LinkedIn, and company profiles.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="text-sm font-medium">Upload portrait</div>
                <div className="border-primary/35 bg-primary/5 grid min-h-64 place-items-center rounded-[28px] border border-dashed px-6 py-8 text-center">
                  <div className="grid gap-4">
                    <div className="bg-background text-primary mx-auto flex size-16 items-center justify-center rounded-2xl shadow-sm">
                      <ImagePlus className="size-7" />
                    </div>
                    <div className="grid gap-1">
                      <p className="font-medium">
                        Drop image here or click to upload
                      </p>
                      <p className="text-muted-foreground text-sm">
                        PNG, JPG, JPEG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">
                    Professional direction
                  </div>
                  <div className="text-muted-foreground text-xs">0 / 500</div>
                </div>
                <div className="border-border/60 bg-background/60 grid gap-3 rounded-[24px] border p-4">
                  <div className="text-muted-foreground text-sm leading-6">
                    Describe wardrobe, expression, background, and lighting so
                    the generated portrait matches your professional brand.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((prompt) => (
                      <button
                        key={prompt}
                        className="border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="h-12 rounded-2xl text-base font-semibold">
                <Sparkles className="size-4" />
                Generate Headshot
              </Button>
            </div>
          }
          right={
            <div className="grid gap-6">
              <div className="flex items-center justify-between gap-3">
                <div className="grid gap-1">
                  <div className="text-muted-foreground text-sm font-medium">
                    Result
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Professional preview
                  </h2>
                </div>
                <div className="border-border/60 bg-background/70 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
                  <Briefcase className="size-3.5" />
                  Profile-ready
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border-border/60 relative aspect-[16/10] overflow-hidden rounded-[28px] border bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.20),transparent_28%),linear-gradient(135deg,rgba(250,251,255,0.98),rgba(236,241,255,0.88)_44%,rgba(224,232,255,0.96))]">
                  <div className="grid h-full grid-cols-[1fr_220px]">
                    <div className="grid h-full place-items-center p-6">
                      <div className="grid w-full max-w-[500px] gap-4 rounded-[30px] border border-black/5 bg-white/72 p-6 shadow-[0_20px_48px_rgba(17,24,39,0.10)] backdrop-blur">
                        <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
                          <div className="aspect-[4/5] rounded-[24px] bg-[linear-gradient(180deg,rgba(226,232,240,0.82),rgba(203,213,225,0.68))]" />
                          <div className="grid content-between gap-4">
                            <div className="grid gap-2">
                              <div className="h-3 w-24 rounded-full bg-slate-200" />
                              <div className="h-10 rounded-2xl bg-slate-100" />
                              <div className="h-10 rounded-2xl bg-slate-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="h-16 rounded-2xl bg-slate-100" />
                              <div className="h-16 rounded-2xl bg-slate-100" />
                            </div>
                          </div>
                        </div>
                        <div className="h-12 rounded-2xl bg-slate-900" />
                      </div>
                    </div>

                    <div className="border-l border-black/5 bg-white/32 p-4 backdrop-blur">
                      <div className="grid h-full content-between gap-4">
                        <div className="grid gap-3">
                          <div className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                            Output Notes
                          </div>
                          <div className="grid gap-2 rounded-[22px] bg-white/70 p-3">
                            <div className="h-16 rounded-2xl bg-slate-100" />
                            <div className="h-16 rounded-2xl bg-slate-100" />
                          </div>
                        </div>
                        <div className="grid gap-2 rounded-[22px] bg-slate-900 px-4 py-5 text-white shadow-lg">
                          <div className="text-xs tracking-[0.24em] text-white/60 uppercase">
                            Delivery
                          </div>
                          <div className="text-sm leading-6 text-white/80">
                            Use this area for variants, audit notes, quality
                            checks, or face-safe export guidance.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-border/60 bg-background/60 grid gap-3 rounded-[24px] border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="grid gap-1">
                    <div className="font-medium">Result toolbar</div>
                    <p className="text-muted-foreground text-sm leading-6">
                      Reserve this area for compare, regenerate, download, or
                      export actions.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="size-4" />
                      Regenerate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button size="sm">
                      Open Asset
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          }
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
            <Button asChild size="sm" variant="outline">
              <Link href={toolShellHref}>Open dashboard demo</Link>
            </Button>
          </div>
        </ToolDashboardSection>
      </ToolDashboardMain>
    </ToolDashboardShell>
  );
}
