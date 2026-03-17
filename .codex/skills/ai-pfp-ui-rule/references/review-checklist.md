# Review Checklist

Run this pass before finishing.

## Token Check

- Are surfaces using semantic colors instead of custom or opacity-based colors?
- Is border usage normalized to `border-border`?
- Are shadow and radius choices aligned with nearby components?

## Spacing Check

- Are major cards and panels on `p-6`?
- Are shell wrappers on `p-3` or `p-4`?
- Is the main rhythm mostly `gap-4`?
- Are buttons, triggers, and compact controls on `h-10`?
- Are badges on `px-2 py-1`?

## Tailwind Style Check

- Remove `bg-*/80`, `border-*/60`, and similar opacity utilities.
- Remove arbitrary values unless they solve a concrete layout requirement.
- Prefer `sm`, `md`, `lg`, `xl` breakpoint usage over narrow range tricks such as `lg:max-xl:*`.
- Prefer simple `transition-colors` or `transition-transform` over custom transition property lists.

## Reuse Check

- Can the structure be moved into an existing shared block?
- Is the page still carrying inline layout chrome that should live in a reusable block?

## Verification

- Run `npx.cmd tsc --noEmit --pretty false`
