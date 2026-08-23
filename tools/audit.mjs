import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Point at any origin: a local `python3 -m http.server`, or a mirror of the
// deployed site pulled down by tools/mirror.sh.
const BASE = process.env.AUDIT_BASE || 'http://localhost:8899/';
// Playwright's own resolution unless a system Chromium is named explicitly.
const EXE = process.env.CHROMIUM || undefined;
const OUT = process.env.AUDIT_SHOTS || resolve(ROOT, '.audit-shots');
mkdirSync(OUT, { recursive: true });

const PAGES = [
  'index.html', 'work.html', 'about.html', 'journal.html', 'contact.html',
  'project.html?p=herome', 'project.html?p=peakfort',
  'project.html?p=permanent-voter-s-card', 'project.html?p=tvc',
  'project.html?p=women-watchers', 'project.html?p=emerald-clipz',
  'project.html?p=tonya-smalls', 'project.html?p=effyz-avalon',
  'project.html?p=flex2ride', 'project.html?p=danny-s-foods',
  'project.html?p=footstepz-ng', 'project.html?p=wose-co',
  'project.html?p=petharry-photography',
  'project.html?p=nope'                                  // fallback page
];

const SIZES = [
  { n: 'sm', w: 320, h: 700, mob: true },
  { n: 'ph', w: 390, h: 844, mob: true },
  { n: 'tb', w: 820, h: 1180, mob: true },
  { n: 'lp', w: 1280, h: 800, mob: false },
  { n: 'xl', w: 1600, h: 900, mob: false }
];

const problems = [];
const note = (where, msg) => problems.push(`${where}: ${msg}`);

const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});

for (const s of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h }, hasTouch: s.mob, isMobile: s.mob
  });
  // The font CDN is unreachable from this sandbox; stub so pages reach load.
  await ctx.route('**fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const page = await ctx.newPage();

  const errs = [];
  page.on('pageerror', e => errs.push('JS ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url().replace(BASE, '')); });

  for (const p of PAGES) {
    errs.length = 0;
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const r = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      // elements poking past the viewport that are not deliberately scrollable
      const over = [];
      document.querySelectorAll('main *, footer *, nav *').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.width < 2 || b.height < 2) return;
        if (b.right > innerWidth + 2 || b.left < -2) {
          const p = el.closest('.marquee-outer,.filter-bar,#peek,#curtain,svg');
          if (p) return;
          const c = getComputedStyle(el);
          if (c.overflowX === 'auto' || c.overflowX === 'scroll') return;
          if (c.position === 'absolute' && el.closest('[style*="overflow"],.statement,.page-hero,.cs-hero,.ar-head')) return;
          over.push((el.tagName + '.' + String(el.className).split(' ')[0]).slice(0, 42));
        }
      });
      // unrevealed content that should have shown by now (above the fold)
      const stuck = [...document.querySelectorAll('.r:not(.on)')].filter(el => {
        const b = el.getBoundingClientRect();
        return b.top < innerHeight * 0.85 && b.bottom > 0;
      }).length;
      const emptyMain = (document.querySelector('main')?.textContent || '').trim().length < 40;
      // Nothing inside main should be fixed-position — that is how the
      // case-study prev/next ended up pinned over the hero.
      const pinned = [...document.querySelectorAll('main *')]
        .filter(el => getComputedStyle(el).position === 'fixed')
        .map(el => String(el.className).split(' ')[0]);
      // The first thing in main must actually start at the top of the page.
      const broken = [...document.querySelectorAll('img')]
        .filter(i => i.complete && i.naturalWidth === 0).length;
      const first = document.querySelector('main > *');
      const firstTop = first ? Math.round(first.getBoundingClientRect().top + scrollY) : -1;
      return {
        bg: cs.backgroundColor,
        loaded: document.body.classList.contains('loaded'),
        docOver: document.documentElement.scrollWidth - innerWidth,
        over: [...new Set(over)].slice(0, 3),
        stuck,
        emptyMain,
        title: document.title.slice(0, 30),
        h1: document.querySelectorAll('h1').length,
        pinned: [...new Set(pinned)],
        broken,
        firstTop
      };
    });

    const bad = [];
    if (r.docOver > 1) bad.push(`h-overflow ${r.docOver}px ${r.over.join(',')}`);
    if (r.bg !== 'rgb(8, 8, 8)') bad.push(`bg ${r.bg}`);
    if (!r.loaded) bad.push('never loaded');
    if (r.stuck) bad.push(`${r.stuck} reveals stuck`);
    if (r.emptyMain) bad.push('main empty');
    if (r.h1 !== 1) bad.push(`${r.h1} h1`);
    if (r.pinned.length) bad.push('fixed inside main: ' + r.pinned.join(','));
    if (r.broken) bad.push(r.broken + ' broken images');
    if (r.firstTop > 4) bad.push(`main starts at ${r.firstTop}px`);
    if (errs.length) bad.push(...[...new Set(errs)].slice(0, 3));

    if (bad.length) {
      note(`${s.n} ${p}`, bad.join(' | '));
      console.log(`  ✗ ${s.n.padEnd(3)} ${p.padEnd(46)} ${bad.join(' | ')}`);
    }
    if (s.n === 'ph' || s.n === 'lp') {
      await page.screenshot({ path: `${OUT}/audit-${s.n}-${p.replace(/[^a-z0-9]/gi, '_')}.png` });
    }
  }
  await ctx.close();
}

