// Exports a clickable static snapshot of the theme from the running preview harness.
// Cart, filters, search and recommendations replay pre-recorded harness responses (see the fetch shim below).
// Usage: npm run preview (in another terminal), then: node tools/preview/export-static.mjs <out-dir>
import fs from 'node:fs';
import path from 'node:path';
import { products, collections, pages } from './mock/catalog.mjs';

const BASE = `http://localhost:${process.env.PORT || 4321}`;
const OUT = path.resolve(process.argv[2] || 'preview-static');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

// route → file
const routes = new Map([['/', 'home.html'], ['/cart', 'cart.html'], ['/search', 'search.html'], ['/404', 'not-found.html'], ['/collections', 'collections.html']]);
for (const c of collections) routes.set(`/collections/${c.handle}`, `collection-${c.handle}.html`);
for (const p of products) routes.set(`/products/${p.handle}`, `product-${p.handle}.html`);
for (const p of pages) routes.set(`/pages/${p.handle}`, `page-${p.handle}.html`);

let sid = 0;
const RUN = Date.now();
const get = async (url, cookie = 'vk_sid=static') => (await fetch(BASE + url, { headers: { cookie } })).text();
const post = async (url, body, cookie) => (await fetch(BASE + url, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify(body) })).json();

const replay = {}; // key → body (string)
// Must match keyOf() in static-shim.js
const keyOf = (u, defaultSort) => { const url = new URL(u, BASE); url.searchParams.delete('section_id'); if (url.searchParams.get('sort_by') === defaultSort) url.searchParams.delete('sort_by'); url.searchParams.sort(); return `${url.pathname}?${url.searchParams}`; };
async function record(url, sectionId, defaultSort = 'manual') {
  const k = `${sectionId}|${keyOf(url, defaultSort)}`;
  if (k in replay) return;
  const u = new URL(url, BASE); if (sectionId) u.searchParams.set('section_id', sectionId);
  replay[k] = await get(u.pathname + u.search);
}

