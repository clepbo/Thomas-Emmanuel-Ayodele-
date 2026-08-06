#!/usr/bin/env python3
"""
Bundle the five-page site into one self-contained HTML file.

The published Artifact runs under a strict CSP that blocks every external
host, so nothing can be linked: fonts, images, CSS and JS all have to be
inlined. Navigation becomes a client-side section swap driven by the
TEA_NAVIGATE hook in shared.js.
"""
import re, base64, pathlib, sys, urllib.request

ROOT  = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / "tools" / ".fontcache"
OUT   = ROOT / "dist" / "tea-portfolio.html"

# Matches the <link> every page uses. Keep the two in step.
FONT_URL = ("https://fonts.googleapis.com/css2?"
            "family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500"
            "&family=Syne:wght@300;400;500;700&family=Syne+Mono&display=swap")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def embedded_fonts():
    """Inline the latin subset of each face as a data URI.

    Google serves one @font-face per subset. Only `latin` is kept: the copy
    is English, and that range already covers the em-dash, middle dot and
    curly quotes the design leans on. Results are cached so repeat builds
    do not re-download 300KB of woff2.
    """
    cached = CACHE / "embedded.css"
    if cached.exists():
        return cached.read_text()

    css = fetch(FONT_URL).decode()
    faces = re.findall(r"/\*\s*([a-z0-9-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S)
    out = []
    for subset, face in faces:
        if subset != "latin":
            continue
        m = re.search(r"src:\s*url\((https://[^)]+\.woff2)\)", face)
        if not m:
            continue
        b64 = base64.b64encode(fetch(m.group(1))).decode()
        face = face.replace(m.group(0),
                            "src:url(data:font/woff2;base64," + b64 + ") format('woff2')")
        out.append(re.sub(r"\s+", " ", face))

    if not out:
        sys.exit("could not resolve any webfonts — check network access")
    CACHE.mkdir(parents=True, exist_ok=True)
    cached.write_text("\n".join(out))
    return cached.read_text()

PAGES = [
    ("index.html",   "Home",    "Thomas Emmanuel Ayodele — Brand Designer & Illustrator"),
    ("work.html",    "Work",    "Work — Thomas Emmanuel Ayodele"),
    ("about.html",   "About",   "About — Thomas Emmanuel Ayodele"),
    ("journal.html", "Journal", "Journal — Thomas Emmanuel Ayodele"),
    ("contact.html", "Contact", "Contact — Thomas Emmanuel Ayodele"),
    # One page div for all thirteen case studies. project.html is already a
    # template driven by ?p=slug, so the bundle keeps a single copy and
    # re-renders it on navigation rather than inlining thirteen near-copies.
    ("project.html", "Project", "Case study — Thomas Emmanuel Ayodele"),
]

def read(p):
    return (ROOT / p).read_text()

def grab(pattern, text, flags=re.S):
    m = re.search(pattern, text, flags)
    if not m:
        raise SystemExit("pattern not found: " + pattern[:60])
    return m.group(1)


# ── assets ────────────────────────────────────────────────────────────
fonts = embedded_fonts()

def data_uri(rel, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode((ROOT / rel).read_bytes()).decode())

# Only the mid-size portrait goes in — three srcset variants would triple
# the payload for a page that is only ever viewed at one size at a time.
portrait = data_uri("assets/images/portrait-900.jpg", "image/jpeg")

shared_css = read("shared.css")
shared_css = shared_css.replace(
    "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Syne:wght@300;400;500;700&family=Syne+Mono&display=swap');",
    "")

shared_js = read("shared.js")


def image_map():
    """Every project shot as a data URI, keyed `<slug>-<n>`.

    Only the 600w variants: in one file there is no viewport-dependent
    fetch to optimise, so carrying the 1080w set too would add 4.3MB for
    an image the bundle would never choose. 2.0MB of WebP becomes ~2.7MB
    of base64, comfortably inside the 16MB page limit.
    """
    entries = []
    for f in sorted((ROOT / "assets" / "img").glob("*-600.webp")):
        key = f.name[: -len("-600.webp")]
        b64 = base64.b64encode(f.read_bytes()).decode()
        entries.append('"%s":"data:image/webp;base64,%s"' % (key, b64))
    if not entries:
        sys.exit("no images found in assets/img — run the image build first")
    return "window.TEA_IMG={%s};" % ",".join(entries)


content_js = read("content.js")

# Point the img() helper at the embedded map instead of the filesystem, and
# drop srcset/sizes with it — every candidate would resolve to the same data
# URI, so the browser would parse three identical multi-KB strings per image
# and gain nothing.
content_js = content_js.replace(
    "const src = a => `assets/img/${slug}-${n}-${a}.webp`;",
    "const src = () => (window.TEA_IMG[slug + '-' + n] || '');")
content_js = content_js.replace(
    """    return `<img class="${cls || ''}" src="${src(600)}" ` +
           `srcset="${W.map(w => src(w) + ' ' + w + 'w').join(', ')}" ` +
           `sizes="${sizes}" alt="" ` +
           `loading="${eager ? 'eager' : 'lazy'}" decoding="async" ` +
           `${eager ? 'fetchpriority="high"' : ''}>`;""",
    """    return `<img class="${cls || ''}" src="${src()}" alt="" ` +
           `loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;""")

if "TEA_IMG" not in content_js:
    sys.exit("could not rewrite the img() helper in content.js — it has moved")


# ── per-page pieces ───────────────────────────────────────────────────
page_css, page_html, page_js = [], [], []

for fname, _label, title in PAGES:
    src = read(fname)
    slug = fname.replace(".html", "")

    page_css.append("/* ── %s ── */\n%s" % (fname, grab(r"<style>(.*?)</style>", src)))

    # project.html's is `<main id="cs-root">`, so match attributes too.
    main = grab(r"(<main\b[^>]*>.*?</main>)", src)
    # The <picture> srcset points at files that will not exist in a single
    # file; collapse it to the one embedded image.
    if slug == "about":
        main = re.sub(r"<picture>.*?</picture>",
                      '<img class="portrait-img" src="%s" '
                      'alt="Thomas Emmanuel Ayodele, brand designer and creative director">' % portrait,
                      main, flags=re.S)

    page_html.append(
        '<div class="pg" id="pg-%s" data-page="%s" data-title="%s">\n%s\n</div>'
        % (slug, fname, title.replace('"', "&quot;"), main))

    # Page-specific behaviour. These blocks build markup out of
    # TEA_CONTENT, so they run BEFORE shared.js in the bundle: the reveal
    # observer only ever sees `.r` elements present at init, and anything
    # injected afterwards would sit at opacity 0 forever.
    for block in re.findall(r'<script>(.*?)</script>', src, re.S):
        if "tea-nav" in block:       # the pre-paint curtain flag; not needed here
            continue
        block = block.strip()
        if slug == "project":
            # Turn the one-shot IIFE into a function the router can call
            # again with a different slug.
            block = block.replace("(function () {",
                                  "window.TEA_RENDER_PROJECT = function (slug) {", 1)
            block = block.replace(
                "  const slug = new URLSearchParams(location.search).get('p');\n", "", 1)
            if not block.endswith("})();"):
                raise SystemExit("project.html script no longer ends in })(); — check it")
            block = block[: -len("})();")] + "};"
            if "TEA_RENDER_PROJECT" not in block:
                raise SystemExit("could not convert project.html's renderer")
        page_js.append("/* ── %s ── */\n%s" % (fname, block))

nav    = grab(r"(<nav>.*?</nav>)", read("index.html"))
footer = grab(r"(<footer>.*?</footer>)", read("index.html"))


# ── router ────────────────────────────────────────────────────────────
ROUTER = r"""
/* ── SINGLE-FILE ROUTER ──────────────────────────────────────────────
   Every page is in the document at once; only one is displayed. Hidden
   pages cost nothing to the observers in shared.js — an element inside
   `display:none` never intersects, so its reveal simply waits until the
   page is shown. */
(function () {
  const pages = Array.from(document.querySelectorAll('.pg'));
  const byName = name => document.getElementById('pg-' + name.replace('.html', ''));

  function setActive(name) {
    document.querySelectorAll('.nav-link, .dock-links a, .footer-col a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.endsWith('.html')) a.classList.toggle('active', href === name);
    });
  }

  function show(name, instant) {
    // Case studies are one page template re-rendered per slug, so they are
    // routed by their query string rather than by element id.
    const q = name.indexOf('?p=');
    const slug = q > -1 ? decodeURIComponent(name.slice(q + 3)) : null;
    const target = byName(slug !== null ? 'project.html' : name);

    if (!target) {
      // Not a page in this bundle. Uncover and hand off to a real
      // navigation rather than sitting behind the curtain.
      document.body.classList.remove('leaving');
      location.href = name;
      return;
    }

    if (slug !== null) window.TEA_RENDER_PROJECT(slug);

    pages.forEach(p => p.classList.toggle('on', p === target));
    document.title = slug !== null ? document.title : target.dataset.title;
    setActive(name);
    window.scrollTo(0, 0);

    const hash = slug !== null
      ? '#project=' + encodeURIComponent(slug)
      : '#' + name.replace('.html', '');
    if (location.hash !== hash) history.pushState({ page: name }, '', hash);

    if (instant) return;

    // Take over the curtain from shared.js and peel it back down.
    const html = document.documentElement;
    html.classList.add('nav-in');
    document.body.classList.remove('leaving');
    requestAnimationFrame(() => {
      html.classList.add('open');
      setTimeout(() => html.classList.remove('nav-in', 'open'), 820);
    });
  }

  window.TEA_NAVIGATE = href => show(href);

  // '#project=herome' -> 'project.html?p=herome'; '#work' -> 'work.html'.
  function fromHash() {
    const h = location.hash.slice(1);
    if (h.indexOf('project=') === 0) return 'project.html?p=' + h.slice(8);
    return (h || 'index') + '.html';
  }

  window.addEventListener('popstate', () => show(fromHash(), true));

  const start = fromHash();
  show(start.indexOf('?p=') > -1 || byName(start) ? start : 'index.html', true);
})();
"""

BANNER = r"""
/* Preview banner: this bundle is a single file, so tell people where the
   real thing lives rather than letting them wonder why the URL never
   changes. */
(function () {
  const bar = document.createElement('div');
  bar.id = 'preview-note';
  bar.innerHTML = '<span>Live preview — the full multi-page site is in the repository</span>' +
                  '<button type="button" aria-label="Dismiss">&times;</button>';
  document.body.appendChild(bar);
  bar.querySelector('button').addEventListener('click', () => bar.remove());
  setTimeout(() => bar.classList.add('on'), 2600);
})();
"""

EXTRA_CSS = r"""
/* ── SINGLE-FILE SHELL ── */
.pg{display:none}
.pg.on{display:block}

/* Bottom-left: clear of the top bar and of the centre-anchored dock, and
   borrowing the dock's own pill shape, mono face and gold hairline so it
   reads as part of the site rather than as browser chrome. */
#preview-note{position:fixed;left:24px;bottom:26px;z-index:8500;display:flex;align-items:center;gap:10px;
  transform:translateY(14px);opacity:0;transition:opacity .5s var(--ease),transform .6s var(--ease3);
  background:rgba(22,22,22,.88);backdrop-filter:blur(16px);border:1px solid rgba(218,213,202,.2);
  border-radius:100px;padding:8px 8px 8px 18px;font-family:var(--mono);font-size:9px;
  letter-spacing:.14em;text-transform:uppercase;color:var(--muted2);pointer-events:none;
  max-width:calc(100vw - 48px)}
#preview-note.on{opacity:1;transform:translateY(0);pointer-events:auto}
#preview-note span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#preview-note button{background:none;border:none;color:var(--muted2);font-size:15px;line-height:1;
  padding:3px 9px;border-radius:100px;transition:color .2s,background .2s;flex-shrink:0}
#preview-note button:hover{color:var(--off);background:rgba(255,255,255,.07)}
#preview-note button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
@media (max-width:760px){
  /* The dock owns the bottom centre on small screens, so sit above it */
  #preview-note{left:12px;right:12px;bottom:74px;max-width:none;justify-content:space-between;
    font-size:8px;letter-spacing:.1em;padding:7px 7px 7px 14px}
}
"""

# The Artifact host supplies <!doctype>, <html>, <head> and <body>, so the
# file is a fragment: title, styles, markup, scripts — nothing more.
doc = """<title>Thomas Emmanuel Ayodele — Brand Designer &amp; Illustrator</title>
<style>
/* ═══ EMBEDDED WEBFONTS (latin subset) ═══
   The Artifact CSP blocks font CDNs, so the faces are inlined as data URIs
   rather than linked — otherwise the page would silently fall back to
   Georgia and lose most of its character. */
{fonts}
/* ═══ SHARED ═══ */
{shared_css}
{extra_css}
/* ═══ PAGES ═══ */
{page_css}
</style>

<div id="curtain" aria-hidden="true"><div class="curtain-mark">T<i>EA</i></div></div>
<div id="loader"><div class="loader-monogram">T<i>EA</i></div><div class="loader-bar-wrap"><div class="loader-bar"></div></div><div class="loader-text">Loading Portfolio</div></div>
<div id="cur"></div><div id="cur-ring"></div>

{nav}

{pages}

{footer}

<script>
{images}
</script>
<script>
{content_js}
</script>
<script>
{page_js}
</script>
<script>
{shared_js}
</script>
<script>
{router}
{banner}
</script>
""".format(
    fonts=fonts,
    images=image_map(),
    content_js=content_js,
    shared_css=shared_css,
    extra_css=EXTRA_CSS,
    page_css="\n\n".join(page_css),
    nav=nav,
    pages="\n\n".join(page_html),
    footer=footer,
    shared_js=shared_js,
    router=ROUTER,
    banner=BANNER,
    page_js="\n\n".join(page_js),
)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(doc)
print("wrote %s  (%.0f KB)" % (OUT.relative_to(ROOT), len(doc.encode()) / 1024))
