import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ToolsOverview({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id || section.name}
      className={cn('overflow-x-hidden pt-16 md:pt-24', section.className, className)}
    >
      <div className="container !max-w-5xl">
        <div className="rounded-3xl bg-muted px-6 py-10 md:px-10 md:py-14">
          <ScrollAnimation>
            <div className="grid gap-6 text-center">
              <h2 className="text-foreground mx-auto max-w-full text-3xl font-semibold tracking-normal text-pretty md:max-w-5xl md:text-4xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground text-lg leading-7 md:text-xl">
                {section.description}
              </p>
            </div>
          </ScrollAnimation>

          {section.items && section.items.length > 0 && (
            <div className="mt-16">
              {section.items.map((item, idx) => (
                <ScrollAnimation key={idx} delay={idx * 0.05}>
                  <article className={cn('grid gap-6', idx > 0 && 'mt-16')}>
                    <h3 className="text-foreground text-xl font-semibold tracking-normal md:text-2xl">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-7 md:text-xl">
                      {item.description}
                    </p>
                  </article>
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
