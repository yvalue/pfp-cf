# FAQ And Pricing Highlight Design

## Goal

Add a shared text-highlighting rule for FAQ and Pricing blocks only.

The rule should:

- render email addresses with green highlight styling
- render numeric fragments with green highlight styling
- avoid affecting any other page blocks or generic text components

## Scope

Apply the shared renderer only in these block types:

- FAQ answers
- Pricing feature lists

Do not apply the rule to:

- pricing titles
- pricing prices
- generic rich text or paragraph components
- other landing page sections

## Implementation

Create one shared React renderer in `src/shared/components/text-highlight.tsx`.

The renderer should:

- accept plain text
- detect email addresses
- detect numeric fragments such as `400`, `1,100`, `12`, and `3 calendar days`
- wrap matched fragments in styled spans
- render email addresses as `mailto:` links

## Integration

Use the shared renderer in:

- `src/themes/ai-pfp/blocks/faq.tsx`
- `src/themes/default/blocks/faq.tsx`
- `src/themes/ai-pfp/blocks/pricing.tsx`
- `src/themes/default/blocks/pricing.tsx`

FAQ should highlight only the answer text.

Pricing should highlight only the feature line text.

## Styling

Use existing Tailwind tokens and keep the treatment simple:

- green text
- slightly stronger weight

The styling should feel like emphasis, not like a badge or pill.

## Risks

- overly broad number matching could highlight unrelated punctuation
- email matching should remain safe for plain-text content
- wrapping text in multiple spans must not break the current list layout

## Validation

Confirm that:

- `support@ai-pfp.com` renders green in FAQ answers
- feature numbers such as `400 Credits`, `Up to 100 Images`, and `12 Months` render green for the numeric fragments
- non-FAQ and non-Pricing content remains unchanged
