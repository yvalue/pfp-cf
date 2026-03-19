# Kie Nano Banana Integration Design

## Context

The project already has:
- a homepage hero generator at `src/themes/ai-pfp/blocks/hero-generator.tsx`
- a shared image generator page at `src/shared/blocks/generator/image.tsx`
- a Kie provider at `src/extensions/ai/kie.ts`
- local Kie API references in `content/docs/kie`

Current state is inconsistent:
- the homepage hero generator uses Replicate and Fal image models
- the image generator page still exposes multiple providers
- Kie is only partially surfaced in the image generator
- `kie.ts` currently treats image payload fields too generically for the Nano Banana family

The approved goal is to make both image entry points feel like one coherent Nano Banana product experience.

## Approved Product Direction

Approved direction:
- use Kie as the only image provider exposed in the homepage hero generator
- use Kie as the only image provider exposed in the shared image generator page
- show exactly 3 model options in both places:
  - `Nano Banana`
  - `Nano Banana Pro`
  - `Nano Banana 2`
- do not expose `Nano Banana Edit` in the UI
- when the user enters image-to-image mode with `Nano Banana`, silently route the request to `google/nano-banana-edit`
- keep `Nano Banana Pro` and `Nano Banana 2` as visible model options for both text-to-image and image-to-image
- aspect ratio options must change based on the selected model

## UX Design

### Homepage Hero Generator

The homepage hero generator will:
- keep its current overall layout and generation flow
- replace the current model list with the 3 Kie model families
- keep mode switching between `text-to-image` and `image-to-image`
- keep prompt input, reference image upload, image count, progress, results, and download behavior
- keep provider hidden from the user

The user will always choose a product-facing model family, not a raw backend model id.

### Shared Image Generator Page

The shared image generator page will:
- remove the visible provider selector from the UI
- use the same 3-model family list as the homepage hero generator
- keep the `text-to-image` and `image-to-image` tabs
- keep prompt input, upload flow, progress polling, result display, and download behavior

The homepage and generator page must present the same model taxonomy and the same mode behavior.

## Model Family Mapping

The UI will store a model family id instead of a raw Kie model id.

Recommended model family mapping:

- `nano-banana`
  - label: `Nano Banana`
  - provider: `kie`
  - text-to-image model: `google/nano-banana`
  - image-to-image model: `google/nano-banana-edit`

- `nano-banana-pro`
  - label: `Nano Banana Pro`
  - provider: `kie`
  - text-to-image model: `nano-banana-pro`
  - image-to-image model: `nano-banana-pro`

- `nano-banana-2`
  - label: `Nano Banana 2`
  - provider: `kie`
  - text-to-image model: `nano-banana-2`
  - image-to-image model: `nano-banana-2`

Request submission behavior:
- resolve the selected model family into the real Kie model id right before calling `/api/ai/generate`
- for `Nano Banana`, switch between `google/nano-banana` and `google/nano-banana-edit` based on mode
- for the other two families, keep the same model id across both modes

This preserves a clean product surface while still matching Kie's actual API contracts.

## Aspect Ratio Design

Aspect ratio options must be driven by the selected model family.

Value format rules:
- frontend ratio values stay as ratio strings such as `1:1`, `9:16`, and `auto`
- no pixel-size conversion is required for this integration
- `google/nano-banana` and `google/nano-banana-edit` receive those values via `input.image_size`
- `nano-banana-pro` and `nano-banana-2` receive those values via `input.aspect_ratio`

### Nano Banana

Supported ratios:
- `1:1`
- `9:16`
- `16:9`
- `3:4`
- `4:3`
- `3:2`
- `2:3`
- `5:4`
- `4:5`
- `21:9`
- `auto`

Default ratio:
- `1:1`

### Nano Banana Pro

Supported ratios:
- `1:1`
- `2:3`
- `3:2`
- `3:4`
- `4:3`
- `4:5`
- `5:4`
- `9:16`
- `16:9`
- `21:9`
- `auto`

Default ratio:
- `1:1`

### Nano Banana 2

Supported ratios:
- `1:1`
- `1:4`
- `1:8`
- `2:3`
- `3:2`
- `3:4`
- `4:1`
- `4:3`
- `4:5`
- `5:4`
- `8:1`
- `9:16`
- `16:9`
- `21:9`
- `auto`

Default ratio:
- `auto`

Behavior rules:
- when the user changes model family, recompute the available ratio list
- if the current ratio is unsupported by the newly selected family, reset it to that family default ratio
- `Nano Banana` image-to-image keeps the same ratio list as `Nano Banana` text-to-image even though the backend model changes to `google/nano-banana-edit`

## Shared Frontend Configuration

To avoid drift between the homepage and image generator page, create a shared Nano Banana configuration source.

The shared configuration should contain:
- model family id
- display label
- provider
- text-to-image backend model
- image-to-image backend model
- supported aspect ratios
- default aspect ratio

Both frontend entry points should consume that shared configuration rather than maintaining separate hardcoded model lists.

## Homepage Section Config Compatibility

The homepage hero generator currently reads `section.aspect_ratios` from page content config.

