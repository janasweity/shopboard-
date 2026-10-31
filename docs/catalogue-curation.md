# Initial RAHA catalogue curation

This is the earlier 40-product curation snapshot. See [the subsequent catalogue expansion](catalogue-expansion.md) for the current 60-product range.

## Audit and selection

The previous catalogue contained 36 entries: several similar cream curved sofas,
stone tables, dome lamps, and ivory kitchen ceramics; no bathroom range; and only
two bedroom textile products. Color variants were already nested inside products.

The revised catalogue contains **40 distinct products, eight in each of five
categories**. Fourteen existing designs remain: ARC sofa, MOSS chair, DUNE table,
FERN lamp, LOOM rug, GRAIN boards, FLAX runner, ROUGE bedding, RIPPLE mirror, PLUM
cushion, EARTH vase, CONTOUR art, CANOPY plant, and GLOW candle holders.

Twenty-six new designs add glass, chrome, walnut, cotton, linen, ceramic, green
marble, seagrass, brass, and terracotta stone. Colors include muted blue, ochre,
soft pink, burgundy, olive, and terracotta. Geometric blocks, gingham, stripes,
waffle weave, fluting, and sculptural shapes provide variation beyond color.
Kitchen sets count as one product each; color variants never count as products.

Repetitive entries have been removed from the active data. Old product links
recover into the relevant category. Old material/type category URLs map to the
new room categories. Existing room stories and the shoppable room remain intact.
Original user-supplied image files remain available; they were not deleted.

## Photography and limitations

New photographs were made with the built-in image generation tool, one request
per product, without external reference screenshots or third-party stock images.
The complete final prompt set and product briefs are in
[`scripts/catalogue-briefs.json`](../scripts/catalogue-briefs.json).

Generated compositions include studio photographs, textile and stone detail,
tabletop arrangements, and natural bedroom/bathroom settings. These are concept
products, not sourced or authenticated supplier inventory. Materials, dimensions,
prices, and stock labels are illustrative; no manufacturing or supplier claims
are implied. Only photographed finishes are offered. New designs have one finish;
retained designs keep their matching alternative photos and stock behavior.

All website product and variant photographs are saved in
[`public/images/catalogue/`](../public/images/catalogue/) as 1536 × 1024 JPEGs.
`scripts/prepare-catalogue-images.ps1` fits images without stretching or removing
any part of the original photograph; square legacy shots receive side space.
The original generated PNGs remain in Codex's generation directory. The site
uses local project assets and does not depend on that directory or remote URLs.

Room photos remain explicitly labelled as styling inspiration and may contain
other furniture. New bathroom/decor products without relevant room imagery omit
that gallery choice instead of showing an unrelated room.

The logo, stylesheets, typography, neutral interface colors, animations, and
local-only registration and cart behavior were preserved.
