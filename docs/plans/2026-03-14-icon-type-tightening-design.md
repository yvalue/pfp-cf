# Icon Type Tightening Design

## Goal

Tighten shared block `icon` fields to `string` so shared types represent serializable configuration data instead of mixed data and runtime JSX.

## Scope

Apply this decision to shared block types under `src/shared/types/blocks`.

In scope:

- `NavItem.icon`
- `Section.icon`
- inherited usages such as `Button.icon`

Do not change in this task:

- icon fields in unrelated local component props
- image-based provider icons such as `icon_url`
- visual styling or layout of provider buttons

## Approved Approach

Use a strict split between shared configuration data and component-local render details.

- shared `icon` fields use `string` only
- shared icon rendering continues through `SmartIcon`
- components that need direct JSX icons stop using `ButtonType.icon` for that purpose
- those components define a local field such as `iconNode` or a local provider item type instead

## Rationale

Most existing consumers already treat shared `icon` values as string names and pass them into `SmartIcon`.

Keeping `string | ReactNode` in shared types makes the model ambiguous:

- config-driven code expects icon names
- a small number of local components inject JSX directly
- future consumers must defensively handle both shapes

Tightening the shared type keeps the data model predictable and pushes UI-specific exceptions back into the component that owns them.

## Migration Plan

1. Change shared block `icon` fields from `string | ReactNode` to `string`.
2. Fix compile errors where JSX is still passed into shared `icon`.
3. Update local exceptions such as social sign-in providers to use a component-local icon field.
4. Leave existing string-based icon flows unchanged.

## Validation

Confirm TypeScript no longer allows JSX to flow through shared block `icon` fields.

Confirm existing string-driven icon rendering still works in shared blocks that use `SmartIcon`.

Confirm social provider buttons still render the same Google and GitHub icons and keep the same click behavior after moving those icons to a local field.
