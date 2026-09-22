# Liwan Lake Park Guide (荔湾湖公园攻略)

A fast, lightweight, multilingual static travel blog about **Liwan Lake Park (Liwanhu Park, 荔湾湖公园)** in Guangzhou's historic Liwan District — built with entity-based SEO for Google, Bing/Yahoo, Yandex and Brave Search.

## Structure

- `index.html` — topic hub homepage
- `liwan-lake-park-guangzhou/` — pillar page: complete visitor guide (FAQ schema, TouristAttraction/Park JSON-LD, hreflang)
- `how-to-get-to-liwan-lake-park/` — metro / bus / taxi / walking routes
- `liwan-lake-park-opening-hours/` — hours, tickets, crowds, rules
- `liwan-lake-park-photo-spots/` — photography guide
- `things-to-do-liwan-lake-park/` — opera, boats, chess, tea culture
- `food-near-liwan-lake-park/` — Xiguan food guide
- `liwan-lake-park-vs-yuexiu-park/` — comparison page
- `ru/parke-livankhu-guangzhou/` — Russian version (Yandex targeting)
- `zh/liwan-hu-gongyuan-guide/` — Simplified Chinese version
- `sitemap.xml`, `robots.txt`, `assets/style.css`, `assets/app.js`

## Design principles

- Plain semantic HTML/CSS with a small vanilla JS enhancement layer; navigation and content remain usable without JavaScript
- Quick-answer blocks, tables and FAQ sections for featured snippets / AI search
- Cautious language for unverified hours/fees; corrections welcome via issues or PRs

Enable GitHub Pages (Settings → Pages → main branch) to serve the site at `https://dawidmillenium-design.github.io/GuangzhouLiwanDistrict/`.
## Localization and UX maintenance

The English homepage is `index.html`. Shared colors, layout, responsive drawer, theme, map cards, gallery, and lazy-image reveal live in `assets/style.css` and `assets/app.js`. The three language pages reuse those files via relative paths; do not copy the script into each page.

- Set `<html lang="zh-Hans">` or `<html lang="ru">`. The script picks its `zh` or `ru` dictionary from this attribute. Translate or update these keys together in each `I18N` object in `assets/app.js`: `menuOpen`, `menuClose`, `themeToDark`, `themeToLight`, `mapTitle`, `hotspotClose`, `galleryLabel`, `lightboxClose`, `lightboxPrev`, `lightboxNext`, `photoCounter`. Keep `{current}` and `{total}` unchanged.
- Page-specific text stays in the HTML: header links, skip link, map heading and explanatory note, each hotspot's `data-spot-title`, `data-spot-desc`, and `aria-label`, gallery heading, `alt`, `data-caption`, and the button `aria-label`. The localized guide pages already have examples.
- Keep local language URLs canonical to themselves and reciprocal `hreflang` links. Match `og:locale` to the page language and use an absolute `og:image` URL. The 1200×630 PNG social card is an illustration; replace it with a real, properly licensed photo when available.
- The map is a schematic illustration. Replace marker positions only after checking the real park layout. The homepage `TouristAttraction` schema deliberately omits exact opening hours because current sources disagree; add `openingHoursSpecification` only after checking an authoritative current notice and display the same hours on the page.

## Deployment checklist

1. Review these files on the `codex/liwan-ux-accessibility` branch. Preview each route at 375px and desktop widths; test keyboard Tab, Escape, theme persistence, all markers, and gallery arrows.
2. Replace placeholder SVG illustrations with original, correctly sized WebP/AVIF photos when available. Keep width/height, descriptive alt text, and `loading="lazy"` for below-the-fold images; keep a prominent hero image eager if one is added.
3. Merge into `main` after review. If GitHub Pages is configured to deploy `main`, wait for its deployment workflow and verify the English, Chinese, and Russian URLs live.


## Launch fixes

The drawer now includes a translated close button and uses a native modal dialog. The lightbox also uses a native modal dialog to isolate background content. Browsers without dialog support retain the normal navigation. Map descriptions appear below the illustration to prevent clipping. The device-theme button clears the saved preference.

Header controls have 44px touch targets. Hero text fading and section reveal animations have been removed. A project-path-aware 404 page provides links to all three language guides, and page footers link to the repository correction form. Unsupported field-research wording has been removed.

Lazy loading uses the browser's native attribute. IntersectionObserver controls image reveal only; older browsers may fetch images eagerly.

Validation: JavaScript syntax and local URL/fragment checks are run before commit. Real-device and browser interaction verification remains required; the environment's attempted Chromium download failed. No Lighthouse score or screen-reader compliance claim is made.
