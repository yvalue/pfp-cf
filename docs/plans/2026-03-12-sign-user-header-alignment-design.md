# Sign User Header Alignment Design

## Context

The desktop header in `src/themes/ai-pfp/blocks/header.tsx` is designed to fit within a fixed `72px` vertical budget.

The right-side auth control is rendered by `src/shared/blocks/sign/sign-user.tsx`.

Today the auth control uses different heights by state:

- Logged out: `Button` with `size="sm"` => `h-8` (`32px`)
- Logged in: avatar trigger button with `h-10 w-10` (`40px`)

That means the desktop header fits exactly when logged out but exceeds its height budget when the logged-in avatar appears after refresh. The result is a persistent vertical misalignment where the centered nav appears shifted downward.

## Goal

- Keep the current desktop header height unchanged.
- Eliminate the persistent nav vertical shift after the logged-in avatar appears.
- Keep login and user dropdown behavior unchanged.
- Minimize change scope.

## Constraints

- Do not change the desktop header height in `src/themes/ai-pfp/blocks/header.tsx`.
- Do not change the header grid layout.
- Do not change session, auth fallback, or dropdown menu logic.
- Keep the fix localized to `src/shared/blocks/sign/sign-user.tsx`.

## Root Cause

The problem is not the nav component itself. It is the mismatch between logged-out and logged-in auth control heights.

Desktop header budget:

- Header shell height: `72px`
- Desktop row padding: `20px` top + `20px` bottom

Logged-out state:

- Auth control height: `32px`
- Total used height: `20 + 32 + 20 = 72`

Logged-in state:

- Auth control height: `40px`
- Total used height: `20 + 40 + 20 = 80`

This overflow changes the row's vertical balance and makes the centered nav appear lower once the avatar finishes loading.

## Options Considered

### Option 1: Normalize Auth Control Height

Change the logged-in avatar trigger to the same `32px` height system as the logged-out button.

Pros:

- Smallest possible fix.
- Preserves header height.
- Directly addresses the root cause.
- No layout changes outside the auth control.

Cons:

- The avatar trigger becomes visually smaller than it is today.

### Option 2: Reduce Desktop Header Padding

Keep the `40px` avatar and reduce desktop header vertical padding to stay inside `72px`.

Pros:

- Keeps the larger avatar.

Cons:

- Changes the entire desktop header rhythm.
- Affects logged-out layout too.
- Larger blast radius than needed.

### Option 3: Refactor Header to Explicit Fixed Internal Height

Rebuild the desktop header row to use explicit internal height constraints instead of padding.

Pros:

- More structurally rigid.

Cons:

- Over-engineered for this bug.
- Much larger change surface.

## Recommended Design

Use Option 1.

Normalize the logged-in avatar trigger height to the same `32px` system used by the logged-out button.

## Architecture

Only `src/shared/blocks/sign/sign-user.tsx` changes.

The auth component remains responsible for switching among:

- loading state
- logged-in avatar trigger
- logged-out sign-in button

The header component continues to treat `SignUser` as a black-box control in the right-side action area.

## Component Changes

In the logged-in branch of `SignUser`:

- Change the avatar trigger button from `h-10 w-10` to a `32px` square size such as `size-8`.
- Keep `variant="ghost"`, `rounded-full`, and `p-0`.
- Keep `DropdownMenuTrigger asChild`.

For the avatar itself:

- Keep current avatar behavior.
- Prefer ensuring the avatar fills the trigger size so future default size changes do not reintroduce mismatch.

## Data Flow

No data flow changes.

The component still:

- reads session state from `useSession()`
- merges it with app context user state
- shows the avatar dropdown only when a user is available

This fix is visual and structural only.

## Error Handling

No new error paths are introduced.

Existing auth fallback behavior, loading state behavior, and sign-out flow remain unchanged.

## Verification Criteria

- Refreshing while logged in no longer causes the centered nav to remain vertically shifted.
- Logged-out and logged-in desktop auth controls use the same height budget.
- Desktop header overall height remains unchanged.
- Avatar dropdown still opens and functions correctly.
- Logged-out sign-in flow remains unchanged.

## Testing

Manual verification should cover:

- desktop refresh while logged in
- desktop refresh while logged out
- switching from logged out to logged in
- avatar dropdown open/close behavior
- dark mode header rendering

Targeted code validation after implementation:

- TypeScript check
- formatting check

## Out of Scope

- Changing avatar artwork or visual style beyond size normalization
- Changing desktop header spacing
- Changing mobile or tablet auth behavior
- Refactoring shared `Avatar` or `Button` primitives
