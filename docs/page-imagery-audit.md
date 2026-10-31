# Page imagery audit

The Home hero previously shared a room photograph with Room Inspiration. Three Home slider scenes were also reused as inspiration stories. Twenty-five product detail pages offered generic room imagery that could show different furniture. About & Contact had no dedicated materials photography.

## Revised ownership

- Home: one new hero (`public/images/editorial/home-hero.jpg`), six unchanged featured product photographs, and three existing slider scenes reserved for Home.
- Products: the existing individual product photographs. No decorative category banners were added.
- Room Inspiration: eight new editorial photographs, covering living rooms, an entrance, bedroom, dining room, kitchen, and bathroom. The existing interactive Shop the Room scene remains unique to this page; its product hotspots are preserved.
- About & Contact: two new photographs showing a materials arrangement and oak joinery craftsmanship.
- Product details: original-finish product-specific additional angles, material details, and lifestyle settings. Each uses that exact product's original photograph as an identity reference. Generic room-gallery images were removed.

## Generation and limits

Images were created with the built-in image generation tool, saved locally, visually compared with the product references, and converted to 1536 x 1024 JPEGs without stretching or cropping. They are concept photography for this demonstration catalogue, not manufacturer-supplied photographs or independently verified construction documentation.

Additional views depict only the original photographed finish. Other colors retain their accurate matching main photograph and a clearly named link to the original-finish gallery. Selecting a color resets the gallery, so an original-finish close-up is never presented as another finish. No CSS tinting is used.

The exact prompt sets are `scripts/page-imagery-briefs.json` and `scripts/product-gallery-briefs.json`. Approved assets are recorded in `scripts/page-image-review.json`; `scripts/accepted-page-photos.json` records local source and destination paths. Final assets live in `public/images/editorial/` and `public/images/galleries/`.

Old scene assets remain where collection metadata, documentation, or provenance still references them. Product images and unrelated assets were preserved. Main product photographs may appear in listings, details, and cart, as intended.

## Verification

The page-imagery tests check distinct decorative file paths and hashes, gallery ownership, finish isolation, and gallery reset behavior. Existing browser tests cover image decoding, every product link, color selection, separate variant cart entries, combined catalogue controls, registration/contact behavior, keyboard access, and responsive accessibility at 360, 768, and 1280 pixels.

Final delivery contains 191 new local JPEGs: 11 editorial photographs and 180 additional views across all 60 products. Temporary generation PNGs and status files were removed after verifying each final JPEG and checking that application code did not reference the temporary paths.
