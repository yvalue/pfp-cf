import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  LayoutGrid,
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
  title: 'Tool Shell',
  description: 'Reusable tool subpage shell preview.',
  alternates: {
    canonical: '/tool-shell',
  },
});

const sidebarItems = [
  { label: 'Home' },
  { label: 'Create' },
  { label: 'Image Effects', active: true },
  { label: 'Video Effects' },
];

const promptSuggestions = [
  'Sharper studio lighting',
  'Natural office background',
  'Polished corporate wardrobe',
];

const featureHighlights = [
  'Swap in any task-specific panel without rewriting the page chrome.',
  'Keep intro and FAQ full-width so they do not inherit the workbench ratio.',
  'Reuse the same shell for image, video, audio, or document generation tools.',
];

const faqItems = [
  {
    value: 'faq-layout',
    question: 'Why keep the workbench as a single component?',
    answer:
      'Because the upper area is one layout unit. The shell owns spacing, pane ratio, and responsive collapse while the page only swaps slot content.',
  },
  {
    value: 'faq-sections',
    question: 'Why split intro and FAQ into two components?',
    answer:
      'They evolve differently. Intro is descriptive content, while FAQ is interactive content. Separate components keep their structure and data cleaner.',
  },
  {
    value: 'faq-reuse',
    question: 'Can this route become a template for more tools?',
    answer:
      'Yes. Replace the left and right pane nodes plus the lower sections, and the surrounding shell stays stable across tool pages.',
  },
];

