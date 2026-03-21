'use client';

import type { IconType } from 'react-icons';
import {
  FaDiscord,
  FaDribbble,
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaRedditAlien,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaTwitch,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';

import { LazyImage } from '@/shared/blocks/common';
import { Marquee } from '@/shared/components/ui/marquee';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section, SectionItem } from '@/shared/types/blocks/landing';

const SOCIAL_ICON_MAP: Record<
  string,
  {
    icon: IconType;
    baseClassName: string;
  }
> = {
  instagram: {
    icon: FaInstagram,
    baseClassName: 'text-[#E4405F]',
  },
  facebook: {
    icon: FaFacebookF,
    baseClassName: 'text-[#1877F2]',
  },
  x: {
    icon: FaXTwitter,
    baseClassName: 'text-black',
  },
  pinterest: {
    icon: FaPinterestP,
    baseClassName: 'text-[#E60023]',
  },
  linkedin: {
    icon: FaLinkedinIn,
    baseClassName: 'text-[#0A66C2]',
  },
  youtube: {
    icon: FaYoutube,
    baseClassName: 'text-[#FF0000]',
  },
  threads: {
    icon: FaThreads,
    baseClassName: 'text-black',
  },
  tiktok: {
    icon: FaTiktok,
    baseClassName: 'text-[#25F4EE]',
  },
  reddit: {
    icon: FaRedditAlien,
    baseClassName: 'text-[#FF4500]',
  },
  whatsapp: {
    icon: FaWhatsapp,
    baseClassName: 'text-[#25D366]',
  },
  discord: {
    icon: FaDiscord,
    baseClassName: 'text-[#5865F2]',
  },
  telegram: {
    icon: FaTelegram,
    baseClassName: 'text-[#2AABEE]',
  },
  twitch: {
    icon: FaTwitch,
    baseClassName: 'text-[#9146FF]',
  },
  github: {
    icon: FaGithub,
    baseClassName: 'text-black',
  },
  dribbble: {
    icon: FaDribbble,
    baseClassName: 'text-[#EA4C89]',
  },
};

function resolveIconKey(item: SectionItem) {
  const iconKey =
    typeof item?.icon === 'string' ? item.icon.toLowerCase().trim() : '';
  if (iconKey && SOCIAL_ICON_MAP[iconKey]) {
    return iconKey;
  }

  const titleKey =
    typeof item?.title === 'string'
      ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '')
      : '';

  const titleAliases: Record<string, string> = {
    facebook: 'facebook',
    github: 'github',
    instagram: 'instagram',
    linkedin: 'linkedin',
    pinterest: 'pinterest',
    reddit: 'reddit',
    telegram: 'telegram',
    threads: 'threads',
    tiktok: 'tiktok',
    twitch: 'twitch',
    whatsapp: 'whatsapp',
    x: 'x',
    youtube: 'youtube',
  };

  return titleAliases[titleKey] ?? '';
}

export function Logos({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('py-10 md:py-15', section.className, className, 'bg-white')}
    >
      <div className="container !max-w-5xl">
        <ScrollAnimation>
          <p className="text-muted-foreground text-center text-base leading-7 font-medium md:text-lg">
            {section.title}
          </p>
        </ScrollAnimation>
        <ScrollAnimation delay={0.2}>
          <div className="relative mx-auto mt-8 max-w-5xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white to-transparent md:w-24"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white to-transparent md:w-24"
            />
            <Marquee
              pauseOnHover
              className="mx-auto py-4 [--duration:42s] [--gap:2.75rem] md:[--gap:4rem]"
            >
              {section.items?.map((item, idx) => {
                const lightSrc = item.image?.src ?? '';
                const lightAlt = item.image?.alt ?? item.title ?? '';
                const iconKey = resolveIconKey(item);
                const iconEntry = SOCIAL_ICON_MAP[iconKey];

                return (
                  <div
                    key={`${item.title ?? iconKey}-${idx}`}
                    className="flex h-14 min-w-16 shrink-0 items-center justify-center"
                    title={item.title}
                    aria-label={item.title}
                  >
                    {lightSrc ? (
                      <LazyImage
                        className="h-8 w-fit"
                        src={lightSrc}
                        alt={lightAlt}
                      />
                    ) : iconEntry ? (
                      <iconEntry.icon
                        className={cn('size-9', iconEntry.baseClassName)}
                      />
                    ) : (
                      <span className="sr-only">{lightAlt}</span>
                    )}
                  </div>
                );
              })}
            </Marquee>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
