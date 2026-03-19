import { locales } from '@/config/locale';
import type { ToolNavItem } from '@/shared/types/blocks/tools';

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
  items: ToolNavItem[],
  slug: string
): ToolNavItem | null {
  const targetUrl = normalizeToolUrl(slug);

  return items.find((item) => normalizeToolUrl(item.url) === targetUrl) ?? null;
}

export function getToolNavItemFromPathname(
  items: ToolNavItem[],
  pathname: string
): ToolNavItem | null {
  const slug = getToolSlugFromPathname(pathname);

  if (!slug) {
    return null;
  }

  return getToolNavItemFromSlug(items, slug);
}

export function isToolNavItemActive(
  item: ToolNavItem,
  pathname: string
): boolean {
  const currentItem = getToolNavItemFromPathname([item], pathname);
  return currentItem !== null;
}
