# Component Patterns

Keep component styling predictable across pages.

## Buttons

Prefer:
- `h-10`
- `rounded-xl`
- `text-sm`
- `shadow-sm` only when the button sits on a flat surface and needs separation

Primary button pattern:
- `bg-primary text-primary-foreground`

Secondary or outline pattern:
- `border border-border bg-background text-foreground`

## Inputs And Triggers

Prefer:
- `h-10`
- `rounded-xl`
- `text-sm leading-6`
- `border border-border`
- `bg-background`

Apply the same trigger shape to `SelectTrigger`, text fields, and compact dropdown triggers when possible.

## Tabs

Tabs list:
- `border border-border`
- `bg-background`
- `rounded-2xl`
- `p-1`
- `shadow-sm`

Tabs trigger:
- `h-10`
- `rounded-xl`
- `text-sm leading-6`

Avoid motion-heavy trigger styling when a standard active state is enough.

## Cards And Panels

Prefer:
- `border border-border`
- `bg-background` or `bg-card`
- `rounded-3xl`
- `p-6`
- `shadow-sm`

Nested informational blocks can step down to:
- `rounded-2xl`
- `p-4`

## Badges

Prefer:
- `rounded-xl`
- `px-2 py-1`
- `text-xs`

Use semantic surfaces such as `bg-muted` or `bg-accent`.

## Accordion And Dropdown

Prefer:
- outer container `rounded-3xl` or `rounded-2xl`
- `border border-border`
- `bg-background`
- `p-3` for menu or accordion shell

Keep item spacing compact and readable. Do not over-style hover and active states.
