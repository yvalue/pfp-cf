'use client';

import { LazyImage } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Logos({
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
      <div className={`mx-auto max-w-5xl px-6`}>
        <ScrollAnimation>
          <p className="text-muted-foreground text-center text-sm leading-6 font-medium md:text-base">
            {section.title}
          </p>
        </ScrollAnimation>
        <ScrollAnimation delay={0.2}>
          <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
            {section.items?.map((item, idx) => {
              const lightSrc = item.image?.src ?? '';
              const lightAlt = item.image?.alt ?? '';
              const darkSrc = item.image_invert?.src ?? '';
              const darkAlt = item.image_invert?.alt ?? lightAlt;

              return (
                <div key={idx}>
                  {darkSrc ? (
                    <>
                      <LazyImage className="h-8 w-fit dark:hidden" src={lightSrc} alt={lightAlt} />
                      <LazyImage className="hidden h-8 w-fit dark:block" src={darkSrc} alt={darkAlt} />
                    </>
                  ) : (
                    <LazyImage className="h-8 w-fit" src={lightSrc} alt={lightAlt} />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
