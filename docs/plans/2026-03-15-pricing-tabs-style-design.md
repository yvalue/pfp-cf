# Pricing Tabs Style Cleanup Design

## Scope

Tighten the pricing tabs implementation in `src/themes/ai-pfp/blocks/pricing.tsx`
without changing behavior, copy, or interaction flow.

## Goals

- Remove non-standard Tailwind arbitrary values from the pricing tabs.
- Replace direct inline layout math with one controlled CSS-variable-based styling hook.
- Keep the current sliding indicator and tab switching behavior intact.

## Approved Approach

1. Replace tab sizing and typography magic numbers with Tailwind scale tokens.
2. Move the indicator layout math into a dedicated CSS module.
3. Keep one controlled runtime exception by passing tab count and active index
   as CSS custom properties from the component.

## Non-Goals

- No changes to pricing business logic.
- No visual redesign.
- No new animations.
- No changes outside the pricing tabs area unless required by formatting.

## Validation

- Confirm `pricing.tsx` no longer uses the pricing tabs arbitrary values that were flagged.
- Confirm the sliding indicator still tracks the active tab.
- Run formatting and TypeScript validation.
