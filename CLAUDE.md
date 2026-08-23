# Working notes

Read `README.md` first — it covers the layout, the content model, the image
pipeline, deployment and the full list of what's outstanding. This file is
only the things that are easy to get wrong here.

## Hard rules

**Nothing goes on this site as Thomas's work unless it came from Thomas.**
No invented metrics, clients, testimonials, quotes or career history. This
is not a style preference — an early version of this site showed another
designer's projects as his, next to testimonials and journal articles that
were written rather than reported, and it took a rebuild to remove. If a
page needs copy that doesn't exist yet, leave an honest empty state and say
so, the way `journal.html` does.

**One Pages publisher, matching the configured Source. Never two.** Pages
allows one deployment at a time per repository; a second workflow takes the
lock, cannot finish, and blocks the one that would have worked. Source is
currently the `gh-pages` branch, so `gh-pages.yml` is the only publisher.
Adding an Actions-pipeline workflow alongside it breaks deployment
completely — that failure mode cost five consecutive deploys and a wrong
diagnosis. README → Deployment has the error text.

**Run the audit before merging.** `cd tools && npm install` once, then serve
the repo and `npm run audit`. Every check in `tools/audit.mjs` is there
because that exact bug shipped once.

## Where things live

- **Content is `content.js`** — all 13 projects, as data. `index.html`,
  `work.html` and `project.html` render from it. Adding or reordering a
  project is a `content.js` edit; no page markup changes.
- **The wordmark appears in four places**, and one of them is not in any
  HTML file: the mobile dock is built by `shared.js`. A sweep over `*.html`
  will miss it, which is how the site once shipped with the real mark in the
  header and a placeholder in the dock. The dock uses the *dark* cut, since
  its pill is filled bone.
- **`assets/projects/` is source, `assets/img/` is output.** Regenerate with
  `tools/build-images.py`; don't hand-edit `assets/img/`.

## Things that will bite

- **`body > nav`, never bare `nav`.** A bare selector also catches the
  in-page prev/next nav on case studies and pins it over their own hero.
- **Reveals use `threshold: 0`.** The work grid on a 390px screen is several
  thousand pixels tall and never reaches a percentage threshold as it
  enters. Raising it hides the grid on phones.
- **Content injected after `shared.js` never reveals.** The observer only
  sees the `.r` elements present at init. Anything built from `TEA_CONTENT`
  must run before `shared.js`, not after.
- **`srcset` must not assume a 1080 variant exists.** Sources narrower than
  1080 are never upscaled, so some projects only have 600.
- **`actions/deploy-pages` caps `timeout` at 600000ms** and silently clamps
  anything larger. Raising it does nothing.
- **The white page has had three separate causes**, all fixed and all
  documented in README → The white-page bugs. If it recurs it's a fourth
  thing; check the resolved `background-color` and the z-index of anything
  overlaying the hero before assuming it's one of the old ones.

## After changing the site

If `dist/tea-portfolio.html` is being kept current, rebuild it with
`tools/build-single-file.py` and check it with `tools/bundle-audit.mjs` —
the bundler inlines and rewrites paths, so markup changes can break it while
the site itself is fine.
