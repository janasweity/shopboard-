# RAHA Debugging Log

## Bug 1: The cart emptied after a refresh

- **What I saw:** I added products to the cart, refreshed the page, and found the cart empty.
- **Type:** State bug.
- **How I found it:** I added items to the cart and refreshed the page to check whether they were saved.
- **Cause:** At the time, `src/shopboard.js` kept the cart in an in-memory `Map`. Refreshing the page recreated the map, and there was no saved cart to restore.
- **Fix:** Cart state was moved into a separate module. The app saves product IDs, variant IDs, and quantities to `localStorage` after cart changes. On startup, it restores and validates those entries before rendering the cart.
- **Verification:** I added products again, refreshed the page, and confirmed the cart stayed populated. The cart persistence tests also passed.
- **Did I use AI? For what?** Yes. Codex traced the cause and implemented the fix. I reproduced the issue and verified the result in the browser.

## Bug 2: Missing CollectionId type

- **What I saw:** TypeScript flagged `CollectionId` in `src/modules/products/products.types.ts`.
- **Type:** Compile-time type error.
- **How I found it:** I noticed the error while editing the product type definitions.
- **Cause:** `Product`, `Collection`, and `Room` referenced `CollectionId`, but the type was missing.
- **Fix:** I defined `CollectionId` as a union of the three existing collection IDs: `'nature-form'`, `'burgundy-butter'`, and `'kitchen-dining'`.
- **Verification:** I ran `npm run typecheck` and it finished without errors.
- **Did I use AI? For what?** Yes. I shared the code with ChatGPT, which identified the missing type and suggested the fix. I updated the file and ran the check.

## Breakpoint practice

- I set a breakpoint in `calculateCart` on the line that multiplies the unit price by the quantity.
- I checked the values in the debugger. The unit price was `1695` and the quantity was `1`.
- I used Step Over and confirmed that the line total was `1695`.
