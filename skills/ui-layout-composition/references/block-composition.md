# Block Composition

This project uses section-based page composition through theme blocks.

## 1. Section Contract

Reference type: `src/shared/types/blocks/landing.d.ts`

Core section fields:

- `id`
- `block`
- `title`
- `description`
- `items`
- `buttons`
- `className`
- `disabled`

Dynamic page fields:

- `sections: Record<string, Section>`
- `show_sections?: string[]`

## 2. Block Resolver Behavior

Reference: `src/themes/default/pages/dynamic-page.tsx`

Resolver logic:

1. Iterate `sections` keys.
2. Skip section if `disabled === true`.
3. Skip section if not listed in `show_sections`.
4. Resolve block name with priority:
   - `section.block`
   - `section.id`
   - section key
5. Load block through `getThemeBlock(blockName)`.

When adding new block types, ensure export names match resolver expectations.

## 3. Add New Block

1. Create block file:
   - `src/themes/default/blocks/<block-name>.tsx`
2. Export component using matching name conventions.
3. Reference block in page JSON:
   - `"block": "<block-name>"`
4. Verify render in both locales.

## 4. Add New Config-Driven Page

1. Add locale files:
   - `src/config/locale/messages/en/pages/<slug>.json`
   - `src/config/locale/messages/zh/pages/<slug>.json`
2. Register namespace in:
   - `src/config/locale/index.ts` -> `localeMessagesPaths` add `'pages/<slug>'`
3. Visit route:
   - `/ <slug>` (default locale)
   - `/zh/<slug>` (secondary locale)

## 5. Use MDX vs JSON vs Custom Route

- JSON: preferred for most marketing pages.
- MDX: legal/help pages or long-form static content.
- Custom route: runtime data, advanced interactions, custom logic.
