'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

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
import { useMedia } from '@/shared/hooks/use-media';
import { cn } from '@/shared/lib/utils';
import { NavItem } from '@/shared/types/blocks/common';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

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

  // Navigation menu for large screens
  const NavMenu = () => {
    return (
      <NavigationMenu
        viewport={false}
        className="max-w-full **:data-[slot=navigation-menu-content]:top-10 max-lg:hidden"
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
                        ? 'bg-muted/40 text-primary hover:text-primary dark:bg-foreground/10 dark:text-foreground dark:hover:bg-foreground/10 dark:hover:text-foreground'
                        : 'text-muted-foreground hover:text-primary dark:hover:bg-foreground/10 dark:hover:text-foreground'
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
                    isParentActive &&
                      'bg-muted/40 text-primary dark:bg-foreground/10 dark:text-foreground'
                  )}
                >
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="min-w-2xs origin-top p-0.5">
                  <div className="border-foreground/5 bg-card rounded-[calc(var(--radius)-2px)] p-2">
                    <ul className="mt-1 space-y-2">
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
                  </div>
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
      <nav
        role="navigation"
        className="w-full [--color-border:--alpha(var(--color-foreground)/5%)] [--color-muted:--alpha(var(--color-foreground)/5%)]"
      >
        <Accordion
          type="single"
          collapsible
          className="-mx-4 mt-0.5 space-y-0.5 **:hover:no-underline"
        >
          {header.nav?.items?.map((item, idx) => {
            return (
              <AccordionItem
                key={idx}
                value={item.title || ''}
                className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
              >
                {item.children && item.children.length > 0 ? (
                  <>
                    <AccordionTrigger className="data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg font-normal">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <ul>
                        {item.children?.map((subItem: NavItem, iidx) => (
                          <li key={iidx}>
                            <Link
                              href={subItem.url || ''}
                              onClick={closeMenu}
                              className="grid grid-cols-[auto_1fr] items-center gap-2.5 px-4 py-2"
                            >
                              <div
                                aria-hidden
                                className="flex items-center justify-center *:size-4"
                              >
                                {subItem.icon && (
                                  <SmartIcon name={subItem.icon as string} />
                                )}
                              </div>
                              <div className="text-base font-normal">
                                {subItem.title}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </>
                ) : (
                  <Link
                    href={item.url || ''}
                    onClick={closeMenu}
                    className="data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg font-normal"
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
    const getMenuVisual = (itemTitle: string, fallbackIconName?: string) => {
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
    };

    const menuVisual = getMenuVisual(title, iconName);

    return (
      <li {...props}>
        <NavigationMenuLink
          asChild
          className="hover:bg-foreground/5 focus:bg-foreground/5 data-[active=true]:bg-foreground/5 data-[active=true]:hover:bg-foreground/5 dark:hover:bg-foreground/10 dark:focus:bg-foreground/10 dark:data-[active=true]:bg-foreground/10 dark:data-[active=true]:hover:bg-foreground/10"
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
                  size={25}
                  className={cn(menuVisual.iconClassName, 'size-[25px]')}
                />
              </div>
              <div className="text-foreground text-base font-normal">
                {title}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground line-clamp-1 text-sm">
                {description}
              </p>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }

  return (
    <>
      <header
        data-state={isMobileMenuOpen ? 'active' : 'inactive'}
        {...(isScrolled && { 'data-scrolled': true })}
        className="has-data-[state=open]:bg-background/50 fixed inset-x-0 top-0 z-50 has-data-[state=open]:h-screen has-data-[state=open]:backdrop-blur"
      >
        <div
          className={cn(
            'absolute inset-x-0 top-0 z-50 h-18 border-transparent ring-1 ring-transparent transition-all duration-300',
            'in-data-scrolled:border-foreground/5 in-data-scrolled:bg-background/75 in-data-scrolled:border-b in-data-scrolled:backdrop-blur',
            'has-data-[state=open]:ring-foreground/5 has-data-[state=open]:bg-card/75 has-data-[state=open]:h-[calc(var(--navigation-menu-viewport-height)+3.4rem)] has-data-[state=open]:border-b has-data-[state=open]:shadow-lg has-data-[state=open]:shadow-black/10 has-data-[state=open]:backdrop-blur',
            'max-lg:in-data-[state=active]:bg-background/75 max-lg:h-14 max-lg:overflow-hidden max-lg:border-b max-lg:in-data-[state=active]:h-screen max-lg:in-data-[state=active]:backdrop-blur'
          )}
        >
          <div className="container">
            <div className="relative flex flex-wrap items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:py-5">
              <div className="flex items-center justify-between gap-8 max-lg:h-14 max-lg:w-full max-lg:border-b lg:justify-self-start">
                {/* Brand Logo */}
                {header.brand && <BrandLogo brand={header.brand} />}

                {/* Hamburger menu button for mobile navigation */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={
                    isMobileMenuOpen == true ? 'Close Menu' : 'Open Menu'
                  }
                  className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="m-auto size-5 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                  <X className="absolute inset-0 m-auto size-5 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
                </button>
              </div>

              {/* Desktop Navigation Menu */}
              {isLarge && (
                <div className="hidden lg:block lg:max-w-full lg:min-w-0 lg:justify-self-center">
                  <NavMenu />
                </div>
              )}

              {/* Show mobile menu if needed */}
              {!isLarge && isMobileMenuOpen && (
                <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
              )}

              {/* Header right section: theme toggler, locale selector, sign, buttons */}
              <div className="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 in-data-[state=active]:flex max-lg:in-data-[state=active]:mt-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:justify-self-end lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="flex w-full flex-row items-center gap-4 sm:flex-row sm:gap-6 sm:space-y-0 md:w-fit lg:justify-end">
                  {header.buttons &&
                    header.buttons.map((button, idx) => (
                      <Link
                        key={idx}
                        href={button.url || ''}
                        target={button.target || '_self'}
                        className={cn(
                          'focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                          'h-7 px-3 ring-0',
                          button.variant === 'outline'
                            ? 'bg-background border-primary ring-foreground/10 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50 border border-transparent shadow-sm ring-1 shadow-black/15 duration-200'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 border-[0.5px] border-white/25 shadow-md ring-1 shadow-black/20 ring-(--ring-color) [--ring-color:color-mix(in_oklab,var(--color-foreground)15%,var(--color-primary))]'
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
                  <div className="flex-1 md:hidden"></div>
                  {header.show_sign ? (
                    <SignUser userNav={header.user_nav} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
