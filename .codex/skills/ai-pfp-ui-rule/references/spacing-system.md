# Spacing System

Use a narrow spacing set. Normalize nearby elements to the same rhythm instead of preserving small differences.

## Preferred Tokens

- shell padding: `p-3` or `p-4`
- panel/card padding: `p-6`
- larger desktop section padding: `lg:p-8`
- compact block padding: `p-4`
- primary layout gaps: `gap-4`
- compact inner gaps: `gap-2` or `gap-3`
- control height: `h-10`
- badge padding: `px-2 py-1`

## Convergence Rules

- Convert `px-*` + `py-*` pairs to `p-*` when the values are equal.
- Prefer `gap-4` over `gap-5` and `gap-6` unless the extra space is part of a deliberate layout breakpoint.
- Prefer `p-6` over mixed `px-6 py-8`, `p-5 md:p-6`, or `lg:px-7 lg:py-7` unless content density materially changes by breakpoint.
- Keep buttons and triggers aligned to `h-10`.

## Avoid

- `px-1.5`, `py-1.5`, `gap-5`, `gap-6` as default rhythm
- one-off desktop-only padding adjustments without a strong reason
- per-page spacing scales that diverge from neighboring blocks
