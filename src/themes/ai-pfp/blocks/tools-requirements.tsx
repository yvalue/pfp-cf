'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ToolsRequirements({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [activeItem, setActiveItem] = useState<string>('item-1');

  // This block uses one shared section image; individual accordion items do not control the preview.
  const sectionImage = section.image
    ? {
        image: section.image.src ?? '',
        alt: section.image.alt || section.title || '',
      }
    : undefined;

  return (
    <section
      id={section.id || section.name}
      className={cn(
        'overflow-x-hidden py-16 md:py-24',
        section.className,
        className
      )}
    >
      <div className="container grid gap-8 overflow-x-hidden md:gap-16 lg:gap-20">
        <ScrollAnimation>
          <div className="mx-auto grid max-w-4xl gap-4 text-center text-balance">
            <h2 className="text-foreground text-3xl font-semibold tracking-normal md:text-4xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-lg leading-7 md:text-xl">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid min-w-0 items-start gap-12 sm:px-6 md:grid-cols-2 lg:gap-20 lg:px-0">
          <ScrollAnimation delay={0.1} direction="left">
            <Accordion
              type="single"
              value={activeItem}
              onValueChange={(value) => setActiveItem(value as string)}
              className="w-full"
            >
              {section.items?.map((item, idx) => (
                <AccordionItem value={`item-${idx + 1}`} key={idx}>
                  <AccordionTrigger>
                    <div className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-normal md:text-xl">
                      {item.icon && (
                        <SmartIcon name={item.icon as string} size={24} />
                      )}
                      {item.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground text-lg leading-7 md:text-xl">
                      {item.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollAnimation>

          {sectionImage && (
            <ScrollAnimation delay={0.2} direction="right" className="self-start">
              <div className="border-border relative aspect-square w-full min-w-0 overflow-hidden rounded-3xl border shadow-sm">
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-hidden rounded-3xl"
                >
                  <LazyImage
                    src={sectionImage.image}
                    className="size-full object-cover object-center dark:mix-blend-lighten"
                    wrapperClassName="block size-full"
                    alt={sectionImage.alt}
                  />
                </motion.div>
              </div>
            </ScrollAnimation>
          )}
        </div>
      </div>
    </section>
  );
}
