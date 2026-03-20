---
name: ai-pfp-ui-rule
description: Enforce shared Tailwind UI rules for the `ai-pfp` theme and adjacent reusable blocks. Use when creating, refactoring, reviewing, or normalizing page blocks, layout shells, pricing sections, generator panels, or common UI components under `src/themes/ai-pfp/**`, `src/shared/blocks/**`, and related app routes. Apply this skill when the task mentions style unification, Tailwind cleanup, spacing consistency, border/shadow/radius normalization, replacing ad hoc inline styles, or making component styling more reusable and mainstream.
---

# AI PFP UI Rule

Apply a constrained, repeatable Tailwind style system for the `ai-pfp` theme. Favor standard utility usage, semantic tokens, and reusable layout/component patterns over one-off page styling.

## Workflow

1. Identify the styling surface.
   Common targets: page shells, section cards, workbench layouts, tabs, forms, pricing cards, sidebars, topbars.
2. Read only the references needed for that surface.
   Use `design-tokens.md` and `spacing-system.md` by default.
   Read `layout-patterns.md` for shell or section structure changes.
   Read `component-patterns.md` for control-level work.
   Read `review-checklist.md` before finishing.
3. Normalize before inventing.
   Reuse existing block patterns and class groups already established in nearby files.
4. Prefer mainstream Tailwind.
   Use standard breakpoint, spacing, border, background, and radius utilities.
   Avoid arbitrary values unless there is a concrete layout requirement that cannot be expressed cleanly otherwise.
5. Verify.
   Run the project type check after edits.

## Editing Rules

- Keep classes semantic: `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `text-foreground`, `text-muted-foreground`, `border-border`.
- Remove numeric opacity variants for UI surfaces in this theme.
- Keep card chrome simple: `border border-border`, `rounded-3xl`; do not pair borders with shadows by default.
- Keep controls simple: `h-10`, `rounded-xl`, `text-sm`.
- Keep typography on a narrow scale; use the shared title, body, and supporting-copy sizes from `design-tokens.md` instead of page-local text scales.
- Converge spacing onto a small set of tokens instead of preserving page-specific drift.
- Keep section and container spacing standardized; use the shared section padding and container gutter rules from `spacing-system.md` instead of ad hoc `px-*`, `py-*`, `mt-*`, and `mb-*`.
- Prefer parent `grid` or `flex` `gap-*` for vertical rhythm; do not rely on browser default paragraph or heading margins.
- Treat `p-*`, `m-*`, `px-*`, `py-*`, `mt-*`, and `mb-*` as explicit layout decisions; add them only when the parent layout gap cannot express the spacing cleanly.
- Prefer shared layout blocks over page-local wrappers when structure repeats.

## References

- `references/design-tokens.md`
- `references/spacing-system.md`
- `references/layout-patterns.md`
- `references/component-patterns.md`
- `references/review-checklist.md`
