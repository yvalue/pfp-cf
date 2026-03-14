# Nano Banana Quality Credit Design

## Context

The project already has:
- a homepage hero generator at `src/themes/ai-pfp/blocks/hero-generator.tsx`
- a shared image generator page at `src/shared/blocks/generator/image.tsx`
- shared Nano Banana model-family config at `src/shared/lib/ai-image.ts`
- Kie image payload adaptation at `src/extensions/ai/kie.ts`
- image generation credit charging at `src/app/api/ai/generate/route.ts`

Current behavior is incomplete for the approved pricing model:
- the homepage hero generator does not expose image quality selection
- the shared image generator does not expose image quality selection
- image generation cost is still hardcoded by scene only
- homepage FAQ and pricing FAQ do not explain the approved Nano Banana quality-credit mapping

The approved goal is to expose `1K / 2K / 4K` quality where supported, charge the exact approved credits, and explain the mapping in FAQ.

## Approved Product Direction

Approved direction:
- add image quality selection to both the homepage hero generator and the shared image generator page
- keep the 3 visible model families:
  - `Nano Banana`
  - `Nano Banana 2`
  - `Nano Banana Pro`
- use one shared source of truth for model quality support and credit costs
- show user-facing quality wording as `1K / 2K / 4K 画质`
- add one dedicated FAQ item on the homepage FAQ
- add one dedicated FAQ item on the pricing page FAQ

Approved credit mapping:
- `Nano Banana`: fixed `4` credits
- `Nano Banana 2`
  - `1K`: `5` credits
  - `2K`: `10` credits
  - `4K`: `15` credits
- `Nano Banana Pro`
  - `1K`: `10` credits
  - `2K`: `15` credits
  - `4K`: `20` credits

## Capability Constraints

Kie support is not uniform across the Nano Banana family.

Current local API references indicate:
- `google/nano-banana` uses `input.image_size` and does not support a `resolution` field
- `nano-banana-pro` supports `input.resolution`
- the existing provider adapter already forwards `options.resolution` for non-Google Nano Banana models

Because of that, the UI must not pretend that `Nano Banana` supports selectable `2K` or `4K` output.

Approved constraint handling:
- keep the quality control visible in both image entry points
- for `Nano Banana`, expose only the real default quality option
- present `Nano Banana` as a fixed-cost model with `4` credits
- only pass `options.resolution` for models that actually support it

This keeps product copy aligned with backend capability.

## Shared Configuration Design

Extend `src/shared/lib/ai-image.ts` so it becomes the shared rule source for:
- visible model family label
- backend model mapping per generation mode
- supported aspect ratios
- default aspect ratio
- supported quality options
- default quality
- credit cost by quality

Recommended additions to each model family:
- `supportedResolutions`
- `defaultResolution`
- `creditCostByResolution`

Recommended behavior helpers:
- resolve the backend model from `familyId + mode`
- resolve the effective quality from `familyId + requestedResolution`
- resolve the credit cost from `familyId + quality`
- resolve a complete generation selection object for frontend and backend consumers

This keeps homepage UI, generator UI, and server-side charging aligned without duplicating mapping logic.

## Frontend UX Design

### Homepage Hero Generator

The homepage hero generator will:
- keep the current hero-first visual layout
- keep the current model selector, mode switch, aspect-ratio selector, count selector, upload flow, generation flow, and results flow
- add a quality selector near the existing generation controls
- update the displayed total cost whenever model, quality, mode, or count changes

Quality behavior:
- `Nano Banana` shows only its supported default quality option
- `Nano Banana 2` shows `1K`, `2K`, `4K`
- `Nano Banana Pro` shows `1K`, `2K`, `4K`
- when the user switches to a model that does not support the currently selected quality, reset quality to that model's default

The hero generator should continue to show a truthful total:
- `cost per image * image count`

### Shared Image Generator Page

The shared image generator page will:
- keep the current tabs, prompt flow, reference image flow, progress flow, and result flow
- add the same quality selector used by the homepage hero generator
- update the displayed cost instantly when model or quality changes
- continue to use the same 3 visible model families as the hero generator

The homepage and image generator page must expose the same model-quality taxonomy.

## Submission Data Flow

For both image entry points:
1. user selects model family
2. user selects supported quality
3. frontend resolves current cost from shared config
4. frontend submits:
   - `provider`
   - `model`
   - `scene`
   - `prompt`
   - `options.aspect_ratio`
   - `options.image_input` when needed
   - `options.resolution` only when supported by the selected model family
5. backend re-resolves the same family-quality mapping before charging

The backend must remain the source of truth for actual charging even though the UI precomputes the display cost.

## Backend Charging Design

Update `src/app/api/ai/generate/route.ts` so image charging is no longer based only on scene.

For image generation:
- resolve the selected Nano Banana family from the submitted model id
- read the requested quality from `options.resolution`
- normalize unsupported or missing quality to the family default
- compute `costCredits` from the shared Nano Banana quality-credit mapping

Non-image media types remain unchanged:
- video charging remains scene-based
- music charging remains fixed

This ensures:
- displayed frontend cost matches persisted `costCredits`
- AI task history reflects the real charged amount
- future pricing updates can be made in one shared rule source

## Kie Provider Design

`src/extensions/ai/kie.ts` keeps responsibility for translating normalized frontend options into Kie-specific request payloads.

Rules:
- `google/nano-banana` and `google/nano-banana-edit`
  - continue using `image_size`
  - do not send `resolution`
- `nano-banana-pro` and `nano-banana-2`
  - continue using `aspect_ratio`
  - send `resolution` from normalized frontend options

This keeps provider adaptation separated from product pricing rules.

## FAQ Design

Add one dedicated FAQ item to each of:
- `src/config/locale/messages/en/pages/index.json`
- `src/config/locale/messages/zh/pages/index.json`
- `src/config/locale/messages/en/pages/pricing.json`
- `src/config/locale/messages/zh/pages/pricing.json`

FAQ content requirements:
- explain the full model-quality credit mapping in one answer
- use user-facing wording `1K / 2K / 4K 画质`
- describe `Nano Banana` as fixed `4` credits
- describe `Nano Banana 2` and `Nano Banana Pro` by quality tier

Formatting constraint:
- current FAQ blocks render plain text answers
- avoid HTML tables or structured markup dependencies
- write the answer as readable multiline or sentence-based text that still works as plain text

## Error Handling

Frontend:
- if a user switches to an unsupported quality, reset to the selected model default
- if model config cannot be resolved, fall back to the first configured model family

Backend:
- if submitted image quality is unsupported for the resolved family, use the family default before charging
- if model resolution support is absent, do not pass `resolution` to the provider

These fallbacks protect against stale UI state or crafted requests.

## Verification

After implementation:
- homepage hero generator shows a quality selector
- shared image generator shows a quality selector
- `Nano Banana` only exposes its supported default quality option
- `Nano Banana 2` and `Nano Banana Pro` expose `1K`, `2K`, `4K`
- displayed credits update correctly when model, quality, mode, or count changes
- backend `costCredits` matches the approved mapping
- `google/nano-banana` requests do not include `resolution`
- `nano-banana-2` and `nano-banana-pro` requests include `resolution`
- homepage FAQ contains the new dedicated credit-mapping item
- pricing FAQ contains the new dedicated credit-mapping item

## Out of Scope

This design does not include:
- changing subscription pricing plans
- changing free-credit amounts
- adding table rendering support to FAQ blocks
- changing non-image generators
