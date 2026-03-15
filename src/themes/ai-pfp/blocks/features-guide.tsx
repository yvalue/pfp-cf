import { LazyImage } from '@/shared/blocks/common';
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
  const image = section.image;

  return (
    <section className={cn('overflow-x-hidden py-16 md:py-24', section.className, className)}>
      <div className="container !max-w-5xl px-2 sm:px-6">

        {/* Top: left title/desc + right image */}
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
          <ScrollAnimation direction="left">
            <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-lg">{section.description}</p>
          </ScrollAnimation>

          {image && (
            <ScrollAnimation direction="right">
              <div className="overflow-hidden rounded-2xl">
                <LazyImage
                  src={image.src}
                  alt={image.alt || section.title || ''}
                  wrapperClassName="block"
                  className="block w-full dark:mix-blend-lighten"
                />
              </div>
            </ScrollAnimation>
          )}
        </div>

        {/* Bottom: single-column item list */}
        {section.items && section.items.length > 0 && (
          <div className="mt-12 flex flex-col gap-8 md:mt-16">
            {section.items.map((item, idx) => (
              <ScrollAnimation key={idx} delay={idx * 0.05}>
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-lg">{item.description}</p>
              </ScrollAnimation>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
