'use client';

import { useState } from 'react';
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

function FieldBadge({
  children,
  variant = 'muted',
}: {
  children: React.ReactNode;
  variant?: 'required' | 'muted';
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

const aspectRatioOptions = [
  { label: 'Match Input' },
  { label: '9:16' },
  { label: '16:9' },
  { label: '1:1' },
];

const resolutionOptions = [{ label: '1K' }, { label: '2K' }, { label: '4K' }];

const batchSizeOptions = [
  { label: '1' },
  { label: '2' },
  { label: '3', premium: true },
  { label: '4', premium: true },
  { label: '5', premium: true },
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
];

function EffectThumbnail({
  accentClassName,
  cardClassName,
  silhouetteClassName,
}: {
  accentClassName: string;
  cardClassName: string;
  silhouetteClassName: string;
}) {
  return (
    <div
      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ${cardClassName}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.22),transparent_18%)]" />
      <div className="absolute inset-x-2.5 top-1.5 h-2.5 rounded-full bg-white/70" />
      <div
        className={`absolute inset-x-2.5 bottom-1.5 top-5 rounded-xl ${silhouetteClassName}`}
      />
      <div
        className={`absolute left-1.5 top-1.5 h-2 w-2 rounded-full ${accentClassName}`}
      />
    </div>
  );
}

export function ProfessionalHeadshotControls() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedEffectId, setSelectedEffectId] = useState(effectOptions[0].id);
  const activeTabIndex = activeTab === 'parameter' ? 1 : 0;
  const selectedEffect =
    effectOptions.find((item) => item.id === selectedEffectId) ??
    effectOptions[0];

  return (
    <div className="flex h-full flex-col gap-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col gap-6"
      >
        <TabsList className="border-zinc-300/80 bg-background/90 relative inline-grid h-auto w-full grid-cols-2 rounded-full border p-1 shadow-none backdrop-blur-sm">
          <div
            aria-hidden
            className="bg-primary absolute inset-y-1 left-1 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: 'calc((100% - 0.5rem) / 2)',
              transform: `translateX(${activeTabIndex * 100}%)`,
            }}
          />
          <TabsTrigger
            value="upload"
            className="text-foreground relative z-10 h-9 min-w-0 rounded-full bg-transparent px-4 text-[0.9rem] font-[450] tracking-tight transition-[transform,color] duration-300 ease-out will-change-transform data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none active:scale-[0.98]"
          >
            Upload Image
          </TabsTrigger>
          <TabsTrigger
            value="parameter"
            className="text-foreground relative z-10 h-9 min-w-0 rounded-full bg-transparent px-4 text-[0.9rem] font-[450] tracking-tight transition-[transform,color] duration-300 ease-out will-change-transform data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none active:scale-[0.98]"
          >
            Parameter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0 flex-1">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Upload Image</div>
                  <FieldBadge variant="required">
                    Required
                  </FieldBadge>
                </div>
              </div>

              <div className="border-primary/40 bg-primary/5 grid min-h-[168px] place-items-center rounded-2xl border-2 border-dashed px-6 py-5 text-center">
                <div className="grid gap-2">
                  <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl">
                    <Upload className="size-6" />
                  </div>
                  <div className="grid gap-1.5">
                    <p className="text-base font-medium text-slate-700">
                      Drop files or{' '}
                      <span className="text-primary font-semibold">
                        click to upload
                      </span>
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
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Description</div>
                  <FieldBadge>Optional</FieldBadge>
                </div>
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

            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Effect Style</div>
                <FieldBadge variant="required">Required</FieldBadge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="border-border/70 bg-background hover:border-primary/25 flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition-colors outline-none"
                  >
                    <EffectThumbnail
                      accentClassName={selectedEffect.accentClassName}
                      cardClassName={selectedEffect.cardClassName}
                      silhouetteClassName={selectedEffect.silhouetteClassName}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground truncate text-[15px] font-semibold">
                        {selectedEffect.label}
                      </div>
                    </div>
                    <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl border border-border/70 p-2 shadow-xl"
                  sideOffset={8}
                >
                  {effectOptions.map((effect) => {
                    const isSelected = effect.id === selectedEffectId;

                    return (
                      <DropdownMenuItem
                        key={effect.id}
                        className="focus:bg-primary/5 flex items-center gap-3 rounded-xl px-3 py-3"
                        onClick={() => setSelectedEffectId(effect.id)}
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parameter" className="mt-0 flex-1">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Model</div>
                  <FieldBadge>Default</FieldBadge>
                </div>
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
              <div className="grid gap-4">
                <div className="grid gap-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Aspect Ratio</div>
                    <FieldBadge>Default</FieldBadge>
                  </div>
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

                <div className="grid gap-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Quality</div>
                    <FieldBadge>Default</FieldBadge>
                  </div>
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

                <div className="grid gap-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Count</div>
                    <FieldBadge>Default</FieldBadge>
                  </div>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Batch Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchSizeOptions.map((item) => (
                        <SelectItem key={item.label} value={item.label}>
                          {item.premium
                            ? `${item.label} Premium`
                            : item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button size="lg" className="mt-auto min-w-44 rounded-xl text-base">
        Submit
        <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-black/10 px-1.5 text-base dark:bg-white/15">
          15
          <RiVipDiamondFill className="size-4 text-amber-400" />
        </span>
      </Button>
    </div>
  );
}
