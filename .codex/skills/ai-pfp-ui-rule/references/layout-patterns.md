# Layout Patterns

Choose an existing structural pattern before introducing a new wrapper.

## Shell Pattern

Use for dashboard-like and tool pages:
- outer shell
- optional sidebar
- topbar
- main content area

Prefer shared block composition over inline page wrappers.

## Section Pattern

Use for content sections:
- `border border-border`
- `bg-card` or `bg-background`
- `rounded-3xl`
- `p-6`

Attach heading, description, and actions inside a consistent header region before content.

## Workbench Pattern

Use for tool builders:
- outer shell with `p-4`
- two panes with `p-6`
- `gap-4`

Prefer standard grid columns like `grid-cols-1`, `lg:grid-cols-2`, or shared block props over arbitrary grid templates.

## Grid Pattern

Prefer:
- `grid-cols-1`
- `md:grid-cols-2`
- `xl:grid-cols-3`
- `xl:grid-cols-4`

Avoid arbitrary `grid-cols-[...]` templates unless the content truly requires asymmetric proportions and the shared patterns cannot express it.
