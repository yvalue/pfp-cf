# Yearly Pricing Design

## Context

The current system grants yearly subscription credits in a single annual allocation. This is not a monthly refresh model.

Current behavior:
- `monthly` grants credits per billing month
- `yearly` grants one annual credit allocation on initial payment and again on annual renewal
- checkout and credit grant logic read `credits` directly from `pricing.json`

The existing yearly pricing copy drifted away from backend reality by using monthly-style language such as `Credits Refill Each Month`.

## Decision

Keep the backend behavior unchanged and redesign the yearly plan around the real system model.

Approved direction:
- yearly remains an annual subscription
- yearly credits are granted once per annual term
- yearly credits should be set to `monthly * 12`
- yearly image limits should be set to `monthly * 12`
- yearly pricing display remains annual-pricing based and is not reframed as a monthly-refresh product

## Data Changes

Update the three yearly plans in `src/config/locale/messages/en/pages/pricing.json`.

### Credits

- Basic yearly: `4800`
- Pro yearly: `13200`
- Max yearly: `24000`

### Feature Copy

Use yearly wording that matches annual grant behavior.

Basic yearly:
- `4,800 Credits / Year`
- `Up to 1,200 Images / Year`
- `Unlimited Image Dimension`
- `Advanced Image Model`
- `Fast Response`
- `Priority Support`
- `Batch Image Generation`
- `No Captcha`
- `Credits Granted Annually`

Pro yearly:
- `13,200 Credits / Year`
- `Up to 3,300 Images / Year`
- `Unlimited Image Dimension`
- `Advanced Image Model`
- `Fast Response`
- `Priority Support`
- `Batch Image Generation`
- `No Captcha`
- `Credits Granted Annually`

Max yearly:
- `24,000 Credits / Year`
- `Up to 6,000 Images / Year`
- `Unlimited Image Dimension`
- `Advanced Image Model`
- `Fast Response`
- `Priority Support`
- `Batch Image Generation`
- `No Captcha`
- `Credits Granted Annually`

### Pricing Fields

Keep yearly price presentation as yearly pricing, without converting the product back into a monthly-refresh framing.

For this change:
- keep `price` as the currently approved yearly display price
- keep `original_price` as the currently approved yearly original price
- keep `amount` as the actual yearly checkout amount source

## Behavior Impact

No payment-flow or renewal-flow code changes are required.

Existing behavior remains:
- checkout reads `pricingItem.credits`
- first successful yearly payment grants the full annual credit amount once
- yearly renewal grants the full annual credit amount once
- subscription credits expire with the current subscription period

## Constraints

- Do not change monthly or one-time plans in this task
- Keep `Basic` yearly `Priority Support` visually crossed via existing `crossed_features`
- Keep pricing page component behavior unchanged unless required for the new yearly copy

## Verification

After implementation:
- yearly `credits` values in `pricing.json` match the approved annual totals
- yearly features use `/ Year` wording
- yearly feature tail copy is `Credits Granted Annually`
- monthly and one-time plans remain unchanged
- JSON remains valid
- Basic yearly still renders `Priority Support` as crossed
