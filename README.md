# danmaxpublishing.github.io

Publisher and support site for **Photo Mode Pro** (DanMaxPublishing), served
by GitHub Pages from this repository's root.

Live: https://danmaxpublishing.github.io/

## Layout

- Hand-written pages: `index.html`, `photo-mode-pro/`, `roadmap/`,
  `support/`, `about/`, `demo/`, `404.html`
- Generated manual: `docs/*/index.html` + `assets/search-index.json` —
  do not edit by hand
- Shared assets: `assets/css/site.css`, `assets/js/site.js` (no external
  dependencies, no cookies, no third-party requests)
- WebGL demo build: `demo/Build/` (Unity, committed as-is)

## Regenerating the docs

The manual is ported from the Unity project's MkDocs sources
(`<unity-project>/docs-site/docs`):

```
python tools/build_docs.py [--src <path-to-docs>]
```

Requires Python 3.10+ with `markdown` and `pymdown-extensions`. The output
is committed; the site itself has no build step.

## Deploying

Push to `master`. GitHub Pages publishes the repository root.
