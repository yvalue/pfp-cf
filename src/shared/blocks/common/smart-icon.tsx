'use client';

import {
  cloneElement,
  ComponentType,
  isValidElement,
  ReactElement,
  useEffect,
  useState,
} from 'react';

type IconComponentType = ComponentType<any>;
type IconValue = IconComponentType | ReactElement;

const iconCache: Record<string, IconValue> = {};
const iconPromiseCache: Record<string, Promise<IconValue>> = {};

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
  name: string | ReactElement;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  if (isValidElement(name)) {
    const element = name as ReactElement<any>;

    return cloneElement(element, {
      ...props,
      size,
      className: [element.props.className, className].filter(Boolean).join(' '),
    });
  }

  if (!name || typeof name !== 'string') {
    return null;
  }

  const library = detectIconLibrary(name);
  const cacheKey = `${library}-${name}`;
  const [Icon, setIcon] = useState<IconValue | null>(() => {
    // Store the component itself; passing a function directly would be treated
    // as a lazy initializer and React would execute it into an element.
    return iconCache[cacheKey] || null;
  });

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

  if (isValidElement(Icon)) {
    const element = Icon as ReactElement<any>;

    return cloneElement(element, {
      ...props,
      size,
      className: [element.props.className, className].filter(Boolean).join(' '),
    });
  }

  return <Icon size={size} className={className} {...props} />;
}
