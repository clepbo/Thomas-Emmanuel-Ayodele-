/* ══════════════════════════════════════════════════════════════════════
   TEA — project content

   Every project here is real work by Thomas Emmanuel Ayodele (TEA Studios),
   with images from assets/img. Copy is deliberately factual — what the
   client is and what was made — drawn from the deliverables visible in the
   work itself. Where a brief or a palette appears inside the artwork, it is
   quoted rather than paraphrased. Nothing is invented: no fabricated
   metrics, testimonials, or client quotes.

   `imgs` is the count of images available for a project; filenames follow
   `<slug>-<n>-<width>.webp` at 600 and 1080. Add a project by adding an
   entry and dropping its images in.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const W = [600, 1080];

  /* <img> with srcset, sized by role. `n` is 1-based. */
  function img(slug, n, sizes, cls, eager) {
    const src = a => `assets/img/${slug}-${n}-${a}.webp`;
    return `<img class="${cls || ''}" src="${src(600)}" ` +
           `srcset="${W.map(w => src(w) + ' ' + w + 'w').join(', ')}" ` +
           `sizes="${sizes}" alt="" ` +
           `loading="${eager ? 'eager' : 'lazy'}" decoding="async" ` +
           `${eager ? 'fetchpriority="high"' : ''}>`;
  }

  const projects = [
    {
      slug: 'herome', name: 'Herome', display: 'Here<i>me</i>',
      tagline: 'Fashion and beauty, built on a mark that stacks',
      sector: 'Fashion & Beauty', discipline: 'Brand Identity', year: '2022',
      tags: ['Brand Identity', 'Logo Design'], imgs: 8, feature: true,
      // Palette lifted directly from the project's own colour slide.
      palette: [
        { hex: '#711416', name: 'Maroon Red' }, { hex: '#3754A5', name: 'Navy Blue' },
        { hex: '#D35540', name: 'Coral' }, { hex: '#E8E5E1', name: 'Off White' }
      ],
      body: [
        'A fashion and beauty label built around a wordmark that stacks — HE / RO / ME — set inside a tall arched frame so the mark reads as a crest at small sizes and as a banner at large ones.',
        'The identity runs across badges, apparel and lookbook photography. Maroon and navy carry the formal weight; the coral keeps it from tipping into heritage.'
      ]
    },
    {
      slug: 'peakfort', name: 'Peakfort', display: 'Peak<i>fort</i>',
      tagline: 'A public speaking hub, sealed like an institution',
      sector: 'Education & Community', discipline: 'Brand Identity', year: '2023',
      tags: ['Brand Identity', 'Logo Design'], imgs: 8, feature: true,
      palette: [
        { hex: '#2A3E8F', name: 'Cobalt' }, { hex: '#F2F0EA', name: 'Chalk' },
        { hex: '#101426', name: 'Ink' }, { hex: '#C8CEE4', name: 'Pale Blue' }
      ],
      body: [
        'Peakfort is a public speaking hub. The mark is a polygonal seal — a fortress and a rising road inside a ring reading PEAK FORT · PUBLIC SPEAKING HUB · EST 2023 — chosen because a badge carries authority that a wordmark alone does not.',
        'Built to hold at a lectern, on a certificate and as a social avatar, which is why the ring type and the icon are drawn to survive being reduced to a circle.'
      ]
    },
    {
      slug: 'permanent-voter-s-card', name: "Permanent Voter's Card",
      display: 'Permanent <i>Voter\'s Card</i>',
      tagline: 'A civic push that speaks the way people actually speak',
      sector: 'Civic & Public', discipline: 'Campaign · Brand Identity', year: '2023',
      tags: ['Brand Identity', 'Motion'], imgs: 8, feature: true,
      palette: [
        { hex: '#C6F000', name: 'Acid Green' }, { hex: '#0B7A3B', name: 'Deep Green' },
        { hex: '#0A0A0A', name: 'Black' }, { hex: '#F4F4EC', name: 'Paper' }
      ],
      body: [
        'A campaign encouraging Nigerians to collect their Permanent Voter\'s Card. The icon fuses a thumbprint with a card, since the fingerprint is the part of the process everyone recognises.',
        'The copy is written in pidgin — "Oya carry yourself go the nearest INEC office" — because a civic message that sounds like a government circular gets ignored. Acid green was picked to survive a compressed phone screen.'
      ]
    },
    {
      slug: 'tvc', name: 'True Vine Crew', display: 'True <i>Vine Crew</i>',
      tagline: 'A gospel crew and record label, marked with a vine',
      sector: 'Music & Entertainment', discipline: 'Brand Identity', year: '2022',
      tags: ['Brand Identity', 'Logo Design'], imgs: 8, feature: true,
      palette: [
        { hex: '#C6DB2E', name: 'Vine Green' }, { hex: '#2B3450', name: 'Night Navy' },
        { hex: '#F2F4E8', name: 'Bone' }, { hex: '#7E9B3A', name: 'Leaf' }
      ],
      // The brief is quoted from the construction slide in the project itself.
      body: [
        'True Vine Crew is a gospel music crew and record label in Nigeria. The brief specified using elements of vine and a musical icon to brand the crew, with the stated aim: "to reach out to people, teaching them the real essence of worship."',
        'The mark sets three vine buds inside an arched window — a rose window abstracted far enough to read as notes on a stave. The construction grid is part of the delivered system.'
      ]
    },
    {
      slug: 'women-watchers', name: 'Women Watchers', display: 'Women <i>Watchers</i>',
      tagline: 'A community mark that doubles as a pin',
      sector: 'Community & Faith', discipline: 'Brand Identity', year: '2023',
      tags: ['Brand Identity', 'Logo Design'], imgs: 8, feature: true,
      palette: [
        { hex: '#1E2536', name: 'Deep Navy' }, { hex: '#2E7D4F', name: 'Watch Green' },
        { hex: '#6FB868', name: 'Fresh Green' }, { hex: '#F2F2F0', name: 'Light' }
      ],
      body: [
        'Women Watchers is a community, described in the delivered guidelines as "targeted at raising godly, prayerful and spiritually intelligent women."',
        'The monogram folds a W into a location pin, so the mark says gathering and place at once. Delivered as a full system — logo identity, construction, typography set in Monea Alegante, palette and app icons.'
      ]
    },
    {
      slug: 'emerald-clipz', name: 'Emerald Clipz', display: 'Emerald <i>Clipz</i>',
      tagline: 'Barbering with a green that stays clean',
      sector: 'Grooming & Services', discipline: 'Brand Identity', year: '2023',
      tags: ['Brand Identity', 'Packaging'], imgs: 8,
      palette: [
        { hex: '#5DBD77', name: 'Emerald' }, { hex: '#515C56', name: 'Slate Green' },
        { hex: '#535150', name: 'Graphite' }, { hex: '#FFFFFF', name: 'White' }
      ],
      body: [
        'A barbering brand where the whole system has to survive being worn, wiped and washed. The palette — #5DBD77 against #515C56 and #535150 — is taken from the project\'s own colour sheet.',
        'Applied across aprons, stationery and cards, with the mark drawn to stay legible embroidered at chest height.'
      ]
    },
    {
      slug: 'tonya-smalls', name: 'Tonya Smalls', display: 'Tonya <i>Smalls</i>',
      tagline: 'A personal label with a monogram that closes',
      sector: 'Fashion', discipline: 'Brand Identity', year: '2019',
      tags: ['Brand Identity', 'Logo Design'], imgs: 8,
      palette: [
        { hex: '#1D2F3A', name: 'Deep Teal' }, { hex: '#A8BDB0', name: 'Sage' },
        { hex: '#F5F2E3', name: 'Cream' }, { hex: '#0E1A21', name: 'Near Black' }
      ],
      body: [
        'A fashion label established 2019. The wordmark is a wide-tracked geometric sans; the monogram closes a T and an S into a single circular counter so it works as a button, a label and an avatar.',
        'Deep teal, sage and cream — quiet enough that the garments stay the loudest thing in any photograph.'
      ]
    },
    {
      slug: 'effyz-avalon', name: 'Effyz Avalon', display: 'Effyz <i>Avalon</i>',
      tagline: 'A hospitality monogram cut for glass',
      sector: 'Hospitality & Lifestyle', discipline: 'Brand Identity', year: '2019',
      tags: ['Brand Identity', 'Logo Design'], imgs: 8,
      palette: [
        { hex: '#8A9A7B', name: 'Sage' }, { hex: '#C9BFAE', name: 'Taupe' },
        { hex: '#3D4A38', name: 'Olive' }, { hex: '#F6F3EC', name: 'Ivory' }
      ],
      body: [
        'A lifestyle and hospitality brand, established 2019. A ligatured "e" sits in a soft-cornered oval frame with the name arced above and below — a device that reads as engraving on glass, which is where it is used.',
        'Sage and taupe keep it warm without going gold. The stationery leans on a single "thank you" set small and centred.'
      ]
    },
    {
      slug: 'flex2ride', name: 'Flex2Ride', display: 'Flex<i>2Ride</i>',
      tagline: 'Luxury that listens to your wallet',
      sector: 'Mobility & App', discipline: 'Brand Identity · Campaign', year: '2024',
      tags: ['Brand Identity', 'Motion'], imgs: 8,
      palette: [
        { hex: '#0B0B0D', name: 'Night' }, { hex: '#D8A64B', name: 'Amber' },
        { hex: '#1E4FD8', name: 'Signal Blue' }, { hex: '#EDEDF0', name: 'Chrome' }
      ],
      body: [
        'A ride and rental app whose whole proposition is in the line it runs on: "Luxury that listens to your wallet." The campaign is shot almost entirely at night, lit from inside the car.',
        'Social units carry a QR straight to the app, so every frame is built around leaving room for it.'
      ]
    },
    {
      slug: 'danny-s-foods', name: "Danny's Foods", display: 'Danny\'s <i>Foods</i>',
      tagline: 'Spicy Pop, loud enough for a market shelf',
      sector: 'Food & Beverage', discipline: 'Packaging', year: '2024',
      tags: ['Packaging', 'Brand Identity'], imgs: 5,
      palette: [
        { hex: '#E24A26', name: 'Chilli' }, { hex: '#1F5B3A', name: 'Leaf Green' },
        { hex: '#F5E3C0', name: 'Corn' }, { hex: '#F7F1E4', name: 'Cream' }
      ],
      body: [
        'Packaging for Spicy Pop, a popcorn line sold through local retail. The logotype is drawn heavy with a hard outline so it holds up printed on film and stacked three deep in a rack.',
        'The pack carries the things that actually matter at the point of sale: 100% natural, the recycling mark, a phone number and the junction it is sold at.'
      ]
    },
    {
      slug: 'footstepz-ng', name: 'Footstepz.ng', display: 'Footstepz<i>.ng</i>',
      tagline: 'Footwear shot on paper, sold on a phone',
      sector: 'Retail & E-commerce', discipline: 'Brand Identity · Art Direction', year: '2024',
      tags: ['Brand Identity', 'Art Direction'], imgs: 8,
      palette: [
        { hex: '#EFE7DA', name: 'Paper' }, { hex: '#5A3A22', name: 'Leather' },
        { hex: '#1A1A18', name: 'Ink' }, { hex: '#C8C2B6', name: 'Stone' }
      ],
      body: [
        'A footwear retailer selling through social. The art direction puts every product on crumpled paper with the wordmark set oversized and cropped behind it, so a phone-sized crop still reads as the brand.',
        'One template, one background, many products — the point was a system the client could keep shooting without a designer present.'
      ]
    },
    {
      slug: 'wose-co', name: 'Wosè.co', display: 'Wosè<i>.co</i>',
      tagline: 'Culture, clarity, execution',
      sector: 'Culture & Events', discipline: 'Brand Identity', year: '2025',
      tags: ['Brand Identity', 'Art Direction'], imgs: 7,
      palette: [
        { hex: '#0E0E0E', name: 'Black' }, { hex: '#22402F', name: 'Forest' },
        { hex: '#E9E5DC', name: 'Bone' }, { hex: '#9AA88F', name: 'Moss' }
      ],
      body: [
        'A culture and events brand whose stated line is "Culture, clarity, execution." The wordmark keeps the Yoruba diacritic in Wosè rather than flattening it, which is the whole identity in one decision.',
        'Applied to merchandise and event collateral, including coverage of The Nigeria Summit 2025.'
      ]
    },
    {
      slug: 'petharry-photography', name: 'Petharry Photography',
      display: 'Petharry <i>Photography</i>',
      tagline: 'A shutter folded into a monogram',
      sector: 'Photography', discipline: 'Logo Design', year: '2024',
      tags: ['Logo Design', 'Brand Identity'], imgs: 5,
      palette: [
        { hex: '#3B5BDB', name: 'Lens Blue' }, { hex: '#3A3A3A', name: 'Charcoal' },
        { hex: '#EDEDED', name: 'Light Grey' }, { hex: '#101010', name: 'Black' }
      ],
      body: [
        'A photography brand built on a geometric monogram — two curved blades meeting on a diagonal, reading as both a P and an aperture.',
        'Set against neutral greys so it can sit over photographic work without competing with it.'
      ]
    }
  ];

  window.TEA_CONTENT = { projects, img };
})();
