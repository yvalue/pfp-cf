# Spacing System

Use a narrow spacing set. Normalize nearby elements to the same rhythm instead of preserving small differences.

## Preferred Tokens

- container gutters: use the shared `.container`; avoid local `px-*` overrides unless a block has a concrete edge-to-edge requirement
- standard section padding: `py-12 md:py-16`
- larger hero or spotlight section padding: `py-16 md:py-24`
- shell padding: `p-3` or `p-4`
- panel/card padding: `p-6`
- larger desktop section padding: `lg:p-8`
- compact block padding: `p-4`
- primary layout gaps: `gap-4`
- compact inner gaps: `gap-2` or `gap-3`
- default stacked text rhythm: use parent `grid gap-3` or `gap-4` instead of per-element margins
- control height: `h-10`
- badge padding: `px-2 py-1`

## Convergence Rules

- Keep container side spacing on the shared `.container`; remove page-local `px-5`, `px-6`, or `md:px-*` when the shared container already solves the layout.
- Prefer `py-12 md:py-16` for standard sections; only use larger section padding when the block is intentionally spacious.
- Convert `px-*` + `py-*` pairs to `p-*` when the values are equal.
- Prefer `gap-4` over `gap-5` and `gap-6` unless the extra space is part of a deliberate layout breakpoint.
- Prefer `p-6` over mixed `px-6 py-8`, `p-5 md:p-6`, or `lg:px-7 lg:py-7` unless content density materially changes by breakpoint.
- Prefer parent `gap-*` over stacked `mb-*` and `mt-*` on headings and paragraphs.
- Default paragraph and heading margins to none inside app blocks; add `mt-*` or `mb-*` only for isolated exceptions such as prose content or third-party markup.
- Keep buttons and triggers aligned to `h-10`.

## Avoid

- `px-1.5`, `py-1.5`, `gap-5`, `gap-6` as default rhythm
- repeated `mb-*` on sibling `p`, `h2`, `h3`, and wrapper elements when a parent `grid` or `flex` gap would express the same spacing
- container-local `px-*` that fight the shared `.container`
- one-off desktop-only padding adjustments without a strong reason
- per-page spacing scales that diverge from neighboring blocks
