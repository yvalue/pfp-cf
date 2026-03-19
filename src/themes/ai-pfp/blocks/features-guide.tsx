import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesGuide({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id || section.name}
      className={cn(
        'overflow-x-hidden py-16 md:py-24',
        section.className,
        className
      )}
    >
      <div className="container !max-w-5xl px-2 sm:px-6">
        <ScrollAnimation>
          <div className="text-center">
            <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-base leading-7 md:text-lg md:leading-8">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        {section.items && section.items.length > 0 && (
          <div className="mt-12 md:mt-16">
            {section.items.map((item, idx) => (
              <ScrollAnimation key={idx} delay={idx * 0.05}>
                <article className={cn(idx > 0 && 'mt-8 md:mt-10')}>
                  <h3 className="text-foreground mb-3 text-lg font-semibold md:text-xl">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-base leading-7 md:text-lg md:leading-8">
                    {item.description}
                  </p>
                </article>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
