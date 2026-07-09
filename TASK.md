# Task: DanMaxPublishing Support Website

Build the complete publisher/support website for **Photo Mode Pro** (first asset of
**DanMaxPublishing**), publish it to GitHub Pages from this repository.

Live URL target: `https://supportdanmax.github.io/photo-mode-pro-docs/`

## Decisions (from interview, 2026-07-09)

| Topic | Decision |
|---|---|
| Tech stack | Hand-crafted static HTML/CSS/vanilla JS. No build step, no frameworks, no external services. |
| Theme | Dark only — navy/cyan with orange accent, matching DanMaxPublishing V3 branding. |
| Sections | Home/showcase, asset catalog (built to grow), full restyled user manual, FAQ/troubleshooting, support page, About (publisher), changelog, roadmap (Photo Mode Pro updates + generic "more tools" teaser) — plus anything the publisher-site research shows is expected. |
| Support channel | `supportdanmax@gmail.com` + GitHub Issues on this repo. |
| Screenshots | Real Unity captures (batch mode) + nano-banana-generated hero/decorative art. Existing publisher images in `marketing/publisher info/` may be used. |
| Docs depth | Full user manual ported from the project's docs into the site's own design. No DocFX API dump. |
| Deployment | GitHub Pages, `main` branch, root folder. Enable via API if possible, else document the manual step. |
| CTA / store link | Asset not live yet → "Coming soon" CTAs; store URL kept in one config spot for later swap. |
| WebGL demo | Attempt a playable in-browser demo (best effort — ship without it if the build fails). |
| Extras | No newsletter, no analytics, no trackers, no legal pages. |
| Identity | "Dan Max" alias everywhere; no real name on the site. |

## Plan

1. **Research** — survey ~30 Unity Asset Store publisher websites; extract common
   sections, patterns, and polish benchmarks. Feed findings into information
   architecture.
2. **Content gathering** — mine the Unity project (`docs/`, `docs-site/`,
   `marketing/`) for manual content, feature lists, FAQ material, changelog.
3. **Visual assets** — Unity batch screenshots of the demo scene + photo mode UI;
   nano banana hero/brand art; attempt WebGL demo build.
4. **Build the site** — semantic static HTML, single shared CSS design system,
   vanilla JS interactions (nav, search, lightbox, scroll effects). Small commits.
5. **QA — 3 passes** — serve locally, click every link/interaction, screenshot
   every page, fix and improve each pass.
6. **Publish** — push to `main`, enable GitHub Pages (API or documented manual
   step), verify the live URL.

## Status (2026-07-09)

Site complete: 23 pages (home, product tour, WebGL demo, support, about, roadmap,
17-page manual with search), 12 real Unity captures, brand art, zero external
resources. Three QA passes done: visual (desktop + true-390px mobile), scripted
interaction suite (23/23 checks: preset tabs, compare slider incl. keyboard,
lightbox, accordion, docs search + keyboard nav, copy buttons, scroll spy, mobile
nav, Unity demo boot, zero console errors), and a content/metadata/no-JS sweep.

Notable decisions made during the build:
- **Support email is `support.dan.max@gmail.com`** (not supportdanmax@gmail.com as
  guessed in the interview) — the shipped package hardcodes it in
  `PhotoModeProductInfo.cs`, README and docs. The site must match the package.
  → Verify that inbox actually exists.
- OG share image derived from the key art (the 5th generated image hit persistent
  Vertex AI quota exhaustion — another session was consuming the project quota).
- WebGL demo: gzip + decompression fallback, ~23 MB, boots and loads to 100% in
  headless checks. Roadmap page frames WebGL honestly as unsupported-for-capture.

## Published ✅

**Live:** https://supportdanmax.github.io/photo-mode-pro-docs/ (Pages enabled via
API on 2026-07-09; deploy from `main`, root; all routes verified 200 including the
WebGL build files; live homepage screenshot-verified.)

## Remaining manual steps for the owner

1. **Verify the WebGL demo in a real browser** at
   https://supportdanmax.github.io/photo-mode-pro-docs/demo/ — headless checks
   confirmed download + engine instantiation, but not the GPU render path.
2. **Confirm the support inbox** `support.dan.max@gmail.com` exists and is
   monitored (it's on every page, and hardcoded in the shipped package).
3. **When the asset goes live:** put the real store URL into the `STORE_URL`
   constant at the top of `assets/js/site.js` — every "Get Photo Mode Pro" button
   updates from that one spot. Also update the roadmap "Submitted" card.
