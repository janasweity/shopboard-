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

This is a local storefront demo with illustrative products, specifications, availability, and prices. A read-only catalogue API is available locally through Vite; there is no checkout, payment processing, or order fulfilment. Registration uses native email and password validation, including an eight-character password minimum; successful validation does not create an account. Registration and contact details are neither transmitted nor stored, and the contact form sends no message.

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

## Local products API

Run `npm.cmd run dev`, then open [http://localhost:5173/api/products](http://localhost:5173/api/products) in your browser. Vite uses port 5173 and fails if it is occupied, rather than silently opening a different port. Stop the old RAHA dev server before starting a replacement. After adding or changing the API plugin, restart Vite; a stale server can return the HTML page with status 200 at `/api/products` instead of JSON. `GET /api/products` returns `{ "items": [...] }` containing all RAHA products, including every existing ID, category, image, variant, and other catalogue field. Product and variant `price` values are integer USD cents: `$1,695` becomes `169500`.

The endpoint reads the existing catalogue exported by `src/data.ts`; it does not maintain a second product list or change the catalogue's dollar prices. The Products page fetches this endpoint each time the Products route opens, validates the response, and maps cents to dollars before rendering. Home, product details, and saved carts continue using the existing catalogue directly. Methods other than GET return JSON with status 405 and `Allow: GET`.

The route is available in both `npm.cmd run dev` and `npm.cmd run preview` (normally port 4173). It is Vite middleware, so uploading only `dist/` to a static host does not deploy an API server. The response uses the course API envelope `{ "items": [...] }`.

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
    products/              Product types, pure logic, catalogue UI, variants, and galleries
    cart/                  Cart types, pure logic, rendering, and delegated actions
    rooms/                 Room-area calculation, planner UI, and shop-room panel
    forms/                 Registration and contact demo handlers
    navigation/            Routing, active links, and keyboard focus
    interactions/          Entrance animation cleanup and manual hero slider
    state/                 Entrance session behavior
  shared/
    api/
      api-client.ts        Shared fetchJson and ApiError
    ui/
      dom.ts               Typed DOM helpers
      app.types.ts         UI dependency contracts
  state.ts                 Cart state, browser storage, and entrance session flag
  ui.ts                    Initializes feature UI modules once and connects route hooks
  pages.ts                 Page templates and reusable product markup
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

Feature UI modules own their DOM access and handlers. Navigation invokes coordinator hooks to reset forms and cart status, close room panels, stop entrance effects, and initialize catalogue controls. Catalogue requests use route generations to ignore stale responses; navigation cancels pending focus callbacks before rendering another route. Pure calculations remain separate from DOM and storage.

To inspect the request, run `npm.cmd run dev`, open the site, and open DevTools ? Network. Select Fetch/XHR, then visit Products (or reload it). Select `products`: Headers shows `GET /api/products` and status 200; Response shows `items` with integer-cent prices. Cards display dollars. Slow the network to see loading, or block `/api/products` and reload to see the error. Unblock it and choose **Try again** to recover.
