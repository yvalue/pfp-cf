'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, User, X } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useMedia } from '@/shared/hooks/use-media';
import { cn } from '@/shared/lib/utils';

type NavigationItem = {
  label: string;
  href: string;
  active?: boolean;
  icon: 'user';
};

type ProfessionalHeadshotMobileNavProps = {
  appLogo: string;
  appName: string;
  homeHref: string;
  items: NavigationItem[];
  signInHref: string;
  signInLabel: string;
};

function NavigationIcon({ icon }: { icon: NavigationItem['icon'] }) {
  switch (icon) {
    case 'user':
      return <User className="size-4 shrink-0" />;
    default:
      return null;
  }
}

export function ProfessionalHeadshotMobileNav({
  appLogo,
  appName,
  homeHref,
  items,
  signInHref,
  signInLabel,
}: ProfessionalHeadshotMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLarge = useMedia('(min-width: 64rem)');

  useEffect(() => {
    if (isLarge) {
      setIsOpen(false);
    }
  }, [isLarge]);

  return (
    <div className="border-border/60 bg-background/80 sticky top-0 z-30 border-b backdrop-blur lg:hidden">
      <div className="px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link className="flex min-w-0 items-center gap-3" href={homeHref}>
            <Image
              src={appLogo}
              alt={appName}
              width={32}
              height={32}
              className="shrink-0"
            />
            <span className="truncate text-base font-semibold tracking-tight">
              {appName}
            </span>
          </Link>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
            onClick={() => setIsOpen((open) => !open)}
            className="relative -m-2.5 -mr-2 block cursor-pointer p-2.5"
          >
            <Menu
              className={cn(
                'size-5 transition duration-200',
                isOpen && 'scale-0 rotate-180 opacity-0'
              )}
            />
            <X
              className={cn(
                'absolute inset-0 m-auto size-5 scale-0 -rotate-180 opacity-0 transition duration-200',
                isOpen && 'scale-100 rotate-0 opacity-100'
              )}
            />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-border/60 grid gap-3 border-t px-4 py-4">
          <nav className="grid gap-2">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <NavigationIcon icon={item.icon} />
                <span className="ml-2.5 tracking-tight">{item.label}</span>
              </Link>
            ))}
          </nav>

          <Button asChild className="w-full justify-center" size="sm">
            <Link href={signInHref} onClick={() => setIsOpen(false)}>
              {signInLabel}
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
