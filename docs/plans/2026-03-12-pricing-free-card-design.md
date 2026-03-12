# Pricing Free Card Design

## Goal

Add a second-row, centered `Free` card to the English pricing page.

The card must:

- stay visible under the paid pricing cards
- change with the active pricing tab (`yearly`, `monthly`, `one-time`)
- remain outside checkout and subscription logic
- show a disabled CTA for presentation only

## Chosen Approach

Use a dedicated `free_cards` map in the pricing section locale data.

Reasons:

- keeps free-card content out of paid `items`
- allows tab-specific content without special-casing pricing items
- keeps copy in locale JSON instead of hardcoding UI text in the component
- avoids accidental interaction with payment flow

## Data Shape

Add an optional `free_cards` field to the pricing block type:

- key: pricing group name such as `yearly`, `monthly`, `one-time`
- value: a lightweight free-card config object with presentation fields only

Fields:

- `title`
- `description`
- `price`
- `original_price`
- `unit`
- `features_title`
- `features`
- `button`

## Rendering

Keep the current paid-card grid unchanged.

Render a second section below it:

- read `section.free_cards?.[group]`
- if present, show one centered card
- style it with the same pricing-card visual language but lower emphasis
- keep the button disabled

The free card does not:

- participate in `visibleItems`
- enter checkout
- react to current subscription state
- use currency switching

## Compatibility

- `free_cards` is optional
- locales without `free_cards` continue rendering only paid cards
- this change only adds English content for now

## Validation

- `pnpm.cmd exec prettier --check ...`
- `pnpm.cmd exec tsc --noEmit --pretty false`
