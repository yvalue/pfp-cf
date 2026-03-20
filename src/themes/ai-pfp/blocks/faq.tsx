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
    <section id={section.id} className={cn('py-16 md:py-24', className)}>
      <div className="container !max-w-4xl">
        <ScrollAnimation>
          <div className="px-6 py-6 text-center md:px-6 md:py-6">
            <div className="mx-auto grid max-w-3xl gap-4">
              <h2 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground text-base leading-7 md:text-lg">
                {section.description}
              </p>
            </div>
          </div>

          <div className="border-primary/40 bg-background overflow-hidden rounded-3xl border">
            <div className="px-6 py-6">
              <Accordion type="single" collapsible className="w-full">
                {section.items?.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={item.question || item.title || ''}
                    className="border-primary/40 border-b last:border-b-0"
                  >
                    <AccordionTrigger className="text-foreground cursor-pointer items-center py-5 text-xl font-semibold tracking-tight hover:no-underline md:text-2xl">
                      {item.question || item.title || ''}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
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
    </section>
  );
}
