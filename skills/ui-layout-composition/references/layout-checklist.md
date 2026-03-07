# Layout Checklist

Run this checklist before finalizing UI layout changes.

## Visual Consistency

- Theme tokens from `src/config/style/theme.css` are used instead of hardcoded colors.
- Typography and spacing match existing design language.
- Components use shared UI primitives under `src/shared/components/ui`.

## Responsiveness

- Landing page sections remain readable on mobile widths.
- Header/nav interactions are usable on touch devices.
- No horizontal overflow in key pages.

## Route and Content Integrity

- Page route resolves in expected route group.
- Content source (JSON, MDX, or route component) is intentional and documented.
- Locale namespaces are registered and translated keys exist.

## Theme Safety

- Works with active `NEXT_PUBLIC_THEME`.
- Missing custom theme files still fallback correctly to `default`.
- Light/dark mode readability is preserved.

## Regression Checks

- Existing nav items are still reachable.
- Metadata/canonical URLs are still generated correctly.
- No runtime errors from missing blocks or invalid section keys.
