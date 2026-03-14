import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RiVipDiamondFill } from 'react-icons/ri';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { NANO_BANANA_MODEL_FAMILIES } from '@/shared/lib/ai-image';

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

const aspectRatioOptions = [
  {
    label: 'Match Input',
    shapeClassName: 'h-5 w-5 border-dashed border-primary',
    active: true,
  },
  {
    label: '9:16',
    shapeClassName: 'h-6 w-3.5',
  },
  {
    label: '16:9',
    shapeClassName: 'h-3.5 w-6',
  },
  {
    label: '1:1',
    shapeClassName: 'h-5 w-5',
  },
];

const resolutionOptions = [
  { label: '1K' },
  { label: '2K', active: true },
  { label: '4K' },
];

const batchSizeOptions = [
  { label: '1', active: true },
  { label: '2' },
  { label: '3', premium: true },
  { label: '4', premium: true },
  { label: '5', premium: true },
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
          left={
            <div className="flex h-full flex-col gap-6">

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Upload Image</div>
                </div>

                <div className="border-primary/40 bg-primary/5 grid min-h-[168px] place-items-center rounded-2xl border-2 border-dashed px-6 py-5 text-center">
                  <div className="grid gap-2">
                    <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl">
                      <Upload className="size-6" />
                    </div>
                    <div className="grid gap-1.5">
                      <p className="text-base font-medium text-slate-700">
                        Drop files or{' '}
                        <span className="text-primary font-semibold">click to upload</span>
                      </p>
                      <p className="text-muted-foreground text-xs leading-5">
                        PNG, JPG, JPEG or WEBP (max 10MB each)
                        <br />
                        <span className="text-primary font-medium">
                          Supports multiple images
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Description</div>
                </div>

                <div className="border-border bg-white relative min-h-[124px] rounded-2xl border px-4 py-4">
                  <p className="text-muted-foreground text-sm leading-5">
                    Describe how your image should look like...
                  </p>
                  <div className="text-muted-foreground absolute bottom-3 right-4 flex items-center gap-2 text-xs">
                    <Sparkles className="size-3.5" />
                    <span>0/1000</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Model</div>
                </div>

                <div className="min-w-0">
                  <Select defaultValue={NANO_BANANA_MODEL_FAMILIES[0]?.id}>
                    <SelectTrigger className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {NANO_BANANA_MODEL_FAMILIES.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Parameter</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="min-w-0">
                    <Select defaultValue="Match Input">
                      <SelectTrigger className="h-10 w-full rounded-xl">
                        <SelectValue placeholder="Aspect Ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatioOptions.map((item) => (
                          <SelectItem key={item.label} value={item.label}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0">
                    <Select defaultValue="2K">
                      <SelectTrigger className="h-10 w-full rounded-xl">
                        <SelectValue placeholder="Resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.map((item) => (
                          <SelectItem key={item.label} value={item.label}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0">
                    <Select defaultValue="1">
                      <SelectTrigger className="h-10 w-full rounded-xl">
                        <SelectValue placeholder="Batch Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {batchSizeOptions.map((item) => (
                          <SelectItem key={item.label} value={item.label}>
                            {item.premium ? `${item.label} Premium` : item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button size="lg" className="mt-auto min-w-44 rounded-xl text-base">
                Submit
                <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-black/10 px-1.5 text-base dark:bg-white/15">
                  15
                  <RiVipDiamondFill className="size-4 text-amber-400" />
                </span>
              </Button>
            </div>
          }
          right={
            <div className="grid gap-5">
              <div className="grid gap-1.5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Professional Headshot Result
                </h2>
                <p className="text-muted-foreground text-sm">
                  Processing time 5-30 seconds
                </p>
              </div>

              <div className="border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,247,255,0.96))] rounded-2xl border p-4 shadow-sm">
                <div className="border-border/60 grid min-h-[420px] place-items-center overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(250,251,255,0.98),rgba(240,244,255,0.92))] p-5">
                  <div className="grid w-full max-w-[680px] items-center gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                    <div className="border-border/50 relative aspect-[4/5] overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(247,248,251,0.95),rgba(233,236,245,0.95))]">
                      <div className="absolute inset-5 rounded-[24px] bg-white/88 shadow-[0_12px_30px_rgba(15,23,42,0.08)]" />
                      <div className="absolute inset-x-14 top-14 h-20 rounded-full bg-rose-100/90" />
                      <div className="absolute inset-x-12 bottom-10 top-32 rounded-[36px] border border-rose-200/70 bg-[repeating-linear-gradient(135deg,rgba(244,114,182,0.10)_0,rgba(244,114,182,0.10)_14px,rgba(255,255,255,0.92)_14px,rgba(255,255,255,0.92)_30px)]" />
                      <div className="absolute left-8 top-8 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                        Source
                      </div>
                    </div>

                    <div className="text-foreground/80 flex size-14 items-center justify-center rounded-full bg-white shadow-sm">
                      <ArrowRight className="size-6" />
                    </div>

                    <div className="border-border/50 relative aspect-[4/5] overflow-hidden rounded-[28px] border bg-[radial-gradient(circle_at_top,rgba(255,245,228,0.95),transparent_30%),linear-gradient(180deg,rgba(253,248,240,0.98),rgba(241,232,216,0.98))]">
                      <div className="absolute inset-5 rounded-[24px] bg-white/42 backdrop-blur-[2px]" />
                      <div className="absolute inset-x-14 top-14 h-20 rounded-full bg-amber-100/95" />
                      <div className="absolute inset-x-12 bottom-12 top-32 rounded-[36px] bg-[linear-gradient(180deg,rgba(203,213,225,0.92),rgba(226,232,240,0.55))]" />
                      <div className="absolute inset-x-10 bottom-0 h-24 rounded-t-[44px] bg-white/55" />
                      <div className="absolute left-8 top-8 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                        Output
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="border-primary/15 bg-background text-foreground/80 hover:border-primary/35 hover:bg-primary/5 h-11 rounded-xl border"
                variant="outline"
              >
                <Download className="text-primary size-4" />
                Download
              </Button>
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
          </div>
        </ToolDashboardSection>
      </ToolDashboardMain>
    </ToolDashboardShell>
  );
}
