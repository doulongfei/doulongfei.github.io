# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Static GitHub Pages portfolio for developer "doulongfei", served from the `gh-pages` branch at
https://git.doufei.eu.org/ (see `CNAME`). The `main` branch holds the GitHub profile README and the
workflow that refreshes the 3D contribution charts.

Sections: hero (3D contribution chart + GitHub metrics), projects (filterable cards), tech stack,
certificates (lightbox), contact + Twikoo comments.

## Key Files
- `index.html` — all page content and markup, including an inline SVG icon sprite (`<symbol id="i-…">`)
- `assets/site.css` — styles, organised as tokens → base → layout → components → sections → motion → responsive
- `assets/site.js` — progressive enhancement only (reveal animation, header/menu/scrollspy, project filter,
  live GitHub stats, lightbox, copy email, lazy Twikoo, background canvas)
- `assets/img/` — optimised WebP certificate images (`-640` thumbnails, `-1280` lightbox) and `og-card.jpg`
- Twikoo 1.6.39 comments are loaded from npmmirror → jsDelivr → unpkg (in that order) with a pinned SRI hash, only when the comments section nears the viewport. It is not vendored: the bundle contains an example Tencent Cloud SecretId placeholder that GitHub push protection rejects. To upgrade, bump `TWIKOO_VERSION` and `TWIKOO_INTEGRITY` in `site.js`
- `profile-3d-contrib/` — 3D contribution SVGs, regenerated daily by the workflow on `main` (do not edit by hand)
- Original certificate files (`assets/*-certificate.jpg`) and README assets (`Bottom_*.svg`, header png, social svgs) are kept for reference / the README

## Conventions
- No build step, no package.json: edit files directly. Bump the `?v=` query on `site.css`/`site.js` in `index.html` when changing them (cache busting behind Cloudflare).
- The page must stay fully readable without JavaScript. JS-only styling lives under `html.js`
  (the class is set by an inline script in `<head>` and removed again on `load` if `site.js` never ran).
- Icons: add a `<symbol>` to the sprite (lucide paths, ISC) and reference it with `<svg class="icon" aria-hidden="true"><use href="#i-name"/></svg>`.
- Project cards: `data-category` drives the filter (space-separated: `ai`, `tooling`, `web`, `mobile`); counts are computed by JS. `data-lang` on `.lang` maps to the GitHub linguist colour in CSS.
- Metrics: the numbers in HTML are the fallback; `site.js` refreshes them from the public GitHub API (cached 6h in localStorage). Public data only — private repos are not counted.
- Images: add `width`/`height`, `loading="lazy"` below the fold, and prefer WebP derivatives over large originals.
- Respect `prefers-reduced-motion` for any new animation.

## Deployment
- Push/merge to `gh-pages` → GitHub Pages redeploys automatically (~1 min).
- The `profile-3d-contrib` workflow commits to `gh-pages` daily at 18:30 UTC; avoid editing those SVGs to prevent conflicts.
