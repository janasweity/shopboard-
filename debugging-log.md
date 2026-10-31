# Cart persistence investigation

## Actual cause

The cart was a module-local `new Map()` in `src/shopboard.js`. Add and quantity handlers changed that Map, and `renderCart()` read it, calculated totals, and built the DOM. There was no localStorage read or write and no initial cart render. Internal History API navigation retained the module instance, but refreshing recreated an empty Map and the HTML's zero count and total. This was lost in-memory state, not a color-key collision or JSON parsing failure. The existing cart regression explicitly expected an empty cart after refresh, and the cart note and README described that behavior.

## Investigation

- Read AGENTS.md and traced cart initialization, add, increase, decrease, remove, rendering, and internal navigation in `src/shopboard.js`.
- Confirmed that existing keys already combined product and variant IDs, so those identities needed preserving.
- Checked catalogue variant availability/prices, the cart dialog markup, and existing Playwright coverage. No state.js, logic.js, or ui.js modules existed.
- The first full-suite run exposed two additional obsolete assumptions: finish-selection tests expected reload to discard the original item, and a kitchen-product loop expected full navigation to isolate each product's cart. Updated the former to retain its original item and the latter to remove its items explicitly between iterations, then restarted the suite.

## Fix

- `src/state.js` owns the cart and the `raha-cart` localStorage key. It restores with JSON.parse during module initialization, before the first render. Startup does not write to storage. Every add, remove, quantity change, and explicit clear saves with JSON.stringify. Only product ID, variant ID, and quantity are stored; form details are never included.
- `src/logic.js` validates restored records against the current catalogue and calculates item totals, total quantity, and subtotal. Unknown products, missing or unavailable variants, and invalid quantities are ignored. Duplicate valid records merge by product/variant key. Saved prices are ignored.
- Malformed JSON or an invalid top-level value yields an empty cart safely. Storage failures leave the in-memory cart usable. Subsequent successful mutations save only validated records.
- `src/ui.js` contains the existing cart renderer, preserving markup, controls, image alternatives, and styling. `src/shopboard.js` delegates mutations and rendering to the modules and renders the restored cart once at startup. There is no second cart implementation.
- Updated the cart note and README to describe persistence and updated the old refresh assertion. Added focused persistence coverage, including clearing through the state API; no new cart controls or design changes were introduced.

## Verification

- `npm.cmd run lint`: passed.
- `npm.cmd run format:check`: passed.
- `npm.cmd run build`: passed.
- `npm.cmd test -- tests/cart-persistence.spec.js`: 3 passed. Covered two adds of the same finish, another product, separate colors, refresh and internal/full page navigation, count/subtotal, increase/decrease/removal/clear, malformed JSON, invalid records, duplicate records, current catalogue prices, no startup overwrite, and blocked storage.
- `npm.cmd test`: 249 passed (4.4 minutes), including all shared cart behavior, catalogue/variant checks, registration privacy, keyboard navigation, and page layout/accessibility checks at 360px, 768px, and 1280px. Lint, formatting, and build also passed again after updating the obsolete test expectations.

The preview server is started separately for tests because the previous session exposed a Windows Playwright-managed server shutdown stall. Test commands reuse it so their results can exit normally.

## Breakpoint practice

- وضعت نقطة توقف داخل calculateCart على سطر حساب سعر المنتج × الكمية.
- راقبت السعر وكان 1695، والكمية كانت 1.
- نفّذت السطر باستخدام Step over، وكانت النتيجة 1695.
- هذه تجربة لفهم التنفيذ، وليست خطأ في الحساب.
