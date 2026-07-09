#!/usr/bin/env python3
"""One-time porter: converts the Photo Mode Pro MkDocs manual into the site's
own static HTML design. Re-run whenever the source docs change:

    python tools/build_docs.py [--src <unity-project>/docs-site/docs]

Outputs docs/<slug>/index.html plus assets/search-index.json.
No build step is needed to serve the site; the generated HTML is committed.
"""

import argparse
import html as html_mod
import json
import re
from pathlib import Path

import markdown

REPO = Path(__file__).resolve().parent.parent
DEFAULT_SRC = Path(r"D:\AssetStore_PhotoMode\AssetStore_PhotoMode\docs-site\docs")

SITE_NAME = "DanMaxPublishing"
PRODUCT = "Photo Mode Pro"

# (source file, slug ('' = docs home), sidebar title, group)
NAV = [
    ("index.md", "", "Overview", "Getting started"),
    ("quick-start.md", "quick-start", "Quick Start", "Getting started"),
    ("core-concepts.md", "core-concepts", "Core Concepts", "Getting started"),
    ("how-to/camera.md", "camera", "Camera", "Guides"),
    ("how-to/effects.md", "effects", "Effects & Depth of Field", "Guides"),
    ("how-to/presets.md", "presets", "Presets", "Guides"),
    ("how-to/capture.md", "capture", "Capture", "Guides"),
    ("how-to/events-and-api.md", "events-and-api", "Events & Scripting", "Guides"),
    ("how-to/theming.md", "theming", "Theming the UI", "Guides"),
    ("integrations.md", "integrations", "Integrations", "Reference"),
    ("pipelines.md", "pipelines", "Per-Pipeline Notes", "Reference"),
    ("support-matrix.md", "support-matrix", "Platform & Pipeline Support", "Reference"),
    ("performance.md", "performance", "Performance", "Reference"),
    ("faq.md", "faq", "FAQ", "Help"),
    ("troubleshooting.md", "troubleshooting", "Troubleshooting", "Help"),
    ("changelog.md", "changelog", "Changelog", "Help"),
    ("upgrade-guide.md", "upgrade-guide", "Upgrade Guide", "Help"),
]

# Map source .md paths (as referenced in links) to slugs.
MD_TO_SLUG = {}
for src, slug, _, _ in NAV:
    MD_TO_SLUG[src] = slug
    MD_TO_SLUG[src.split("/")[-1]] = slug  # bare-name links from how-to/ pages

MD_EXTENSIONS = [
    "tables",
    "attr_list",
    "admonition",
    "toc",
    "pymdownx.highlight",
    "pymdownx.superfences",
    "pymdownx.details",
]

MD_CONFIG = {
    "toc": {"permalink": "¶", "toc_depth": "2-3"},
    "pymdownx.highlight": {"css_class": "codehilite", "guess_lang": False},
}


def nav_html(active_slug: str, root: str) -> str:
    groups: dict[str, list] = {}
    for _, slug, title, group in NAV:
        groups.setdefault(group, []).append((slug, title))
    out = []
    for group, items in groups.items():
        lis = []
        for slug, title in items:
            href = f"{root}docs/{slug}/" if slug else f"{root}docs/"
            cur = ' aria-current="page"' if slug == active_slug else ""
            lis.append(f'<li><a href="{href}"{cur}>{title}</a></li>')
        out.append(
            f'<div class="group"><span class="grp">{group}</span>'
            f'<ul>{"".join(lis)}</ul></div>'
        )
    return "".join(out)


def site_chrome_top(title: str, description: str, root: str, active: str) -> str:
    def cur(name: str) -> str:
        return ' aria-current="page"' if name == active else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html_mod.escape(title)}</title>
