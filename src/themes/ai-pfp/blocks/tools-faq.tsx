'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { TextHighlight } from '@/shared/components/text-highlight';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ToolsFaq({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('overflow-x-hidden py-16 md:py-24', className)}
    >
      <div className="container !max-w-6xl">
        <div className="rounded-[2rem] bg-[#f4efff] px-6 py-12 md:px-10 md:py-16 dark:bg-card/40">
          <div className="mx-auto max-w-4xl">
            <ScrollAnimation>
              <div className="mx-auto grid max-w-3xl gap-4 text-center rounded-3xl">
                <h2 className="text-foreground text-2xl font-semibold tracking-normal md:text-3xl">
                  {section.title}
                </h2>
                <p className="text-muted-foreground text-base leading-7 md:text-lg">
                  {section.description}
                </p>
              </div>

              <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-background dark:bg-card">
                <div className="px-6">
                  <Accordion type="single" collapsible className="w-full">
                    {section.items?.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        value={item.question || item.title || ''}
                        className="border-border last:border-b-0"
                      >
                        <AccordionTrigger className="text-foreground cursor-pointer items-center py-5 text-base font-semibold tracking-normal hover:no-underline md:text-lg">
                          {item.question || item.title || ''}
                        </AccordionTrigger>
                        <AccordionContent className="pb-5">
                          <p className="text-muted-foreground text-base leading-7 md:text-lg">
                            <TextHighlight
                              text={item.answer || item.description || ''}
                            />
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  );
}
