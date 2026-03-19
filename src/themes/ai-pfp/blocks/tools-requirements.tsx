'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

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

  const images: any = {};
  section.items?.forEach((item, idx) => {
    images[`item-${idx + 1}`] = {
      image: item.image?.src ?? '',
      alt: item.image?.alt || item.title || '',
    };
  });
  const previewImage = section.image
    ? {
        image: section.image.src ?? '',
        alt: section.image.alt || section.title || '',
      }
    : images[activeItem];

  return (
    <section
      id={section.id || section.name}
      className={cn(
        'overflow-x-hidden py-8 md:py-16',
        section.className,
        className
      )}
    >
      <div className="container grid gap-8 overflow-x-hidden px-2 sm:px-6 md:gap-16 lg:gap-20">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground mb-6 text-base leading-7 md:mb-12 md:text-lg md:leading-8 lg:mb-16">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid min-w-0 items-stretch gap-12 sm:px-6 md:grid-cols-2 lg:gap-20 lg:px-0">
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
                    <div className="text-foreground flex items-center gap-2 text-base font-semibold md:text-lg">
                      {item.icon && (
                        <SmartIcon name={item.icon as string} size={24} />
                      )}
                      {item.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground text-base leading-7">
                      {item.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2} direction="right" className="md:h-full">
            <div className="border-border relative aspect-square w-full min-w-0 overflow-hidden rounded-3xl border shadow-sm md:aspect-auto md:h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewImage?.image || `${activeItem}-id`}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-hidden rounded-3xl"
                >
                  <LazyImage
                    src={previewImage?.image || ''}
                    className="size-full object-cover object-center dark:mix-blend-lighten"
                    wrapperClassName="block size-full"
                    alt={previewImage?.alt || ''}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
