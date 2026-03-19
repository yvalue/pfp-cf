---
name: ui-layout-composition
description: Design and implement UI layout and page composition in the pfp-cf theme architecture. Use when adding or refactoring landing/admin/docs/chat/auth pages, composing theme blocks, creating locale page JSON/MDX content, wiring headers/footers/navigation, or preserving responsive and theme-consistent layout behavior.
---

# UI Layout Composition

Build new UI pages and sections using the repository's route-group and theme-loader architecture. Preserve consistency between locale content, dynamic block rendering, and layout wrappers.

## Workflow

### 1. Choose route group and render strategy

Identify the target group under `src/app/[locale]`:

- `(landing)`
- `(admin)`
- `(docs)`
- `(chat)`
- `(auth)`

For landing pages, choose one:

1. JSON config page (`src/config/locale/messages/{locale}/pages/*.json`)
2. MDX static page (`content/pages/*.mdx`)
3. Custom route component (`src/app/[locale]/(landing)/.../page.tsx`)

See [references/layout-map.md](references/layout-map.md).

### 2. Compose page through theme contracts

Use existing contracts:

- `getThemeLayout()` for layout shells.
- `getThemePage()` for page renderers.
- `getThemeBlock()` for section blocks.

Respect fallback behavior:

- Missing block/page/layout in custom theme falls back to `default`.
- Use this for incremental migration instead of full copy rewrites.

### 3. Keep locale content and UI structure aligned

If using JSON pages:

- Add page namespace files for each locale.
- Register `'pages/<slug>'` in `src/config/locale/index.ts`.
- Ensure key shape consistency across locales.

If using MDX pages:

- Add locale variants (`about.mdx`, `about.zh.mdx`).
- Keep frontmatter complete (`title`, `description`, dates where applicable).

### 4. Enforce layout quality checks

Before completion:

- Verify desktop and mobile breakpoints.
- Verify light/dark mode token readability.
- Verify header/footer/nav behavior in target locale.
- Verify route and metadata generation still resolve canonical URLs.

Use [references/layout-checklist.md](references/layout-checklist.md).

## Completion Criteria

Complete only when:

- Route renders correctly under expected locale paths.
- Theme block mapping is correct and no block resolution errors appear.
- Navigation and content sources (JSON/MDX/route) are consistent.
- UI remains responsive and visually coherent across key pages.

## Resources

- [references/layout-map.md](references/layout-map.md)
- [references/block-composition.md](references/block-composition.md)
- [references/layout-checklist.md](references/layout-checklist.md)
