'use client';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesList({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    // Prevent scrollbar overflow from scroll animations
    <section
      id={section.id || section.name}
      className={cn(
        'overflow-hidden py-12 md:py-16',
        section.className,
        className,
        'bg-white dark:bg-background'
      )}
    >
      <div className="container overflow-hidden bg-white dark:bg-background">
        <div className="mx-auto max-w-7xl bg-white dark:bg-background">
          <ScrollAnimation>
            <div className="grid gap-4 rounded-3xl p-6 text-center lg:p-8">
              <h2 className="text-foreground mx-auto max-w-full text-4xl font-semibold tracking-normal text-pretty md:max-w-5xl md:text-6xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-4xl break-words text-lg leading-7 md:text-xl">
                {section.description}
              </p>
              {section.buttons && section.buttons.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {section.buttons?.map((button, idx) => (
                    <Button
                      asChild
                      key={idx}
                      variant={button.variant || 'default'}
                      size={button.size || 'default'}
                    >
                      <Link
                        href={button.url ?? ''}
                        target={button.target ?? '_self'}
                        className={cn(
                          'focus-visible:ring-ring inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                          'text-white hover:bg-neutral-900 duration-200'
                        )}
                      >
                        {button.icon && (
                          <SmartIcon name={button.icon as string} size={20} />
                        )}
                        {button.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollAnimation>

          <div className="grid items-stretch gap-6 pt-8 md:grid-cols-2">
            {section.items?.map((item, idx) => (
              <ScrollAnimation
                className="h-full"
                key={idx}
                direction={idx % 2 === 0 ? 'left' : 'right'}
                delay={0.1 + idx * 0.05}
              >
                <article className="flex h-full min-w-0 items-start gap-4 rounded-3xl border border-sky-100 bg-sky-50 px-8 py-6 dark:border-border dark:bg-card">
                  {item.icon && (
                    <div className="text-primary shrink-0">
                      <SmartIcon name={item.icon as string} size={42} />
                    </div>
                  )}
                  <div className="grid min-w-0 flex-1 gap-2">
                    <h3 className="text-foreground min-w-0 text-xl font-semibold tracking-normal break-words md:text-2xl">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground min-w-0 text-lg leading-7 break-words md:text-xl">
                      {item.description ?? ''}
                    </p>
                  </div>
                </article>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
