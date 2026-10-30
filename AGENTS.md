# Project rules

`CLAUDE.md` was empty when this file was created. The rules below record the existing project stack and the user's stated assignment requirements; they are not additional rules inferred from that empty file.

## Stack and scope

- Work in this existing Vite project using HTML, CSS, and vanilla JavaScript. Do not introduce a framework or replace the project.
- Preserve the current Havlo Home furniture-store design, local images, intro animations, additional pages, and local cart behavior unless the user requests a change.
- Keep all website text in English. Preserve user work and unrelated files.
- Shared semantic HTML is in `index.html`; page templates are in `src/pages.js`; catalogue data is in `src/data/catalog.js`.

## Assignment requirements

- Keep a header with working navigation and a main containing the Home hero, products, and registration sections. Additional existing sections and pages are allowed.
- Home must show six product cards as `article` elements. Preserve the expanded Products page with at least twelve products.
- Use semantic elements and one rendered `h1` per page. The no-JavaScript fallback heading is only shown when scripts are disabled.
- Registration labels must be explicitly linked to their inputs. Email uses `type="email"` and `required`; password uses `type="password"`, `required`, and `minlength="8"`. Use a real submit button and native HTML validation.
- Preserve the registration demo's local-only behavior: no account creation, data transmission, or password storage.
- Keep active styles in `src/styles/tokens.css` and `src/styles/main.css`. Use mobile-first CSS, `min-width` layout media queries at 768px and 1280px, and no `!important`. Reduced-motion preference queries are allowed.
- Preserve keyboard navigation, visible focus, descriptive image alternatives, reduced-motion support, and layouts without horizontal overflow at 360px, 768px, and 1280px.

## Verification

- Run `npm.cmd run build` and tests relevant to the change (`npm.cmd test -- <test file>` on PowerShell). Run the broader suite when shared behavior changes.
- Do not claim a Lighthouse score without running Lighthouse.
- Keep fixes limited to the requested scope and explain every change.
