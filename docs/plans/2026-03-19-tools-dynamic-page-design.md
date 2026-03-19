# Tools Dynamic Page Design

## Goal

Replace the current `professional-headshot-generator` special-case route with a real dynamic `tools` system that:

- keeps public URLs at root level, for example `/professional-headshot-generator`
- uses a shared `sidebar + topbar` shell
- loads each tool page from `messages/{locale}/tools/{slug}.json`
- stays structurally close to the existing landing dynamic-page system
- fails loudly when registration, config, or block resolution is wrong

## Approved Decisions

- Use `src/app/[locale]/(tools)/[slug]/page.tsx` for tool routes.
- Keep root-path URLs instead of `/tools/{slug}`.
- Keep sidebar registration manual in `messages/{locale}/tools.json`.
- Future tool creation flow should only require:
  - creating `messages/{locale}/tools/{slug}.json`
  - registering `tools/{slug}` in `src/config/locale/index.ts`
  - adding sidebar nav in `messages/{locale}/tools.json`
- Breadcrumb labels come from pathname-matched sidebar entries, not manual per-page labels.
- Do not keep the `tool-dashboard` naming or directory.
- Do not silently swallow missing config or missing blocks.

## Architecture

### Route Layer

- `src/app/[locale]/(tools)/layout.tsx`
- `src/app/[locale]/(tools)/[slug]/page.tsx`

This mirrors landing:

- route layout loads global shell config from `tools.json`
- route page loads per-tool content from `tools.{slug}`

### Message Layer

- `src/config/locale/messages/{locale}/tools.json`
- `src/config/locale/messages/{locale}/tools/{slug}.json`

`tools.json` is the global tools registry and shell config source.
Per-tool JSON files contain `metadata` and `page.sections`.

### Theme Layer

- `src/themes/default/layouts/tools.tsx`
- `src/themes/default/pages/tool-page.tsx`
- `src/themes/default/blocks/tools/sidebar.tsx`
- `src/themes/default/blocks/tools/topbar.tsx`
- `src/themes/default/blocks/tools/dynamic-page.tsx`

This keeps the top-level shape close to landing while placing tools-only shell subcomponents under `blocks/tools`.

### Type Layer

- `src/shared/types/blocks/tools.d.ts`

This mirrors `landing.d.ts` and reuses `Section` for `page.sections`.

## Strictness Rules

- Missing `tools.json`: throw
- Missing `tools/{slug}.json`: `notFound()`
- Slug not registered in `tools.json.sidebar.nav.items`: `notFound()`
- Current pathname not matched to a registered tool nav item in tools topbar/sidebar: throw
- Missing section block component: throw
- No silent `try/catch` block swallowing inside tools dynamic-page rendering
- No `tool-dashboard` fallback layer kept in `shared/blocks`

## Migration Plan

1. Add tools types, route files, strict theme loaders, and tools helpers.
2. Add `tools.json` and move `professional-headshot-generator` page data to `tools/professional-headshot-generator.json`.
3. Register `tools` and `tools/professional-headshot-generator` in locale message paths.
4. Build the new tools shell and dynamic page renderer.
5. Migrate `generator/tool-panel.tsx` off `tool-dashboard` workbench.
6. Remove old `(tool-shell)` route, old page JSON files, old `tool-dashboard` types, and old `shared/blocks/tool-dashboard`.

## Verification

- `/professional-headshot-generator` resolves through `(tools)/[slug]`
- metadata loads from `tools.professional-headshot-generator`
- sidebar highlights the current tool
- topbar breadcrumb resolves label from pathname-matched nav entry
- no old `tool-dashboard` imports remain