const rewritePath = (href) => {
  const [p] = href.split(/[?#]/);
  if (routes.has(p)) return routes.get(p) + href.slice(p.length);
  if (p.startsWith('/assets/')) return 'assets/' + path.basename(p);
  if (p.startsWith('/products/') || p.startsWith('/collections/')) return '#vk-preview-na';
  return null;
};
const nav = [['/', 'Homepage'], ['/collections/all', 'Collectie: alles'], ['/collections/sets', 'Collectie: sets'], ['/products/gehamerde-titanium-pan', 'Product: Gehamerde Titanium Pan'], ['/products/complete-set', 'Product: Complete set'], ['/products/damascus-chef-knife', 'Product: Damascus koksmes'], ['/pages/technology', 'VolcanicCore™'], ['/pages/about', 'Over ons'], ['/pages/veelgestelde-vragen', 'Veelgestelde vragen'], ['/pages/verzenden-en-retourneren', 'Verzenden en retourneren'], ['/pages/contact', 'Contact'], ['/cart', 'Winkelwagen'], ['/search', 'Zoeken'], ['/collections', 'Alle collecties'], ['/404', '404']];
const bar = (route) => `<div class="vk-preview-bar"><strong>VOLKARA preview</strong><label for="vk-preview-nav" class="vk-visually-hidden">Ga naar pagina</label><select id="vk-preview-nav" onchange="location.href=this.value">${nav.map(([r, t]) => `<option value="${routes.get(r)}"${r === route ? ' selected' : ''}>${t}</option>`).join('')}${nav.some(([r]) => r === route) ? '' : '<option selected disabled>Andere pagina</option>'}</select><span>Demo · afrekenen en accounts werken pas in Shopify</span></div>`;
function rewrite(html, route = '') {
  const defaultSort = html.match(/<option value="([a-z-]+)" selected/)?.[1] || 'manual';
  return html
    .replace(/(href|src|action|data-three)="(\/[^"]*)"/g, (m, attr, href) => {
      if (href.startsWith('//') || href.startsWith('/cart/change')) return m;
      const r = rewritePath(href);
      if (r) return `${attr}="${r}"`;
      return attr === 'href' ? `href="#vk-preview-na" data-vk-orig="${href}"` : m;
    })
    .replace(/url\((["']?)\/assets\//g, 'url($1assets/')
    .replace('</head>', `<script>window.__VK_STATIC = ${JSON.stringify({ route, defaultSort, routes: Object.fromEntries(routes) })};</script>\n<script src="assets/vk-static-shim.js"></script>\n</head>`)
    .replace(/<body([^>]*)>/, `<body$1>\n${bar(route)}`);
}

// 1. pages
const htmls = {};
for (const [route, file] of routes) {
  const html = await get(route === '/search' ? '/search?q=pan' : route);
  htmls[file] = html;
  fs.writeFileSync(path.join(OUT, file), rewrite(html, route));
}

// 2. cart: one recorded add per variant (fresh cart each), plus the cart page with items
const cartSections = 'vk-cart-drawer,vk-cart-icon-bubble';
for (const p of products) for (const v of p.variants) {
  const cookie = `vk_sid=rec${RUN}x${++sid}`;
  replay[`add|${v.id}`] = JSON.stringify(await post('/cart/add.js', { id: v.id, quantity: 1, sections: cartSections }, cookie));
  if (p.handle === 'gehamerde-titanium-pan' && v.title === '28 cm') {
    replay['change|empty'] = JSON.stringify(await post('/cart/change.js', { line: 1, quantity: 0, sections: cartSections + ',vk-main-cart' }, cookie));
  }
}
{
  const cookie = `vk_sid=cartpage${RUN}`;
  await post('/cart/add.js', { id: products[0].variants[2].id, quantity: 1 }, cookie);
  await post('/cart/add.js', { id: products.find((p) => p.handle === 'glass-lid').variants[2].id, quantity: 1 }, cookie);
  fs.writeFileSync(path.join(OUT, 'cart.html'), rewrite(await get('/cart', cookie), '/cart'));
}

// 3. section fetches: collection sort + single filters, recommendations, predictive search
for (const [file, html] of Object.entries(htmls)) {
  const facetSection = html.match(/<vk-facets[^>]*data-section-id="([^"]+)"/)?.[1] || html.match(/<vk-facets[^>]*data-section="([^"]+)"/)?.[1];
  const route = [...routes].find(([, f]) => f === file)[0];
  if (facetSection && route.startsWith('/collections/')) {
    const defaultSort = html.match(/<option value="([a-z-]+)" selected/)?.[1] || 'manual';
    const sorts = [...html.matchAll(/<option value="([a-z-]+)"[^>]*>/g)].map((m) => m[1]).filter((s) => /-(ascending|descending)|best-selling|manual/.test(s));
    for (const s of new Set(sorts)) await record(`${route}?sort_by=${s}`, facetSection, defaultSort);
    const filters = [...html.matchAll(/name="(filter\.[^"]+)"[^>]*value="([^"]+)"/g)];
    for (const [, n, v] of filters) if (!n.includes('price')) {
      const q = `${encodeURIComponent(n)}=${encodeURIComponent(v.replace(/&quot;/g, '"').replace(/&amp;/g, '&'))}`;
      await record(`${route}?${q}`, facetSection, defaultSort);
      for (const s of new Set(sorts)) await record(`${route}?${q}&sort_by=${s}`, facetSection, defaultSort);
    }
    await record(route, facetSection, defaultSort);
  }
  for (const [, u] of html.matchAll(/data-url="(\/recommendations[^"]+)"/g)) await record(u.replace(/&amp;/g, '&'), '');
}
const terms = ['pan', 'wok', 'pot', 'set', 'knife', 'lid', 'board', 'forge', 'titanium', 'damascus', 'saucepan', 'stockpot', 'trio', 'utensil', 'santoku', 'chef', 'glass', 'sauté'];
const searchSection = 'vk-predictive-search';
for (const t of terms) {
  const u = `/search/suggest?q=${encodeURIComponent(t)}&resources[type]=product,collection,page,article,query&resources[limit]=6&resources[options][fields]=title,product_type,variants.title,vendor&section_id=${searchSection}`;
  replay[`search|${t}`] = await get(u);
}
// rewrite links inside recorded HTML too
for (const k of Object.keys(replay)) if (!k.startsWith('add|') && !k.startsWith('change|')) replay[k] = rewrite(replay[k]).replace(/<div class="vk-preview-bar">[\s\S]*?<\/div>/, '');
for (const k of Object.keys(replay)) if (k.startsWith('add|') || k.startsWith('change|')) {
  const d = JSON.parse(replay[k]); for (const s of Object.keys(d.sections || {})) d.sections[s] = rewrite(d.sections[s]); replay[k] = JSON.stringify(d);
}
// Must match bucketOf() in static-shim.js
const bucketOf = (k) => (k.startsWith('add|') || k.startsWith('change|') ? 'cart' : k.startsWith('search|') ? 'search' : k.startsWith('|') ? 'recs' : `facets-${k.split('|')[1].split('?')[0].split('/').pop()}`);
const buckets = {};
for (const [k, v] of Object.entries(replay)) (buckets[bucketOf(k)] ||= {})[k] = v;
for (const [b, obj] of Object.entries(buckets)) fs.writeFileSync(path.join(OUT, 'assets', `vk-static-${b}.json`), JSON.stringify(obj));

// 4. assets
for (const f of fs.readdirSync(path.join(ROOT, 'assets'))) fs.copyFileSync(path.join(ROOT, 'assets', f), path.join(OUT, 'assets', f));
fs.copyFileSync(path.join(ROOT, 'tools/preview/static-shim.js'), path.join(OUT, 'assets', 'vk-static-shim.js'));
console.log(`Exported ${routes.size} pages + ${Object.keys(replay).length} recorded responses → ${OUT}`);
