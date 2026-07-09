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

## Manual steps for the owner (running list)

- (filled in as discovered)
