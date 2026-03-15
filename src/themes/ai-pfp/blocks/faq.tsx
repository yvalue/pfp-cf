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

export function Faq({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section id={section.id} className={cn('py-8 md:py-16', className)}>
      <div className="container !max-w-4xl px-2 sm:px-6">
        <ScrollAnimation>
          <div className="px-5 py-7 text-center sm:px-7 md:px-9 md:py-9">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground text-lg leading-8">
                {section.description}
              </p>
            </div>
          </div>

          <div className="border-primary/25 bg-background/70 overflow-hidden rounded-3xl border">
            <div className="px-5 py-2 sm:px-7 md:px-9 md:py-3">
              <Accordion type="single" collapsible className="w-full">
                {section.items?.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={item.question || item.title || ''}
                    className="border-primary/25 border-b last:border-b-0"
                  >
                    <AccordionTrigger className="cursor-pointer items-center py-5 text-base font-semibold hover:no-underline md:text-lg">
                      {item.question || item.title || ''}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <p className="text-muted-foreground max-w-3xl text-base leading-8">
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
    </section>
  );
}
