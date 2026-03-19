# Shared Tools Image Tool Panel Design

## Goal

Replace the current split `workbench.tsx` plus instance-specific `tool-panel.tsx` with a single shared `tool-panel.tsx` that acts as the runtime for multiple image-based tools routes.

The target outcome is:

- one shared implementation in `src/shared/blocks/generator/tool-panel.tsx`
- multiple tool instances configured from `src/config/locale/messages/*/tools/<slug>.json`
- no instance-specific naming such as `ProfessionalHeadshotGenerator`
- data flow and task handling aligned with `src/shared/blocks/generator/image.tsx`

## Confirmed Decisions

- `workbench.tsx` will be merged into `tool-panel.tsx` and removed as a separate component
- `tool-panel.tsx` is a complete business component, not just a layout shell
- the shared runtime is for multiple image tools under `tools/<slug>.json`
- `tools.json` remains the shared tools shell config for sidebar and topbar only
- each generator tool keeps its own `tools/<slug>.json` config file
- the first implementation targets image processing only, not music or video
- internal upload, generate, poll, progress, and download flow should follow `src/shared/blocks/generator/image.tsx`

## Context

Today the generator folder mixes two patterns:

- `image.tsx`, `music.tsx`, and `video.tsx` are standalone business components
- the tools generator path uses `tool-panel.tsx` plus `workbench.tsx`, with instance-specific naming tied to the professional headshot route

This split makes the tools generator less consistent with sibling files and makes future tools harder to add. The approved direction is to keep a single-file business component model while still allowing multiple tools routes to share one implementation.

## Architecture

### Component Responsibility

`src/shared/blocks/generator/tool-panel.tsx` becomes the only shared runtime for tools image generators. It owns:

- layout for the left input area and right results area
- form state
- upload state
- generation state
- task polling
- normalized result state
- download behavior

It does not delegate core layout responsibility to `workbench.tsx`, and it does not expose instance-specific component names.

### Route Responsibility

`src/app/[locale]/(tools)/[slug]/page.tsx` continues to:

- validate the slug against `tools.sidebar.nav.items`
- load `tools.<slug>.metadata`
- load `tools.<slug>.page`
- render the shared theme block for `tool-page`

The route does not gain tool-specific business logic.

### Message Responsibility

Each tool instance remains a localized config file under `src/config/locale/messages/*/tools/<slug>.json`.

That file provides:

- metadata
- page-level section ordering
- one generator section with `block: "tool-panel"`
- configuration values that drive the shared runtime

`tools.json` remains the place for tools-wide shell configuration only:

- sidebar navigation
- topbar behavior

## Configuration Design

The shared runtime will consume a generic section type instead of `ProfessionalHeadshotGeneratorSection`.

The generator section should remain under `page.sections.generator`, but its schema is generalized to support multiple image tools. The first version should support these groups:

- `title`, `description`
- `tabs`
- `fields`
- `upload`
- `inputs`
- `model`
- `generation`
- `result`
- `buttons`
- `credits`
- `examples`

### Schema Intent

- `tabs` controls visible panel modes and labels
- `fields` provides labels and badge text
- `upload` defines upload limits, hints, and whether uploads are required
- `inputs` defines configurable text or selection inputs and their defaults
- `model` defines visible model family choices and defaults
- `generation` maps normalized form state to request payload fields
- `result` defines how generated images and progress areas are presented
- `examples` defines the right-side fallback content before generation

This is intentionally a configuration-driven schema, not a slot-based rendering system.

## Data Flow

The tool panel should follow the same image-generation lifecycle pattern as `src/shared/blocks/generator/image.tsx`.

### Initialization

On mount, the component derives default state from configuration:

- active tab
- selected model family
- resolution
- aspect ratio
- batch count
- prompt and other input defaults
- upload rules

### Upload Flow

The component handles uploads internally:

1. user selects or drops images
2. files are validated against configured limits
3. files are uploaded through `/api/storage/upload-image`
4. uploaded URLs are normalized into a shared internal list

### Generation Flow

The component builds `/api/ai/generate` payloads using the same image-oriented structure already used by `image.tsx`:

- `mediaType: IMAGE`
- image-generation scene
- resolved provider and model
- normalized prompt
- normalized options payload

Tool-specific differences are expressed through configuration mapping, not through route-specific React logic.

### Polling Flow

After task creation, the component polls `/api/ai/query` until:

- success
- failure
- timeout

Progress, task status, completed task count, and credits refresh behavior should align with the image generator pattern.

### Result Flow

Task responses are normalized into a shared generated-image list. The right pane only consumes normalized result items and does not depend on backend-specific raw payload shape.

## Error Handling

The first version should preserve the same operational behavior expected from the image generator:

- prevent submit when prompt is invalid
- prevent submit when required uploads are missing
- prevent submit when credits are insufficient
- surface per-upload failure states
- show polling timeout errors
- keep partial successes when batch generation only partially succeeds

## Naming

Remove instance-specific names from the shared generator implementation.

Approved naming direction:

- keep the file name `tool-panel.tsx`
- export a generic component name such as `ToolPanel`
- export a generic section type such as `ToolPanelSection`

Do not retain `ProfessionalHeadshotGenerator` or `ProfessionalHeadshotGeneratorSection` in shared code.

## Migration Scope

First implementation includes:

- fold `workbench.tsx` into `tool-panel.tsx`
- rename shared instance-specific types and component exports to generic names
- align internal image processing flow to `image.tsx`
- keep the theme block entry point for `tool-panel`
- keep the current professional headshot route working through the new generic schema

First implementation excludes:

- migrating `image.tsx`, `music.tsx`, or `video.tsx`
- adding automatic discovery for every `tools/<slug>.json`
- building a cross-media generator abstraction
- adding slot-based custom rendering hooks for tools pages

## Validation

The change is considered correct when:

- the current professional headshot tool still renders through `block: "tool-panel"`
- uploads work
- generation requests succeed
- polling and progress updates work
- downloads work
- unauthenticated, insufficient-credit, upload-error, and timeout states still behave correctly
- there are no remaining runtime references to `workbench.tsx`

## Implementation Notes

The desired coding style is pragmatic, not over-engineered:

- prefer one self-contained shared business component over many micro-abstractions
- keep schema and rendering logic close to `tool-panel.tsx`
- reuse the image generator's task flow patterns rather than inventing a new runtime model
- optimize for adding more image tools through config files, not through new React components
