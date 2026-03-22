'use client';

import { ArrowBigRight } from 'lucide-react';

import { SmartIcon } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesStep({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('bg-background py-16 md:py-24', section.className, className)}
    >
      <div className="@container relative container">
        <ScrollAnimation>
          <div className="mx-auto grid max-w-2xl gap-4 text-center">
            <span className="text-primary text-sm font-medium">{section.label}</span>
            <h2 className="text-foreground mx-auto max-w-full text-4xl font-semibold tracking-normal text-pretty md:max-w-5xl md:text-6xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-lg leading-7 text-balance md:text-xl">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="mt-16 grid gap-12 @3xl:grid-cols-4">
            {section.items?.map((item, idx) => (
              <div className="grid gap-4" key={idx}>
                <div className="grid gap-2 text-center">
                  <span className="bg-primary text-primary-foreground mx-auto flex size-10 items-center justify-center rounded-full text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <div className="relative">
                    <div className="mx-auto my-3 w-fit">
                      {item.icon && (
                        <SmartIcon name={item.icon as string} size={24} />
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <h3 className="text-foreground text-xl font-semibold tracking-normal md:text-2xl">
                      {item.title}
                    </h3>
                    {idx < (section.items?.length ?? 0) - 1 && (
                      <ArrowBigRight className="fill-muted stroke-primary absolute top-1/2 right-0 hidden -translate-y-1/2 translate-x-full @3xl:block" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg leading-7 text-balance md:text-xl">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
