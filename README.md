# RAHA

RAHA is a responsive concept furniture and homeware storefront built with Vite, HTML, CSS, and vanilla TypeScript. It uses a warm neutral palette, serif headings, and local product photography. All website content is in English.

## Current features

- Home includes a living-room hero, six featured product cards, a manual room inspiration slider, and a registration demo.
- The catalogue contains 60 distinct products: 12 each in Living Room, Kitchen & Dining, Bedroom, Bathroom, and Home Decor.
- Products supports combined case-insensitive name search, category or collection filtering, and ascending or descending price sorting. Controls include result counts, an empty state, and reset actions; selections are reflected in the URL.
- Product details include colour and finish selection, availability, prices in USD, dimensions, materials, care information, and image galleries. Alternate finishes show their matching photograph and link to the original-finish gallery.
- The cart supports adding, increasing, decreasing, removing, and clearing items. Matching product/finish combinations share a quantity; different finishes remain separate. It displays selected finishes, item counts, and totals.
- Cart contents persist across reloads in localStorage under `raha-cart`. Saved entries are validated against the current catalogue; invalid or unavailable items are ignored. If storage is blocked, the cart works in memory.
- Room Inspiration includes living-room, bedroom, and kitchen scenes with links to matching products and finishes, plus a room floor-area calculator.
- About & Contact includes store information and a contact form demo.
- Internal navigation supports direct URLs, refresh, and browser Back/Forward. Routes update the page title, active navigation, and keyboard focus.
- Responsive styling includes visible focus states and reduced-motion support. A skippable entrance animation runs once per tab session; `/?intro=replay` requests a replay, subject to reduced-motion preferences.

This is a local storefront demo with illustrative products, specifications, availability, and prices. There is no backend, checkout, payment processing, or order fulfilment. Registration uses native email and password validation, including an eight-character password minimum; successful validation does not create an account. Registration and contact details are neither transmitted nor stored, and the contact form sends no message.

## Install and run

Run commands from the project root, where `package.json` is located. Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To build and preview the production output:

```sh
npm run build
npm run preview
```

The build is written to `dist/`. Use `npm.cmd` instead of `npm` in Windows PowerShell if execution policy blocks `npm.ps1`.

## Verification

```sh
npm run lint
npm run format:check
npm run typecheck
npm run build
npm test
```

Lint fails on errors or warnings. Formatting checks do not modify files; `npm run format` applies formatting when needed. Type checking runs separately from the Vite build.

Browser tests use Playwright with installed Google Chrome. The current configuration starts the Vite server at `http://127.0.0.1:5173` using `npm.cmd`, so its automatic server command targets Windows. Tests cover catalogue controls, product links and imagery, variants, cart persistence, demo forms, navigation, room interactions, responsive layouts, and accessibility with axe. To run a focused test:

```sh
npm test -- tests/catalogue-controls.spec.js
```

## Pages

| Page             | URL                          |
| ---------------- | ---------------------------- |
| Home             | `/`                          |
| Products         | `/?page=products`            |
| Product details  | `/?page=product&id=arc-sofa` |
| Room Inspiration | `/?page=inspiration`         |
| About & Contact  | `/?page=about`               |

Pages share one HTML entry point and use query-based routing.

## Folder structure

```text
index.html                 Shared page shell, navigation, registration, and cart dialogs
src/
  main.ts                  Imports styles and connects application modules
  data.ts                  Public catalogue exports
  data/                    Products, variants, collections, rooms, and imagery records
  modules/
    products/              Product types and pure search, filter, and sort logic
    cart/                  Cart types, validation, normalization, and totals
    rooms/                 Room-area calculation
  state.ts                 Cart state, browser storage, and entrance session flag
  ui.ts                    DOM rendering, routing, and user interaction handlers
  pages.ts                 Page templates and reusable product markup
  dom.ts                   Typed DOM helpers
  app.types.ts             UI dependency and session contracts
  product-gallery.ts       Gallery selection helpers
  styles/
    tokens.css             Design tokens
    main.css               Active responsive styles
public/images/             Local product and interior images
tests/                     Playwright browser tests
tooling/eslint/            Workspace for TypeScript ESLint tooling
package.json               Dependencies and development scripts
playwright.config.js       Browser test and development server configuration
```
