# Tools Dashboard Architecture Design

## Goal

Move tools pages onto the shared ShipAny dashboard architecture so theme-specific tool sidebar and topbar implementations are no longer needed.

## Approved Direction

- Reuse shared dashboard layout, sidebar, nav, header, trigger, and collapse behavior.
- Keep the existing `tools.json` data shape and add a small adapter from `ToolSidebarConfig` to dashboard sidebar config.
- Use a shared tools header wrapper to resolve the current tool from pathname and feed shared dashboard header props.
- Remove theme-level `tools-sidebar` and `tools-topbar` blocks once layouts no longer reference them.

## Implementation Notes

- `primary_action` maps to dashboard `buttons`.
- Tool navigation maps to dashboard `main_navs`.
- Shared dashboard header is extended to support signed-in user menu display.
- Shared dashboard sidebar buttons get a collapsed fallback glyph when a button has no icon.

## Expected Outcome

- Fewer theme-specific blocks.
- One shared navigation/collapse implementation for tools pages.
- Tool page theming stays at the layout/footer layer instead of duplicating sidebar and topbar rendering.
