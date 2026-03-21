'use client';

import { motion } from 'framer-motion';

import { LazyImage } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const createFadeInVariant = (delay: number) => ({
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  transition: {
    duration: 0.6,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

export function FeaturesFlow({ section }: { section: Section }) {
  if (!section.items || section.items.length === 0) {
    return null;
  }

  return (
    <section
      id={section.id || section.name}
      className={cn(
        'bg-white py-16 md:py-24 dark:bg-background',
        section.className
      )}
    >
      <motion.div
        className="container mb-8 grid gap-4 text-center"
        {...createFadeInVariant(0)}
      >
        {section.sr_only_title && (
          <h1 className="sr-only">{section.sr_only_title}</h1>
        )}
        <h2 className="text-foreground mx-auto max-w-full text-4xl font-semibold tracking-tight text-pretty md:max-w-5xl md:text-6xl">
          {section.title}
        </h2>
        <p className="text-muted-foreground mx-auto max-w-5xl text-lg leading-7 break-words md:text-xl">
          {section.description}
        </p>
      </motion.div>
      <div className="container flex flex-col items-center justify-center gap-8 md:gap-12">
        {section.items.map((item, index) => {
          const isImageRight = item.image_position === 'right';
          return (
            <motion.div
              key={index}
              className="grid items-center gap-4 rounded-3xl p-6 sm:grid-cols-2 md:gap-6 md:p-8 lg:gap-10"
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <motion.div
                className={cn(isImageRight && 'sm:order-2')}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15 + 0.2,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                <LazyImage
                  src={item.image?.src ?? ''}
                  wrapperClassName="mx-auto block w-full max-w-xl"
                  className="w-full rounded-3xl"
                  alt={item.image?.alt ?? ''}
                />
              </motion.div>

              <motion.div
                className={cn('relative grid gap-4', isImageRight && 'sm:order-1')}
                initial={{ opacity: 0, x: isImageRight ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15 + 0.3,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                <h3 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-base leading-7 md:text-lg">
                  {item.description}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
