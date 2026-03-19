# ShipAny Homepage Recipes

## Reorder Homepage Sections

- Edit `src/config/locale/messages/<locale>/pages/index.json`.
- Move the section keys inside `page.sections`.
- If `show_sections` is present, keep it aligned with the intended visible order.

## Hide Or Show A Section

- Preferred: update `page.show_sections`.
- Alternative: set `section.disabled` to `true`.
- Use `show_sections` for page-level curation and `disabled` for section-local suppression.

## Replace A Section With Another Existing Block

- Edit the target section in `pages/index.json`.
- Set `block` to the target block file name, for example `features-list` or `hero-generator`.
- Keep only fields the new block expects and remove stale fields that no longer apply.

## Add A New Homepage Section Using An Existing Block

- Add a new key under `page.sections`.
- Set `id`.
- Set `block` if the block name differs from the key.
- Provide the fields that block expects.
- Add the new key to `show_sections` if the page uses it.
- Mirror the change across locales.

## Add A New Block Type

- Create `src/themes/<active-theme>/blocks/<block-name>.tsx`.
- Export a component whose name matches the PascalCase file convention, for example `features-guide.tsx` -> `FeaturesGuide`.
- Accept `section` props using the shared `Section` type unless a stricter type is required.
- Then point JSON `block` at `<block-name>`.

## Change Header Or Footer

- Edit `src/config/locale/messages/<locale>/landing.json`.
- Header nav, buttons, brand, locale toggle, and theme toggle are configured there.
- Footer links, social items, agreements, and copyright are configured there.

## Decide Whether To Edit JSON Or React

- Edit JSON when the user wants copy, order, visibility, links, images, icons, button labels, or block selection changes.
- Edit React when the user wants new markup, new behavior, spacing rules, responsive layout changes, or new supported fields.

## Safe Checklist

- Confirm the block file exists.
- Confirm export name matches the block file name convention.
- Keep `en` and `zh` in sync unless told otherwise.
- Keep JSON valid.
- If wiring changed, run validation.
