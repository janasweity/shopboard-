# RAHA

A responsive furniture storefront with the RAHA ten-shade warm neutral palette, serif headings, and natural product photography built in the existing Vite project using HTML, CSS, and vanilla JavaScript. No framework or backend was added. All website content is English.

The current catalogue contains **60 distinct products**: all 40 existing designs plus 20 new designs, four per category. Every product has at least four available photographed finishes. There are 241 product/finish images, including the existing out-of-stock FERN cream finish. New assets are in `public/images/expansion/`; prompts and photo review records are in `scripts/`. See [the catalogue expansion notes](docs/catalogue-expansion.md).

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
npm test
```

Use `npm.cmd` in Windows PowerShell if script execution policy blocks `npm.ps1`. Browser tests use installed Google Chrome.

## Formatting and linting

Install development dependencies with `npm install` (or `npm ci` for the locked versions). The `prepare` script runs Husky and sets this checkout's Git hooks path to `.husky/_`. Run `npm run prepare` if hooks need to be enabled again. Development dependencies must be installed for the hooks to work.

```sh
npm run lint
npm run format
npm run format:check
```

`lint` checks JavaScript and fails on errors or warnings. `format` rewrites supported files; `format:check` checks formatting without modifying files.

- `eslint.config.js` uses ESLint's flat configuration and recommended JavaScript rules. Source files have browser globals; configuration files have Node globals. Playwright tests have both because their callbacks also execute in the browser. `eslint-config-prettier` disables conflicting formatting rules.
- `.prettierrc.json` preserves the existing no-semicolon, single-quote JavaScript style, uses trailing commas and LF line endings, and leaves embedded template languages alone to preserve rendered HTML strings.
- `.prettierignore` excludes generated folders, Husky's generated internals, the npm-managed lockfile, project instruction files, and existing prompt documents. ESLint also ignores generated folders.
- `lint-staged.config.js` formats staged JavaScript first, then runs ESLint. Other staged files are formatted when Prettier supports them; binary assets are skipped. Tasks run sequentially, and lint-staged updates the staged versions automatically.
- `.husky/pre-commit` runs lint-staged before each normal commit. A formatting or lint failure returns a nonzero status and blocks the commit. Like other local Git hooks, it can be bypassed explicitly; it is not a replacement for CI.
- `package.json` contains the development dependencies and scripts; `package-lock.json` records their resolved versions.

Stage and commit normally with `git add` and `git commit`. Review changes with `git diff` and `git diff --cached`. No manual formatting command is required before a commit, but the commands above let you check the whole project at any time.

The hook was verified in a disposable nested repository by running `git hook run pre-commit`: a poorly formatted staged JavaScript file was corrected in the index, and an undefined identifier caused ESLint and the hook to exit with code 1. No commit was created, and the temporary repository was removed.

## Pages and URLs

- `/`: Home with one living-room hero, six varied featured product articles, the room inspiration slider, local registration demo, and footer.
- `/?page=products`: sixty products with combined case-insensitive name search, category selection, price ordering, result counts, empty state, and reset controls. URL parameters retain selections.
- `/?page=product&id=arc-sofa`: product details. All sixty product cards link to their correct detail page, with price, description, dimensions, materials, care, add-to-cart, and an accessible image gallery.
- `/?page=inspiration`: eight distinct room editorial sections across the cream-and-olive and burgundy-and-cream palettes plus the interactive Shop the Room and room-area planner.
- `/?page=about`: store information, returns explanation, and accessible contact demo.

The project remains a single Vite entry point. Vanilla JavaScript renders the appropriate page for each URL, uses the History API for internal navigation, and supports Back/Forward, direct opening, refresh, and opening links in another tab. Home links are present in shared navigation, logo, and footer. Route changes update the page title, current navigation, and keyboard focus.

## Source files

- `index.html`: shared semantic shell, slim header, navigation, main view, registration demo, cart dialog, and footer.
- `src/pages.js`: page HTML templates and reusable product card markup.
- `src/data/catalog.js`: combines preserved records from `retained-products.js` and `curated-products.js` with twenty designs from `expanded-products.js` and reviewed finishes from `additional-variants.js`; also defines category labels, collection metadata, room records and legacy routes.
- `src/main.js`: application entry point; imports styles and connects data, pure calculations, state operations, and UI initialization.
- `src/data.js`: public catalogue exports; individual product, collection, and imagery records remain under `src/data/`.
- `src/logic.js`: pure combined product search/category filtering/price sorting, cart validation/totals, and room-area calculations; no DOM or storage access.
- `src/state.js`: cart state, localStorage restoration and saving, and the intro's sessionStorage flag; no DOM access.
- `src/ui.js`: all application DOM access and event listeners, including routes, gallery/variant controls, cart rendering, room planner, local forms, manual room slider, shop-the-room panel, and the optional 3.75-second intro with its skip/cleanup behavior.
- `src/product-gallery.js`: pure gallery selection; `src/pages.js` retains pure HTML templates without accessing the DOM.
- `src/styles/tokens.css`: design colors, spacing, and typography tokens.
- `src/styles/main.css`: responsive shared/page styling. Products use Grid; navigation uses Flexbox. Product columns: one at 360px, two from 768px, three from 1280px. Includes visible keyboard focus and reduced-motion support; uses min-width media queries.
- `public/images/collection/`: local product and interior photography. Below-the-fold images lazy-load; hero/main product images load eagerly.
- `docs/nature-form-collection.md`: study of every reference vignette and exact prompts for the twelve product photos and three room photographs.
- `tests/shopboard.spec.js`: browser checks covering all five page types at all required widths, image decoding, axe, all product links/galleries, search/history, cart navigation/quantities/removal, native registration/contact constraints, keyboard focus, and room planning.

## Local-only behavior

The cart stores product IDs, variant IDs, and quantities in localStorage (`raha-cart`) and restores them before its first render. Prices come from the current catalogue. `src/state.js` owns cart state and storage, `src/logic.js` validates entries and calculates totals, and `src/ui.js` renders the cart. Invalid or unavailable items are ignored; blocked storage falls back to an in-memory cart. No checkout, payments, or backend is implemented.

The entrance uses a single `sessionStorage` flag, `raha-entrance-seen`, so it does not replay during navigation or refresh in the same tab session. No user details are stored. If storage is unavailable, the animation is skipped. Reduced-motion users see content immediately; changing that preference during the sequence cancels it. The overlay is created only by JavaScript and has a keyboard-focused Skip intro button. Enter, Escape, or focusing the underlying page dismisses it immediately. The page renders normally underneath; the intro never waits for images or an artificial loading state. Its CSS curtain slides fully offscreen even if cleanup fails, and no hidden base styles are applied to page content.

`tests/entrance.spec.js` checks the 3–4 second timing, session replay prevention, keyboard skip, replay URL, reduced motion, blocked storage, image failures, responsive sizing, and the no-JavaScript fallback. The general storefront checks use an already-introduced session.

Registration remains available on Home. Native HTML validates required email/password fields and the eight-character password minimum. `method="dialog"` closes the demo without sending data; fields are reset on close and navigation. Credentials are never stored.

The contact form uses native HTML validation and clearly states it is a demo. Valid submission is handled locally, clears the fields, and reports that no message was sent. No input is saved or sent to a service.

All product names, prices, and specifications are illustrative. Product galleries show additional angles, material details, and lifestyle photographs generated from the exact original-finish product image. Alternate finishes show only their matching product photograph, with a link to the original-finish gallery. All forty products present before the latest expansion remain available. Previously retired product links lead to the relevant category; unknown IDs show the product-not-found recovery page. The cart stores nothing locally and begins empty after reload; deleted IDs are rejected.

## Verification

`npm test` checks no horizontal overflow at 360px, 768px, and 1280px and runs WCAG-tagged axe checks. An axe pass is not a Lighthouse score. The production build can serve every query-based page without server rewrite rules.

## Historical collection notes

The notes below record earlier development stages. The current counts, categories, finish options and homepage structure are described above and in `docs/catalogue-expansion.md`.

### Nature & Form collection

Twelve new pieces combine curved cream upholstery, olive seating and lighting, travertine, fluted dark walnut, an organic mirror, textured wool, ceramics, abstract art, and decorative greenery. This collection remains alongside Burgundy & Butter Cream. Home features three pieces from each; Products shows all thirty-six items. All images are original generated concept photography stored locally in `public/images/collection/`. Product cards use individual studio photos; banners and inspiration sections use furnished-room images. The reference study and exact prompts are in `docs/nature-form-collection.md`.

## Replay the intro

Open http://127.0.0.1:5173/?intro=replay to replay it in the current tab. The replay parameter is removed immediately, so a subsequent refresh will not replay it again. Reduced motion still takes priority. Alternatively, remove only the raha-entrance-seen sessionStorage key in browser developer tools and refresh.

## Warm visual redesign

The shared styles use the RAHA ten-shade palette with local system serif headings. See `docs/raha-brand.md` for every shade and its purpose. The former sidebar services are preserved as footer links. Product data, search, filters, detail galleries, local cart, and native registration validation retain their behavior. The current generated hero is `public/images/collection/soft-living.png`; its exact prompt and the full reference study are in `docs/nature-form-collection.md`. Decorative botanical line art is in `public/botanical.svg`, and the favicon uses the same olive palette. No external fonts or image requests are needed.

## Burgundy & Butter Cream

Twelve additional products bring burgundy leather and marble, butter-cream seating, cream stools and pendants, glossy burgundy lighting, travertine dining and decorative pieces, linen bedding, velvet cushions, abstract art, and a branch-filled ceramic vase. Individual product photographs and three styled room images are local under `public/images/burgundy/`; reference observations and exact built-in image_gen prompts are in `docs/burgundy-butter-collection.md`.

Use the collection buttons alongside category filters and search. URLs preserve `collection`, `category`, and `q` on refresh and browser navigation, for example `/?page=products&collection=burgundy-butter&category=lighting`. Reset clears all three. Each detail page links back to its collection and shows related pieces from the same palette. The retired original catalogue remains removed.

## RAHA identity and color options

RAHA uses the tagline HOME & LIVING, charcoal-brown serif lettering on ivory, and a matching R favicon. All ten interface shades are in `src/styles/tokens.css`; their roles, contrast choices, and image-repair prompts are documented in `docs/raha-brand.md`. Product photos and swatch colors keep their actual collection colors.

The Nature & Form and Burgundy & Butter Cream products offer two photographed colors or finishes directly below their main detail image. Kitchen & Dining offers photographed warm-taupe alternatives for the HAVEN stool and TERRA mug pair. Its other products show one photographed finish; unphotographed colors are not offered. Keyboard-accessible buttons update the image, color name, description, materials, price, and illustrative availability. The `color` URL parameter preserves selection. Cart items are identified by product and color, show their own photo and price, and support independent quantities and removal. Unavailable variants cannot be added.

## Shop the Room

Home replaces the former collection cards with a unique room photo and four catalogue-matched hotspots. One compact panel shows the photographed finish, current price, and correct product link. Keyboard users can open with Enter or Space, close with Escape, and move through the panel without a focus trap. Below 768px, a four-item product list replaces hotspots. Collection/category/search filters remain on Products. See `docs/shop-the-room.md` for image provenance, exact prompt, item coordinates, and interaction behavior.

## Kitchen & Dining

Twelve kitchen products expand the store to thirty-six items across three collections. A newly composed 1672 x 941 kitchen photograph shows ivory cabinetry, oak counters, a fluted island, rattan pendants, beige stools, warm lighting, ceramics, wood accessories, and greenery. Product photos and the kitchen scene are stored locally in `public/images/kitchen/`. Exact generation prompts are in `docs/kitchen-image-prompts.md`.

The manual Home hero controls switch between Living room, Burgundy & Butter Cream, and Kitchen & Dining with one rendered h1 and no auto-advance. Explore the look opens `/?page=products&collection=kitchen-dining&category=kitchen-dining`. Header navigation and the category grid also link to Kitchen & Dining. The kitchen collection has a styled introduction, and the same collection/category/search, detail-gallery, photographed-finish and local cart behavior as the existing store.

The active kitchen records are defined in src/data/kitchen.js, with unique IDs, USD concept prices, dimensions, materials, and product-specific care. Existing overlapping kitchen drafts are preserved in docs/kitchen-reconciliation-snapshot.json; they are not duplicated in the active catalogue. The original 24 products and their variants remain unchanged. Fifteen active generated assets (one wide scene, twelve primary product photos, and two photographed color alternatives) are used from public/images/kitchen/. Additional generated visual studies are retained alongside them and documented in docs/kitchen-collection.md.

## Products: search, category and price order

Products has one labeled search input (`#product-search`), one category select (`#category-filter`, including All categories), and one price select (`#price-sort`, default/low-to-high/high-to-low). These replace the previous category buttons; collection buttons remain an independent existing filter.

`renderProducts()` in `src/shopboard.js` is the single grid-rendering function. It reads the current controls, filters the catalogue by case-insensitive product **name**, category, and collection, then sorts `[...filteredProducts]` by price. The original catalogue is never sorted or mutated. It reuses `card()` from `src/pages.js` for all displayed results and updates the matching count and helpful empty state.

The existing delegated `input` handler runs it for search. A single delegated `change` handler runs it for either select. The existing collection/reset/clear handlers reuse it too. Controls stay outside the replaced grid, so changing one never resets another. URL query parameters (`q`, `category`, `sort`, `collection`) preserve state through refresh, product-detail navigation, and browser Back. Reset explicitly restores everything to defaults. Existing delegated product links and local cart actions work after each render.

`tests/catalogue-controls.spec.js` checks the requested Lighting → mixed-case lAmP → ascending/descending sequence at 360px, 768px and 1280px, retained selections, name-only matching, original/default order, immutable source data, empty states, links/cart, and accessibility.

Page imagery ownership, generation prompts, and finish-specific gallery limits are documented in [the page imagery audit](docs/page-imagery-audit.md).
