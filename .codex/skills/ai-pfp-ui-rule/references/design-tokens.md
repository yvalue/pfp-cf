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
- controls, labels, helper text: `text-sm`
- section descriptions and body copy: `text-base leading-7`
- long-form supporting paragraphs on larger sections: `md:text-lg md:leading-8`
- small block titles: `text-xl font-semibold tracking-tight`
- section titles: `text-3xl font-semibold tracking-tight md:text-4xl`
- large hero-only titles: `text-4xl font-semibold tracking-tight md:text-6xl`

Avoid custom tracking values and arbitrary text sizes unless the design clearly depends on them.
Avoid mixing too many nearby text scales inside one block; keep each block to one title size and one body size unless there is a clear hierarchy need.
