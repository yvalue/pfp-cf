'use client';

import { useEffect, useState } from 'react';
import { Check, Globe, Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/core/i18n/navigation';
import { localeNames } from '@/config/locale';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cacheSet } from '@/shared/lib/cache';

export function LocaleSelector({
  type = 'icon',
}: {
  type?: 'icon' | 'button';
}) {
  const iconTriggerClassName =
    'flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary hover:text-primary-foreground data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:pointer-events-none disabled:opacity-50';

  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitchLanguage = (value: string) => {
    if (value !== currentLocale) {
      // Update localStorage to sync with locale detector
      cacheSet('locale', value);
      const query = searchParams?.toString?.() ?? '';
      const href = query ? `${pathname}?${query}` : pathname;
      router.push(href, {
        locale: value,
      });
    }
  };

  // Return a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      type === 'icon' ? (
        <button className={iconTriggerClassName} disabled>
          <Languages size={18} />
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-muted focus:bg-muted"
          disabled
        >
          <Globe size={16} />
          {localeNames[currentLocale]}
        </Button>
      )
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {type === 'icon' ? (
          <button className={iconTriggerClassName}>
            <Languages size={18} />
          </button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-muted focus:bg-muted"
          >
            <Globe size={16} />
            {localeNames[currentLocale]}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(localeNames).map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleSwitchLanguage(locale)}
            className="focus:bg-muted focus:text-foreground"
          >
            <span>{localeNames[locale]}</span>
            {locale === currentLocale && (
              <Check size={16} className="text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
