'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { RiComputerLine, RiMoonLine, RiSunLine } from 'react-icons/ri';

import { AnimatedThemeToggler } from '@/shared/components/magicui/animated-theme-toggler';
import { Button } from '@/shared/components/ui/button';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/components/ui/toggle-group';
import { cn } from '@/shared/lib/utils';

export function ThemeToggler({
  type = 'icon',
  className,
}: {
  type?: 'icon' | 'button' | 'toggle';
  className?: string;
}) {
  const iconTriggerClassName =
    'flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary hover:text-primary-foreground';

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  if (!mounted) {
    return null;
  }

  if (type === 'button') {
    return (
      <Button variant="outline" size="sm" className="hover:bg-muted">
        <RiSunLine className="size-4" />
      </Button>
    );
  } else if (type === 'toggle') {
    return (
      <ToggleGroup
        type="single"
        className={` ${className}`}
        value={theme}
        onValueChange={handleThemeChange}
        variant="outline"
      >
        <ToggleGroupItem
          value="light"
          onClick={() => setTheme('light')}
          aria-label="Switch to light mode"
        >
          <RiSunLine className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          onClick={() => setTheme('dark')}
          aria-label="Switch to dark mode"
        >
          <RiMoonLine className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="system"
          onClick={() => setTheme('system')}
          aria-label="Switch to system mode"
        >
          <RiComputerLine className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  return (
    <AnimatedThemeToggler className={cn(iconTriggerClassName, className)} />
  );
}