<meta name="description" content="{html_mod.escape(description)}">
<meta property="og:title" content="{html_mod.escape(title)}">
<meta property="og:description" content="{html_mod.escape(description)}">
<meta property="og:image" content="https://supportdanmax.github.io/photo-mode-pro-docs/assets/img/og-share.jpg">
<meta name="theme-color" content="#060b14">
<link rel="icon" type="image/png" href="{root}assets/img/favicon.png">
<link rel="stylesheet" href="{root}assets/css/site.css">
</head>
<body data-root="{root}">
<a class="skip-link" href="#main">Skip to content</a>
<nav class="site-nav" aria-label="Main">
  <div class="bar">
    <a class="brand" href="{root}"><img src="{root}assets/img/logo-mark.png" alt="" width="30" height="30">DanMax<span class="pub">Publishing</span></a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button>
    <ul class="nav-links">
      <li><a href="{root}photo-mode-pro/"{cur('product')}>Photo Mode Pro</a></li>
      <li><a href="{root}docs/"{cur('docs')}>Docs</a></li>
      <li><a href="{root}roadmap/"{cur('roadmap')}>Roadmap</a></li>
      <li><a href="{root}support/"{cur('support')}>Support</a></li>
      <li><a href="{root}about/"{cur('about')}>About</a></li>
      <li class="nav-cta"><a class="btn btn-primary btn-sm" href="{root}photo-mode-pro/#get" data-store-link>Get Photo Mode Pro</a></li>
    </ul>
  </div>
</nav>
"""


def site_chrome_bottom(root: str) -> str:
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div class="cols">
      <div>
        <h4>DanMaxPublishing</h4>
        <p>Production-grade Unity tools by a solo developer with 10+ years of
        shipped commercial projects. Built, documented and supported like they
        have to survive production — because they do.</p>
      </div>
      <div>
        <h4>Product</h4>
        <ul>
          <li><a href="{root}photo-mode-pro/">Photo Mode Pro</a></li>
          <li><a href="{root}demo/">WebGL demo</a></li>
          <li><a href="{root}photo-mode-pro/#gallery">Screenshots</a></li>
          <li><a href="{root}docs/changelog/">Changelog</a></li>
          <li><a href="{root}roadmap/">Roadmap</a></li>
        </ul>
      </div>
      <div>
        <h4>Documentation</h4>
        <ul>
          <li><a href="{root}docs/quick-start/">Quick Start</a></li>
          <li><a href="{root}docs/faq/">FAQ</a></li>
          <li><a href="{root}docs/troubleshooting/">Troubleshooting</a></li>
          <li><a href="{root}docs/support-matrix/">Support Matrix</a></li>
        </ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          <li><a href="mailto:support.dan.max@gmail.com">Email support</a></li>
          <li><a href="https://github.com/supportdanmax/photo-mode-pro-docs/issues" rel="noopener">GitHub Issues</a></li>
          <li><a href="{root}support/">How to get help</a></li>
        </ul>
      </div>
    </div>
    <p class="fineprint">© <span data-year>2026</span> Dan Max · DanMaxPublishing.
    Demo scene art and audio are CC0 (Quaternius, Kenney, Poly Haven, ambientCG,
    OpenGameArt) — full attributions ship in the package. This site loads no
    external resources and sets no cookies.</p>
  </div>
</footer>
<script src="{root}assets/js/site.js"></script>
</body>
</html>
"""


def rewrite_links(body: str, slug: str) -> str:
    """Rewrite intra-docs .md links to the generated folder URLs."""

    def repl(m: re.Match) -> str:
        href = m.group(2)
        anchor = ""
        if "#" in href:
            href, anchor = href.split("#", 1)
            anchor = "#" + anchor
        clean = href.lstrip("./")
        if clean in MD_TO_SLUG:
            target = MD_TO_SLUG[clean]
            path = f"../{target}/" if target else "../"
            if not slug:  # docs home lives one level up from its children
                path = f"{target}/" if target else "./"
            return f'{m.group(1)}"{path}{anchor}"'
        return m.group(0)

    return re.sub(r'(href=)"([^"#:]+\.md)(#[^"]*)?"',
                  lambda m: repl(m), body)


def extract_toc(body: str) -> list:
    toc = []
    for m in re.finditer(
        r'<h([23]) id="([^"]+)">(.*?)</h\1>', body, flags=re.S
    ):
        level, hid, inner = m.group(1), m.group(2), m.group(3)
        text = re.sub(r"<[^>]+>", "", inner)
        text = text.replace("¶", "").strip()
        toc.append((int(level), hid, text))
    return toc


def strip_tags(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html_mod.unescape(text)).strip()


