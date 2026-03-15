'use client';

import { Download } from 'lucide-react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

import { Button } from '@/shared/components/ui/button';

const usageSteps = [
  'Upload your photo',
  'Choose a style',
  'Adjust parameters or description (optional)',
  'Wait and download'
];

function ComparisonHandle() {
  return (
    <div className="pointer-events-none relative flex h-full items-center justify-center text-white">
      <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white" />
      <div className="relative z-10 inline-flex items-center gap-5 bg-transparent px-0 text-[11px] font-semibold tracking-[0.18em]">
        <span aria-hidden className="text-sm text-white">
          &#x25C0;
        </span>
        <span aria-hidden className="text-sm text-white">
          &#x25B6;
        </span>
      </div>
    </div>
  );
}

export function ProfessionalHeadshotResultPanel() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Professional Headshot Generator
        </h2>
        <p className="text-muted-foreground text-sm">
          Make professional headshots in seconds with a reusable comparison and
          guidance layout.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(280px,0.82fr)]">
        <div className="rounded-[24px] border border-primary/10 bg-white/72 p-4 backdrop-blur">
          <div className="mb-3 text-center">
            <div className="text-foreground text-lg font-semibold">Example</div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <ReactCompareSlider
              position={50}
              handle={<ComparisonHandle />}
              itemOne={
                <div className="relative aspect-square w-full">
                  <ReactCompareSliderImage
                    alt="Original portrait example"
                    src="/imgs/tool-dashboard/professional-headshot-generator/before.jpg"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur">
                    Before
                  </div>
                </div>
              }
              itemTwo={
                <div className="relative aspect-square w-full">
                  <ReactCompareSliderImage
                    alt="Enhanced professional headshot example"
                    src="/imgs/tool-dashboard/professional-headshot-generator/after.jpg"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute right-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-900 uppercase backdrop-blur">
                    After
                  </div>
                </div>
              }
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
              }}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-primary/10 bg-white/78 p-5 backdrop-blur">
          <div className="text-foreground text-center text-lg font-semibold">
            How to Use
          </div>
          <div className="mt-4 grid gap-3">
            {usageSteps.map((step, index) => (
              <div
                key={step}
                className="border-border/70 bg-background/80 grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border px-4 py-3"
              >
                <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-sm font-semibold shadow-sm">
                  {index + 1}
                </div>
                <p className="text-foreground text-sm leading-6">
                  {step}
                </p>
              </div>
            ))}
          </div>
          <p className="text-primary/80 mt-4 text-xs leading-5">
            Tip: Not happy with the presets? Upload a reference image and update the description.
          </p>
        </div>
      </div>

      <Button className="h-11 w-fit justify-self-center rounded-xl border-0 bg-blue-300 px-5 text-white transition-opacity hover:bg-blue-500">
        <Download className="size-4" />
        Download
      </Button>
    </div>
  );
}
