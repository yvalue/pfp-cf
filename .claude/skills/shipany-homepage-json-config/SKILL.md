---
name: shipany-homepage-json-config
description: Explain and modify ShipAny homepage configuration driven by `src/config/locale/messages/*/pages/index.json`, `src/config/locale/messages/*/landing.json`, and theme blocks. Use when the user asks how the homepage works, how sections are ordered or toggled, how to add/remove/replace a homepage block, how `show_sections` or `block` works, or how theme hot-swapping resolves header, footer, and homepage sections.
---

# ShipAny Homepage JSON Config

This skill is for homepage structure work in this repo. Prefer JSON edits first. Only change theme blocks when the requested behavior or layout cannot be expressed in config.

## Load Order

- For the homepage render chain and file map, read `references/00-architecture.md`.
- For common edit patterns, read `references/01-recipes.md`.

## Core Rules

- Homepage page content lives in `src/config/locale/messages/<locale>/pages/index.json`.
- Landing header and footer content lives in `src/config/locale/messages/<locale>/landing.json`.
- Homepage sections are rendered by `src/app/[locale]/(landing)/page.tsx` and `src/themes/default/pages/dynamic-page.tsx`.
- Section component lookup uses `section.block || section.id || sectionKey`.
- Theme lookup uses the active theme first, then falls back to `default`.
- Prefer changing `show_sections`, section order, copy, image fields, `items`, and `className` in JSON before editing React code.
- Keep `en` and `zh` homepage configs aligned unless the user explicitly wants locale divergence.
- When adding or renaming a section, confirm the target block exists in the active theme or in `src/themes/default/blocks`.

## Validation

- Keep JSON valid.
- If only content changed, a quick JSON sanity check is enough.
- If section or block wiring changed, run a build or relevant validation command.
