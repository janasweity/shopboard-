# Catalogue and photographed finish expansion

The catalogue now contains 60 distinct designs. All 40 products from the previous
curation and their existing finish records are retained. Twenty new designs add
four products to each of the five categories; variants do not count as products.

| Category | New designs |
| --- | --- |
| Living Room | BEAM articulated task lamp, CHANNEL velvet storage ottoman, CADENCE striped lumbar cushion, FOLIO bentwood magazine rack |
| Kitchen & Dining | GEM colored goblet pair, MOSAIC patterned serving platter, WEFT woven serving tray, HEARTH ceramic butter dish |
| Bedroom | FLORA botanical percale duvet set, DRUM metal bedside table, SCALLOP oak wall mirror, HERRINGBONE cotton coverlet |
| Bathroom | HAMMAM striped towel pair, REED fluted toothbrush cup, FRAME canvas laundry basket, WAFFLE cotton wash bag |
| Home Decor | HORIZON landscape print, FACET colored glass vase, BRIDGE metal candle holder, ORBIT woven wall basket |

## Finish photography

Every design has four available photographed options. FERN has five finish records because its existing cream option remains out of stock. There are 241 product/finish photographs in total, with 190 newly saved images (20 new base photos and 170 finish edits). No requested finish remains without a reviewed matching photo. Wood receives
appropriate natural, smoked, white-oiled or ebonized finishes. Stone retains
natural stone tones, and metal items use metal or powder-coated finishes.
Textiles, ceramic glazes and glass introduce burgundy, terracotta, olive,
forest green, dusty blue, navy, ochre, blush, cream, taupe and charcoal.

New base photographs use varied studio, tabletop, material-focused and room
compositions. Every additional finish is generated from that product's original
photo with instructions to preserve its silhouette, construction, materials,
pattern geometry, camera angle, setting and object count. Each finished set is
visually compared before inclusion. Incorrect edits are corrected or omitted.

The site offers only finishes with their own local image files; it uses no image
tints, repeated photos under different swatches, or unrelated replacements.
All new final files are in `public/images/expansion/`, at 1536 × 1024. Existing
product images in `public/images/catalogue/` remain untouched.

Generation uses the built-in imagegen tool. These are concept product photographs,
not verified supplier inventory. Dimensions, materials, prices and availability
remain illustrative. An existing unavailable finish remains unavailable.

The prompt records are `scripts/catalogue-expansion-briefs.json`,
`scripts/catalogue-variant-briefs.json`, `scripts/new-product-variant-briefs.json`
and `scripts/catalogue-corrected-variant-prompts.json`. Reviewed finish IDs are
recorded in `scripts/catalogue-photo-review.json`. The original 40-product
snapshot is `scripts/catalogue-expansion-baseline.json`.

## Website behavior

All finishes appear below the main product photograph with readable names and a
selected state. Selecting one changes its photograph, price, materials,
availability and URL. The cart keys items by both product and finish, shows the
finish name and photograph, and increments quantity only for the same finish.

There is still one Products page with combined case-insensitive name search,
category selection and price ordering. Six homepage features span all five
categories. The neutral interface palette, typography, logo, layouts, intro and
room animations, registration demo and existing local cart behavior are preserved.
