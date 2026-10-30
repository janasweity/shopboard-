# Havlo Home

A responsive, blue-and-yellow furniture storefront built in the existing Vite project using HTML, CSS, and vanilla JavaScript. No framework or backend was added. All website content is English.

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

- `/`: Home with a large furnished-room hero, six categories, six featured product articles, and two promotional banners.
- `/?page=products`: twelve products, live search, category filters, result counts, empty state, and reset controls. Category/search state is encoded in shareable URL parameters.
- `/?page=product&id=sofa`: product details. All twelve product cards link to their correct detail page, with price, description, dimensions, materials, care, add-to-cart, and an accessible image gallery.
- `/?page=inspiration`: living room, bedroom, kitchen, and home-office editorial sections plus the room-area planner.
- `/?page=about`: store information, returns explanation, and accessible contact demo.

The project remains a single Vite entry point. Vanilla JavaScript renders the appropriate page for each URL, uses the History API for internal navigation, and supports Back/Forward, direct opening, refresh, and opening links in another tab. Home links are present in shared navigation, logo, and footer. Route changes update the page title, current navigation, and keyboard focus.

## Source files

- `index.html`: shared semantic shell, sidebar, navigation, main view, registration demo, cart dialog, and footer.
- `src/pages.js`: page HTML templates and reusable product card markup.
- `src/data/catalog.js`: twelve product records, category labels, four room records, prices, descriptions, dimensions, materials, images, and alt text.
- `src/shopboard.js`: routing, search/filter state, gallery controls, in-memory cart, room planner, and local form-demo behavior.
- `src/entrance.js`: optional first-session brand intro: a blue screen, Havlo Home name reveal, yellow underline, brief hold, upward curtain, and staggered content. The full sequence finishes at 3.75 seconds and cancels on navigation or Skip intro.
- `src/styles/tokens.css`: design colors, spacing, and typography tokens.
- `src/styles/main.css`: responsive shared/page styling. Products use Grid; navigation uses Flexbox. Product columns: one at 360px, two from 768px, three from 1280px. Includes visible keyboard focus and reduced-motion support; uses min-width media queries.
- `public/images/havlo/`: local product and interior photography. Below-the-fold images lazy-load; hero/main product images load eagerly.
- `docs/catalogue-image-prompts.md`: exact built-in image_gen prompts for the six new product photographs and three new room photographs.
- `docs/havlo-lifestyle-prompt.md`: the earlier living-room image prompt.
- `tests/shopboard.spec.js`: twenty browser checks covering all five page types at all required widths, image decoding, axe, all twelve product links/galleries, search/history, cart navigation/quantities/removal, native registration/contact constraints, keyboard focus, and room planning.

## Local-only behavior

The cart lives in memory and persists during internal page navigation. Refreshing or opening a separate tab starts an empty cart. No checkout, payments, backend, or cart storage is implemented.

The entrance uses a single `sessionStorage` flag, `havlo-entrance-seen`, so it does not replay during navigation or refresh in the same tab session. No user details are stored. If storage is unavailable, the animation is skipped. Reduced-motion users see content immediately; changing that preference during the sequence cancels it. The overlay is created only by JavaScript and has a keyboard-focused Skip intro button. Enter, Escape, or focusing the underlying page dismisses it immediately. The page renders normally underneath; the intro never waits for images or an artificial loading state. Its CSS curtain slides fully offscreen even if cleanup fails, and no hidden base styles are applied to page content.

`tests/entrance.spec.js` checks the 3–4 second timing, session replay prevention, keyboard skip, replay URL, reduced motion, blocked storage, image failures, responsive sizing, and the no-JavaScript fallback. The general storefront checks use an already-introduced session.

Registration remains available on every page. Native HTML validates required email/password fields and the eight-character password minimum. `method="dialog"` closes the demo without sending data; fields are reset on close and navigation. Credentials are never stored.

The contact form uses native HTML validation and clearly states it is a demo. Valid submission is handled locally, clears the fields, and reports that no message was sent. No input is saved or sent to a service.

All product names, prices, and specifications are illustrative. Product galleries distinguish product photography from room styling inspiration; the room photo may show different furniture. Existing files and historical assets are preserved.

## Verification

`npm test` checks no horizontal overflow at 360px, 768px, and 1280px and runs WCAG-tagged axe checks. An axe pass is not a Lighthouse score. The production build can serve every query-based page without server rewrite rules.

## Original photography sources

- Sofa: https://images.unsplash.com/photo-1555041469-a586c61ea9bc
- Chair: https://images.unsplash.com/photo-1567538096630-e0c55bd6374c
- Shelf: https://images.unsplash.com/photo-1594620302200-9a762244a156
- Lamp: https://images.unsplash.com/photo-1507473885765-e6ed057f782c
- Plates: https://images.unsplash.com/photo-1578749556568-bc2c40e68b61
- Coffee table: https://www.2modern.com/products/bellwood-coffee-table
- Additional room: https://images.unsplash.com/photo-1600210492486-724fe5c67fb0

Six additional product images and three additional room images were generated with the built-in image_gen tool. All used images are copied into the project; no external image or font requests are needed at runtime.

## Replay the intro

Open http://127.0.0.1:5173/?intro=replay to replay it in the current tab. The replay parameter is removed immediately, so a subsequent refresh will not replay it again. Reduced motion still takes priority. Alternatively, remove only the havlo-entrance-seen sessionStorage key in browser developer tools and refresh.
