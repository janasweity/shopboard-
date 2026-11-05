# RAHA Project Rules

## Stack and scope

- Use the existing Vite project with HTML, CSS, and strict TypeScript.
- Do not introduce a framework or replace the project.
- Preserve RAHA’s design, branding, images, animations, pages, and cart unless a change is requested.
- Keep all website text in English.
- Preserve user work and unrelated files.

## Assignment requirements

- Keep a header with working navigation and a main containing the Home hero, products, and registration sections.
- Show six featured product cards on Home using article elements.
- Keep one Products page for the full catalogue, with category filtering instead of separate category pages.
- Render product cards from the TypeScript catalogue data using `map` and `join`. Keep product cards out of `index.html`.
- Use semantic HTML and one rendered h1 per page.
- Keep headings in a logical order.
- Give informative images descriptive alt text and decorative images empty alt text.
- Set the page language to English.

## Registration form

- Explicitly link every label to its input.
- Email must use type="email" and required.
- Password must use type="password", required, and minlength="8".
- Use a real submit button and native HTML validation.
- Keep registration as a demo: do not create accounts, transmit registration data, or store passwords.
- Explain that successful validation does not create a real account.

## Search, filter, and sort

- Provide a search input, a category select, and a price-sort select.
- Search product names without case sensitivity.
- Use the input event for search and change events for both selects.
- Search, category filtering, and price sorting must work together.
- Filter first, then sort a copy without changing the original product array.
- Use one shared rendering function for the catalogue product grid.
- Show a helpful message when no products match.

## Cart

- Use event delegation for product and cart actions.
- Adding the same product and color again increases its quantity.
- Keep different color variants as separate cart items.
- Display the selected color, quantity, total item count, and total price.
- Save cart changes in localStorage using JSON.stringify.
- Restore the cart using JSON.parse before its first render.
- Do not overwrite saved cart data with an empty cart during startup.
- Handle invalid or outdated saved data safely.

## Styling and accessibility

- Keep design tokens in src/styles/tokens.css and active styles in src/styles/main.css.
- Preserve RAHA’s coordinated color palette and typography.
- Use mobile-first CSS with min-width layout media queries at 768px and 1280px.
- Do not use max-width layout media queries or !important.
- Use Flexbox and Grid where appropriate.
- Preserve keyboard navigation and visible focus states.
- Respect prefers-reduced-motion.
- Prevent horizontal page overflow at 360px, 768px, and 1280px.
- Maintain accessible contrast for text and controls.

## Architecture

- Keep catalogue data in `src/data/` and export it through `src/data.ts`.
- Put product search, filtering, sorting, and product types in `src/modules/products/`.
- Put cart types, validation, and totals in `src/modules/cart/`. Keep cart state and browser storage in `src/state.ts`.
- Put room area calculations in `src/modules/rooms/`.
- Keep page templates in `src/pages.ts` and typed DOM helpers in `src/shared/ui/dom.ts`. Keep `src/ui.ts` as a small coordinator that initializes feature UI modules once.
- Put DOM rendering and event handlers beside their feature in `src/modules/`: products and galleries in `products/`, cart in `cart/`, registration/contact forms in `forms/`, room interactions in `rooms/`, routing in `navigation/`, and entrance/slider interactions in `interactions/`.
- Register delegated handlers once on stable roots. Use explicit route lifecycle hooks for cleanup, reject stale async catalogue results after navigation, and cancel pending navigation focus callbacks. Avoid circular imports.
- Use `src/main.ts` to load styles and connect the application modules.
- Add new logic to the module that owns the feature. For example, add a new product filter in `src/modules/products/products.logic.ts` and connect its control in `src/modules/products/products.ui.ts`.
- Keep calculations separate from DOM access and browser storage.

## Verification

- Run npm run lint, npm run format:check, and npm run build.
- On PowerShell, use npm.cmd instead of npm if required.
- Run existing tests relevant to each change.
- Run the broader test suite when shared behavior changes.
- Recheck combined search, filtering, sorting, and cart persistence after refactoring.
- Verify changed images and links.
- Do not claim a Lighthouse score without running Lighthouse.
- Fix relevant errors without disabling checks to make them pass.
- Explain every change and keep edits within the requested scope.
- Do not commit or push unless requested.

## Rules learned from a mistakes

- ## Rules learned from mistakes

- Refresh the page after changing the cart. Check that the same products, finishes, and quantities are still there.
- Test every cart action before calling the feature done. Clear Cart should remove all items and reset the count and total to zero.
- Review the room photos across all pages before adding new ones. Use a different room photo for each section so the site does not feel repetitive.