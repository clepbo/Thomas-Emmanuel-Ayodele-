# Thomas Emmanuel Ayodele — portfolio

Portfolio site for **Thomas Emmanuel Ayodele** (TEA Studios, [@teastudios_](https://www.instagram.com/teastudios_/)), brand designer and illustrator, Nigeria.

**Live: https://clepbo.github.io/Thomas-Emmanuel-Ayodele-/**

Static HTML, CSS and vanilla JavaScript. No framework, no bundler, no npm dependency at runtime — the files in the repository root *are* the site. The only build step is copying the publishable ones into `_site/`.

---

## Status

| | |
|---|---|
| **Site** | Live and complete. 13 case studies, 5 static pages. |
| **Deployment** | Working, from the `gh-pages` branch. |
| **Content** | All 13 projects are real work. Nothing is invented — see [Content honesty](#content-honesty). |
| **Logo** | Real TEA wordmark, in all four places it appears. |
| **Audits** | 19 pages × 5 widths clean, plus interaction, reduced-motion and no-JS passes. |

### What's left

1. **The contact form tells visitors it sent, and it didn't.** `handleSubmit` in `contact.html` calls `preventDefault()`, fades the form out and shows a success message — there is no backend and no request. Anyone who fills it in believes they have reached him. This should be wired to a form service or the success message removed; of everything on this list it is the only one that actively misleads. See [Contact form](#contact-form).
2. **Per-project write-ups.** The case studies currently run on the briefs from Thomas's own slides — accurate but short. Longer narrative copy would be the single biggest improvement. Drop it into the `body:` array of any project in `content.js`.
3. **The journal has no content.** `journal.html` shows an honest empty state and `article.html` is a working template with nothing behind it. Either write posts or delete both pages and the Journal nav link.
4. **`wordpress-advisory.html`** documents a WordPress port of an earlier version. It's stale — it still describes the serif wordmark markup and carries two hard-coded values from the retired gold palette. It's a standalone reference doc, linked from nowhere. Update or delete.
5. **The commit email `oniokikijesu04@gmail.com` is visible in the public git history.** Rewriting history would remove it, at the cost of changing every commit SHA.
6. **`assets/projects/new/`** is a staging folder with no project behind it. Either promote it to a project or remove it.

---

## Layout

```
index.html          Home — hero mosaic + work list, built from TEA_CONTENT
work.html           All 13 projects, filterable by discipline
project.html        Case-study template, addressed as project.html?p=<slug>
about.html          Bio, disciplines, portrait
contact.html        Contact form (front-end only — see Contact form below)
journal.html        Empty state
article.html        Article template, addressed as article.html?a=<slug>
wordpress-advisory.html   Stale standalone doc, linked from nowhere

shared.css          Every global style and the whole motion layer's CSS
shared.js           The motion layer — one IIFE, no dependencies
content.js          All 13 projects as data. The only file content lives in.

assets/img/         194 generated WebP variants + the logo + manifest.json
assets/images/      Portrait variants and originals
assets/projects/    Full-size originals, one folder per project (not deployed)
assets/Logo/        Supplied logo artwork (not deployed)

tools/              Build and check scripts — see Tools
.github/workflows/gh-pages.yml   The one and only publisher
```

`shared.css` and `shared.js` are loaded by every page; each page then carries its own `<style>` and `<script>` blocks for what is specific to it.

---

## Content

`content.js` is the single source of truth. It defines `window.TEA_CONTENT`, and `index.html`, `work.html` and `project.html` all render from it. Adding, reordering or removing a project is a `content.js` edit — no page markup changes.

A project looks like this:

```js
{
  slug: 'herome',                     // URL: project.html?p=herome
  name: 'Herome',
  display: 'Here<i>me</i>',           // the <i> is the accent-coloured half
  tagline: 'Fashion and beauty, built on a mark that stacks',
  sector: 'Fashion & Beauty',
  discipline: 'Brand Identity',
  year: '2022',
  tags: ['Brand Identity', 'Logo Design'],   // drives the work.html filters
  imgs: 8,                            // how many shots to render
  feature: true,                      // first 5 fill the home mosaic
  palette: [ { hex: '#711416', name: 'Maroon Red' }, ... ],
  body: [ 'paragraph', 'paragraph' ]
}
```

Two fields carry load beyond their own project:

- **`feature: true`** — the first five featured projects fill the home hero mosaic, in array order. Reorder the array to reorder the mosaic.
- **`imgs`** — how many shots the case study asks for, *and* what `tools/build-images.py` generates. Raising it without re-running the image build produces 404s.

### Content honesty

`content.js` opens with a comment recording the rule, and it is not decoration:

> Every project here is real work by Thomas Emmanuel Ayodele.

Palettes are read off his own colour slides. Briefs are quoted from those slides verbatim. There are no invented metrics, client names, testimonials or quotes anywhere on this site.

This rule exists because it was broken. An early version of this site showed projects taken from a reference video as if they were his, alongside a testimonials section, an experience history and journal articles that were written for the site rather than reported. All of it was removed in [#6](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/6). Anything added from here needs to have come from him.

---

## Images

Sources live in `assets/projects/<Project Name>/`. The generated variants the site actually loads live in `assets/img/`, named `<slug>-<n>-<width>.webp`.

```bash
python3 tools/build-images.py            # regenerate from the originals
python3 tools/build-images.py --dry-run  # list without writing
python3 tools/build-images.py --all      # every shot, ignoring imgs: counts
```

Three things about it are worth knowing before you run it:

- **Order is filename order.** `<slug>-1` is the first file alphabetically, and it becomes that project's card image and case-study hero. Renaming a source file reshuffles the set.
- **Count comes from `content.js`.** Several folders hold more shots than the case study shows; generating the rest would put megabytes into every deploy that nothing requests. Use `--all` when choosing which to keep, then set `imgs:` and re-run without it.
- **Nothing is upscaled.** Widths are 600 and 1080, but a source narrower than 1080 only gets the variants it can fill — which is why `srcset` must never assume a 1080 exists. Requesting one that was never generated is how an earlier version 404'd.

`assets/projects/` is deliberately **not deployed** — 6.6MB of originals nothing on the site requests.

---

## Deployment

Push to `main`. `.github/workflows/gh-pages.yml` stages the site with `tools/build-site.sh` and force-pushes it to the `gh-pages` branch; GitHub's branch-based Pages builder serves it. Roughly 6–8 minutes from merge to live.

Pages **Source** is set to *Deploy from a branch* → `gh-pages` → `/ (root)`.

### The one rule

**One publisher, matching the configured Source. Never two.**

GitHub Pages allows one deployment at a time per repository. This repo used to have two publishing workflows — an Actions-pipeline one (`pages.yml`) and this branch one. Once Source was switched to the branch, `pages.yml` still fired on every push to `main`, took the deployment lock, and — because its route no longer matched the configured Source — never completed, holding the lock for its full ten-minute timeout. The branch deployment that would have worked was refused three seconds after it started:

```
Failed to create deployment (status: 400) ... due to in progress deployment.
Please cancel <main sha> first or wait for it to complete.
```

Five consecutive deploys failed this way and were misdiagnosed as a GitHub-side queue backlog. They weren't; they were queued behind each other. Deleting `pages.yml` ([#11](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/11)) fixed it on the next run.

If Source is ever switched back to *GitHub Actions*, delete `gh-pages.yml` in the same change.

### Other deployment facts learned the hard way

- `actions/deploy-pages` caps its `timeout` input at **600000ms**. Anything larger is silently clamped, with only a warning well above the eventual error. Raising it does nothing.
- `enablement: true` on `actions/configure-pages` cannot work from a workflow. Creating a Pages site is `POST /repos/{owner}/{repo}/pages`, which rejects `GITHUB_TOKEN` (a GitHub App installation token) with `Resource not accessible by integration`. `pages: write` covers *deploying to* a site, not *creating* one. Enabling Pages is a one-time manual settings change.
- A `deployment_queued` that never resolves is almost never a GitHub incident. Read the next run's error before theorising — the 400 above names exactly what holds the lock.

---

## Tools

```
tools/build-site.sh          Stage the publishable files into _site/
tools/build-images.py        Generate assets/img/ from assets/projects/
tools/build-single-file.py   Flatten the whole site into one HTML file
tools/audit.mjs              The site check — 19 pages x 5 widths
tools/bundle-audit.mjs       The same idea, against the single-file build
tools/mirror.sh              Pull the deployed site down for auditing
```

### Checks

```bash
cd tools && npm install          # playwright, once

# serve the repo, then audit it
python3 -m http.server 8899 &
cd tools && npm run audit
```

`audit.mjs` drives Chromium over every page at 320 / 390 / 820 / 1280 / 1600, and checks for: horizontal overflow, resolved background colour, `body.loaded` ever being set, reveals stuck off-screen, an empty `main`, `h1` count, fixed-position elements inside `main`, `main` starting at the top of the page, broken images, console errors and 404s. It then runs interaction, reduced-motion and JS-disabled passes.

Every check in it exists because that bug shipped once. It is worth running before any merge.

To audit **what is actually deployed** rather than your working copy:

```bash
tools/mirror.sh                                  # curl the live site into .livemirror/
python3 -m http.server 8901 --directory .livemirror &
cd tools && AUDIT_BASE=http://localhost:8901/ npm run audit
```

Set `CHROMIUM=/path/to/chrome` to use a system browser instead of Playwright's own.

### Single-file build

```bash
python3 tools/build-single-file.py     # -> dist/tea-portfolio.html (~3MB)
```

Flattens all six page types into one self-contained HTML file: fonts, CSS, JS and every image inlined as data URIs, navigation replaced by a client-side section swap. Built for sharing a preview where external requests are blocked.

It leans on one extension point in `shared.js`: if a host defines `window.TEA_NAVIGATE`, it takes over once the transition curtain has closed. The default path is untouched.

Two things it has to do that aren't obvious:

- **Page scripts run before `shared.js`.** They build their markup out of `TEA_CONTENT`, and the reveal observer only ever sees the `.r` elements present at init. Injected afterwards, every one of them would sit at `opacity: 0` forever.
- **The wordmark's `srcset` is stripped and its `src` inlined.** Relative paths resolve to nothing in a file with no origin.

---

## The motion layer

`shared.js` is one IIFE with no dependencies. Everything in it is progressive enhancement: with JavaScript off the site still reads, navigates and submits.

Loader and page-transition curtain · custom cursor with directional stretch · scroll progress · retracting top nav · floating pill dock · scroll reveals with auto-stagger · split-text headings · eased counters · magnetic buttons · text scramble · parallax · scroll-reactive marquee · card tilt · cursor spotlight · work-list image peek · role ticker.

All per-frame work shares **one** `requestAnimationFrame` loop and one sampled scroll position, rather than each effect running its own.

`prefers-reduced-motion` is honoured throughout, and hover-only effects switch off on touch and coarse pointers.

### Traps in here

- **`nav` must be selected as `body > nav`.** A bare `nav` selector also catches the in-page prev/next navigation on case studies and pins it over their hero.
- **The reveal observer uses `threshold: 0`,** not a percentage. The work grid on a 390px screen is several thousand pixels tall and never reaches 7% visibility as it enters — a percentage threshold left it permanently hidden.
- **The transition curtain lives in the markup,** not in JS. Built in JS it arrives too late to cover the first paint.
- **The `.nav-in` flag is set by an inline script at the very top of `<head>`,** before any stylesheet. A pending stylesheet blocks every script after it, so anywhere lower and the incoming page flashes uncovered.

---

## The white-page bugs

The homepage rendered white three separate times, from three unrelated causes. If it ever happens again, it is a fourth thing — these are all fixed.

1. **`@import` at the top of `shared.css`.** A stylesheet is not applied until its `@import` rules resolve, so a slow or blocked `fonts.googleapis.com` held back every rule in the file. Fonts are now requested once per page through a non-blocking `<link>`.
2. **The background lived only on `<body>`, behind a `background` shorthand fed by a custom property.** A body background reaches the canvas only while `<html>` has none of its own, and one invalid custom property invalidates an entire shorthand. Now declared three ways: `color-scheme: dark`, a literal-hex `background-color` on `<html>`, and longhand on `body`.
3. **`#particles` sat at `z-index: 1` with `.hero-right` unpositioned,** so the decorative canvas composited over the hero text and mosaic. The canvas was removed rather than restacked.

---

## Contact form

`contact.html` validates, fades the form out and shows "message sent" — and **sends nothing**. `handleSubmit` calls `preventDefault()` and never makes a request; there is no backend behind it.

That is worse than a missing feature: a visitor who fills it in comes away believing they have contacted him. Either wire it to a form service (Formspree, Basin, a Cloudflare Worker — a few lines in `handleSubmit`), or drop the fake success state and leave the `mailto:` link as the route.

---

## History

| PR | |
|---|---|
| [#1](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/1) | Motion layer, mobile layouts, real portrait |
| [#2](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/2) – [#3](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/3) | Pages enablement, twice misdiagnosed before the real cause |
| [#4](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/4) | White page cause 1 (`@import`); case study and article templates |
| [#5](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/5) | White page cause 2 (canvas background) |
| [#6](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/6) | **Rebuild around the real work.** White page cause 3; fabricated content removed |
| [#7](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/7) – [#8](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/8) | A deploy timeout raise, and its retraction — the input is capped |
| [#9](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/9) | `gh-pages` branch publisher |
| [#10](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/10) | Single-file bundler brought up to the rebuild |
| [#11](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/11) | **The deploy deadlock.** `pages.yml` deleted |
| [#12](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/12) – [#13](https://github.com/clepbo/Thomas-Emmanuel-Ayodele-/pull/13) | Real TEA wordmark, header and dock |
