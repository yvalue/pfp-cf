---
name: coding-style-governance
description: Enforce coding style and consistency for the pfp-cf Next.js TypeScript repository. Use when creating or modifying `.ts/.tsx/.json/.mdx` files, refactoring shared modules, reviewing pull requests, or validating formatting, import order, alias usage, and lint/build quality gates before merge.
---

# Coding Style Governance

Apply repository-specific style rules and quality checks with minimal ambiguity. Keep style enforcement deterministic and tied to current repo configuration.

## Workflow

### 1. Read project style sources

Inspect:

- `.prettierrc.json`
- `tsconfig.json`
- `package.json` scripts (`format`, `format:check`, `lint`, `build`)
- `src/` module structure and alias usage (`@/*`)

Use [references/style-rules.md](references/style-rules.md) for the canonical rules.

### 2. Apply style while editing

Enforce these baselines:

- Prettier rules (single quotes, semicolons, trailing commas, `printWidth: 80`).
- Prettier import sorting order from `.prettierrc.json`.
- Prefer `@/...` aliases over long relative imports when crossing modules.
- Keep route files and async server components readable and typed.
- Minimize `any`; justify unavoidable usage.

### 3. Run style quality gates

Use the bundled script:

```bash
python scripts/style_guard.py --repo .
```

Optional modes:

```bash
python scripts/style_guard.py --repo . --fix
python scripts/style_guard.py --repo . --with-build
python scripts/style_guard.py --repo . --fix --with-build
```

### 4. Review diffs before completion

Before finalizing:

- Confirm no unrelated formatting churn.
- Confirm import groups are stable after formatter run.
- Confirm updated files still match module boundaries (`core`, `config`, `extensions`, `shared`, `themes`).
- Use [references/review-checklist.md](references/review-checklist.md) as a final pass.

## Completion Criteria

Complete only when:

- Formatter and lint checks pass.
- Build check passes when change scope affects compile/runtime paths.
- New code follows import ordering and alias conventions.
- Exceptions to style rules are documented in-code with concise reasoning.

## Resources

- [references/style-rules.md](references/style-rules.md)
- [references/review-checklist.md](references/review-checklist.md)
- `scripts/style_guard.py`
