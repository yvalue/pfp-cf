'use client';

import { createContext, Fragment, useContext } from 'react';

import { Link } from '@/core/i18n/navigation';
import {
  LocaleSelector,
  SignUser,
  SmartIcon,
  ThemeToggler,
} from '@/shared/blocks/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { Header as HeaderType } from '@/shared/types/blocks/dashboard';

const DashboardHeaderDefaultsContext =
  createContext<Partial<HeaderType> | null>(null);

export function DashboardHeaderDefaultsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: Partial<HeaderType>;
}) {
  return (
    <DashboardHeaderDefaultsContext.Provider value={value}>
      {children}
    </DashboardHeaderDefaultsContext.Provider>
  );
}

export function Header({
  title,
  crumbs,
  buttons,
  show_locale,
  show_theme,
  show_sign,
  user_nav,
}: HeaderType) {
  const defaults = useContext(DashboardHeaderDefaultsContext);

  const resolvedButtons = buttons ?? defaults?.buttons;
  const resolvedShowLocale = show_locale ?? defaults?.show_locale;
  const resolvedShowTheme = show_theme ?? defaults?.show_theme;
  const resolvedShowSign = show_sign ?? defaults?.show_sign;
  const resolvedUserNav = user_nav ?? defaults?.user_nav;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        {crumbs && crumbs.length > 0 && (
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        )}
        {crumbs && crumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => (
                <Fragment key={index}>
                  <BreadcrumbItem className="hidden md:block">
                    {crumb.is_active ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.url || ''}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < crumbs.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="ml-auto flex items-center gap-4">
          {resolvedButtons && resolvedButtons.length > 0 && (
            <div className="flex items-center gap-4">
              {resolvedButtons.map((button, idx) => (
                <Button
                  key={idx}
                  variant={button.variant || 'outline'}
                  size="sm"
                >
                  <Link
                    href={button.url || ''}
                    target={button.target || '_self'}
                    className="flex items-center gap-2"
                  >
                    {button.icon && <SmartIcon name={button.icon as string} />}
                    {button.title}
                  </Link>
                </Button>
              ))}
            </div>
          )}
          {resolvedShowTheme && <ThemeToggler />}
          {resolvedShowLocale !== false && <LocaleSelector />}
          {resolvedShowSign ? <SignUser userNav={resolvedUserNav} /> : null}
        </div>
      </div>
    </header>
  );
}
