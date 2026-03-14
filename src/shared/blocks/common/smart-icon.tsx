"use client";

import { ComponentType, useEffect, useState } from 'react';

type IconComponentType = ComponentType<any>;

const iconCache: Record<string, IconComponentType> = {};
const iconPromiseCache: Record<string, Promise<IconComponentType>> = {};

// Function to automatically detect icon library
function detectIconLibrary(name: string): 'ri' | 'lucide' {
  if (name && name.startsWith('Ri')) {
    return 'ri';
  }

  return 'lucide';
}

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  const library = detectIconLibrary(name);
  const cacheKey = `${library}-${name}`;
  const [Icon, setIcon] = useState<IconComponentType | null>(
    iconCache[cacheKey] || null
  );

  useEffect(() => {
    let active = true;

    if (iconCache[cacheKey]) {
      setIcon(() => iconCache[cacheKey]);
      return () => {
        active = false;
      };
    }

    if (!iconPromiseCache[cacheKey]) {
      iconPromiseCache[cacheKey] =
        library === 'ri'
          ? import('react-icons/ri')
              .then((module) => {
                const LoadedIcon = module[name as keyof typeof module];
                if (LoadedIcon) {
                  return LoadedIcon as IconComponentType;
                }

                console.warn(
                  `Icon "${name}" not found in react-icons/ri, using fallback`
                );
                return module.RiQuestionLine as IconComponentType;
              })
              .catch(async (error) => {
                console.error(`Failed to load react-icons/ri:`, error);
                const fallbackModule = await import('react-icons/ri');
                return fallbackModule.RiQuestionLine as IconComponentType;
              })
          : import('lucide-react')
              .then((module) => {
                const LoadedIcon = module[name as keyof typeof module];
                if (LoadedIcon) {
                  return LoadedIcon as IconComponentType;
                }

                console.warn(
                  `Icon "${name}" not found in lucide-react, using fallback`
                );
                return module.HelpCircle as IconComponentType;
              })
              .catch(async (error) => {
                console.error(`Failed to load lucide-react:`, error);
                const fallbackModule = await import('lucide-react');
                return fallbackModule.HelpCircle as IconComponentType;
              });
    }

    iconPromiseCache[cacheKey].then((LoadedIcon) => {
      iconCache[cacheKey] = LoadedIcon;

      if (active) {
        setIcon(() => LoadedIcon);
      }
    });

    return () => {
      active = false;
    };
  }, [cacheKey, library, name]);

  if (!Icon) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          flexShrink: 0,
        }}
      />
    );
  }

  return <Icon size={size} className={className} {...props} />;
}