For this integration:
- the final ratio options must be driven by the shared Nano Banana model-family configuration
- `section.aspect_ratios` is no longer the primary source of truth for selectable ratios
- the field may remain temporarily for backward compatibility, but it should not override model capability rules
- if a legacy page config still contains `section.aspect_ratios`, it should be treated as historical data rather than an active model constraint unless a future task explicitly reintroduces that behavior

This avoids a mismatch where CMS-configured ratios expose options that a selected Kie model does not actually support.

## Backend and Provider Design

No new API routes are required.

Existing routes stay unchanged:
- `/api/ai/generate`
- `/api/ai/query`

The frontend will continue to send:
- `provider`
- `model`
- `scene`
- `prompt`
- `options`

The main backend adaptation happens inside `src/extensions/ai/kie.ts`.

Responsibility split:
- frontend components send standardized image options such as `options.aspect_ratio` and `options.image_input`
- frontend components do not branch on Kie payload field names
- `kie.ts` is responsible for translating those normalized options into model-specific Kie request fields

## Kie Payload Mapping

`kie.ts` must stop treating Nano Banana image models as one uniform payload shape.

It should translate the common frontend options into model-specific Kie payloads.

### google/nano-banana

Use:
- `input.prompt`
- `input.output_format`
- `input.image_size`

Do not send:
- `input.aspect_ratio`
- `input.image_input`
- `input.image_urls`

### google/nano-banana-edit

Use:
- `input.prompt`
- `input.image_urls`
- `input.output_format`
- `input.image_size`

Do not send:
- `input.aspect_ratio`
- `input.image_input`

Frontend `options.image_input` should be translated into `input.image_urls`.

Frontend `options.aspect_ratio` should be translated into `input.image_size`.

### nano-banana-pro

Use:
- `input.prompt`
- `input.image_input` when reference images are present
- `input.aspect_ratio`
- `input.resolution` when configured
- `input.output_format`

### nano-banana-2

Use:
- `input.prompt`
- `input.image_input` when reference images are present
- `input.aspect_ratio`
- `input.google_search` when configured in the future
- `input.resolution` when configured
- `input.output_format`

## Result Parsing Consistency

The homepage hero generator and the shared image generator currently use similar but not identical image URL extraction logic.

For this integration:
- image result extraction should be unified into a shared helper or otherwise brought to the same behavior in both entry points
- the shared logic should support at least:
  - `output`
  - `images`
  - `data`
  - `resultUrls`

Although Kie image polling currently converts `resultJson.resultUrls` into `taskInfo.images`, the frontend should still use one consistent extraction strategy so that provider responses and future refactors do not cause the two entry points to drift again.

## Component-Level Changes

### `src/themes/ai-pfp/blocks/hero-generator.tsx`

Required changes:
- replace the existing hardcoded model list with the shared Nano Banana family config
- keep model selection as a family selection, not a raw backend model id
- derive real backend model id at submission time from mode
- derive available aspect ratios from the selected family
- reset invalid ratio values when switching families

The rest of the hero generator flow should remain intact unless required by the model-family abstraction.

### `src/shared/blocks/generator/image.tsx`

Required changes:
- remove visible provider selection
- replace the current mixed provider model list with the shared Nano Banana family config
- store selected family id instead of a raw backend model id
- derive the real Kie model id from the current tab before submission
- derive ratio options from the selected family
- keep credit checks, polling, upload validation, and result rendering behavior unchanged

## Error Handling

The integration should preserve current user-facing validation:
- require sign-in before generation
- require prompt before submission
- block submission while reference images are still uploading
- block image-to-image when no reference image is provided
- block submission when credits are insufficient
- preserve task timeout and polling failure handling

Additional safeguards:
- if a model family resolves to no valid backend model for the current mode, fail early with a configuration error
- if a ratio becomes invalid after model switching, auto-correct before submission
- if Kie returns no images on success, surface a clear retry message

## Testing Scope

Minimum verification after implementation:

### Homepage Hero Generator

- `Nano Banana` text-to-image sends `provider: kie` and model `google/nano-banana`
- `Nano Banana` image-to-image sends `provider: kie` and model `google/nano-banana-edit`
- `Nano Banana Pro` sends `nano-banana-pro`
- `Nano Banana 2` sends `nano-banana-2`
- aspect ratio list changes when model family changes
- invalid ratio selection is reset when switching to a model family with a narrower ratio set

### Shared Image Generator Page

- provider selector is no longer shown
- only the 3 approved model families are shown
- `Nano Banana Edit` never appears in the UI
- model-family switching works in both tabs
- polling and result rendering still work

### Provider Layer

- `google/nano-banana` payload uses `image_size`
- `google/nano-banana-edit` payload uses `image_urls` and `image_size`
- `nano-banana-pro` payload uses `image_input` and `aspect_ratio`
- `nano-banana-2` payload uses `image_input` and `aspect_ratio`

## Non-Goals

This design does not include:
- changing credit pricing or credit costs
- changing `/api/ai/generate` or `/api/ai/query` route contracts
- exposing advanced Kie-only fields such as `google_search`, `resolution`, or `output_format` in the UI beyond current needs
- changing non-image generators

## Implementation Notes

Keep this change scoped to:
- shared Nano Banana model-family configuration
- homepage hero generator
- shared image generator page
- Kie provider payload translation

Do not expand the work into unrelated model cleanup unless it directly blocks this integration.
