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
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="m-4 rounded-3xl">
        <div className="@container relative container">
          <ScrollAnimation>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-primary text-sm font-medium">{section.label}</span>
              <h2 className="text-foreground mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-7 text-balance md:text-lg md:leading-8">
                {section.description}
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2}>
            <div className="mt-20 grid gap-12 @3xl:grid-cols-4">
              {section.items?.map((item, idx) => (
                <div className="grid gap-6" key={idx}>
                  <div className="text-center">
                    <span className="bg-muted mx-auto flex size-6 items-center justify-center rounded-xl text-sm font-medium">
                      {idx + 1}
                    </span>
                    <div className="relative">
                      <div className="mx-auto my-6 w-fit">
                        {item.icon && (
                          <SmartIcon name={item.icon as string} size={24} />
                        )}
                      </div>
                      {idx < (section.items?.length ?? 0) - 1 && (
                        <ArrowBigRight className="fill-muted stroke-primary absolute inset-y-0 right-0 my-auto mt-1 hidden translate-x-full @3xl:block" />
                      )}
                    </div>
                    <h3 className="text-foreground mb-4 text-lg leading-7 font-semibold md:text-xl">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-base leading-7 text-balance">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