def build_search_entries(body: str, page_title: str, url: str) -> list:
    """One entry per h2 section plus one for the page lead."""
    entries = []
    parts = re.split(r'(<h2 id="[^"]+">.*?</h2>)', body, flags=re.S)
    lead = strip_tags(parts[0])[:400]
    if lead:
        entries.append({"t": page_title, "s": PRODUCT + " docs", "u": url, "b": lead})
    for i in range(1, len(parts), 2):
        m = re.match(r'<h2 id="([^"]+)">(.*?)</h2>', parts[i], flags=re.S)
        if not m:
            continue
        hid = m.group(1)
        heading = strip_tags(m.group(2)).replace("¶", "").strip()
        section_body = strip_tags(parts[i + 1] if i + 1 < len(parts) else "")[:400]
        entries.append(
            {"t": heading, "s": page_title, "u": f"{url}#{hid}", "b": section_body}
        )
    return entries


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", type=Path, default=DEFAULT_SRC)
    args = parser.parse_args()

    search_index = []
    flat = NAV

    for i, (src_rel, slug, title, group) in enumerate(flat):
        src = args.src / src_rel
        text = src.read_text(encoding="utf-8")

        md = markdown.Markdown(extensions=MD_EXTENSIONS, extension_configs=MD_CONFIG)
        body = md.convert(text)

        # First h1 becomes the page heading; lift it out of the body.
        h1 = title
        m = re.search(r"<h1[^>]*>(.*?)</h1>", body, flags=re.S)
        if m:
            h1 = strip_tags(m.group(1)).replace("¶", "").strip()
            body = body.replace(m.group(0), "", 1)

        body = rewrite_links(body, slug)
        body = body.replace("<table>", '<div class="table-scroll"><table>')
        body = body.replace("</table>", "</table></div>")

        root = "../" if not slug else "../../"
        url = "docs/" if not slug else f"docs/{slug}/"

        desc_m = re.search(r"<p>(.*?)</p>", body, flags=re.S)
        description = (strip_tags(desc_m.group(1))[:158] if desc_m else
                       f"{PRODUCT} documentation — {h1}.")

        toc = extract_toc(body)
        toc_html = ""
        if len(toc) >= 2:
            items = "".join(
                f'<li class="h{lv}"><a href="#{hid}">{html_mod.escape(txt)}</a></li>'
                for lv, hid, txt in toc
            )
            toc_html = (
                '<aside class="docs-toc" aria-label="On this page">'
                f'<span class="grp">On this page</span><ul>{items}</ul></aside>'
            )

        prev_html = next_html = ""
        if i > 0:
            p_slug, p_title = flat[i - 1][1], flat[i - 1][2]
            p_href = f"{root}docs/{p_slug}/" if p_slug else f"{root}docs/"
            prev_html = (f'<a class="prev" href="{p_href}">'
                         f'<span class="dir">Previous</span>{p_title}</a>')
        if i < len(flat) - 1:
            n_slug, n_title = flat[i + 1][1], flat[i + 1][2]
            n_href = f"{root}docs/{n_slug}/"
            next_html = (f'<a class="next" href="{n_href}">'
                         f'<span class="dir">Next</span>{n_title}</a>')
        pager = (f'<nav class="docs-pager" aria-label="Docs pages">'
                 f"{prev_html}{next_html}</nav>") if (prev_html or next_html) else ""

        page_title = (f"{h1} — {PRODUCT} Documentation" if slug
                      else f"{PRODUCT} Documentation")

        html_out = site_chrome_top(page_title, description, root, "docs")
        html_out += f"""<div class="docs-shell">
  <aside class="docs-sidebar" aria-label="Documentation">
    <div class="docs-search">
      <svg class="mag" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" placeholder="Search docs…" aria-label="Search documentation">
      <div class="results" role="listbox"></div>
    </div>
    {nav_html(slug, root)}
  </aside>
  <main class="docs-article" id="main">
    <p class="crumbs"><a href="{root}">Home</a> / <a href="{root}docs/">Docs</a> / {group}</p>
    <h1>{html_mod.escape(h1)}</h1>
{body}
{pager}
  </main>
  {toc_html}
</div>
"""
        html_out += site_chrome_bottom(root)

        out_dir = REPO / "docs" / slug if slug else REPO / "docs"
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(html_out, encoding="utf-8")

        search_index.extend(build_search_entries(body, h1, url))
        print(f"built docs/{slug or ''} ({len(body)} bytes)")

    (REPO / "assets" / "search-index.json").write_text(
        json.dumps(search_index, ensure_ascii=False), encoding="utf-8"
    )
    print(f"search index: {len(search_index)} entries")


if __name__ == "__main__":
    main()
