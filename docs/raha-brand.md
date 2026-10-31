# RAHA — HOME & LIVING

The identity uses a live serif RAHA wordmark in charcoal brown on warm ivory, with a small tracked HOME & LIVING tagline. The header, footer, favicon, metadata, route titles, no-script message, room captions, and optional entrance share the new brand. The entrance session key is `raha-entrance-seen`.

The ten reference-inspired shades are defined once in `src/styles/tokens.css`. Interface styles use these variables; product photography and actual color/finish swatches retain their own colors.

| Shade | Hex | Visible purpose |
| --- | --- | --- |
| Soft Black | `#171614` | Headings, strong focus outlines, button hover states |
| Charcoal Brown | `#302923` | RAHA lettering, body text, primary buttons, footer |
| Warm Slate | `#4d4b47` | Supporting text and promotional banner |
| Graphite Grey | `#62605b` | Selected collection control and unavailable button |
| Stone Grey | `#88857d` | Input and component borders, cart icon, swatch outlines |
| Warm Greige | `#b6ac9d` | Alternating category cards and registration section |
| Taupe Brown | `#9a826d` | Navigation underline, product highlights, botanical details, footer edge, intro line |
| Silver Mist | `#d1c8bc` | Product image panels, story section, selected swatch surface, footer supporting text |
| Warm Ivory | `#eee5d5` | Header, logo backing, hero, entrance and light panels |
| Soft White | `#faf8f1` | Main page background, forms, inputs, text on dark surfaces |

Supporting text on warm-greige panels uses charcoal brown to maintain contrast. Keyboard focus remains explicit on both light and dark surfaces. The original animation timing, skip actions and reduced-motion behavior remain intact.

## Preserved color variants

The 24 Nature & Form and Burgundy & Butter Cream products have an original photograph and an edited alternative-color photograph stored under `public/images/variants/` as `<product-id>-<color-id>.png`. The existing original photographs remain in their collection folders. Edits use the original product image as a reference and preserve construction, shape, framing and lighting; there are no CSS image tints.

The last four alternative images repaired during this rebrand were generated with the built-in image_gen tool:

- `rouge-bedding-olive.png`: Change only the burgundy linen duvet cover and pillowcases to muted olive green linen, preserving every fold, stack, weave and softly creased edge exactly.
- `velvet-cushion-cream.png`: Change only the burgundy velvet cushion face to butter-cream velvet, preserving the subtle cream piping, square outline, plump shape and every seam exactly.
- `wine-art-olive.png`: Change only the burgundy blocks in the artwork to muted olive green. Preserve every beige form, artwork geometry, dark walnut frame, paper and composition unchanged.
- `branch-vase-burgundy.png`: Change only the ivory ceramic vase to a glazed deep burgundy ceramic vase. Preserve the decorative burgundy branches, every leaf and stem, vase shape and arrangement unchanged.

Each instruction used this exact prefix:

> Edit the supplied product photograph to create a true alternative finish photograph of the exact same product.

And this exact suffix:

> Preserve its exact silhouette, dimensions, construction, seams, details, camera angle, crop, position, ivory studio background and lighting. Render the changed material realistically with its original texture, highlights, reflections and shadows; do not apply a global tint or color overlay. Change no other objects or materials. No text, logos, borders, people or interface elements.

Color buttons retain readable names, pressed state, selected text, and visible keyboard focus. Selection updates the image, description, materials, price and illustrative availability. The selected color is encoded in the URL. Cart entries use product ID plus variant ID; same-color additions increase quantity while different colors remain separate. The cart remains in memory only, and refresh starts an empty cart.
