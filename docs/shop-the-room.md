# RAHA Shop the Room

The former collection-card showcase is removed from Home and Products. Products retains collection buttons and shareable `collection`, `category`, and `q` filters. Home keeps six featured product articles and now uses a single new room photograph for Shop the Room.

## Photograph and matching products

The image is saved at `public/images/collection/shop-the-room.png`. It was created with the built-in image_gen tool using the actual catalogue product photos as strict references, then inspected against them. It is not reused elsewhere on Home. Unlinked background objects are styling props.

| Hotspot | Catalogue product | Finish | Image position (x, y) |
| --- | --- | --- | --- |
| 1 | ARC Curved Sofa | Cream | 45%, 52% |
| 2 | DUNE Travertine Coffee Table | Sand travertine | 48%, 66% |
| 3 | MOSS Olive Accent Chair | Olive | 88%, 60% |
| 4 | FERN Olive Table Lamp | Olive | 6.2%, 44.5% |

The full image is displayed without cropping so percentage coordinates stay aligned at responsive widths. Names, prices, finish photos, and product links are resolved from the existing catalogue rather than duplicated. Links select the photographed original finish.

## Interaction

`src/data/shop-room.js` holds the room image and four product coordinates. `src/pages.js` renders the semantic section, native hotspot buttons, one initially hidden non-modal dialog panel, and the mobile list. `src/shop-room.js` handles panel opening, dismissal, focus, and responsive cleanup; the main router closes it before replacing page markup.

- Enter, Space, or click opens one panel and focuses its close button.
- Escape or Close dismisses it and returns focus to the triggering hotspot.
- Outside clicks dismiss it; clicking another focusable control keeps focus on that control.
- Tab can leave the panel without being trapped; Shift+Tab from Close returns to the hotspot.
- At widths below 768px, hotspots are hidden and all four products are available in a list below the image. Resizing an open panel to mobile focuses the matching list link.
- The decorative pulse is disabled with reduced motion. Focus and expanded states remain visible without animation.

## Exact generation prompt

Create a high-resolution photorealistic interior editorial photograph for an interactive 'Shop the Room' furniture-store section. Use the FOUR supplied product photographs as strict furniture identity references, not as a collage. Reference 1: ARC cream boucle curved three-seat sofa, continuous crescent seat and rounded enveloping back, low upholstered plinth. Reference 2: MOSS olive textured barrel swivel accent chair with thick curved wraparound back, broad padded seat and concealed plinth. Reference 3: DUNE light sand travertine oval coffee table, thick rounded slab and TWO short cylindrical stone legs. Reference 4: FERN muted olive metal mushroom table lamp with broad dome, thick cylindrical stem and round base. These must remain the EXACT four product designs, shapes, construction, materials and colors from the references. Place the sofa across the left/rear of the room, the olive chair prominently at right, the oval table centered in front, and the olive mushroom lamp clearly visible on a low simple wood side console at left. All four linked objects fully recognizable and unobstructed; no pillows obscuring the sofa shape, no props on table. Compose a single elegant real furnished living room: warm ivory limewash walls, soft white linen curtains and daylight from left, subtle taupe and greige textures, pale neutral rug, restrained natural wood floor and one small unlinked botanical detail in background. Quiet RAHA warm neutral palette with authentic olive furniture accents. Landscape 3:2, straight-on eye-level architectural photography, generous balanced space, natural scale, soft realistic shadows. No people, no labels, no hotspots, no text, no brands, no watermarks, no UI. Do not substitute similar furniture: reproduce the four referenced products faithfully.
