'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';

import { Link, usePathname } from '@/core/i18n/navigation';
import {
  BrandLogo,
  LocaleSelector,
  SignUser,
  SmartIcon,
  ThemeToggler,
} from '@/shared/blocks/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger as RawNavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { useMedia } from '@/shared/hooks/use-media';
import { cn } from '@/shared/lib/utils';
import { NavItem } from '@/shared/types/blocks/common';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

function getMenuVisual(itemTitle: string, fallbackIconName?: string) {
  const normalizedTitle = itemTitle.toLowerCase();

  if (normalizedTitle.includes('image')) {
    return {
      iconName: 'RiImageAiLine',
      iconClassName: 'text-sky-600',
    };
  }

  if (normalizedTitle.includes('music')) {
    return {
      iconName: 'RiMusicAiLine',
      iconClassName: 'text-emerald-600',
    };
  }

  if (normalizedTitle.includes('video')) {
    return {
      iconName: 'RiVideoAiLine',
      iconClassName: 'text-rose-600',
    };
  }

  if (normalizedTitle.includes('chat') || normalizedTitle.includes('bot')) {
    return {
      iconName: 'RiChatAiLine',
      iconClassName: 'text-violet-600',
    };
  }

  if (normalizedTitle.includes('blog')) {
    return {
      iconName: 'RiArticleLine',
      iconClassName: 'text-amber-600',
    };
  }

  if (normalizedTitle.includes('update')) {
    return {
      iconName: 'RiHistoryLine',
      iconClassName: 'text-cyan-600',
    };
  }

  if (normalizedTitle.includes('doc')) {
    return {
      iconName: 'RiBookOpenLine',
      iconClassName: 'text-indigo-600',
    };
  }

  return {
    iconName: fallbackIconName || 'RiSparklingLine',
    iconClassName: 'text-primary',
  };
}

// For Next.js hydration mismatch warning, conditionally render NavigationMenuTrigger only after mount to avoid inconsistency between server/client render
function NavigationMenuTrigger(
  props: React.ComponentProps<typeof RawNavigationMenuTrigger>
) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Only render after client has mounted, to avoid SSR/client render id mismatch
  if (!mounted) return null;
  return <RawNavigationMenuTrigger {...props} />;
}

