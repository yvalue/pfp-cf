# Review Checklist

Use this checklist before finalizing code changes.

## Scope and Diff Hygiene

- Change set is limited to requested scope.
- No accidental formatting churn in unrelated files.
- No generated cache artifacts committed.

## Readability and Boundaries

- Import order follows formatter rules.
- Aliases and relative imports are consistent and minimal.
- Shared logic stays in `core/config/extensions/shared`; theme/view layer keeps UI concerns.

## Type Safety

- New public interfaces are typed.
- `any` usage is minimized and intentional.
- Error handling paths return predictable shapes.

## Validation

- `pnpm format:check` passes.
- `pnpm lint` passes.
- `pnpm build` passes when touching shared runtime paths.

## Documentation

- Non-obvious decisions are explained with concise comments.
- New constraints are reflected in related docs or skill references.
