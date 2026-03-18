# Design Tokens

Use semantic Tailwind tokens already present in the project. Do not introduce page-local color systems.

## Colors

Prefer:
- `bg-background`
- `bg-card`
- `bg-muted`
- `bg-accent`
- `text-foreground`
- `text-muted-foreground`
- `text-primary`
- `text-primary-foreground`
- `border-border`

Avoid:
- `bg-*/*`
- `text-*/*`
- `border-*/*`
- `shadow-*/*`
- direct opacity-based surface tuning such as `bg-background/80`

## Shadows

Avoid shadows for bordered surfaces by default.

Allow shadows only when the component is intentionally floating and separation cannot be expressed well enough with border and background alone.

## Radius

Prefer:
- large cards and panels: `rounded-3xl`
- medium groups and nested panels: `rounded-2xl`
- controls and buttons: `rounded-xl`

Avoid mixing `rounded-full` into card and control surfaces unless the shape is intentionally circular.

## Typography

Prefer:
- body and controls: `text-sm`
- supporting paragraphs: `text-sm leading-6` or `text-base leading-7`
- headings: `font-semibold tracking-tight`

Avoid custom tracking values and arbitrary text sizes unless the design clearly depends on them.
