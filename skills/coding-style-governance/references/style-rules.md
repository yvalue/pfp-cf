# Style Rules

Repository: `pfp-cf` (Next.js + TypeScript)

## 1. Formatting Baseline

Source: `.prettierrc.json`

- `semi: true`
- `singleQuote: true`
- `tabWidth: 2`
- `useTabs: false`
- `trailingComma: es5`
- `printWidth: 80`
- `arrowParens: always`
- `endOfLine: lf`

Use:

```bash
pnpm format
pnpm format:check
```

## 2. Import Order Baseline

Source: `.prettierrc.json` (`@ianvs/prettier-plugin-sort-imports`)

Order:

1. `react`
2. `next`
3. third-party modules
4. blank line
5. `@/core`
6. `@/config`
7. `@/extensions`
8. `@/shared`
9. `@/themes`
10. blank line
11. relative imports (`./`, `../`)

Do not hand-sort imports against plugin output; run formatter.

## 3. TypeScript and Alias Baseline

Source: `tsconfig.json`

- `strict: true`
- `moduleResolution: bundler`
- alias: `@/* -> ./src/*`

Guideline:

- Prefer explicit interfaces/types for shared module boundaries.
- Avoid unchecked `any`; narrow with union/types where possible.
- Use `@/...` aliases for cross-domain imports.

## 4. Next.js File Conventions

Observed conventions in `src/app` and `src/themes`:

- Route/layout files often use default export.
- Service modules commonly use named exports.
- Async server components are common; keep params typed.

Match local file conventions instead of forcing one global export style.

## 5. Style Gate Commands

Baseline:

```bash
pnpm format:check
pnpm lint
```

Escalated (for broad refactor or shared runtime changes):

```bash
pnpm format:check
pnpm lint
pnpm build
```
