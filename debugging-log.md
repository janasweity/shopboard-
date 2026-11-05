# RAHA Debugging Log

## Bug 1: Cart items disappeared after refreshing

- **What I saw:** I added products to the cart, but after refreshing or reopening the page, the products disappeared. I had to add them again.
- **Type:** State bug.
- **How I found it:** I added products, refreshed the page, and checked the cart again.
- **Cause:** The cart was kept in page memory and was not saved between page loads.
- **Fix:** The cart was saved to localStorage and restored when the page opened.
- **Verification:** I refreshed and reopened the page, and the products stayed in the cart.
- **Did I use AI? For what?** Yes. I described the problem to Codex. It found the cause and added persistence, and I tested the result.

## Bug 2: Missing CollectionId type

- **What I saw:** An error appeared on `CollectionId` while I was editing `src/modules/products/products.types.ts`.
- **Type:** TypeScript compile-time error.
- **How I found it:** I noticed the error in VS Code and shared the code with ChatGPT.
- **Cause:** The code used `CollectionId`, but its type definition was missing.
- **Fix:** I added the `CollectionId` type with the three allowed collection IDs.
- **Verification:** I ran `npm run typecheck`, and it passed.
- **Did I use AI? For what?** Yes. ChatGPT explained the missing definition and helped me add it. I ran the check myself.

## Breakpoint practice

- I set a breakpoint in `calculateCart` on the line that multiplies the unit price by the quantity.
- I checked the values in the debugger. The unit price was `1695` and the quantity was `1`.
- I used Step Over and confirmed that the line total was `1695`.
