# Layout Map

Use this map to place UI changes in the correct layer.

## 1. Root and Locale Wrappers

- `src/app/layout.tsx`
  - Loads global CSS and fonts.
  - Injects analytics/ads/affiliate/customer-service scripts.
- `src/app/[locale]/layout.tsx`
  - Validates locale.
  - Wraps with `NextIntlClientProvider`, `ThemeProvider`, `AppContextProvider`.
  - Mounts global `Toaster`.

## 2. Route Groups

Under `src/app/[locale]`:

- `(landing)`: marketing pages and dynamic content pages.
- `(admin)`: admin dashboard and management pages.
- `(docs)`: documentation UI pages.
- `(chat)`: chat workflows and history pages.
- `(auth)`: sign-in/sign-up/verification pages.

Choose group first; do not mix page responsibilities across groups.

## 3. Landing Layout Pipeline

Key files:

- `src/app/[locale]/(landing)/layout.tsx`
- `src/themes/default/layouts/landing.tsx`
- `src/themes/default/pages/dynamic-page.tsx`
- `src/core/theme/index.ts`

Flow:

1. Read `landing` translations (header/footer).
2. Resolve layout via `getThemeLayout('landing')`.
3. Render header/footer via theme blocks.
4. Render page sections via dynamic page + block resolver.

## 4. Content Sources for Landing Pages

`[...slug]` resolution order:

1. `content/pages/*.mdx` (static MDX page)
2. `src/config/locale/messages/{locale}/pages/*.json` (config-driven page)
3. `404`

This allows content-first pages to avoid custom route code.

## 5. Theme and Fallback

- Active theme selected by `NEXT_PUBLIC_THEME`.
- Missing theme block/page/layout falls back to `src/themes/default`.
- Use fallback behavior for incremental theming.
