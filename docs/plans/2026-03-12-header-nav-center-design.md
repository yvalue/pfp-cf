# Header Nav Center Design

## Context

The current desktop header in `src/themes/ai-pfp/blocks/header.tsx` renders the brand logo and desktop navigation inside the same left-side flex group, while the theme, locale, sign, and CTA controls render in a separate right-side group.

Because of that structure, the desktop navigation is only centered within the left group, not geometrically centered relative to the full header width.

## Goal

On `lg` and larger breakpoints only:

- Keep the navigation geometrically centered relative to the full header container.
- Keep the brand logo aligned left.
- Keep the right-side controls aligned right.
- Preserve all existing navigation, dropdown, scroll, theme, locale, sign, and mobile menu behavior.

## Constraints

- Do not change the mobile or tablet layout.
- Keep the current hamburger and accordion drawer behavior below `lg`.
- Do not change navigation data, active-state logic, dropdown logic, or shared navigation primitives.
- Limit changes to `src/themes/ai-pfp/blocks/header.tsx`.

## Existing Behavior

- `isLarge` is driven by `useMedia('(min-width: 64rem)')`, which matches the `lg` breakpoint.
- Below `lg`, the desktop navigation is hidden and the hamburger button is shown.
- The expanded mobile menu uses the existing `Accordion` structure.
- The desktop controls area already has separate responsive visibility rules and should remain functionally unchanged.

## Options Considered

### Option 1: Absolute-Centered Navigation

Place the desktop navigation in an absolutely positioned center layer using `left-1/2 -translate-x-1/2`.

Pros:

- Simple to implement.
- Minimal DOM changes.

Cons:

- More fragile when the navigation width grows.
- Higher risk of overlap with the logo or right-side controls.
- More likely to need follow-up collision handling.

### Option 2: Three-Column Grid

Switch the desktop header layout to `lg:grid lg:grid-cols-[1fr_auto_1fr]`, with the logo in the left column, navigation in the center column, and controls in the right column.

Pros:

- Produces true geometric centering of the navigation.
- Keeps layout intent explicit and maintainable.
- Avoids absolute-position overlap problems.
- Leaves dropdown behavior tied to the existing navigation trigger structure.

Cons:

- Requires small DOM restructuring in the header component.
- Center space can become tight if either side grows significantly.

### Option 3: Equal-Width Side Compensation

Keep the current flex layout and try to compensate for left/right width differences with placeholder sizing.

Pros:

- Smaller structural change.

Cons:

- Not truly centered.
- Brittle when controls, auth state, or locale change.
- Fails the stated requirement.

## Recommended Design

Use the three-column grid approach on `lg` and above.

### Layout

- Keep the existing mobile-first flex layout.
- At `lg`, switch the main header row to a three-column grid.
- Left column: brand logo only, aligned to the start.
- Center column: desktop `NavMenu` only, aligned to the center.
- Right column: theme, locale, sign, and CTA controls, aligned to the end.

### Component Responsibility

- Keep `NavMenu` unchanged in terms of rendering logic and active-state behavior.
- Keep `MobileMenu` unchanged.
- Keep `NavigationMenuContent` and the shared `navigation-menu.tsx` primitive unchanged.
- Only move where `NavMenu` is mounted in the desktop layout.

### Responsive Rules

- Below `lg`, keep the current logo + hamburger + accordion flow unchanged.
- At `lg` and above, render:
  - left column logo
  - center column desktop navigation
  - right column controls

## Proposed Structural Changes

In `src/themes/ai-pfp/blocks/header.tsx`:

- Change the main header row from desktop flex positioning to desktop grid positioning.
- Remove desktop `NavMenu` from the current left-side logo group.
- Add a dedicated desktop-only middle wrapper for `NavMenu`.
- Keep the left-side wrapper responsible for logo plus mobile hamburger behavior.
- Keep the right-side controls area, but anchor it explicitly to the desktop grid end.

Representative class direction:

- Main row:
  - `relative flex flex-wrap items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:py-5`
- Desktop nav wrapper:
  - `hidden lg:flex lg:min-w-0 lg:max-w-full lg:justify-self-center`
- Desktop controls wrapper:
  - retain current visibility logic and add `lg:justify-self-end`

## Verification Criteria

- At `1024px` and above, the nav block is geometrically centered in the header.
- The logo remains left-aligned.
- The right-side controls remain right-aligned.
- Hover, active, and dropdown behaviors remain unchanged.
- Scrolled-state styling remains unchanged.
- Dark mode remains unchanged.
- Between `768px` and `1023px`, the layout remains hamburger-based.
- Below `768px`, the layout remains unchanged.

## Risks

- If the desktop navigation becomes much wider in the future, available center space can become constrained.
- This design intentionally does not add overflow handling or an earlier desktop-to-mobile fallback threshold.

## Out of Scope

- Reworking shared navigation primitives.
- Changing menu data structure.
- Changing tablet or mobile interaction patterns.
- Adding overflow mitigation for unusually wide desktop menus.

## Implementation Notes

- Restrict the change to `src/themes/ai-pfp/blocks/header.tsx`.
- Do not modify `src/shared/components/ui/navigation-menu.tsx`.
- Validate at `lg`, `xl`, and common tablet widths after implementation.
