'use client';

import { useState, type ReactNode } from 'react';
import { Check, ChevronsUpDown, Sparkles, Upload } from 'lucide-react';
import { RiVipDiamondFill } from 'react-icons/ri';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { NANO_BANANA_MODEL_FAMILIES } from '@/shared/lib/ai-image';

type FieldBadgeVariant = 'required' | 'muted';
type HeadshotTab = 'upload' | 'parameter';
type SelectOption = {
  label: string;
  value: string;
};

const tabOptions = [
  { value: 'upload', label: 'Upload Image' },
  { value: 'parameter', label: 'Parameter' },
] as const;

const sectionClassName = 'grid gap-6 lg:max-xl:gap-5';
const tabTriggerClassName =
  'text-foreground data-[state=active]:text-primary-foreground relative z-10 h-9 min-w-0 rounded-full bg-transparent px-4 text-sm font-medium tracking-tight transition-[transform,color] duration-300 ease-out will-change-transform active:scale-[0.98] data-[state=active]:bg-transparent data-[state=active]:shadow-none';
const selectTriggerClassName = 'h-10 w-full rounded-xl';

const modelOptions: SelectOption[] = NANO_BANANA_MODEL_FAMILIES.map((item) => ({
  label: item.label,
  value: item.id,
}));

const aspectRatioOptions: SelectOption[] = [
  { label: 'Match Input', value: 'Match Input' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
  { label: '1:1', value: '1:1' },
];

const resolutionOptions: SelectOption[] = [
  { label: '1K', value: '1K' },
  { label: '2K', value: '2K' },
  { label: '4K', value: '4K' },
];

const batchSizeOptions: SelectOption[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3 Premium', value: '3' },
  { label: '4 Premium', value: '4' },
  { label: '5 Premium', value: '5' },
];

const effectOptions = [
  {
    id: 'linkedin-headshot',
    label: 'LinkedIn Headshot',
    accentClassName: 'bg-sky-300',
    cardClassName:
      'bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.92),transparent_28%),linear-gradient(160deg,#0f172a,#1e293b_50%,#334155)]',
    silhouetteClassName:
      'bg-[linear-gradient(180deg,rgba(203,213,225,0.96),rgba(241,245,249,0.72))]',
  },
  {
    id: 'studio-clean',
    label: 'Studio Portrait',
    accentClassName: 'bg-amber-300',
    cardClassName:
      'bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.88),transparent_24%),linear-gradient(160deg,#f5e7cf,#ead5b7_48%,#d6b98f)]',
    silhouetteClassName:
      'bg-[linear-gradient(180deg,rgba(120,53,15,0.34),rgba(217,119,6,0.18))]',
  },
  {
    id: 'executive-office',
    label: 'Office Portrait',
    accentClassName: 'bg-emerald-300',
    cardClassName:
      'bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.82),transparent_24%),linear-gradient(160deg,#164e63,#155e75_42%,#0f766e)]',
    silhouetteClassName:
      'bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(204,251,241,0.28))]',
  },
  {
    id: 'soft-window-light',
    label: 'Soft Light Portrait',
    accentClassName: 'bg-rose-300',
    cardClassName:
      'bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.94),transparent_24%),linear-gradient(160deg,#f3d8dd,#f8e5ea_46%,#e9c2c9)]',
    silhouetteClassName:
      'bg-[linear-gradient(180deg,rgba(148,163,184,0.55),rgba(255,255,255,0.72))]',
  },
] as const;

type EffectOption = (typeof effectOptions)[number];
type EffectOptionId = EffectOption['id'];

function FieldBadge({
  children,
  variant = 'muted',
}: {
  children: ReactNode;
  variant?: FieldBadgeVariant;
}) {
  return (
    <span
      className={
        variant === 'required'
          ? 'bg-primary/10 text-primary inline-flex items-center rounded-full px-2 text-xs font-medium'
          : 'bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 text-xs font-medium'
      }
    >
      {children}
    </span>
  );
}

function FieldHeader({
  badge,
  badgeVariant = 'muted',
  label,
}: {
  badge: string;
  badgeVariant?: FieldBadgeVariant;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-medium">{label}</h3>
      <FieldBadge variant={badgeVariant}>{badge}</FieldBadge>
    </div>
  );
}

function StaticSelectField({
  defaultValue,
  label,
  options,
  placeholder,
}: {
  defaultValue: string;
  label: string;
  options: SelectOption[];
  placeholder: string;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <FieldHeader badge="Default" label={label} />
      <Select defaultValue={defaultValue}>
        <SelectTrigger className={selectTriggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EffectThumbnail({
  accentClassName,
  cardClassName,
  silhouetteClassName,
}: Pick<
  EffectOption,
  'accentClassName' | 'cardClassName' | 'silhouetteClassName'
>) {
  return (
    <div
      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl lg:max-xl:h-10 lg:max-xl:w-10 ${cardClassName}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.22),transparent_18%)]" />
      <div className="absolute inset-x-2.5 top-1.5 h-2.5 rounded-full bg-white/70" />
      <div
        className={`absolute inset-x-2.5 top-5 bottom-1.5 rounded-2xl ${silhouetteClassName}`}
      />
      <div
        className={`absolute top-1.5 left-1.5 h-2 w-2 rounded-full ${accentClassName}`}
      />
    </div>
  );
}

export function ProfessionalHeadshotControls() {
  const [activeTab, setActiveTab] = useState<HeadshotTab>('upload');
  const [selectedEffectId, setSelectedEffectId] = useState<EffectOptionId>(
    effectOptions[0].id
  );
  const activeTabIndex = tabOptions.findIndex((tab) => tab.value === activeTab);
  const selectedEffect =
    effectOptions.find((item) => item.id === selectedEffectId) ??
    effectOptions[0];

  return (
    <div className="flex h-full flex-col gap-6 lg:max-xl:gap-5">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as HeadshotTab)}
        className="flex min-h-0 flex-1 flex-col gap-6 lg:max-xl:gap-5"
      >
        <TabsList className="border-border/70 relative inline-grid h-auto w-full grid-cols-2 rounded-full border bg-white p-1 shadow-none backdrop-blur-sm">
          <div
            aria-hidden
            className="bg-primary absolute inset-y-1 left-1 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: 'calc((100% - 0.5rem) / 2)',
              transform: `translateX(${activeTabIndex * 100}%)`,
            }}
          />
          {tabOptions.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={tabTriggerClassName}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="upload" className="mt-0 flex-1">
          <div className={sectionClassName}>
            <section className="grid gap-2">
              <FieldHeader
                badge="Required"
                badgeVariant="required"
                label="Upload Image"
              />

              <div className="border-primary/40 bg-primary/5 grid min-h-32 place-items-center rounded-3xl border-2 border-dashed px-6 py-5 text-center lg:max-xl:min-h-28 lg:max-xl:px-4 lg:max-xl:py-4">
                <div className="grid gap-2 lg:max-xl:gap-1.5">
                  <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl lg:max-xl:size-12">
                    <Upload className="size-6 lg:max-xl:size-5" />
                  </div>
                  <div className="grid gap-1.5 lg:max-xl:gap-1">
                    <p className="text-foreground text-base font-medium break-words lg:max-xl:text-sm">
                      Drop files or{' '}
                      <span className="text-primary font-semibold">
                        click to upload
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs leading-5 lg:max-xl:leading-4">
                      PNG, JPG, JPEG or WEBP (max 10MB each)
                      <br />
                      <span className="text-muted-foreground font-medium">
                        Supports multiple images
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-2">
              <FieldHeader badge="Optional" label="Description" />

              <div className="border-border/70 relative min-h-32 rounded-3xl border bg-white px-4 py-4 lg:max-xl:min-h-28 lg:max-xl:px-3.5 lg:max-xl:py-3.5">
                <p className="text-muted-foreground text-sm leading-5">
                  Describe how your image should look like...
                </p>
                <div className="text-muted-foreground absolute right-4 bottom-3 flex items-center gap-2 text-xs lg:max-xl:right-3.5 lg:max-xl:bottom-2.5 lg:max-xl:gap-1.5">
                  <Sparkles className="size-3.5" />
                  <span>0/1000</span>
                </div>
              </div>
            </section>

            <section className="grid gap-3 lg:max-xl:gap-2.5">
              <FieldHeader
                badge="Required"
                badgeVariant="required"
                label="Effect Style"
              />

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="border-border/70 hover:border-border flex w-full min-w-0 items-center gap-3 rounded-3xl border bg-white px-3 py-2.5 text-left shadow-sm transition-colors outline-none lg:max-xl:gap-2.5 lg:max-xl:px-2.5 lg:max-xl:py-2"
                  >
                    <EffectThumbnail
                      accentClassName={selectedEffect.accentClassName}
                      cardClassName={selectedEffect.cardClassName}
                      silhouetteClassName={selectedEffect.silhouetteClassName}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground truncate text-sm font-semibold">
                        {selectedEffect.label}
                      </div>
                    </div>
                    <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="border-border/70 w-[var(--radix-dropdown-menu-trigger-width)] rounded-3xl border bg-white p-2 shadow-xl"
                  sideOffset={8}
                >
                  {effectOptions.map((effect) => {
                    const isSelected = effect.id === selectedEffectId;

                    return (
                      <DropdownMenuItem
                        key={effect.id}
                        className="focus:bg-primary/5 flex items-center gap-3 rounded-2xl px-3 py-3 lg:max-xl:gap-2.5 lg:max-xl:px-2.5 lg:max-xl:py-2.5"
                        onSelect={() => setSelectedEffectId(effect.id)}
                      >
                        <EffectThumbnail
                          accentClassName={effect.accentClassName}
                          cardClassName={effect.cardClassName}
                          silhouetteClassName={effect.silhouetteClassName}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground truncate text-sm font-semibold">
                            {effect.label}
                          </div>
                        </div>
                        {isSelected ? (
                          <Check className="text-primary size-4 shrink-0" />
                        ) : null}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="parameter" className="mt-0 flex-1">
          <div className={sectionClassName}>
            <StaticSelectField
              defaultValue={modelOptions[0]?.value ?? ''}
              label="Model"
              options={modelOptions}
              placeholder="Model"
            />

            <div className="grid gap-4 lg:max-xl:gap-3.5">
              <StaticSelectField
                defaultValue="Match Input"
                label="Aspect Ratio"
                options={aspectRatioOptions}
                placeholder="Aspect Ratio"
              />
              <StaticSelectField
                defaultValue="2K"
                label="Quality"
                options={resolutionOptions}
                placeholder="Resolution"
              />
              <StaticSelectField
                defaultValue="1"
                label="Count"
                options={batchSizeOptions}
                placeholder="Batch Size"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        size="lg"
        className="mt-auto min-w-44 rounded-xl text-base lg:max-xl:min-w-0 lg:max-xl:text-sm"
      >
        Submit
        <span className="bg-foreground/10 ml-2 inline-flex items-center gap-1 rounded-md px-1.5 text-base lg:max-xl:text-sm">
          15
          <RiVipDiamondFill className="size-4 text-amber-400" />
        </span>
      </Button>
    </div>
  );
}