// ── interaction pass at desktop ────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const page = await ctx.newPage();
  page.on('pageerror', e => note('interaction', 'JS ' + e.message));

  // work card -> case study -> prev/next
  await page.goto(BASE + 'work.html', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.click('a[href="project.html?p=peakfort"]', { force: true });
  await page.waitForURL(/project\.html/, { timeout: 8000 }).catch(() => note('interaction', 'work card did not navigate'));
  await page.waitForTimeout(2000);
  let ok = await page.evaluate(() => ({
    title: document.title.split('—')[0].trim(),
    hasNext: !!document.querySelector('.cs-nav-item.next:not(.empty)'),
    shots: document.querySelectorAll('.cs-shot').length,
    heroImg: (() => { const i = document.querySelector('.cs-hero-art img'); return !!(i && i.naturalWidth > 0); })(),
    swatches: document.querySelectorAll('.cs-sw').length
  }));
  console.log('  work card -> case study:', JSON.stringify(ok));
  if (ok.title !== 'Peakfort') note('interaction', 'wrong case study rendered: ' + ok.title);
  if (!ok.shots || !ok.swatches) note('interaction', 'case study missing gallery/palette');
  if (!ok.heroImg) note('interaction', 'case study hero image broken');

  await page.click('.cs-nav-item.next', { force: true });
  await page.waitForTimeout(2400);
  const nxt = await page.evaluate(() => document.title.split('—')[0].trim());
  console.log('  next project ->', nxt);
  if (nxt !== "Permanent Voter's Card") note('interaction', 'next project wrong: ' + nxt);

  await ctx.close();
}

// ── reduced motion + no-JS ─────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await ctx.route('**fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const page = await ctx.newPage();
  for (const p of ['index.html', 'project.html?p=herome']) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({
      stuck: document.querySelectorAll('.r:not(.on)').length,
      words: document.querySelectorAll('.sw-i').length,
      visible: (document.querySelector('main')?.innerText || '').trim().length > 60
    }));
    if (r.stuck || r.words || !r.visible) note('reduced-motion ' + p, JSON.stringify(r));
  }
  await ctx.close();

  const nojs = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  await nojs.route('**fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const np = await nojs.newPage();
  for (const p of ['index.html', 'work.html']) {
    await np.goto(BASE + p, { waitUntil: 'load' });
    await np.waitForTimeout(7000);   // let the CSS failsafes fire
    const r = await np.evaluate(() => {
      const l = document.getElementById('loader');
      const c = document.getElementById('curtain');
      return { loader: getComputedStyle(l).visibility, curtain: getComputedStyle(c).transform };
    });
    if (r.loader !== 'hidden') note('no-js ' + p, 'loader still covering: ' + JSON.stringify(r));
  }
  await nojs.close();
}

await browser.close();

console.log('\n' + '─'.repeat(60));
if (problems.length) {
  console.log(`AUDIT: ${problems.length} problem(s)`);
  problems.forEach(p => console.log('  • ' + p));
  process.exitCode = 1;
} else {
  console.log('AUDIT CLEAN — ' + PAGES.length + ' pages x ' + SIZES.length + ' widths, plus interaction, reduced-motion and no-JS passes');
}
