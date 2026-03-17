'use client';

import { Link } from '@/core/i18n/navigation';
import { LazyImage, SmartIcon } from '@/shared/blocks/common';
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
      className={cn(
        'overflow-hidden py-16 md:py-24',
        section.className,
        className
      )}
    >
      <div className="container overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <ScrollAnimation>
            <div className="grid gap-4 pb-12 text-center">
              <h2 className="text-foreground text-4xl font-semibold tracking-tight text-balance break-words md:text-5xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-7xl text-lg leading-8 break-words md:text-xl md:leading-9">
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
                          'focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                          'h-10 px-4',
                          'text-foreground hover:bg-muted duration-200'
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

          <div className="grid items-stretch gap-4 lg:grid-cols-2">
            <ScrollAnimation
              className="h-full lg:pr-10"
              direction="left"
              delay={0.1}
            >
              <div className="h-full">
                <div className="h-full w-full overflow-hidden rounded-2xl">
                  <LazyImage
                    src={section.image?.src ?? ''}
                    alt={section.image?.alt ?? ''}
                    wrapperClassName="block h-full w-full"
                    className="h-full w-full object-cover object-center lg:object-contain"
                  />
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation className="h-full" delay={0.15}>
              <div className="grid h-full gap-4 lg:grid-rows-4">
                {section.items?.map((item, idx) => (
                  <div className="h-full overflow-hidden" key={idx}>
                    <div className="flex h-full min-w-0 items-start gap-4">
                      {item.icon && (
                        <div className="text-primary shrink-0 pt-4">
                          <SmartIcon name={item.icon as string} size={38} />
                        </div>
                      )}
                      <div className="grid min-w-0 flex-1 gap-2 p-4">
                        <h3 className="text-foreground min-w-0 text-lg leading-8 font-semibold break-words md:text-xl">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground min-w-0 text-base leading-7 break-words">
                          {item.description ?? ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  );
}
