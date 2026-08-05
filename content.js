/* ══════════════════════════════════════════════════════════════════════
   TEA — case study and journal content

   project.html and article.html are templates; everything they render
   lives here. Adding a project or an article means adding an entry to one
   of these arrays — no new HTML file, and the previous/next links, the
   related lists and the index pages all pick it up automatically.

   Artwork is inline SVG built from a shared motif library, the same
   approach the rest of the site uses, so a case study needs no photography
   to feel finished.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── MOTIF LIBRARY ──────────────────────────────────────────────────
     Each motif returns SVG markup for a given palette. `w`/`h` set the
     viewBox; the caller sizes the element with CSS. */
  const M = {
    bottles: (c, w, h) => `
      <defs><radialGradient id="g-${c.id}" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stop-color="${c.glow}" stop-opacity=".55"/>
        <stop offset="100%" stop-color="${c.bg}" stop-opacity="0"/>
      </radialGradient></defs>
      <rect width="${w}" height="${h}" fill="${c.bg}"/>
      <ellipse cx="${w * 0.5}" cy="${h * 0.5}" rx="${w * 0.42}" ry="${h * 0.42}" fill="url(#g-${c.id})"/>
      <rect x="${w * 0.29}" y="${h * 0.2}" width="${w * 0.13}" height="${h * 0.62}" rx="${w * 0.065}" fill="${c.dark}" opacity=".92"/>
      <rect x="${w * 0.335}" y="${h * 0.155}" width="${w * 0.04}" height="${h * 0.06}" rx="4" fill="${c.cap}"/>
      <rect x="${w * 0.46}" y="${h * 0.17}" width="${w * 0.15}" height="${h * 0.68}" rx="${w * 0.075}" fill="${c.mid}" opacity=".9"/>
      <rect x="${w * 0.512}" y="${h * 0.12}" width="${w * 0.046}" height="${h * 0.062}" rx="4" fill="${c.cap}"/>
      <text x="${w * 0.355}" y="${h * 0.52}" font-family="Syne Mono,monospace" font-size="${w * 0.022}" fill="rgba(255,255,255,.45)" text-anchor="middle" letter-spacing="2">${c.word}</text>
      <text x="${w * 0.535}" y="${h * 0.54}" font-family="Syne Mono,monospace" font-size="${w * 0.024}" fill="rgba(255,255,255,.6)" text-anchor="middle" letter-spacing="2">${c.word}</text>
      <line x1="${w * 0.2}" y1="${h * 0.86}" x2="${w * 0.8}" y2="${h * 0.86}" stroke="rgba(196,169,107,.22)" stroke-width=".5"/>`,

    pouch: (c, w, h) => `
      <rect width="${w}" height="${h}" fill="${c.bg}"/>
      <ellipse cx="${w * 0.5}" cy="${h * 0.55}" rx="${w * 0.4}" ry="${h * 0.38}" fill="${c.glow}" opacity=".18"/>
      <path d="M${w * 0.28} ${h * 0.3} Q${w * 0.28} ${h * 0.22} ${w * 0.36} ${h * 0.22}
               L${w * 0.64} ${h * 0.22} Q${w * 0.72} ${h * 0.22} ${w * 0.72} ${h * 0.3}
               L${w * 0.75} ${h * 0.82} Q${w * 0.75} ${h * 0.88} ${w * 0.69} ${h * 0.88}
               L${w * 0.31} ${h * 0.88} Q${w * 0.25} ${h * 0.88} ${w * 0.25} ${h * 0.82} Z" fill="${c.mid}" opacity=".92"/>
      <path d="M${w * 0.36} ${h * 0.22} L${w * 0.64} ${h * 0.22} L${w * 0.62} ${h * 0.11}
               Q${w * 0.5} ${h * 0.07} ${w * 0.38} ${h * 0.11} Z" fill="${c.dark}"/>
      <text x="${w * 0.5}" y="${h * 0.44}" font-family="Syne,sans-serif" font-size="${w * 0.05}" font-weight="700" fill="white" text-anchor="middle" letter-spacing="1">${c.word}</text>
      <rect x="${w * 0.34}" y="${h * 0.47}" width="${w * 0.32}" height="1" fill="rgba(255,255,255,.35)"/>
      <text x="${w * 0.5}" y="${h * 0.54}" font-family="Syne Mono,monospace" font-size="${w * 0.026}" fill="rgba(255,255,255,.75)" text-anchor="middle" letter-spacing="1">${c.sub}</text>
      <circle cx="${w * 0.4}" cy="${h * 0.68}" r="${w * 0.028}" fill="${c.accent}" opacity=".7"/>
      <circle cx="${w * 0.5}" cy="${h * 0.65}" r="${w * 0.024}" fill="${c.accent}" opacity=".6"/>
      <circle cx="${w * 0.6}" cy="${h * 0.69}" r="${w * 0.032}" fill="${c.accent}" opacity=".65"/>`,

    cup: (c, w, h) => `
      <defs><radialGradient id="g-${c.id}" cx="42%" cy="55%" r="70%">
        <stop offset="0%" stop-color="${c.glow}" stop-opacity=".45"/>
        <stop offset="100%" stop-color="${c.bg}" stop-opacity="0"/>
      </radialGradient></defs>
      <rect width="${w}" height="${h}" fill="${c.bg}"/>
      <ellipse cx="${w * 0.48}" cy="${h * 0.6}" rx="${w * 0.44}" ry="${h * 0.4}" fill="url(#g-${c.id})"/>
      <ellipse cx="${w * 0.46}" cy="${h * 0.4}" rx="${w * 0.21}" ry="${h * 0.07}" fill="${c.dark}" opacity=".9"/>
      <path d="M${w * 0.25} ${h * 0.4} Q${w * 0.25} ${h * 0.78} ${w * 0.46} ${h * 0.78}
               Q${w * 0.67} ${h * 0.78} ${w * 0.67} ${h * 0.4}" fill="${c.mid}" opacity=".92"/>
      <ellipse cx="${w * 0.46}" cy="${h * 0.4}" rx="${w * 0.21}" ry="${h * 0.07}" fill="${c.light}"/>
      <path d="M${w * 0.67} ${h * 0.5} Q${w * 0.81} ${h * 0.5} ${w * 0.81} ${h * 0.63}
               Q${w * 0.81} ${h * 0.75} ${w * 0.67} ${h * 0.75}" stroke="${c.dark}" stroke-width="${w * 0.045}" fill="none" stroke-linecap="round"/>
      <ellipse cx="${w * 0.46}" cy="${h * 0.81}" rx="${w * 0.29}" ry="${h * 0.09}" fill="${c.dark}" opacity=".75"/>
      <text x="${w * 0.46}" y="${h * 0.63}" font-family="Playfair Display,serif" font-size="${w * 0.05}" font-style="italic" fill="${c.accent}" text-anchor="middle">${c.word}</text>
      <path d="M${w * 0.38} ${h * 0.33} Q${w * 0.36} ${h * 0.25} ${w * 0.38} ${h * 0.19}" stroke="rgba(255,255,255,.16)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M${w * 0.46} ${h * 0.31} Q${w * 0.44} ${h * 0.22} ${w * 0.46} ${h * 0.15}" stroke="rgba(255,255,255,.13)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M${w * 0.54} ${h * 0.33} Q${w * 0.56} ${h * 0.25} ${w * 0.54} ${h * 0.19}" stroke="rgba(255,255,255,.11)" stroke-width="2" fill="none" stroke-linecap="round"/>`,

    letterform: (c, w, h) => `
      <rect width="${w}" height="${h}" fill="${c.bg}"/>
      <text x="${w * 0.06}" y="${h * 0.8}" font-family="Playfair Display,serif" font-size="${h * 0.72}" font-weight="700" fill="rgba(255,255,255,.06)">${c.ghost || 'O'}</text>
      <text x="${w * 0.42}" y="${h * 0.93}" font-family="Playfair Display,serif" font-size="${h * 0.8}" font-weight="700" fill="${c.accent}" opacity=".08">${c.ghost2 || 'X'}</text>
      <circle cx="${w * 0.33}" cy="${h * 0.42}" r="${h * 0.26}" stroke="rgba(255,255,255,.18)" stroke-width="1.5" fill="none"/>
      <circle cx="${w * 0.33}" cy="${h * 0.42}" r="${h * 0.18}" stroke="rgba(255,255,255,.08)" stroke-width="1" fill="none"/>
      <line x1="${w * 0.33 - h * 0.26}" y1="${h * 0.42}" x2="${w * 0.33 + h * 0.26}" y2="${h * 0.42}" stroke="rgba(255,255,255,.12)"/>
      <line x1="${w * 0.33}" y1="${h * 0.16}" x2="${w * 0.33}" y2="${h * 0.68}" stroke="rgba(255,255,255,.12)"/>
      <line x1="${w * 0.33 - h * 0.11}" y1="${h * 0.31}" x2="${w * 0.33 + h * 0.11}" y2="${h * 0.53}" stroke="white" stroke-width="${h * 0.03}" stroke-linecap="round"/>
      <line x1="${w * 0.33 + h * 0.11}" y1="${h * 0.31}" x2="${w * 0.33 - h * 0.11}" y2="${h * 0.53}" stroke="white" stroke-width="${h * 0.03}" stroke-linecap="round"/>`,

    mark: (c, w, h) => `
      <rect width="${w}" height="${h}" fill="${c.bg}"/>
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.36}" stroke="${c.accent}" stroke-opacity=".22" stroke-width="1" fill="none"/>
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.28}" stroke="${c.accent}" stroke-opacity=".1" stroke-width=".5" fill="none"/>
      <text x="${w * 0.5}" y="${h * 0.55}" font-family="Playfair Display,serif" font-size="${Math.min(w, h) * 0.22}" font-weight="700" fill="${c.accent}" fill-opacity=".9" text-anchor="middle">${c.word}</text>
      <text x="${w * 0.5}" y="${h * 0.68}" font-family="Syne Mono,monospace" font-size="${Math.min(w, h) * 0.035}" fill="${c.accent}" fill-opacity=".4" text-anchor="middle" letter-spacing="4">${c.sub}</text>
      <path d="M${w * 0.5 - Math.min(w, h) * 0.46} ${h * 0.5} L${w * 0.5 - Math.min(w, h) * 0.4} ${h * 0.5}" stroke="${c.accent}" stroke-opacity=".4"/>
      <path d="M${w * 0.5 + Math.min(w, h) * 0.4} ${h * 0.5} L${w * 0.5 + Math.min(w, h) * 0.46} ${h * 0.5}" stroke="${c.accent}" stroke-opacity=".4"/>`,

    poster: (c, w, h) => `
      <rect width="${w}" height="${h}" fill="${c.bg}"/>
      <rect x="${w * 0.08}" y="${h * 0.1}" width="${w * 0.84}" height="${h * 0.8}" fill="${c.mid}" opacity=".9"/>
      <text x="${w * 0.5}" y="${h * 0.42}" font-family="Syne,sans-serif" font-size="${w * 0.08}" font-weight="700" fill="${c.light}" text-anchor="middle" letter-spacing="1">${c.word}</text>
      <text x="${w * 0.5}" y="${h * 0.55}" font-family="Syne Mono,monospace" font-size="${w * 0.026}" fill="${c.accent}" text-anchor="middle" letter-spacing="4">${c.sub}</text>
      <rect x="${w * 0.32}" y="${h * 0.62}" width="${w * 0.36}" height="1.5" fill="${c.accent}" opacity=".6"/>
      <circle cx="${w * 0.5}" cy="${h * 0.75}" r="${h * 0.06}" fill="${c.accent}" opacity=".25"/>`,

    /* A specimen sheet: each tile carries a colour band and a code, so it
       reads as a system being documented rather than as filler blocks.
       Deliberately carries no caption of its own — the figure's <figcaption>
       sits over the lower edge. */
    grid: (c, w, h) => {
      const tints = [c.mid, c.dark, c.light, c.glow];
      let cells = '';
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
          const x = w * (0.06 + i * 0.235), y = h * (0.09 + j * 0.26);
          const cw = w * 0.2, ch = h * 0.2;
          const fill = tints[(i + j) % tints.length];
          cells += `
            <rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${c.dark}" opacity=".55"/>
            <rect x="${x}" y="${y}" width="${cw}" height="${ch * 0.32}" fill="${fill}" opacity=".95"/>
            <rect x="${x + cw * 0.1}" y="${y + ch * 0.52}" width="${cw * 0.55}" height="1.5" fill="${c.accent}" opacity=".3"/>
            <rect x="${x + cw * 0.1}" y="${y + ch * 0.68}" width="${cw * 0.34}" height="1.5" fill="${c.accent}" opacity=".18"/>
            <text x="${x + cw * 0.1}" y="${y + ch * 0.92}" font-family="Syne Mono,monospace" font-size="${w * 0.015}" fill="${c.accent}" fill-opacity=".45" letter-spacing="1">0${i + 1}·${j + 1}</text>`;
        }
      }
      return `<rect width="${w}" height="${h}" fill="${c.bg}"/>${cells}`;
    }
  };

  const svg = (motif, colors, w, h) =>
    `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${colors.alt || ''}">${M[motif](colors, w, h)}</svg>`;

  /* ── PROJECTS ─────────────────────────────────────────────────────── */
  const projects = [
    {
      slug: 'type-explorations',
      name: 'Type <i>Explorations</i>',
      plain: 'Type Explorations',
      tagline: 'Letterforms drawn from Yoruba signwriting, rebuilt for screens',
      year: '2024', client: 'Self-initiated', sector: 'Type Design',
      category: 'Type Design · Personal',
      tags: ['Type Design', 'Personal'],
      colors: { id: 'te', bg: '#0a0a12', mid: '#1b1b2e', dark: '#101020', light: '#e8e4db', glow: '#3a3a6a', accent: '#c4a96b', word: 'OXO', sub: '2024', ghost: 'O', ghost2: 'X', alt: 'Letterform construction drawing' },
      motif: 'letterform',
      overview: [
        'A year-long personal study into the lettering painted on shopfronts across Lagos and Benin City — the hand-cut signage that gives a Nigerian street its voice. Most of it has never been digitised, and the versions that have tend to sand off exactly the details that make it worth looking at.',
        'The work started as tracing and ended as construction. Each character was rebuilt from its underlying skeleton rather than copied, which meant the awkward joins and heavy terminals survived the translation to a grid instead of being smoothed into another neutral geometric sans.',
        'The result is a working display face and a set of principles I now bring to client identity work — that a mark can be contemporary and specific to a place at the same time, and that the two are not in tension.'
      ],
      approach: [
        { n: '01', t: 'Field study', d: 'Photographed and catalogued 200+ hand-painted signs, sorted by stroke logic rather than by trade or district.' },
        { n: '02', t: 'Skeleton first', d: 'Rebuilt each character from its underlying construction, so the quirks were structural rather than decorative.' },
        { n: '03', t: 'Stress-testing', d: 'Set at 8px and at 800px, in headline and in paragraph, until the shapes held at both extremes.' }
      ],
      palette: [
        { hex: '#0A0A12', name: 'Ink' }, { hex: '#1B1B2E', name: 'Deep Indigo' },
        { hex: '#C4A96B', name: 'Signwriter Gold' }, { hex: '#E8E4DB', name: 'Paper' }
      ],
      type: { display: 'Playfair Display', body: 'Syne', note: 'A high-contrast serif for the specimen pages against a grotesque with unusually wide apertures — the pairing keeps the drawn letterforms the loudest thing on the page.' },
      stats: [{ num: '200+', label: 'Signs catalogued' }, { num: '68', label: 'Characters drawn' }, { num: '2', label: 'Weights shipped' }],
      sections: [
        { motif: 'letterform', span: 'full', caption: 'Construction drawing — the X with its original signwriter stress retained' },
        { motif: 'grid', span: 'half', caption: 'Specimen sheet, 12 cuts' },
        { motif: 'poster', span: 'half', caption: 'Display setting at poster scale' }
      ]
    },
    {
      slug: 'daba-skincare',
      name: 'DABA <i>Skincare</i>',
      plain: 'DABA Skincare',
      tagline: 'Organic skincare that reads as ritual, not as chemistry',
      year: '2023', client: 'DABA', sector: 'Beauty & Personal Care',
      category: 'Brand Identity · Packaging',
      tags: ['Brand Identity', 'Packaging'],
      colors: { id: 'daba', bg: '#1a0e07', mid: '#7a3a10', dark: '#5c2e0a', light: '#c98a55', cap: '#c4a96b', glow: '#8B4513', accent: '#c4a96b', word: 'DABA', sub: 'ORGANIC SKINCARE', alt: 'DABA bottle range' },
      motif: 'bottles',
      overview: [
        'DABA make small-batch skincare from shea, black soap and cold-pressed oils sourced within a day\'s drive of their studio. They arrived with a good product and packaging that looked like a pharmacy own-brand — clinical in a category where their whole advantage was the opposite.',
        'The identity leans into the ritual rather than the ingredient list. Amber glass, deep browns pulled straight from unrefined shea, and a wordmark with enough weight to survive being embossed on a 30ml bottle at arm\'s length on a shelf.',
        'The system had to stretch across nine SKUs at three sizes without a redesign each time, so the packaging is built as a grid of fixed elements and one variable colour band — the range reads as a family from two metres away and as individual products up close.'
      ],
      approach: [
        { n: '01', t: 'Category audit', d: 'Mapped 40 competitors and found the whole shelf trending clinical-white. The opening was warmth.' },
        { n: '02', t: 'Material-led palette', d: 'Colours sampled from the raw ingredients rather than picked from a swatch book.' },
        { n: '03', t: 'One grid, nine SKUs', d: 'A fixed layout with a single variable band, so new products need no new design work.' }
      ],
      palette: [
        { hex: '#1A0E07', name: 'Raw Shea' }, { hex: '#7A3A10', name: 'Amber Glass' },
        { hex: '#C98A55', name: 'Warm Clay' }, { hex: '#C4A96B', name: 'Brass Foil' }
      ],
      type: { display: 'Playfair Display', body: 'Syne', note: 'The serif carries the ritual; the sans keeps the ingredient panel legible at 6pt, which is where most skincare packaging quietly falls apart.' },
      stats: [{ num: '9', label: 'SKUs designed' }, { num: '3', label: 'Bottle formats' }, { num: '2×', label: 'Shelf conversion' }],
      sections: [
        { motif: 'bottles', span: 'full', caption: 'The core range — 30ml, 100ml and 200ml on the shared grid' },
        { motif: 'grid', span: 'half', caption: 'Colour band system across the nine SKUs' },
        { motif: 'mark', span: 'half', caption: 'Wordmark at embossing scale' }
      ]
    },
    {
      slug: 'mo-food-shrimps',
      name: 'M.O. Food <i>Shrimps</i>',
      plain: 'M.O. Food Shrimps',
      tagline: 'Dried seafood, taken seriously enough to put on a table',
      year: '2022', client: 'M.O. Foods', sector: 'Food & Nutrition',
      category: 'Packaging · 3D · Web',
      tags: ['Packaging', '3D', 'Web'],
      colors: { id: 'mo', bg: '#0d1008', mid: '#c0522a', dark: '#8b3318', light: '#f4e2d4', glow: '#c0522a', accent: '#e8a080', word: 'MOFOOD', sub: 'SMOKED SHRIMP', alt: 'M.O. Food pouch range' },
      motif: 'pouch',
      overview: [
        'Dried shrimp is a staple in half the kitchens in West Africa and is almost always sold from an open sack. M.O. Foods wanted to put it in a bag with a name on it — which meant answering a question the category had never had to answer: what does this look like when it is a product rather than an ingredient?',
        'The packaging borrows from spice and coffee rather than from frozen seafood. A deep red that survives fluorescent supermarket light, a pattern drawn from the shrimp\'s own segmentation, and a window that shows the product because the product is genuinely better than its competitors.',
        'The 3D work came first, not last. Rendering the pouch before printing let us test five gusset heights against real shelf photography and kill the two that made the bag look half-empty.'
      ],
      approach: [
        { n: '01', t: 'Category transplant', d: 'Took cues from speciality coffee and spice, where provenance is the selling point, not from frozen seafood.' },
        { n: '02', t: 'Render before print', d: 'Five structural options tested in 3D against real shelf photography before anything was tooled.' },
        { n: '03', t: 'Show the product', d: 'A die-cut window, because their shrimp genuinely looks better than what it sits next to.' }
      ],
      palette: [
        { hex: '#0D1008', name: 'Smoke' }, { hex: '#C0522A', name: 'Shell Red' },
        { hex: '#E8A080', name: 'Flesh Pink' }, { hex: '#F4E2D4', name: 'Salt' }
      ],
      type: { display: 'Syne', body: 'Syne', note: 'A single family across the range. Packaging this small cannot afford two voices, and Syne\'s heavier weights hold up when reversed out of red.' },
      stats: [{ num: '3', label: 'Pack sizes' }, { num: '5', label: 'Structures tested' }, { num: '1', label: 'Shelf listing won' }],
      sections: [
        { motif: 'pouch', span: 'full', caption: 'The three-pack range in final structure' },
        { motif: 'grid', span: 'half', caption: 'Pattern system drawn from shell segmentation' },
        { motif: 'poster', span: 'half', caption: 'Launch campaign, in-store' }
      ]
    },
    {
      slug: 'sugar-alley',
      name: 'Sugar <i>Alley</i>',
      plain: 'Sugar Alley',
      tagline: 'Fresh desserts deserving of a fresh identity',
      year: '2023', client: 'Sugar Alley', sector: 'Food & Nutrition',
      category: 'Brand Identity',
      tags: ['Brand Identity'],
      colors: { id: 'sa', bg: '#100c07', mid: '#5a3a14', dark: '#3d2508', light: '#6b4418', glow: '#8B6914', accent: '#d4915c', word: 'Sugar Alley', sub: 'FRESHLY BAKED', alt: 'Sugar Alley cup and saucer' },
      motif: 'cup',
      overview: [
        'Sugar Alley bake cinnamon rolls from scratch in Accra and are known well enough locally that people give directions by them. The brief was to build an identity that could travel past the neighbourhood without losing the reason people liked them in the first place.',
        'The mark is a script — hand-drawn, then rebuilt as vectors with the wobble kept in. A perfectly even script would have said "chain"; the one we shipped says "someone made this", which is the entire proposition.',
        'The system runs from a paper bag to a shopfront sign to an Instagram grid. Most of the budget went into the two things customers actually touch: the box and the napkin.'
      ],
      approach: [
        { n: '01', t: 'Draw it by hand', d: 'The script was drawn with a brush before it was ever a vector, and the irregularity was preserved on purpose.' },
        { n: '02', t: 'Spend where it is touched', d: 'Box and napkin took priority over anything that only appears on a screen.' },
        { n: '03', t: 'Build for a second location', d: 'Every asset was specified so a second shop could open without a single new design file.' }
      ],
      palette: [
        { hex: '#100C07', name: 'Roast' }, { hex: '#5A3A14', name: 'Cinnamon' },
        { hex: '#D4915C', name: 'Glaze' }, { hex: '#F5EDE3', name: 'Flour' }
      ],
      type: { display: 'Playfair Display', body: 'Syne', note: 'The custom script does the talking; everything else is deliberately quiet so the menu stays readable in a queue.' },
      stats: [{ num: '1', label: 'Custom script' }, { num: '14', label: 'Assets shipped' }, { num: '2', label: 'Locations opened' }],
      sections: [
        { motif: 'cup', span: 'full', caption: 'The script in use — cup and saucer' },
        { motif: 'mark', span: 'half', caption: 'Roundel lockup for signage' },
        { motif: 'grid', span: 'half', caption: 'Packaging system across formats' }
      ]
    },
    {
      slug: 'buy-chicken',
      name: 'Buy <i>Chicken</i>',
      plain: 'Buy Chicken',
      tagline: 'Poultry retail in an extremely cheeky fashion',
      year: '2022', client: 'BuyChicken', sector: 'Agriculture & Retail',
      category: 'Brand Identity · Copywriting',
      tags: ['Brand Identity', 'Copywriting'],
      colors: { id: 'bc', bg: '#2a0508', mid: '#d92027', dark: '#8f1218', light: '#ffd23f', glow: '#d92027', accent: '#ffd23f', word: 'BUY CHICKEN', sub: 'LET\'S CHICKEN IT', alt: 'BuyChicken brand poster' },
      motif: 'poster',
      overview: [
        'BuyChicken sell live and grilled chicken in Benin City, in a market where every competitor is called some variation of Fresh Farms Poultry Ltd. The name was already the best asset they had — blunt, literal, and slightly funny. The identity\'s job was to not get in its way.',
        'So the work is as much copywriting as design. "Main Chick" and "Side Chick" as portion sizes, "Wahala for who no quick" on the delivery vans, "Let\'s chicken it" as the sign-off. The visual system is deliberately simple — a red you can see from a moving car and a yellow that survives being printed on a plastic bag.',
        'The tone did the heavy lifting. Within a year the phrases were being repeated back by customers in the shop, which is the only brand awareness metric that has ever meant much to me.'
      ],
      approach: [
        { n: '01', t: 'Lead with voice', d: 'The copy was written before the logo. In this category, tone was the only real differentiator available.' },
        { n: '02', t: 'Two colours, no more', d: 'Red and yellow only, chosen for legibility from a moving vehicle and survivability on cheap substrates.' },
        { n: '03', t: 'Write for repetition', d: 'Every line was tested on whether a customer would say it out loud unprompted.' }
      ],
      palette: [
        { hex: '#2A0508', name: 'Char' }, { hex: '#D92027', name: 'Signal Red' },
        { hex: '#FFD23F', name: 'Yolk' }, { hex: '#FFF6E5', name: 'Bone' }
      ],
      type: { display: 'Syne', body: 'Syne', note: 'Heavy weights only, tightly tracked. The brand shouts by design, and a lighter cut would have undercut the copy.' },
      stats: [{ num: '30+', label: 'Lines written' }, { num: '2', label: 'Colours used' }, { num: '4×', label: 'Delivery orders' }],
      sections: [
        { motif: 'poster', span: 'full', caption: 'Campaign poster — "Let\'s chicken it"' },
        { motif: 'grid', span: 'half', caption: 'Social system across nine posts' },
        { motif: 'mark', span: 'half', caption: 'Secondary mark for small applications' }
      ]
    },
    {
      slug: 'logofolio-vol-2',
      name: 'Logofolio <i>Vol. 2</i>',
      plain: 'Logofolio Vol. 2',
      tagline: 'Eighteen months of marks, and what they taught me',
      year: '2022', client: 'Various', sector: 'Multiple',
      category: 'Logo Design',
      tags: ['Logo Design'],
      colors: { id: 'lf', bg: '#0c080f', mid: '#1a1420', dark: '#120d18', light: '#e8e4db', glow: '#2a2035', accent: '#c4a96b', word: 'TEA', sub: 'DESIGN CO.', alt: 'Logofolio mark grid' },
      motif: 'mark',
      overview: [
        'A collected volume of marks drawn between 2021 and 2022 — some shipped, some killed by committee, a few never shown to the client at all. Publishing the rejects alongside the winners is the point: the gap between them is usually smaller and less flattering than a portfolio normally admits.',
        'Reviewing eighteen months of work in one sitting exposed habits I could not see one project at a time. I reach for circular containment far too readily. I over-rely on the same three counter shapes. Both of those are now on a checklist I run before anything goes to a client.',
        'The volume is organised by construction rather than by industry, which makes it far more useful as a reference and far worse as a sales document. That trade was deliberate.'
      ],
      approach: [
        { n: '01', t: 'Show the rejects', d: 'Unused marks are printed at the same size as the shipped ones, with the reason each was killed.' },
        { n: '02', t: 'Sort by construction', d: 'Grouped by how each mark is built rather than by client sector — more useful to a designer, less useful to a buyer.' },
        { n: '03', t: 'Audit the habits', d: 'The review produced a checklist of my own defaults, run against every mark before it leaves the studio.' }
      ],
      palette: [
        { hex: '#0C080F', name: 'Void' }, { hex: '#1A1420', name: 'Plum Black' },
        { hex: '#C4A96B', name: 'Leaf' }, { hex: '#E8E4DB', name: 'Stock' }
      ],
      type: { display: 'Playfair Display', body: 'Syne Mono', note: 'Monospace captions throughout, so the annotation never competes with the marks it is describing.' },
      stats: [{ num: '34', label: 'Marks included' }, { num: '11', label: 'Never shipped' }, { num: '18', label: 'Months covered' }],
      sections: [
        { motif: 'mark', span: 'full', caption: 'Cover mark — TEA Design Co.' },
        { motif: 'grid', span: 'half', caption: 'Marks sorted by construction' },
        { motif: 'letterform', span: 'half', caption: 'Counter-shape study' }
      ]
    }
  ];

  /* ── JOURNAL ──────────────────────────────────────────────────────── */
  const articles = [
    {
      slug: 'great-ideas-great-execution',
      title: 'Great <i>Ideas,</i> Great Execution',
      plain: 'Great Ideas, Great Execution',
      cat: 'Design', date: '15 March 2025', read: '8 min read',
      lead: 'The gap between a good idea and a good execution is where most designers lose the project. Here is how to bridge it with intention rather than hope.',
      colors: { id: 'a1', bg: '#0d0a10', mid: '#1a1520', dark: '#120e16', light: '#e8e4db', glow: '#2a2035', accent: '#c4a96b', word: 'IDEAS', sub: 'EXECUTION', alt: 'Ideas and execution' },
      motif: 'poster',
      body: [
        { t: 'p', v: 'I see a lot of behind-the-scenes posts and before-and-afters, and I keep noticing the same thing: the idea is usually there. The sketch is good. The thinking is sound. And then the final artwork lands and something has gone missing between the two.' },
        { t: 'p', v: 'That gap is not talent. It is a set of habits, and habits can be installed. These are the ones that moved my own work the furthest.' },
        { t: 'h', v: 'Do the research you think you can skip' },
        { t: 'p', v: 'You almost certainly do this already — and you almost certainly stop too early. Looking at a lot of work in the style you are aiming for is not copying; it is calibration. You cannot execute a style you have only seen three examples of. Build the mood board, then keep adding to it after you have started designing, because that is when you finally know what you are looking for.' },
        { t: 'h', v: 'Let the details bother you' },
        { t: 'p', v: 'There is far more balance in design than people admit, and things can feel wrong for reasons you cannot immediately name. A few extra pixels of space on one side. A curve that flattens a fraction too early. Be meticulous, especially with logos — a mark gets scrutinised at sizes nothing else does.' },
        { t: 'quote', v: 'A good eye knows when something is not there yet. High taste is what pulls the work up to meet it.' },
        { t: 'h', v: 'Train your eye harder than your hand' },
        { t: 'p', v: 'It is better to know that you do not know than to think you know when you do not. Taste outruns skill, and that gap is uncomfortable — it is also the engine. Keep working at a thing until the output matches the standard you can already recognise. That discomfort is the job, not a sign you have chosen the wrong one.' },
        { t: 'h', v: 'Spend time on it' },
        { t: 'p', v: 'Sometimes you just need to give yourself longer. Great work takes time, and more time usually means better work. Build the slack into the estimate rather than discovering you needed it at 2am the night before a presentation.' },
        { t: 'h', v: 'Be great at replication' },
        { t: 'p', v: 'Pick great designs by other people and rebuild them exactly as you see them. You will inadvertently learn the decisions they made while designing it — the spacing logic, the curve construction, the reason a weight changes where it does. Give credit, always. But do the exercise.' },
        { t: 'h', v: 'Keep looking, and do not stop' },
        { t: 'p', v: 'Make sure your feed is working for you. The sheer volume of talent out there is not a reason to despair; it is the cheapest education available. Read design reviews too — watching someone articulate why a thing works reshapes how you think about your own decisions.' },
        { t: 'p', v: 'None of this is novel. You have probably heard most of it. The difference is whether it is on a checklist you actually run, or a set of things you agree with in principle and skip under deadline.' }
      ],
      tags: ['Craft', 'Process']
    },
    {
      slug: 'champion-locale-to-world-class',
      title: 'Champion Locale to <i>World Class</i>',
      plain: 'Champion Locale to World Class',
      cat: 'Career', date: '02 January 2025', read: '6 min read',
      lead: 'Practical, honest and fairly random notes on how a Nigerian designer can climb past mediocrity and hit a world-class standard of craft.',
      colors: { id: 'a2', bg: '#06201c', mid: '#0d3a32', dark: '#082722', light: '#7fe3c8', glow: '#0d5a4a', accent: '#7fe3c8', word: 'WORLD CLASS', sub: 'CRAFT', alt: 'World class craft' },
      motif: 'poster',
      body: [
        { t: 'p', v: 'There is a ceiling that a lot of designers here hit and mistake for the top. It is the point where you are comfortably better than the people around you, work arrives without you chasing it, and nobody in your immediate market is pushing you. It is a genuinely nice place to be, and it is where most careers quietly stop.' },
        { t: 'h', v: 'Change who you compare yourself to' },
        { t: 'p', v: 'If your benchmark is the studio across town, your ceiling is the studio across town. Pick people whose work makes you slightly uncomfortable, wherever they are, and measure against them instead. It stings for about a month and then it becomes the most useful thing you have done.' },
        { t: 'h', v: 'Stop hiding the process' },
        { t: 'p', v: 'The work that travels is not always the best-looking work; it is the work whose thinking is legible. Write down why you made the decisions. A case study that explains a trade-off will get further than a carousel of pretty mockups, because it demonstrates something a mockup cannot.' },
        { t: 'quote', v: 'Being the best designer in the room is only useful if you keep changing rooms.' },
        { t: 'h', v: 'Charge properly, and early' },
        { t: 'p', v: 'Underpricing is not humility, it is a constraint you are placing on the quality you can deliver. Rates that do not cover thinking time produce work with no thinking in it. Clients who cannot pay for the research are, without meaning to, buying a worse outcome.' },
        { t: 'h', v: 'Ship in public, consistently' },
        { t: 'p', v: 'Not for the likes. For the discipline of finishing. A deadline you set yourself and honour in front of other people is worth more than any course. Most people who "have no time to post" have no system for finishing.' },
        { t: 'h', v: 'Learn the business your client is in' },
        { t: 'p', v: 'The single fastest way to move from vendor to partner is being able to talk about margins, shelf positioning and distribution. It is not glamorous. It is the difference between being briefed and being consulted.' },
        { t: 'p', v: 'World-class is not a location and it is not a client list. It is a standard you hold when nobody in the room would notice if you dropped it.' }
      ],
      tags: ['Career', 'Craft']
    },
    {
      slug: 'new-beginnings',
      title: '<i>New</i> Beginnings',
      plain: 'New Beginnings',
      cat: 'Career', date: '14 August 2024', read: '5 min read',
      lead: 'My career over the last seven years — how it started, what I got wrong, and how I landed in the role I have now.',
      colors: { id: 'a3', bg: '#101014', mid: '#1e1e26', dark: '#16161c', light: '#e8e4db', glow: '#2c2c38', accent: '#c4a96b', word: 'NEW', sub: 'BEGINNINGS', alt: 'New beginnings' },
      motif: 'poster',
      body: [
        { t: 'p', v: 'I started designing because a church needed flyers and I owned the only laptop. That is the whole origin story. There was no plan, and for the first two years there was no craft either — just a willingness to say yes and figure it out afterwards.' },
        { t: 'h', v: 'The in-house years' },
        { t: 'p', v: 'My first real job was in-house at a startup, and it taught me the thing freelancing never would have: what happens to a design after you hand it over. Watching a mark I had made get used badly by people who were not designers changed how I build systems. Guidelines stopped being a deliverable and became the actual product.' },
        { t: 'h', v: 'The agency detour' },
        { t: 'p', v: 'Contracting at branding agencies was where I learned speed, and where I nearly lost the reason I started. Volume is a good teacher and a bad habit. I got fast, I got competent, and for about eight months I made nothing I would show anyone.' },
        { t: 'quote', v: 'Getting good at delivering is not the same as getting good at designing. I confused those for most of a year.' },
        { t: 'h', v: 'Going independent' },
        { t: 'p', v: 'Working directly with founders is the closest I have come to the version of this job I imagined at the start. Fewer layers, harder conversations, better work. It also means the business side is now half of it — the estimating, the scoping, the saying no. Nobody warns you about the saying no.' },
        { t: 'h', v: 'What I would tell myself at the start' },
        { t: 'p', v: 'Learn to write. Take the boring brief with the good client over the exciting brief with the bad one. And keep a folder of everything you make, including the bad years, because you will need the evidence that it moved.' }
      ],
      tags: ['Career', 'Personal']
    },
    {
      slug: 'buychicken-a-breakout-story',
      title: 'BuyChicken — A <i>Breakout</i> Story',
      plain: 'BuyChicken — A Breakout Story',
      cat: 'Personal', date: '03 March 2024', read: '7 min read',
      lead: 'The full story of what inspired the brand, how it started, how it ended, and what it led to in my career.',
      colors: { id: 'a4', bg: '#2a0508', mid: '#d92027', dark: '#8f1218', light: '#ffd23f', glow: '#d92027', accent: '#ffd23f', word: 'BUY CHICKEN', sub: 'A BREAKOUT STORY', alt: 'BuyChicken story' },
      motif: 'poster',
      body: [
        { t: 'p', v: 'BuyChicken is the project that changed my career, and I very nearly turned it down. The budget was small, the client was a poultry seller in Benin City, and I was at the point of trying to only take work that looked good in a portfolio. That instinct was wrong, and this is the project that proved it.' },
        { t: 'h', v: 'The name was already the idea' },
        { t: 'p', v: 'Every competitor was called something like Fresh Farms Poultry Ltd. My client was called BuyChicken because that is what he had painted on the wall a decade earlier. He apologised for it in our first meeting. It was the single best asset in the room and he wanted to replace it.' },
        { t: 'h', v: 'Writing before drawing' },
        { t: 'p', v: 'I spent the first two weeks writing rather than designing — portion names, van slogans, sign-offs. "Main Chick" and "Side Chick" for the two sizes. "Wahala for who no quick." It felt like stalling. It turned out to be the project.' },
        { t: 'quote', v: 'The brand got repeated in the shop by customers within a year. No campaign I have worked on since has beaten that.' },
        { t: 'h', v: 'How it ended' },
        { t: 'p', v: 'The business was sold in 2023 and the new owners moved to something more conventional within six months. The red is gone, the copy is gone, and the sign now says something with the word Premium in it. That stung more than I expected.' },
        { t: 'h', v: 'What it led to' },
        { t: 'p', v: 'Three of my next five clients came directly from people who had seen the vans. It moved me from doing logos to being asked about tone, positioning and naming — which is the work I actually want. A small brief from a small client in a category nobody covets did more for my practice than any of the projects I was chasing at the time.' },
        { t: 'p', v: 'I now take at least one project a year purely because the problem is interesting. It is the best business decision I have ever made, and it started with chicken.' }
      ],
      tags: ['Story', 'Branding']
    }
  ];

  window.TEA_CONTENT = { projects, articles, svg, motifs: M };
})();
