/* ══════════════════════════════════════════════════════════════════════
   TEA — motion & interaction layer
   Every behaviour here is an enhancement. If this file fails to load the
   site still reads, navigates and submits correctly.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const html = document.documentElement;
  const body = document.body;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse  = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const fancy   = !reduced && !coarse;   // pointer-driven flourishes
  const motion  = !reduced;              // scroll-driven motion

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* One shared rAF loop. Everything that needs a per-frame tick registers
     here rather than starting its own — cheaper, and it keeps the ordering
     of reads and writes predictable. */
  const ticks = [];
  const onTick = fn => ticks.push(fn);
  let lastT = performance.now();
  (function frame(now) {
    const dt = Math.min(64, now - lastT) / 16.667; // in ~60fps units
    lastT = now;
    for (let i = 0; i < ticks.length; i++) ticks[i](dt, now);
    requestAnimationFrame(frame);
  })(lastT);

  /* Scroll position and velocity, sampled once per frame and shared. */
  const scroll = { y: window.scrollY, v: 0, dir: 1 };
  onTick(() => {
    const y = window.scrollY;
    scroll.v = lerp(scroll.v, y - scroll.y, 0.35);
    if (Math.abs(y - scroll.y) > 0.5) scroll.dir = y > scroll.y ? 1 : -1;
    scroll.y = y;
  });

  /* ── LOADER & PAGE TRANSITIONS ───────────────────────────────────────
     The full loader is a first-impression device: it plays once per
     session. Every navigation after that uses the curtain, which wipes up
     on the way out and peels down on the way in. */
  /* The curtain lives in the markup rather than being built here: paired
     with the .nav-in flag set in <head>, it covers the incoming page from
     the very first paint, which is well before this script can run. */
  let curtain = $('#curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.id = 'curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = '<div class="curtain-mark">T<i>EA</i></div>';
    body.insertBefore(curtain, body.firstChild);
  }

  const loader = $('#loader');
  const returning = html.classList.contains('nav-in');

  if (returning) {
    sessionStorage.removeItem('tea-nav');
    // .nav-in is what hides the loader before this script runs. Retiring it
    // below would bring the loader straight back over the page, so retire
    // the loader for good first.
    if (loader) loader.classList.add('done');
    // Force layout so the "closed" state is committed before we open it.
    void curtain.offsetHeight;
    requestAnimationFrame(() => html.classList.add('open'));
    setTimeout(() => html.classList.remove('nav-in', 'open'), 800);
  }

  let introDone = false;

  function finishLoader() {
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    body.classList.add('loaded');
    startIntro();
  }

  if (returning || !loader) {
    body.classList.add('loaded');
    // Wait for the curtain to clear before the hero starts moving.
    setTimeout(startIntro, returning ? 340 : 0);
  } else {
    window.addEventListener('load', () => setTimeout(finishLoader, 900));
    // Never let a slow font or image hold the page hostage.
    setTimeout(finishLoader, 3500);
  }

  if (motion) {
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a');
      if (!a || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== '_self') return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      let url;
      try { url = new URL(a.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      e.preventDefault();
      body.classList.add('leaving');

      /* A host that owns its own routing — a single-page bundle, or a
         framework router — can define TEA_NAVIGATE to take over here. It
         is called once the curtain has finished closing, and is then
         responsible for opening it again. */
      if (typeof window.TEA_NAVIGATE === 'function') {
        setTimeout(() => window.TEA_NAVIGATE(href, a.href), 560);
        return;
      }

      sessionStorage.setItem('tea-nav', '1');
      setTimeout(() => { location.href = a.href; }, 560);
    });
  }

  // Restoring from the back/forward cache would otherwise leave the
  // curtain stuck across the screen.
  window.addEventListener('pageshow', e => {
    if (e.persisted) {
      body.classList.remove('leaving');
      html.classList.remove('nav-in', 'open');
    }
  });

  /* ── CURSOR ──────────────────────────────────────────────────────── */
  if (fancy) {
    const dot  = $('#cur');
    const ring = $('#cur-ring');

    if (dot && ring) {
      const label = document.createElement('div');
      label.id = 'cur-label';
      body.appendChild(label);

      let mx = innerWidth / 2, my = innerHeight / 2;
      let rx = mx, ry = my, px = mx, py = my;
      let idle;

      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
        label.style.left = mx + 'px';
        label.style.top  = (my + 28) + 'px';
        body.classList.remove('cur-idle');
        clearTimeout(idle);
        idle = setTimeout(() => body.classList.add('cur-idle'), 2600);
      }, { passive: true });

      document.addEventListener('mouseleave', () => body.classList.add('cur-idle'));
      document.addEventListener('mouseenter', () => body.classList.remove('cur-idle'));
      document.addEventListener('mousedown', () => {
        body.classList.add('click');
        setTimeout(() => body.classList.remove('click'), 200);
      });

      onTick(() => {
        rx = lerp(rx, mx, 0.16);
        ry = lerp(ry, my, 0.16);
        const vx = rx - px, vy = ry - py;
        px = rx; py = ry;

        // Stretch the ring along its direction of travel.
        const speed = Math.min(Math.hypot(vx, vy), 40);
        const s = speed / 40;
        ring.style.setProperty('--ring-rot', (Math.atan2(vy, vx) * 180 / Math.PI).toFixed(1) + 'deg');
        ring.style.setProperty('--ring-sx', (1 + s * 0.45).toFixed(3));
        ring.style.setProperty('--ring-sy', (1 - s * 0.30).toFixed(3));
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
      });

      // Hover states
      $$('a, button, .work-item, .project-card, .post-card, .skill-card, .testi-card, .exp-row, .mc, input, textarea, select')
        .forEach(el => {
          el.addEventListener('mouseenter', () => body.classList.add('link-hover'));
          el.addEventListener('mouseleave', () => body.classList.remove('link-hover'));
        });

      // Contextual label, e.g. data-cursor="View project"
      $$('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => {
          label.textContent = el.dataset.cursor;
          body.classList.add('cur-label');
        });
        el.addEventListener('mouseleave', () => body.classList.remove('cur-label'));
      });
    }
  } else {
    ['#cur', '#cur-ring'].forEach(s => { const el = $(s); if (el) el.remove(); });
  }

  /* ── SCROLL PROGRESS ─────────────────────────────────────────────── */
  if (motion) {
    const bar = document.createElement('div');
    bar.id = 'progress';
    body.appendChild(bar);
    onTick(() => {
      const max = html.scrollHeight - innerHeight;
      const p = max > 0 ? clamp(scroll.y / max, 0, 1) : 0;
      bar.style.setProperty('--p', p.toFixed(4));
      bar.classList.toggle('on', scroll.y > 60);
    });
  }

  /* ── TOP NAV ─────────────────────────────────────────────────────── */
  const nav = $('body > nav');   // the site header, not a page's own <nav>
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(a => {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });

  /* ── FLOATING DOCK ───────────────────────────────────────────────── */
  (function dock() {
    if (!nav) return;

    const el = document.createElement('div');
    el.className = 'dock';
    el.innerHTML =
      '<a href="index.html" class="dock-brand" aria-label="Home">T<i>EA</i></a>' +
      '<div class="dock-menu">' +
        '<button class="dock-toggle" type="button" aria-expanded="false" aria-controls="dock-links">' +
          '<span>Menu</span><span class="dt-bars" aria-hidden="true"><i></i><i></i></span>' +
        '</button>' +
        '<div class="dock-links" id="dock-links"><div class="dock-links-inner">' +
          '<a href="work.html">Work</a><a href="about.html">About</a>' +
          '<a href="journal.html">Journal</a><a href="contact.html">Contact</a>' +
        '</div></div>' +
      '</div>';
    body.appendChild(el);

    const menu   = $('.dock-menu', el);
    const toggle = $('.dock-toggle', el);
    const links  = $('.dock-links', el);

    $$('a', links).forEach(a => {
      if (a.getAttribute('href') === here) a.classList.add('active');
    });

    // Collapsed links must be unreachable by keyboard, not just invisible.
    let open = false, pinned = false;
    const setOpen = next => {
      open = next;
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      links.setAttribute('aria-hidden', String(!open));
      $$('a', links).forEach(a => { a.tabIndex = open ? 0 : -1; });
    };
    setOpen(false);

    /* Hovering peeks the menu open; clicking pins it so it stays put when the
       pointer wanders off. Without the pin, a click after a hover would read
       as "toggle closed" and the menu would snap shut under the cursor. */
    toggle.addEventListener('click', () => {
      pinned = !pinned;
      setOpen(pinned);
    });
    if (fancy) {
      menu.addEventListener('mouseenter', () => { if (!open) setOpen(true); });
      el.addEventListener('mouseleave', () => { if (!pinned) setOpen(false); });
    }
    /* Deliberately no open-on-focusin: the toggle is a disclosure button, so
       keyboard users press it to open and then Tab into the links. Opening on
       focus would also mean Escape's return-focus-to-toggle instantly
       reopened the menu it had just closed. */
    menu.addEventListener('focusout', e => {
      if (!pinned && !menu.contains(e.relatedTarget)) setOpen(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !open) return;
      pinned = false;
      setOpen(false);
      toggle.focus();
    });
    document.addEventListener('click', e => {
      if (el.contains(e.target)) return;
      pinned = false;
      setOpen(false);
    });

    // The dock takes over once the first screen is behind you; below that
    // threshold the top bar is the navigation.
    let shown = null;
    onTick(() => {
      const past = scroll.y > Math.min(innerHeight * 0.7, 620);
      if (past !== shown) {
        shown = past;
        el.classList.toggle('on', past);
        nav.classList.toggle('retracted', past);
        body.classList.toggle('docked', past);
        if (!past) { pinned = false; setOpen(false); }
      }
      nav.classList.toggle('scrolled', scroll.y > 40);
    });
  })();

  /* ── SCROLL REVEAL ───────────────────────────────────────────────
     Siblings that come into view together are staggered by their position
     in the group, so a grid ripples instead of popping. */
  if (!('IntersectionObserver' in window) || reduced) {
    $$('.r').forEach(el => el.classList.add('on'));
    $$('[data-split]').forEach(el => el.classList.add('split-on'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      const hits = entries.filter(e => e.isIntersecting);
      hits.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      hits.forEach((e, i) => {
        const el = e.target;
        // Respect hand-authored delays; only auto-stagger the rest.
        const authored = /(^|\s)d[1-5](\s|$)/.test(el.className);
        if (!authored && i) el.style.transitionDelay = (i * 0.07).toFixed(2) + 's';
        el.classList.add('on');
        obs.unobserve(el);
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
    $$('.r').forEach(el => io.observe(el));
  }

  /* ── SPLIT-TEXT HEADINGS ─────────────────────────────────────────
     Wrap each word in a mask so it can ride up into place. Element
     children (<i>, <br>, <span>) are walked through, never flattened, so
     the existing styling survives. */
  function splitWords(root) {
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          if (!n.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const mask = document.createElement('span');
            mask.className = 'sw';
            const inner = document.createElement('span');
            inner.className = 'sw-i';
            inner.textContent = part;
            mask.appendChild(inner);
            frag.appendChild(mask);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(root);
    $$('.sw-i', root).forEach((el, i) => {
      el.style.transitionDelay = (i * 0.055).toFixed(3) + 's';
    });
  }

  const ATF = '.hero, .page-hero, .journal-hero, .about-intro, .contact-left';
  const splits = $$('[data-split]');

  if (splits.length && !reduced) {
    splits.forEach(splitWords);
    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.classList.add('split-on');
          obs.unobserve(e.target);
        });
      }, { threshold: 0.15 });
      // Above-the-fold headings wait for the intro sequence instead.
      splits.filter(el => !el.closest(ATF)).forEach(el => sio.observe(el));
    } else {
      splits.forEach(el => el.classList.add('split-on'));
    }
  }

  /* Above-the-fold copy plays as one choreographed run after the loader. */
  function startIntro() {
    if (introDone) return;
    introDone = true;
    splits.filter(el => el.closest(ATF))
          .forEach((el, i) => setTimeout(() => el.classList.add('split-on'), 120 + i * 130));
  }

  /* ── COUNTERS ────────────────────────────────────────────────────
     Eased rather than linear, so the number settles instead of stopping. */
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (reduced) { el.textContent = target; return; }
    const dur = 1500;
    const t0 = performance.now();
    (function step(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    })(t0);
  }

  const counters = $$('[data-count]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          countUp(e.target);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(el => cio.observe(el));
    } else counters.forEach(countUp);
  }

  /* ── MAGNETIC BUTTONS ────────────────────────────────────────────
     Writes CSS custom properties so the pull composes with the hover
     lift instead of overwriting it. */
  if (fancy) {
    $$('.btn-gold, .btn-outline, .nav-btn, .magnetic, .dock-brand, .submit-btn').forEach(btn => {
      let tx = 0, ty = 0, cx = 0, cy = 0, active = false;

      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const strength = Math.min(r.width, 220) * 0.0016 + 0.10;
        tx = (e.clientX - (r.left + r.width / 2)) * strength;
        ty = (e.clientY - (r.top + r.height / 2)) * strength;
        active = true;
      });
      btn.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

      onTick(() => {
        if (!active) return;
        cx = lerp(cx, tx, 0.18);
        cy = lerp(cy, ty, 0.18);
        if (!tx && !ty && Math.abs(cx) < 0.02 && Math.abs(cy) < 0.02) {
          cx = cy = 0; active = false;
        }
        btn.style.setProperty('--mx', cx.toFixed(2) + 'px');
        btn.style.setProperty('--my', cy.toFixed(2) + 'px');
      });
    });
  }

  /* ── TEXT SCRAMBLE ───────────────────────────────────────────────
     Width is pinned before scrambling so the nav never reflows. */
  if (fancy) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $$('[data-scramble]').forEach(el => {
      const orig = el.textContent;
      let timer = null;
      el.addEventListener('mouseenter', () => {
        if (timer) return;
        el.style.display = 'inline-block';
        el.style.minWidth = el.getBoundingClientRect().width + 'px';
        let frame = 0;
        timer = setInterval(() => {
          el.textContent = orig.split('').map((c, i) =>
            c === ' ' ? ' ' : (i < frame / 2 ? orig[i] : chars[(Math.random() * 26) | 0])
          ).join('');
          if (frame++ >= orig.length * 2) {
            el.textContent = orig;
            clearInterval(timer);
            timer = null;
          }
        }, 28);
      });
    });
  }

  /* ── PARALLAX ────────────────────────────────────────────────────
     Offset from each element's own document position, so nothing jumps
     when it first scrolls into view. Uses the standalone `translate`
     property rather than `transform` so it stacks with whatever
     transform the element already carries for layout or hover. */
  if (motion) {
    const layers = $$('[data-parallax]').map(el => ({
      el, speed: parseFloat(el.dataset.parallax) || 0.3, base: 0
    }));
    if (layers.length) {
      const measure = () => layers.forEach(l => {
        l.el.style.translate = '';
        l.base = l.el.getBoundingClientRect().top + window.scrollY;
      });
      measure();
      addEventListener('resize', measure);
      onTick(() => {
        for (const l of layers) {
          const rel = scroll.y + innerHeight - l.base;
          if (rel < -innerHeight || rel > innerHeight * 3) continue;
          l.el.style.translate = '0 ' + (rel * l.speed * 0.12).toFixed(1) + 'px';
        }
      });
    }
  }

  /* ── SCROLL-REACTIVE MARQUEE ─────────────────────────────────────
     The strip drifts on its own, then surges and reverses with the
     scroll — the single detail that most makes a page feel alive. */
  if (motion) {
    $$('.marquee-outer').forEach(outer => {
      const track = $('.marquee-track', outer);
      if (!track) return;
      outer.classList.add('js');

      let x = 0, half = 0, hovering = false;
      const measure = () => { half = track.scrollWidth / 2; };
      measure();
      // Fonts land late and change the width; re-measure once they do.
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
      addEventListener('resize', measure);
      outer.addEventListener('mouseenter', () => { hovering = true; });
      outer.addEventListener('mouseleave', () => { hovering = false; });

      const base = parseFloat(outer.dataset.speed || '0.9');

      onTick(dt => {
        if (!half) { measure(); return; }
        const boost = clamp(scroll.v * 0.9, -26, 26);
        x -= ((hovering ? base * 0.15 : base) + boost) * dt;
        // Wrap in both directions so a hard scroll-up never runs off the end.
        while (x <= -half) x += half;
        while (x > 0) x -= half;
        track.style.setProperty('--mq-x', x.toFixed(2) + 'px');
      });
    });
  }

  /* ── CARD TILT ───────────────────────────────────────────────────
     A few degrees at the corners. Enough to feel responsive, not enough
     to notice as an effect. */
  if (fancy) {
    $$('.project-card, .post-card, .skill-card, .testi-card').forEach(card => {
      card.classList.add('tilt');
      const max = card.classList.contains('skill-card') ? 3 : 4.5;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilting');
        card.style.setProperty('--ty', (px * max).toFixed(2) + 'deg');
        card.style.setProperty('--tx', (-py * max).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilting');
        card.style.setProperty('--tx', '0deg');
        card.style.setProperty('--ty', '0deg');
      });
    });
  }

  /* ── CURSOR SPOTLIGHT ────────────────────────────────────────────── */
  if (fancy) {
    $$('.spot').forEach(sec => {
      sec.addEventListener('mousemove', e => {
        const r = sec.getBoundingClientRect();
        sec.style.setProperty('--sx', (e.clientX - r.left) + 'px');
        sec.style.setProperty('--sy', (e.clientY - r.top) + 'px');
        sec.classList.add('lit');
      });
      sec.addEventListener('mouseleave', () => sec.classList.remove('lit'));
    });
  }

  /* ── WORK-LIST PEEK ──────────────────────────────────────────────
     Hovering a row floats its artwork under the cursor, tipped into the
     direction of travel. */
  if (fancy) {
    const rows = $$('.work-item');
    if (rows.length) {
      const peek = document.createElement('div');
      peek.id = 'peek';
      peek.setAttribute('aria-hidden', 'true');
      body.appendChild(peek);

      let mx = 0, my = 0, cx = 0, cy = 0, live = false;

      rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
          const art = $('.wi-thumb svg', row);
          if (!art) return;
          const clone = art.cloneNode(true);
          clone.removeAttribute('width');
          clone.removeAttribute('height');
          clone.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          peek.replaceChildren(clone);
          peek.classList.add('on');
          live = true;
        });
        row.addEventListener('mouseleave', () => {
          peek.classList.remove('on');
          live = false;
        });
      });

      document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

      onTick(() => {
        if (!live && Math.abs(cx - mx) < 1 && Math.abs(cy - my) < 1) return;
        const prev = cx;
        cx = lerp(cx, mx, 0.12);
        cy = lerp(cy, my, 0.12);
        peek.style.setProperty('--peek-r', clamp((cx - prev) * 0.5, -10, 10).toFixed(2) + 'deg');
        peek.style.left = cx + 'px';
        peek.style.top  = cy + 'px';
      });
    }
  }

  /* ── ROLE TICKER ─────────────────────────────────────────────────
     Cycles the highlighted discipline. Pauses while hovered so it can
     actually be read. */
  (function ticker() {
    const items = $$('.about-role');
    if (items.length < 2 || reduced) return;
    const group = items[0].parentElement;
    group.classList.add('ticker');
    items.forEach(i => i.classList.add('ticker-item'));

    /* Toggles `active`, which the page already styles (gold text, grown dot),
       rather than inventing a second state class for the same idea. */
    let i = Math.max(0, items.findIndex(el => el.classList.contains('active')));
    const paint = () => items.forEach((el, n) => el.classList.toggle('active', n === i));
    paint();

    let paused = false;
    group.addEventListener('mouseenter', () => { paused = true; });
    group.addEventListener('mouseleave', () => { paused = false; });
    items.forEach((el, n) => el.addEventListener('mouseenter', () => { i = n; paint(); }));

    setInterval(() => {
      if (paused || document.hidden) return;
      i = (i + 1) % items.length;
      paint();
    }, 2300);
  })();

  /* ── HERO PARTICLES ──────────────────────────────────────────────
     Gold motes drifting upward, with a light push away from the pointer.
     Sleeps whenever the canvas is off screen or the tab is hidden. */
  (function particles() {
    const canvas = $('#particles');
    if (!canvas) return;
    if (reduced) { canvas.style.display = 'none'; return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, visible = true;
    const pts = [];

    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else addEventListener('resize', resize);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    }

    for (let i = 0; i < 16; i++) {
      pts.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.2 + 0.25,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -Math.random() * 0.16 - 0.04,
        o: Math.random() * 0.22 + 0.05,
        life: Math.random()
      });
    }

    let pmx = -9999, pmy = -9999;
    const host = canvas.parentElement;
    if (fancy && host) {
      host.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        pmx = e.clientX - r.left; pmy = e.clientY - r.top;
      });
      host.addEventListener('mouseleave', () => { pmx = pmy = -9999; });
    }

    onTick(dt => {
      if (!visible || document.hidden || !W) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        // Normalised coords survive resizes without teleporting.
        p.x += (p.vx * dt) / W;
        p.y += (p.vy * dt) / H;
        p.life += 0.0035 * dt;

        if (p.y < -0.02 || p.life > 1) { p.y = 1.02; p.x = Math.random(); p.life = 0; }
        if (p.x < 0) p.x += 1;
        if (p.x > 1) p.x -= 1;

        const ax = p.x * W, ay = p.y * H;
        const dx = ax - pmx, dy = ay - pmy;
        const dist = Math.hypot(dx, dy);
        let ox = 0, oy = 0;
        if (dist < 150) {                       // nudge aside near the pointer
          const f = (1 - dist / 150) * 16;
          ox = (dx / (dist || 1)) * f;
          oy = (dy / (dist || 1)) * f;
        }

        ctx.beginPath();
        ctx.arc(ax + ox, ay + oy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(196,169,107,' + (p.o * Math.sin(p.life * Math.PI)).toFixed(3) + ')';
        ctx.fill();
      }
    });
  })();

  /* ── ANCHOR SCROLL ──────────────────────────────────────────────── */
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const t = document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
})();
