# ShipAny Homepage Architecture

## Purpose

Use this reference to explain how the homepage is assembled from locale JSON plus theme blocks.

## File Map

- Homepage route entry: `src/app/[locale]/(landing)/page.tsx`
- Landing route layout: `src/app/[locale]/(landing)/layout.tsx`
- Theme page loader: `src/core/theme/index.ts`
- Dynamic page renderer: `src/themes/default/pages/dynamic-page.tsx`
- Locale message registry: `src/config/locale/index.ts`
- Locale message loader: `src/core/i18n/request.ts`
- Homepage JSON: `src/config/locale/messages/<locale>/pages/index.json`
- Landing shell JSON: `src/config/locale/messages/<locale>/landing.json`
- Theme blocks: `src/themes/<theme>/blocks/*.tsx`

## Render Chain

1. `src/core/i18n/request.ts` loads all configured locale message namespaces from `localeMessagesPaths`.
2. `src/app/[locale]/(landing)/page.tsx` reads `pages.index.page` and passes it into the theme page component.
3. `src/app/[locale]/(landing)/layout.tsx` reads `landing.header` and `landing.footer`, then passes them into the theme layout.
4. `src/themes/default/layouts/landing.tsx` resolves `header` and `footer` blocks through `getThemeBlock`.
5. `src/themes/default/pages/dynamic-page.tsx` loops over `page.sections` in object key order.
6. For each section, it skips disabled sections and sections excluded by `show_sections`.
7. The block name is resolved by `section.block || section.id || sectionKey`.
8. `getThemeBlock` tries `src/themes/<active-theme>/blocks/<block>.tsx`, then falls back to `src/themes/default/blocks/<block>.tsx`.

## What Is Configurable In JSON

- Section order: object key order inside `page.sections`
- Section visibility: `show_sections` and `section.disabled`
- Block selection: `section.block`
- Copy and media: `title`, `description`, `buttons`, `items`, `image`, `className`, and block-specific fields
- Header and footer nav and actions: `landing.json`

## What Requires Code

- New layout or interaction behavior not supported by an existing block
- New block names with no matching file under the active theme or default theme
- Changes to block internals, styling logic, data fetching, or client behavior