export function Header({ header }: { header: HeaderType }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileOpenItem, setMobileOpenItem] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const isLarge = useMedia('(min-width: 64rem)');
  const pathname = usePathname();

  useEffect(() => {
    // Listen to scroll event to enable header styles on scroll
    const handleScroll = () => {
      // Coalesce high-frequency scroll events & only update state when value changes.
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const next = window.scrollY > 50;
        if (next === isScrolledRef.current) return;
        isScrolledRef.current = next;
        setIsScrolled(next);
      });
    };

    // Initialize once on mount.
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isLarge) {
      setIsMobileMenuOpen(false);
      setMobileOpenItem('');
    }
  }, [isLarge]);

  // Navigation menu for large screens
  const NavMenu = () => {
    return (
      <NavigationMenu
        viewport={false}
        className="max-w-full max-lg:hidden"
      >
        <NavigationMenuList className="gap-2">
          {header.nav?.items?.map((item, idx) => {
            const isItemActive =
              item.is_active ||
              (!!item.url && pathname.endsWith(item.url as string));
            const isParentActive =
              item.is_active ||
              !!item.children?.some(
                (subItem: NavItem) =>
                  !!subItem.url && pathname.endsWith(subItem.url)
              );

            if (!item.children || item.children.length === 0) {
              return (
                <NavigationMenuLink key={idx} asChild className="text-base">
                  <Link
                    href={item.url || ''}
                    target={item.target || '_self'}
                    className={`flex items-center px-4 py-1.5 text-base font-normal ${
                      isItemActive
                        ? 'bg-muted text-primary hover:text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              );
            }

            return (
              <NavigationMenuItem key={idx}>
                <NavigationMenuTrigger
                  className={cn(
                    'text-base font-normal',
                    isParentActive && 'bg-muted text-primary'
                  )}
                >
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="top-10 min-w-2xs origin-top p-3 shadow-sm">
                  <ul className="grid gap-2">
                    {item.children?.map((subItem: NavItem, index: number) => (
                      <ListItem
                        key={index}
                        href={subItem.url || ''}
                        target={subItem.target || '_self'}
                        iconName={subItem.icon as string | undefined}
                        title={subItem.title || ''}
                        description={subItem.description || ''}
                      />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  // Mobile menu using Accordion, shown on small screens
  const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <nav role="navigation" className="w-full">
        <Accordion
          type="single"
          collapsible
          value={mobileOpenItem}
          onValueChange={setMobileOpenItem}
          className="border-border -mx-4 border-y"
        >
          {header.nav?.items?.map((item, idx) => {
            return (
              <AccordionItem
                key={idx}
                value={item.title || ''}
                className="border-border bg-background"
              >
                {item.children && item.children.length > 0 ? (
                  <>
                    <AccordionTrigger
                      className="px-4 py-3 text-base font-normal hover:no-underline"
                    >
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="grid gap-1">
                        {item.children?.map((subItem: NavItem, iidx) => (
                          <li key={iidx}>
                            <MobileSubmenuItem
                              item={subItem}
                              closeMenu={closeMenu}
                            />
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </>
                ) : (
                  <Link
                    href={item.url || ''}
                    onClick={() => {
                      setMobileOpenItem('');
                      closeMenu();
                    }}
                    className="flex items-center justify-between px-4 py-3 text-base font-normal"
                  >
                    {item.title}
                  </Link>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </nav>
    );
  };

  // List item for submenus in NavigationMenu
  function ListItem({
    title,
    description,
    href,
    iconName,
    target,
    ...props
  }: React.ComponentPropsWithoutRef<'li'> & {
    href: string;
    iconName?: string;
    title: string;
    description?: string;
    target?: string;
  }) {
    const menuVisual = getMenuVisual(title, iconName);

    return (
      <li {...props}>
        <NavigationMenuLink
          asChild
          className="hover:bg-muted focus:bg-muted"
        >
          <Link
            href={href}
            target={target || '_self'}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <SmartIcon
                  name={menuVisual.iconName}
                  size={24}
                  className={cn(menuVisual.iconClassName, 'size-6')}
                />
              </div>
              <div className="text-foreground text-sm leading-6 font-medium">
                {title}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground line-clamp-1 text-xs leading-5">
                {description}
              </p>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }

  function MobileSubmenuItem({
    item,
    closeMenu,
  }: {
    item: NavItem;
    closeMenu: () => void;
  }) {
    const menuVisual = getMenuVisual(
      item.title || '',
      item.icon as string | undefined
    );

    return (
      <Link
        href={item.url || ''}
        onClick={closeMenu}
        className="flex items-center gap-3 rounded-xl px-3 py-2"
      >
        <div aria-hidden className="flex items-center justify-center">
          <SmartIcon
            name={menuVisual.iconName}
            className={cn(menuVisual.iconClassName, 'size-4')}
          />
        </div>
        <div className="text-sm leading-6 font-normal">{item.title}</div>
      </Link>
    );
  }

  function HeaderActions({ mobile = false }: { mobile?: boolean }) {
    return (
      <div
        className={cn(
          'flex items-center',
          mobile
            ? 'w-full flex-wrap gap-3'
            : 'w-full flex-row gap-4 sm:gap-6 md:w-fit lg:justify-end'
        )}
      >
        {header.buttons &&
          header.buttons.map((button, idx) => (
            <Link
              key={idx}
              href={button.url || ''}
              target={button.target || '_self'}
              className={cn(
                'focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                'h-10 px-4',
                mobile && 'w-full',
                button.variant === 'outline'
                  ? 'border border-border bg-background shadow-sm hover:bg-muted'
                  : 'border border-primary bg-primary text-primary-foreground shadow-sm hover:opacity-90'
              )}
            >
              {button.icon && (
                <SmartIcon
                  name={button.icon as string}
                  className="size-4"
                />
              )}
              <span>{button.title}</span>
            </Link>
          ))}

        {header.show_theme ? <ThemeToggler /> : null}
        {header.show_locale ? <LocaleSelector /> : null}
        {header.show_sign ? <SignUser userNav={header.user_nav} /> : null}
      </div>
    );
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            'absolute inset-x-0 top-0 z-50 border-transparent transition-all duration-300',
            'h-18 max-lg:h-14 max-lg:overflow-hidden max-lg:border-b',
            (isScrolled || isMobileMenuOpen) &&
              'border-border bg-background border-b shadow-sm'
          )}
        >
          <div className="container">
            <div className="relative flex flex-wrap items-center justify-between lg:grid lg:grid-cols-3 lg:items-center lg:gap-6 lg:py-5">
              <div className="flex items-center justify-between gap-8 max-lg:h-14 max-lg:w-full max-lg:border-b lg:justify-self-start">
                {/* Brand Logo */}
                {header.brand && <BrandLogo brand={header.brand} />}

                {/* Hamburger menu button for mobile navigation */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <button
                    onClick={() => {
                      setMobileOpenItem('');
                      setIsMobileMenuOpen(true);
                    }}
                    aria-label="Open Menu"
                    className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
                  >
                    <Menu className="m-auto size-5" />
                  </button>

                  <SheetContent
                    side="left"
                    className="border-border bg-background w-80 p-0 sm:max-w-sm lg:hidden [&>button]:rounded-xl [&>button]:opacity-100"
                  >
                    <div className="flex h-full flex-col">
                      <SheetHeader className="border-border border-b p-4 text-left">
                        <SheetTitle className="sr-only">
                          {header.brand?.title || 'Menu'}
                        </SheetTitle>
                        {header.brand ? <BrandLogo brand={header.brand} /> : null}
                      </SheetHeader>

                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                          <MobileMenu
                            closeMenu={() => {
                              setMobileOpenItem('');
                              setIsMobileMenuOpen(false);
                            }}
                          />
                        </div>

                        <div className="border-border p-4">
                          <HeaderActions mobile />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Navigation Menu */}
              {isLarge && (
                <div className="hidden lg:block lg:max-w-full lg:min-w-0 lg:justify-self-center">
                  <NavMenu />
                </div>
              )}

              {/* Show mobile menu if needed */}
              <div
                className={cn(
                  'hidden lg:flex lg:w-fit lg:justify-self-end'
                )}
              >
                <HeaderActions />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
