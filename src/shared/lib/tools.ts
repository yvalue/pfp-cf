import { locales } from '@/config/locale';
import type { Nav, NavItem } from '@/shared/types/blocks/common';
import type { Sidebar } from '@/shared/types/blocks/dashboard';

export function normalizeToolUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) {
    return '/';
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`.replace(/\/+/g, '/');
}

export function getToolSlugFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);

  if (!segments.length) {
    return null;
  }

  const [first, second] = segments;

  if (locales.includes(first)) {
    return second ?? null;
  }

  return first;
}

export function getToolNavItemFromSlug(
  items: NavItem[],
  slug: string
): NavItem | null {
  const targetUrl = normalizeToolUrl(slug);

  return (
    items.find((item) => normalizeToolUrl(item.url || '') === targetUrl) ?? null
  );
}

export function getToolNavItemFromPathname(
  items: NavItem[],
  pathname: string
): NavItem | null {
  const slug = getToolSlugFromPathname(pathname);

  if (!slug) {
    return null;
  }

  return getToolNavItemFromSlug(items, slug);
}

export function isToolNavItemActive(item: NavItem, pathname: string): boolean {
  const currentItem = getToolNavItemFromPathname([item], pathname);
  return currentItem !== null;
}

export function getToolSidebarItems(sidebar: Sidebar): NavItem[] {
  return sidebar.main_navs?.flatMap((nav: Nav) => nav.items ?? []) ?? [];
}
