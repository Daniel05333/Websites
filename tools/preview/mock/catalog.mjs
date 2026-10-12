// VOLKARA mock catalog for the local preview harness (prices in cents). Mirrors docs/BUILD_SPEC.md §13.
let vid = 41000000;
const sizes = (handle, list, sku) => list.map(([title, price, compare = null]) => ({ id: ++vid, title, options: [title], price, compare_at_price: compare, available: true, sku: `${sku}-${title.replace(/\s|cm/g, '')}` }));
const single = (price, compare, sku) => [{ id: ++vid, title: 'Default Title', options: ['Default Title'], price, compare_at_price: compare, available: true, sku }];
const P = (id, handle, title, type, tags, collections, variants, meta, rating, count) => ({
  id, handle, title, type, vendor: 'VOLKARA', tags, collections, variants,
  options: variants[0].title === 'Default Title' ? ['Title'] : ['Size'],
  description: `<p>${meta.description}</p><ul><li>VolcanicCore™ 5-ply construction</li><li>LavaCell™ titanium surface — no coating</li><li>Lifetime warranty, 60-day home trial</li></ul>`,
  metafields: { custom: { subtitle: meta.subtitle, badge: meta.badge || null, specs: { type: 'json', value: [
    { label: 'Construction', value: 'VolcanicCore™ 5-ply, forged and bonded' }, { label: 'Cooking surface', value: 'LavaCell™ laser-etched titanium' },
    { label: 'Core', value: 'Triple aluminium Thermal Core' }, { label: 'Heat sources', value: 'Gas, induction, ceramic, electric, oven, grill' },
    { label: 'Oven / grill', value: 'Up to 260°C' }, { label: 'Dishwasher', value: 'Safe' }, { label: 'Warranty', value: 'Lifetime, household use' } ] } },
    reviews: { rating, rating_count: count } },
  created_at: `2026-0${(id % 9) + 1}-12T10:00:00Z`,
});
export const products = [
  P(1001, 'forge-pan', 'VOLKARA Forge Pan', 'Frying Pan', ['bestseller'], ['pans', 'bestsellers'], sizes('forge-pan', [['20 cm', 11900], ['24 cm', 13900], ['28 cm', 15900], ['32 cm', 18900]], 'VK-FP'), { subtitle: 'Five layers. One perfect sear.', badge: 'Bestseller', description: 'The pan most VOLKARA kitchens start with. A LavaCell™ titanium surface for a deep, natural-release sear.' }, 4.9, 1284),
  P(1002, 'forge-wok', 'VOLKARA Forge Wok', 'Wok', [], ['woks', 'bestsellers'], sizes('forge-wok', [['30 cm', 18900], ['34 cm', 21900]], 'VK-FW'), { subtitle: 'Built for fierce heat.', description: 'A flat base for induction and a deep bowl for tossing.' }, 4.8, 412),
  P(1003, 'saute-pan', 'VOLKARA Sauté Pan with Lid', 'Sauté Pan', ['new'], ['pans', 'pots'], sizes('saute-pan', [['24 cm', 17900], ['28 cm', 20900]], 'VK-SP'), { subtitle: 'Deep, even, endlessly useful.', badge: 'New', description: 'High walls and a close-fitting lid for braises and one-pan dinners.' }, 4.8, 188),
  P(1004, 'saucepan', 'VOLKARA Saucepan with Lid', 'Saucepan', [], ['pots'], sizes('saucepan', [['16 cm', 12900], ['18 cm', 14900], ['20 cm', 16900]], 'VK-SC'), { subtitle: 'Sauces that never catch.', description: 'A flared pour rim and gentle, even heat.' }, 4.7, 156),
  P(1005, 'stockpot', 'VOLKARA Stockpot with Lid', 'Stockpot', [], ['pots'], sizes('stockpot', [['24 cm', 23900]], 'VK-ST'), { subtitle: 'For long, slow braises.', description: 'Even heat across a broad base for stocks and stews.' }, 4.8, 97),
  P(1006, 'the-trio', 'The Trio — Forge Pan Set', 'Set', ['bestseller'], ['sets', 'bestsellers'], single(37900, 41700, 'VK-SET-3'), { subtitle: '20, 24 and 28 cm.', badge: 'Save €38', description: 'Three Forge Pans for less than the sum of their parts.' }, 4.9, 538),
  P(1007, 'chefs-collection', "The Chef's Collection — 7 pieces", 'Set', [], ['sets'], single(89900, 103400, 'VK-SET-7'), { subtitle: 'Seven pieces, one standard.', badge: 'Most complete', description: 'Pans, pots and lids for a complete kitchen.' }, 4.9, 211),
  P(1008, 'signature-kitchen', 'The Signature Kitchen — 12 pieces', 'Set', [], ['sets'], single(149900, 174200, 'VK-SET-12'), { subtitle: 'Everything, forged once.', badge: 'Limited', description: 'The full VOLKARA kitchen.' }, 5.0, 64),
  P(1009, 'damascus-chef-knife', 'Damascus Chef Knife 21 cm', 'Knife', [], ['knives'], single(16900, null, 'VK-KN-CH'), { subtitle: 'An edge worth keeping.', description: 'Layered Damascus steel with a lava-red collar.' }, 4.9, 302),
  P(1010, 'santoku-knife', 'Damascus Santoku 18 cm', 'Knife', [], ['knives'], single(14900, null, 'VK-KN-SA'), { subtitle: 'Feather-light precision.', description: 'A versatile santoku for vegetables and fish.' }, 4.8, 141),
  P(1011, 'titanium-board', 'Titanium Cutting Board', 'Accessory', [], ['accessories'], sizes('titanium-board', [['M', 8900], ['L', 11900]], 'VK-BRD'), { subtitle: 'Hygienic, handsome, forever.', description: 'A non-porous titanium surface.' }, 4.6, 88),
  P(1012, 'utensil-set', 'Precision Utensil Set — 5 pieces', 'Accessory', [], ['accessories'], single(9900, null, 'VK-UT-5'), { subtitle: 'Tools made to match.', description: 'Five stainless utensils with lava-red collars.' }, 4.7, 73),
  P(1013, 'glass-lid', 'Tempered Glass Lid', 'Accessory', [], ['accessories'], sizes('glass-lid', [['20 cm', 3900], ['24 cm', 4500], ['28 cm', 4900]], 'VK-LID'), { subtitle: 'Sized to your pan.', description: "Watch, don't lift." }, 4.7, 120),
];
export const collections = [
  ['all', 'All cookware', 'Every piece. One <em>standard</em>.', 'Pans, woks, pots, knives and tools — all built on the same idea: performance that outlasts the kitchen it lives in.'],
  ['pans', 'Pans', 'The everyday <em>icon</em>.', 'The Forge Pan in four sizes, and the Sauté Pan for everything deeper.'],
  ['woks', 'Woks', 'Built for <em>fierce</em> heat.', 'A flat base for induction, a deep bowl for tossing.'],
  ['pots', 'Pots', 'Slow heat, <em>perfectly</em> held.', 'Saucepans, a sauté pan and a stockpot with close-fitting lids.'],
  ['sets', 'Sets', 'Your kitchen, <em>complete</em>.', 'Curated sets for less than the sum of their parts.'],
  ['knives', 'Knives', 'An edge worth <em>keeping</em>.', 'Layered Damascus steel, balanced handles.'],
  ['accessories', 'Accessories', 'The finishing <em>details</em>.', 'A titanium cutting board, precision utensils and tempered glass lids.'],
  ['bestsellers', 'Bestsellers', 'The <em>icons</em>.', 'The pieces most kitchens start with.'],
].map(([handle, title, hero, description], i) => ({ id: 500 + i, handle, title, hero, description: `<p>${description}</p>` }));
const L = (title, url, links = []) => ({ title, url, links });
export const menus = {
  'main-menu': [
    L('Shop', '/collections/all', [
      L('Cookware', '/collections/all', [L('Forge Pan', '/products/forge-pan'), L('Forge Wok', '/products/forge-wok'), L('Sauté Pan', '/products/saute-pan'), L('Saucepan', '/products/saucepan'), L('Stockpot', '/products/stockpot')]),
      L('Sets', '/collections/sets', [L('The Trio', '/products/the-trio'), L("The Chef's Collection", '/products/chefs-collection'), L('The Signature Kitchen', '/products/signature-kitchen')]),
      L('Knives & tools', '/collections/knives', [L('Damascus Chef Knife', '/products/damascus-chef-knife'), L('Damascus Santoku', '/products/santoku-knife'), L('Titanium Cutting Board', '/products/titanium-board'), L('Glass Lid', '/products/glass-lid')]),
    ]),
    L('Sets', '/collections/sets'), L('VolcanicCore™', '/pages/technology'), L('Our story', '/pages/about'), L('Support', '/pages/contact'),
  ],
  'footer-shop': [L('All cookware', '/collections/all'), L('Pans', '/collections/pans'), L('Woks', '/collections/woks'), L('Pots', '/collections/pots'), L('Sets', '/collections/sets'), L('Knives', '/collections/knives')],
  'footer-help': [L('Contact', '/pages/contact'), L('Shipping', '/policies/shipping-policy'), L('Returns & home trial', '/policies/refund-policy'), L('Warranty', '/pages/warranty'), L('Track your order', '/account')],
  'footer-legal': [L('Terms of service', '/policies/terms-of-service'), L('Privacy policy', '/policies/privacy-policy'), L('Refund policy', '/policies/refund-policy'), L('Withdraw from a contract', '/pages/contact')],
};
export const pages = [
  { handle: 'about', title: 'Our story', template_suffix: 'about', content: '' },
  { handle: 'technology', title: 'VolcanicCore™ technology', template_suffix: 'technology', content: '' },
  { handle: 'contact', title: 'Contact', template_suffix: 'contact', content: '<p>Questions about sizes, care or an order? Write to us — a real person replies within one working day, Monday to Friday.</p>' },
  { handle: 'warranty', title: 'Warranty & home trial', template_suffix: null, content: '<p><strong>Our lifetime warranty.</strong> Every VolcanicCore™ piece is guaranteed for its lifetime in household use against defects in materials and workmanship.</p><p><strong>60-day home trial.</strong> Cook with any VOLKARA piece for up to 60 days from delivery.</p>' },
];
export const articles = [
  { handle: 'perfect-steak-in-titanium', title: 'How to sear the perfect steak in titanium', author: 'VOLKARA Kitchen', published_at: '2026-09-20T09:00:00Z', tags: ['Technique'], content: '<p>Preheat for three minutes, until a drop of water skates. Oil, shimmer, steak — then leave it alone until it releases.</p><p>Baste with butter, thyme and garlic for the last minute.</p>' },
  { handle: 'why-we-left-non-stick', title: 'Why we left non-stick behind', author: 'VOLKARA', published_at: '2026-08-02T09:00:00Z', tags: ['Story'], content: '<p>Coatings are designed to wear out. We wanted the opposite.</p>' },
  { handle: 'inside-volcaniccore', title: 'Inside VolcanicCore™', author: 'VOLKARA Engineering', published_at: '2026-07-11T09:00:00Z', tags: ['Technology'], content: '<p>Five layers, each with one job.</p>' },
];
