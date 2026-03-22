# Tools Sidebar Collapse Design

## Goal

Switch the tools layout to the shared sidebar system so the desktop sidebar can collapse into an icon rail while mobile keeps a drawer-style navigation.

## Approved Direction

- Use the shared `SidebarProvider` and `SidebarInset` in the tools layout.
- Replace the custom `ai-pfp` tools sidebar with shared sidebar primitives.
- Use desktop `collapsible="icon"` behavior rather than fully hiding the sidebar.
- Keep a dedicated mobile header with brand and menu button, but route the open state through the shared sidebar context.
- Add a theme-local `tools-topbar` block for `ai-pfp` so the sidebar trigger only affects this theme.

## Implementation Notes

- Preserve the existing tool navigation source from `ToolSidebarConfig`.
- Keep active item highlighting in both expanded and collapsed states.
- Show tooltip labels in collapsed mode.
- Hide the footer primary action in collapsed desktop mode to avoid an icon-only CTA with unclear meaning.

## Risks

- The shared sidebar uses `sidebar` theme tokens, so visuals may shift slightly from the original custom card-style sidebar.
- `ai-pfp` previously fell back to the default `tools-topbar`, so a local block is required to keep the trigger scoped to this theme.
