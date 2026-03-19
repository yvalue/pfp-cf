# Header Nav Font Weight Design

## Context

The current AI PFP theme header uses mixed font-weight sources across its navigation:

- Desktop top-level direct links explicitly use `font-medium`
- Desktop top-level dropdown triggers inherit `font-medium` from the shared navigation-menu primitive
- Desktop second-level item titles explicitly use `font-medium`
- Mobile navigation titles already render visually as normal weight through local overrides or default text behavior

The requested change is to make both top-level and second-level navigation titles use normal font weight, while preserving all existing sizes, spacing, colors, and behavior.

## Goal

- Change header navigation titles from `font-medium` to `font-normal`
- Apply the visual result to both desktop and mobile header navigation
- Keep submenu description text unchanged
- Avoid changing shared component defaults outside this theme header

## Constraints

- Do not change font size
- Do not change colors, spacing, or interaction states
- Do not change shared `navigation-menu` defaults globally
- Do not change shared `accordion` defaults globally
- Limit the implementation to `src/themes/ai-pfp/blocks/header.tsx`

## Existing Behavior

In `src/themes/ai-pfp/blocks/header.tsx`:

- Desktop direct links use `text-base font-medium`
- Desktop dropdown triggers inherit `font-medium` from `src/shared/components/ui/navigation-menu.tsx`
- Desktop second-level titles use `text-base font-medium`
- Mobile top-level titles are visually normal because of the existing `**:!font-normal` override on the accordion trigger and plain text defaults on direct links
- Mobile second-level titles already render as normal text

## Options Considered

### Option 1: Local Header-Only Overrides

Change the font weight only in `src/themes/ai-pfp/blocks/header.tsx`.

Pros:

- Minimal blast radius
- Exactly matches the requested scope
- Does not affect other pages or themes that use shared navigation primitives

Cons:

- Desktop dropdown triggers require an explicit local override because their default comes from a shared component

### Option 2: Change Shared Navigation Primitive Defaults

Update the shared `navigation-menu` and `accordion` components to use `font-normal`.

Pros:

- Centralized typography defaults

Cons:

- Affects all consumers of those shared components
- Much broader than the requested theme-specific change

### Option 3: Add Parent-Level Weight Overrides

Apply a higher-level wrapper class that attempts to normalize all descendant text weight.

Pros:

- Fewer edited nodes

Cons:

- Less explicit
- Easier to break when child components change
- Harder to reason about than direct class updates

## Recommended Design

Use Option 1.

Keep the change local to `src/themes/ai-pfp/blocks/header.tsx`, and modify only the nodes that actually control navigation title weight.

## Architecture

Only the theme header block changes.

No data flow, rendering conditions, or component responsibilities change. This is a visual typography adjustment only.

## Component Changes

In `src/themes/ai-pfp/blocks/header.tsx`:

- Desktop direct link items:
  - change `font-medium` to `font-normal`
- Desktop dropdown triggers:
  - add a local `font-normal` override to the trigger class
- Desktop second-level item titles:
  - change `font-medium` to `font-normal`

For mobile:

- Keep the existing accordion-based structure unchanged
- Keep the current local overrides that already produce normal weight
- Do not add unnecessary extra classes where the rendered result is already normal

## Data Flow

No data flow changes.

The navigation items, active-state logic, dropdown state, and mobile accordion state remain unchanged.

## Error Handling

No new error paths are introduced.

## Verification Criteria

- Desktop top-level direct links render with normal font weight
- Desktop top-level dropdown triggers render with normal font weight
- Desktop second-level item titles render with normal font weight
- Mobile top-level titles remain visually normal
- Mobile second-level titles remain visually normal
- Submenu description text remains unchanged
- Hover, active, dropdown, and accordion behavior remain unchanged

## Testing

Manual verification after implementation should cover:

- desktop top-level direct links
- desktop top-level dropdown triggers
- desktop second-level item titles
- mobile accordion top-level items
- mobile submenu item titles
- active and hover states on both desktop and mobile

Targeted code validation:

- formatting check on `src/themes/ai-pfp/blocks/header.tsx`
- TypeScript check

## Out of Scope

- Changing navigation font size
- Changing submenu description typography
- Changing shared navigation primitives
- Changing header layout or responsive behavior
