# Pricing Free Card Design

## Goal

Add a second-row `Free` card below the paid pricing cards.

The card must:

- use the same UI structure as the first-row pricing cards
- stay centered on desktop as a single card below the `Basic / Pro / Max` row
- follow the top pricing switcher (`yearly`, `monthly`, `one-time`)
- change only in the price area when the switcher changes
- remain outside checkout, subscription, and featured-plan logic

## Approved Layout

The pricing section keeps the current first row exactly as it is today:

- first row: the three paid cards for the active pricing group
- second row: one centered `Free` card

The `Free` card should look like it belongs to the same card system:

- same width as a paid card on desktop
- same radius, padding, border, shadow, divider, button sizing, and feature list spacing
- same single-column mobile stacking behavior as the paid cards

This is intentionally not a simplified info block. It is a full pricing card with the same visual hierarchy as the paid cards.

## Data Mapping

Use the existing `section.free_cards` map keyed by pricing group:

- `free_cards.yearly`
- `free_cards.monthly`
- `free_cards["one-time"]`

To match the approved behavior that only the price area changes with the switcher, split the free-card data into two parts at render time:

- static content: `title`, `description`, `features_title`, `features`, `button`
- dynamic price content: `price`, `original_price`, `unit`

Recommended mapping:

- use one canonical free-card content source for the static content
- use the active group entry for the price content

Practical implementation rule:

- `activeFreeCard = section.free_cards?.[group]`
- `baseFreeCard = activeFreeCard ?? section.free_cards?.yearly ?? section.free_cards?.monthly ?? section.free_cards?.["one-time"]`
- render text and features from `baseFreeCard`
- render `price`, `original_price`, and `unit` from `activeFreeCard ?? baseFreeCard`

This keeps the card stable while still allowing `Year / Monthly / One-Time` to update the pricing line.

## Rendering Rules

Keep the current paid-card grid unchanged.

Render a second block under the paid grid:

- only render when a usable free-card source exists
- center the card horizontally
- match the paid-card structure exactly
- keep the CTA visually consistent with the non-featured paid cards

The free card does not:

- join `visibleItems`
- participate in checkout
- react to `currentSubscription`
- use featured-card highlighting
- use multi-currency switching

## Edge Cases

- if `section.free_cards` is missing, do not render the second-row card
- if `activeFreeCard` is missing for the selected group, fall back to `baseFreeCard`
- if `original_price` is empty, hide the struck-through price
- if `unit` is empty, show only the main price
- if `features` is empty, keep the card shell and omit the list

## Acceptance Criteria

- desktop layout renders as `3 + 1`: paid row first, centered `Free` card second
- mobile layout stacks naturally without width or spacing regressions
- switching `Year / Monthly / One-Time` updates the free-card price line
- the `Free` card matches the paid-card UI system
- the `Free` card stays out of payment and subscription logic

## Validation

- run `pnpm exec tsc --noEmit`
- visually verify desktop and mobile layouts