export default async function ToolShellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');
  const toolShellHref = `/${locale}/tool-shell`;

  return (
    <ToolDashboardShell>
      <ToolDashboardSidebar
        brand={
          <Link className="flex items-center gap-3" href={toolShellHref}>
            <div className="bg-primary/12 text-primary flex size-10 items-center justify-center rounded-2xl">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold tracking-tight">
                Img-FX
              </span>
              <span className="text-muted-foreground text-xs">
                Tool Shell Preview
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
                href={toolShellHref}
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
              <div className="text-sm font-semibold">Fixed Area</div>
              <p className="text-muted-foreground text-xs leading-5">
                Put credits, upgrade CTA, support, or tool-wide notices here.
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
                    <Link href={toolShellHref}>Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={toolShellHref}>Image Effects</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tool Shell</BreadcrumbPage>
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
                    AI Headshot Generator
                  </h1>
                  <p className="text-muted-foreground max-w-sm text-sm leading-6">
                    Use this route to review the shell itself. The left pane can
                    hold forms, settings, or any other task controls.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="text-sm font-medium">Upload image</div>
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
                    Additional instructions
                  </div>
                  <div className="text-muted-foreground text-xs">0 / 500</div>
                </div>
                <div className="border-border/60 bg-background/60 grid gap-3 rounded-[24px] border p-4">
                  <div className="text-muted-foreground text-sm leading-6">
                    Add any specific directions for wardrobe, lighting,
                    expression, or background style.
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
                Create
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
                    Preview canvas
                  </h2>
                </div>
                <div className="border-border/60 bg-background/70 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
                  <LayoutGrid className="size-3.5" />
                  Shell demo
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border-border/60 aspect-[16/10] overflow-hidden rounded-[28px] border bg-[radial-gradient(circle_at_top_left,rgba(88,80,236,0.24),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,243,255,0.88)_40%,rgba(222,230,255,0.96))]">
                  <div className="grid h-full grid-cols-[1fr_220px]">
                    <div className="grid h-full place-items-center p-6">
                      <div className="grid w-full max-w-[520px] gap-4 rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_40px_rgba(17,24,39,0.08)] backdrop-blur">
                        <div className="grid gap-2">
                          <div className="h-3 w-24 rounded-full bg-slate-200" />
                          <div className="h-10 rounded-2xl bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-24 rounded-2xl bg-slate-100" />
                          <div className="h-24 rounded-2xl bg-slate-100" />
                          <div className="h-24 rounded-2xl bg-slate-100" />
                        </div>
                        <div className="h-12 rounded-2xl bg-slate-900" />
                      </div>
                    </div>

                    <div className="border-l border-black/5 bg-white/30 p-4 backdrop-blur">
                      <div className="grid h-full content-between gap-4">
                        <div className="grid gap-3">
                          <div className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                            Secondary Pane
                          </div>
                          <div className="grid gap-2 rounded-[22px] bg-white/70 p-3">
                            <div className="h-16 rounded-2xl bg-slate-100" />
                            <div className="h-16 rounded-2xl bg-slate-100" />
                          </div>
                        </div>
                        <div className="grid gap-2 rounded-[22px] bg-slate-900 px-4 py-5 text-white shadow-lg">
                          <div className="text-xs tracking-[0.24em] text-white/60 uppercase">
                            Output
                          </div>
                          <div className="text-sm leading-6 text-white/80">
                            Use this side for results, previews, logs, or a live
                            inspector.
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
                      This row can host actions like download, regenerate,
                      compare, or version history.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline">
                      Compare
                    </Button>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                    <Button size="sm">
                      Open File
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <ToolDashboardIntro
          description="The lower modules are intentionally full-width. They sit under the workbench but outside its column system so they can scale as content sections."
          eyebrow="Overview"
          highlights={
            <div className="border-border/60 bg-background/70 grid gap-3 rounded-[26px] border p-5">
              <div className="text-sm font-semibold">Why this shell works</div>
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
          title="Reusable subpage shell for tool routes"
        >
          <div className="text-muted-foreground grid gap-4 text-sm leading-7 md:text-base">
            <p>
              The top workbench is a single layout primitive. It owns the pane
              ratio, shell styling, and responsive behavior. Individual tool
              routes only swap the two pane nodes.
            </p>
            <p>
              Intro and FAQ stay independent below it. That keeps long-form
              product context, tutorials, and support content out of the upper
              interaction surface.
            </p>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="border-border/60 bg-background/70 rounded-[22px] border p-4">
                <div className="text-foreground mb-2 flex items-center gap-2 font-medium">
                  <Wand2 className="text-primary size-4" />
                  Workbench
                </div>
                <p className="text-sm leading-6">
                  One component with two slots.
                </p>
              </div>
              <div className="border-border/60 bg-background/70 rounded-[22px] border p-4">
                <div className="text-foreground mb-2 flex items-center gap-2 font-medium">
                  <LayoutGrid className="text-primary size-4" />
                  Intro
                </div>
                <p className="text-sm leading-6">
                  Full-width section for context and selling points.
                </p>
              </div>
              <div className="border-border/60 bg-background/70 rounded-[22px] border p-4">
                <div className="text-foreground mb-2 flex items-center gap-2 font-medium">
                  <Sparkles className="text-primary size-4" />
                  FAQ
                </div>
                <p className="text-sm leading-6">
                  Separate interactive support block.
                </p>
              </div>
            </div>
          </div>
        </ToolDashboardIntro>

        <ToolDashboardFaq
          description="This FAQ block is separate from intro on purpose, so each tool page can keep support content isolated and data-driven."
          eyebrow="FAQ"
          items={faqItems.map((item) => ({
            ...item,
            answer: <p>{item.answer}</p>,
          }))}
          tip="You can replace these items with localized copy later. The shell itself does not depend on a landing-page block schema."
          title="Questions about the shell"
        />

        <ToolDashboardSection
          className="bg-background/70 border-dashed"
          description="If this shell direction is right, the next step is wiring one real tool route to it and replacing the placeholder pane content."
          title="Next Step"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={toolShellHref}>Keep Iterating</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/${locale}`}>Back to Home</Link>
            </Button>
          </div>
        </ToolDashboardSection>
      </ToolDashboardMain>
    </ToolDashboardShell>
  );
}
