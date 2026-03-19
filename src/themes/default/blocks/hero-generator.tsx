import { Section } from '@/shared/types/blocks/landing';

import { Hero } from './hero';

export function HeroGenerator({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return <Hero section={section} className={className} />;
}
