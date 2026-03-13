# Navigation Menu Arrow Design

## Goal

Change the desktop navigation dropdown trigger to use a single arrow icon that rotates 180 degrees.

## Scope

Only update the shared navigation menu trigger used by the landing headers.

Do not change:

- dropdown panel animation
- dropdown layout
- mobile navigation
- header structure in theme blocks

Follow-up scope approved later in the same task:

- `ai-pfp` mobile submenu items should reuse the same icon selection and icon color treatment as the `ai-pfp` desktop submenu items
- `ai-pfp` mobile `AccordionTrigger` stays unchanged
- `default` theme stays unchanged

## Approved Approach

Use the smallest possible shared change in `src/shared/components/ui/navigation-menu.tsx`.

- closed state shows the default down arrow
- open state rotates the same arrow 180 degrees
- keep the existing trigger spacing and transition timing

## Validation

Confirm the shared trigger rotates the same arrow between closed and open states in both `default` and `ai-pfp` theme headers.

Confirm `ai-pfp` mobile submenu items use the same icon mapping and icon colors as `ai-pfp` desktop submenu items.
