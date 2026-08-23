import { chromium } from 'playwright';

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = pathToFileURL(resolve(ROOT, 'dist/tea-portfolio.html')).href;
const EXE  = process.env.CHROMIUM || undefined;

const problems = [];
const note = (w, m) => problems.push(`${w}: ${m}`);

const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});

for (const s of [{ n: 'ph', w: 390, h: 844, mob: true },
                 { n: 'lp', w: 1280, h: 800, mob: false }]) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h }, hasTouch: s.mob, isMobile: s.mob });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));

  await page.goto(FILE, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const r = await page.evaluate(() => {
    const vis = document.querySelector('.pg.on');
    const imgs = Array.from(vis.querySelectorAll('img'));
    return {
      bg: getComputedStyle(document.body).backgroundColor,
      loaded: document.body.classList.contains('loaded'),
      onPage: vis && vis.id,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      // images that finished loading with no intrinsic size = broken
      broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
      imgCount: imgs.length,
      stuckReveals: Array.from(vis.querySelectorAll('.r'))
        .filter(e => !e.classList.contains('on') && e.getBoundingClientRect().top < 0).length
    };
  });

  if (r.bg === 'rgba(0, 0, 0, 0)' || r.bg === 'rgb(255, 255, 255)') note(s.n, `body bg ${r.bg}`);
  if (!r.loaded) note(s.n, 'body.loaded never set');
  if (r.overflow) note(s.n, 'horizontal overflow');
  if (r.broken) note(s.n, `${r.broken} broken images`);
  if (!r.imgCount) note(s.n, 'home page has no images');
  if (r.stuckReveals) note(s.n, `${r.stuckReveals} reveals stuck off-screen-above`);
  console.log(`${s.n} home:`, JSON.stringify(r));

  // work -> case study -> next project
  await page.evaluate(() => window.TEA_NAVIGATE('work.html'));
  await page.waitForTimeout(1200);
  const work = await page.evaluate(() => {
    const v = document.querySelector('.pg.on');
    return { page: v.id, cards: v.querySelectorAll('.project-card').length,
             imgs: v.querySelectorAll('img').length };
  });
  if (work.cards < 13) note(s.n, `work grid has ${work.cards} cards, expected 13`);
  console.log(`${s.n} work:`, JSON.stringify(work));

  await page.evaluate(() => window.TEA_NAVIGATE('project.html?p=peakfort'));
  await page.waitForTimeout(1400);
  const cs = await page.evaluate(() => {
    const v = document.querySelector('.pg.on');
    return { page: v.id, title: document.title,
             heroImg: !!v.querySelector('img'),
             shots: v.querySelectorAll('.cs-shot, .cs-gal img, img').length,
             hasNav: !!v.querySelector('.cs-nav a'), hash: location.hash };
  });
  if (cs.page !== 'pg-project') note(s.n, `case study did not open (on ${cs.page})`);
  if (!cs.heroImg) note(s.n, 'case study hero image missing');
  if (!cs.hasNav) note(s.n, 'case study prev/next missing');
  console.log(`${s.n} case study:`, JSON.stringify(cs));

  // back to home via the router
  await page.evaluate(() => window.TEA_NAVIGATE('index.html'));
  await page.waitForTimeout(900);
  const back = await page.evaluate(() => document.querySelector('.pg.on').id);
  if (back !== 'pg-index') note(s.n, `nav home landed on ${back}`);

  if (errs.length) note(s.n, `console: ${errs.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

await browser.close();
console.log('\n' + '─'.repeat(60));
if (problems.length) { problems.forEach(p => console.log('  ✗ ' + p)); process.exit(1); }
console.log('BUNDLE CLEAN');
