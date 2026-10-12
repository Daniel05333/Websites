#!/usr/bin/env node
/* ==========================================================================
   VOLKARA local preview harness
   Renders the theme with liquidjs + a Shopify-compatible subset of tags,
   filters and objects, mock catalog data, an in-memory Ajax cart and the
   Section Rendering API. For visual QA only — the real store is the truth.
   Usage: npm run preview   (PORT=4321)
   ========================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid, Tag, Hash } from 'liquidjs';
import * as mock from './mock/catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = Number(process.env.PORT || 4321);
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const stripComments = (s) => s.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
const readJSON = (p) => JSON.parse(stripComments(read(p)));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const handleize = (s) => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
const errors = [];

/* ---------- Data model ---------- */
const locale = () => readJSON('locales/nl.default.json');
function themeSettings() {
  const schema = readJSON('config/settings_schema.json'); const data = readJSON('config/settings_data.json');
  const out = {};
  for (const g of schema) for (const s of g.settings || []) if (s.id && 'default' in s) out[s.id] = s.default;
  const cur = typeof data.current === 'string' ? data.presets[data.current] : data.current;
  Object.assign(out, cur);
  const schemes = cur.color_schemes || {};
  out.color_schemes = Object.entries(schemes).map(([id, v]) => ({ id, settings: v.settings, toString() { return id; } }));
  out.cart_upsell_product = out.cart_upsell_product ? productByHandle(out.cart_upsell_product) : null;
  return out;
}
const money = (c) => c == null ? '' : '€' + (Number(c) / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function makeVariant(v, p) {
  return { ...v, option1: v.options[0], url: `/products/${p.handle}?variant=${v.id}`, inventory_management: 'shopify', inventory_policy: 'deny', inventory_quantity: 20, featured_media: null, featured_image: null, unit_price_measurement: null, toString() { return String(v.id); } };
}
const productCache = new Map();
function makeProduct(raw) {
  if (productCache.has(raw.handle)) return productCache.get(raw.handle);
  const p = { ...raw, url: `/products/${raw.handle}`, media: [], images: [], featured_image: null, featured_media: null, content: raw.description, available: true, has_only_default_variant: raw.variants.length === 1 && raw.variants[0].title === 'Default Title' };
  p.variants = raw.variants.map((v) => makeVariant(v, p));
  p.price = Math.min(...p.variants.map((v) => v.price)); p.price_min = p.price; p.price_max = Math.max(...p.variants.map((v) => v.price));
  p.price_varies = p.price_min !== p.price_max;
  p.compare_at_price = p.variants[0].compare_at_price; p.compare_at_price_min = p.compare_at_price;
  p.first_available_variant = p.variants[0]; p.selected_or_first_available_variant = p.variants[0]; p.selected_variant = null;
  p.options_with_values = raw.options.map((name, i) => ({ name, position: i + 1, values: [...new Set(p.variants.map((v) => v.options[i]))], selected_value: p.variants[0].options[i] }));
  const mf = (v, type = 'single_line_text_field') => (v == null ? null : { value: v, type, toString() { return typeof v === 'string' ? v : JSON.stringify(v); } });
  p.metafields = {
    custom: { subtitle: mf(raw.metafields.custom.subtitle), badge: mf(raw.metafields.custom.badge), specs: mf(raw.metafields.custom.specs.value, 'json'), care: null },
    reviews: { rating: mf({ rating: raw.metafields.reviews.rating, scale_min: 1, scale_max: 5 }, 'rating'), rating_count: mf(raw.metafields.reviews.rating_count, 'number_integer') },
  };
  p.toJSON = () => ({ id: p.id, handle: p.handle, title: p.title, variants: raw.variants });
  productCache.set(raw.handle, p);
  return p;
}
const allProducts = () => mock.products.map(makeProduct);
const productByHandle = (h) => { const r = mock.products.find((p) => p.handle === h); return r ? makeProduct(r) : null; };
function collectionByHandle(h, query) {
  const raw = mock.collections.find((c) => c.handle === h); if (!raw) return null;
  let products = h === 'all' ? allProducts() : allProducts().filter((p) => p.collections.includes(h));
  const total = products.length;
  // filters
  const q = query || new URLSearchParams();
  const types = q.getAll('filter.p.product_type'); const avail = q.getAll('filter.v.availability');
  const gte = q.get('filter.v.price.gte'), lte = q.get('filter.v.price.lte');
  let filtered = products.filter((p) => (!types.length || types.includes(p.type)) && (!gte || p.price >= gte * 100) && (!lte || p.price <= lte * 100));
  const sort = q.get('sort_by') || 'manual';
  const sorters = { 'price-ascending': (a, b) => a.price - b.price, 'price-descending': (a, b) => b.price - a.price, 'title-ascending': (a, b) => a.title.localeCompare(b.title), 'created-descending': (a, b) => b.created_at.localeCompare(a.created_at) };
  if (sorters[sort]) filtered = [...filtered].sort(sorters[sort]);
  const base = `/collections/${h}`;
  const urlWith = (mut) => { const u = new URLSearchParams(q); u.delete('page'); mut(u); return `${base}?${u}`; };
  const typeValues = [...new Set(products.map((p) => p.type))].map((t) => ({ label: t, value: t, count: products.filter((p) => p.type === t).length, active: types.includes(t), param_name: 'filter.p.product_type', url_to_remove: urlWith((u) => { const k = u.getAll('filter.p.product_type').filter((x) => x !== t); u.delete('filter.p.product_type'); k.forEach((x) => u.append('filter.p.product_type', x)); }) }));
  const maxPrice = Math.max(...products.map((p) => p.price_max));
  const filters = [
    { label: 'Beschikbaarheid', param_name: 'filter.v.availability', type: 'list', values: [{ label: 'Op voorraad', value: '1', count: products.length, active: avail.includes('1'), param_name: 'filter.v.availability', url_to_remove: urlWith((u) => u.delete('filter.v.availability')) }], active_values: [] },
    { label: 'Prijs', param_name: 'filter.v.price', type: 'price_range', range_max: maxPrice, min_value: { param_name: 'filter.v.price.gte', value: gte ? gte * 100 : null }, max_value: { param_name: 'filter.v.price.lte', value: lte ? lte * 100 : null }, url_to_remove: urlWith((u) => { u.delete('filter.v.price.gte'); u.delete('filter.v.price.lte'); }), active_values: [] },
    { label: 'Producttype', param_name: 'filter.p.product_type', type: 'list', values: typeValues, active_values: typeValues.filter((v) => v.active) },
  ];
  filters[0].active_values = filters[0].values.filter((v) => v.active);
  return { ...raw, url: base, products: filtered, products_count: filtered.length, all_products_count: total, featured_image: null, image: null, filters, sort_by: sort, default_sort_by: 'manual',
    sort_options: [['manual', 'Aanbevolen'], ['best-selling', 'Bestverkocht'], ['price-ascending', 'Prijs, laag naar hoog'], ['price-descending', 'Prijs, hoog naar laag'], ['created-descending', 'Datum, nieuw naar oud']].map(([value, name]) => ({ value, name })),
    metafields: { custom: { hero_heading: { value: raw.hero }, eyebrow: null, subtitle: null } } };
}
const linklist = (h) => { const m = mock.menus[h]; if (!m) return null; const wrap = (l) => ({ ...l, active: false, child_active: false, links: (l.links || []).map(wrap) }); return { handle: h, title: h, links: m.map(wrap) }; };

/* ---------- Cart (in-memory per cookie) ---------- */
const carts = new Map();
function cartFor(req) { const sid = (req.headers.cookie || '').match(/vk_sid=(\w+)/)?.[1] || 'default'; if (!carts.has(sid)) carts.set(sid, { items: [], note: '' }); return carts.get(sid); }
function findVariant(id) { for (const p of allProducts()) { const v = p.variants.find((x) => String(x.id) === String(id)); if (v) return { p, v }; } return null; }
function cartObject(c) {
  const items = c.items.map((it, i) => { const { p, v } = findVariant(it.id); return { key: `${v.id}:${i}`, id: v.id, variant_id: v.id, product_id: p.id, product: p, variant: v, title: p.title, quantity: it.quantity, price: v.price, final_price: v.price, line_price: v.price * it.quantity, final_line_price: v.price * it.quantity, original_line_price: v.price * it.quantity, url: v.url, image: null, properties: {}, line_level_discount_allocations: [], url_to_remove: `/cart/change?line=${i + 1}&quantity=0` }; });
  const total = items.reduce((a, b) => a + b.final_line_price, 0);
  return { items, item_count: items.reduce((a, b) => a + b.quantity, 0), total_price: total, items_subtotal_price: total, original_total_price: total, note: c.note, currency: { iso_code: 'EUR' }, cart_level_discount_applications: [], taxes_included: true, requires_shipping: true };
}
const cartJSON = (c) => { const o = cartObject(c); return { ...o, items: o.items.map((i) => ({ ...i, product: undefined, variant: undefined, product_title: i.product.title, variant_title: i.variant.title })) }; };

/* ---------- Liquid engine ---------- */
const preprocess = (src) => src.replace(/\b(posted_successfully|comments_enabled|moderated)\?/g, '$1_q');
const themeFs = {
  exists: async (f) => fs.existsSync(f), existsSync: (f) => fs.existsSync(f),
  readFile: async (f) => preprocess(fs.readFileSync(f, 'utf8')), readFileSync: (f) => preprocess(fs.readFileSync(f, 'utf8')),
  resolve: (root, file, ext) => path.resolve(root, file + (file.endsWith(ext) ? '' : ext)), contains: () => true, dirname: (f) => path.dirname(f), sep: path.sep,
};
const engine = new Liquid({ root: [path.join(ROOT, 'snippets')], partials: path.join(ROOT, 'snippets'), extname: '.liquid', jsTruthy: false, strictFilters: false, strictVariables: false, dynamicPartials: true, relativeReference: false, fs: themeFs });
const origParse = engine.parse.bind(engine);
engine.parse = (src, file) => origParse(preprocess(src), file);

// tags
class RawSkip extends Tag { constructor(token, remain, liquid, endName) { super(token, remain, liquid); const end = endName; while (remain.length) { const t = remain.shift(); if (t.name === end) return; } } *render() {} }
for (const [name, end] of [['schema', 'endschema'], ['doc', 'enddoc'], ['javascript', 'endjavascript'], ['stylesheet', 'endstylesheet']]) engine.registerTag(name, class extends RawSkip { constructor(t, r, l) { super(t, r, l, end); } });
engine.registerTag('layout', class extends Tag { *render() {} });
engine.registerTag('style', class extends Tag {
  constructor(token, remain, liquid) { super(token, remain, liquid); this.tpls = []; const stream = liquid.parser.parseStream(remain).on('tag:endstyle', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('endstyle missing'); }); stream.start(); }
  *render(ctx, emitter) { emitter.write('<style>'); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); emitter.write('</style>'); }
});
engine.registerTag('form', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    const m = token.args.match(/^\s*['"](\w+)['"]\s*(?:,\s*([\w.\[\]'"-]+)(?!\s*:))?\s*,?\s*([\s\S]*)$/);
    this.typeName = m ? m[1] : 'form'; this.hash = new Hash(m ? m[3] : '');
    this.tpls = []; const stream = liquid.parser.parseStream(remain).on('tag:endform', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('endform missing'); }); stream.start();
  }
  *render(ctx, emitter) {
    const attrs = yield this.hash.render(ctx);
    const actions = { product: '/cart/add', customer: '/contact#contact_form', contact: '/contact#contact_form', localization: '/localization', customer_login: '/account/login', create_customer: '/account', recover_customer_password: '/account/recover', storefront_password: '/password', new_comment: '/blogs/comments', customer_address: '/account/addresses', reset_customer_password: '/account/reset', activate_customer_password: '/account/activate', guest_login: '/account/login' };
    const t = this.typeName;
    const a = Object.entries(attrs).filter(([k]) => !['return_to'].includes(k)).map(([k, v]) => `${k.replace(/_/g, '-')}="${esc(v)}"`).join(' ');
    emitter.write(`<form method="post" action="${actions[t] || '/'}" accept-charset="UTF-8" ${a}><input type="hidden" name="form_type" value="${t}"><input type="hidden" name="utf8" value="✓">`);
    ctx.push({ form: { errors: null, posted_successfully_q: false, password_needed: true, set_as_default_checkbox: '<input type="checkbox" name="address[default]" value="1">' } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); ctx.pop(); emitter.write('</form>');
  }
});
engine.registerTag('paginate', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid); const m = token.args.match(/^\s*([\w.]+)\s+by\s+([\w.]+)/); this.path = m[1]; this.by = m[2];
    this.tpls = []; const stream = liquid.parser.parseStream(remain).on('tag:endpaginate', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('endpaginate missing'); }); stream.start();
  }
  *render(ctx, emitter) {
    const by = Number(isNaN(this.by) ? yield this.liquid.evalValue(this.by, ctx) : this.by);
    const parts = this.path.split('.'); const holder = yield this.liquid.evalValue(parts.slice(0, -1).join('.'), ctx); const key = parts.at(-1);
    const list = holder?.[key] || []; const page = Number(ctx.getSync(['current_page'])) || 1; const pages = Math.max(1, Math.ceil(list.length / by));
    const original = holder[key]; holder[key] = list.slice((page - 1) * by, page * by);
    const url = (n) => { const u = new URL(ctx.getSync(['request', 'url']) || 'http://x/', 'http://x'); u.searchParams.set('page', n); return u.pathname + u.search; };
    ctx.push({ paginate: { current_page: page, current_offset: (page - 1) * by, items: list.length, pages, page_size: by, next: page < pages ? { url: url(page + 1) } : null, previous: page > 1 ? { url: url(page - 1) } : null, parts: [] } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); ctx.pop(); holder[key] = original;
  }
});
engine.registerTag('section', class extends Tag { constructor(t, r, l) { super(t, r, l); this.name = t.args.trim().replace(/['"]/g, ''); } *render(ctx, emitter) { emitter.write(yield renderSection(this.name, null, ctx.getSync(['__page']), this.name)); } });
engine.registerTag('sections', class extends Tag {
  constructor(t, r, l) { super(t, r, l); this.name = t.args.trim().replace(/['"]/g, ''); }
  *render(ctx, emitter) { const g = readJSON(`sections/${this.name}.json`); for (const k of g.order) emitter.write(yield renderSection(g.sections[k].type, g.sections[k], ctx.getSync(['__page']), `sections--vk__${k}`)); }
});

// filters
const t = (key, vars = {}) => {
  let v = key.split('.').reduce((o, k) => o?.[k], locale());
  if (v && typeof v === 'object') v = vars.count == 1 ? v.one : v.other;
  if (v == null) return `<span style="color:red">translation missing: ${key}</span>`;
  return String(v).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? '');
};
const kw = (args) => Object.fromEntries(args.filter(Array.isArray));
const F = {
  t(key, ...args) { return t(key, kw(args)); },
  asset_url: (f) => `/assets/${f}`, shopify_asset_url: (f) => `/assets/${f}`, file_url: (f) => `/assets/${f}`,
  stylesheet_tag: (u) => `<link rel="stylesheet" href="${u}" media="all">`,
  preload_tag: (u, ...a) => { const o = kw(a); return `<link rel="preload" href="${u}" as="${o.as}"${o.type ? ` type="${o.type}"` : ''}${o.crossorigin ? ' crossorigin' : ''}>`; },
  money, money_with_currency: (c) => `${money(c)} EUR`, money_without_currency: (c) => money(c).replace('€', ''), money_without_trailing_zeros: (c) => money(c).replace(',00', ''),
  json: (v) => JSON.stringify(v ?? null), handle: handleize, handleize,
  image_url: (img, ...a) => img?.src ? `${img.src}` : '', image_tag: (u, ...a) => { const o = kw(a); return u ? `<img src="${u}" alt="${esc(o.alt)}" class="${o.class || ''}" loading="${o.loading || 'lazy'}">` : ''; },
  color_extract(hex, part) { const h = String(hex).replace('#', ''); const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); if (part === 'red') return r; if (part === 'green') return g; if (part === 'blue') return b; const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255; const l = (mx + mn) / 2; const s = mx === mn ? 0 : (l > .5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn)); return Math.round(s * 100); },
  color_brightness(hex) { const h = String(hex).replace('#', ''); return Math.round((parseInt(h.slice(0, 2), 16) * 299 + parseInt(h.slice(2, 4), 16) * 587 + parseInt(h.slice(4, 6), 16) * 114) / 1000); },
  payment_type_svg_tag: (type) => `<svg class="vk-payment-icon" viewBox="0 0 38 24" role="img" aria-label="${type}"><rect width="38" height="24" rx="4" fill="#F7F5F2"/><text x="19" y="15" font-size="7" text-anchor="middle" font-family="Arial" fill="#080808">${String(type).slice(0, 6).toUpperCase()}</text></svg>`,
  default_errors: () => '', default_pagination: () => '', structured_data: () => '{}', payment_button: () => '<div class="shopify-payment-button"><button class="shopify-payment-button__button vk-btn vk-btn--light vk-btn--block" type="button">Kopen met Shop Pay</button></div>',
  metafield_tag: (m) => m?.value ?? '', video_tag: () => '', media_tag: () => '', external_video_tag: () => '', model_viewer_tag: () => '', format_address: () => '<p>VOLKARA B.V.<br>Amsterdam</p>', format_code: (c) => c,
  time_tag: (d) => `<time>${new Date(d).toDateString()}</time>`, link_to: (txt, url) => `<a href="${url}">${txt}</a>`, url_encode: (s) => encodeURIComponent(s ?? ''),
  at_least: (a, b) => Math.max(Number(a), Number(b)), newline_to_br: (s) => String(s ?? '').replace(/\n/g, '<br />'),
  date(d, fmt, ...rest) { const o = kw([fmt, ...rest]); if (d === 'now') d = new Date(); const dt = new Date(d); if (fmt === '%Y') return dt.getFullYear(); if (fmt === '%s') return Math.floor(dt / 1000); if (o.format || Array.isArray(fmt)) return dt.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }); return dt.toLocaleDateString('nl-NL'); },
};
for (const [k, fn] of Object.entries(F)) engine.registerFilter(k, fn);

/* ---------- Section rendering ---------- */
function sectionSchema(type) { const src = read(`sections/${type}.liquid`); const m = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/); return m ? JSON.parse(m[1]) : {}; }
function resolveSettings(defs, values) {
  const out = {};
  for (const d of defs || []) { if (!d.id) continue; let v = values && d.id in values ? values[d.id] : d.default; out[d.id] = resolveValue(d.type, v); }
  return out;
}
function resolveValue(type, v) {
  if (v === undefined || v === '') v = type === 'checkbox' ? false : (['range', 'number'].includes(type) ? v : null);
  if (v == null) return v ?? null;
  if (type === 'collection') return collectionByHandle(v);
  if (type === 'product') return productByHandle(v);
  if (type === 'link_list') return linklist(v);
  if (type === 'color_scheme') return v;
  if (type === 'image_picker' || type === 'video' || type === 'page') return null;
  return v;
}
async function renderSection(type, data, page, id) {
  const file = `sections/${type}.liquid`;
  if (!fs.existsSync(path.join(ROOT, file))) return `<!-- missing section ${type} -->`;
  const schema = sectionSchema(type); const settings = resolveSettings(schema.settings, data?.settings);
  const defs = Object.fromEntries((schema.blocks || []).map((b) => [b.type, b]));
  const order = data?.block_order || Object.keys(data?.blocks || {});
  const blocks = order.map((k) => { const b = data.blocks[k]; return { id: `${id}-${k}`, type: b.type, settings: resolveSettings(defs[b.type]?.settings, b.settings), shopify_attributes: '' }; });
  const section = { id, settings, blocks, index: page.__index = (page.__index || 0) + 1 };
  try {
    const html = await engine.parseAndRender(read(file), { ...page, section, __page: page }, { globals: page });
    return `<div id="shopify-section-${id}" class="shopify-section ${schema.class || ''}">${html}</div>`;
  } catch (e) {
    const msg = `${type}: ${e.message}`; errors.push(msg); console.error('✗', msg);
    return `<div style="background:#3b0d0b;color:#ffb4a8;padding:1rem;font:13px monospace;border:1px solid #D7261E">Liquid error in ${esc(type)}: ${esc(e.message)}</div>`;
  }
}

/* ---------- Pages ---------- */
function baseContext(req, url, cart) {
  const settings = themeSettings();
  const all = allProducts();
  return {
    shop: { name: 'VOLKARA', url: `http://localhost:${PORT}`, currency: 'EUR', money_format: '€{{amount_with_comma_separator}}', money_with_currency_format: '€{{amount_with_comma_separator}} EUR', enabled_payment_types: ['visa', 'master', 'american_express', 'paypal', 'apple_pay', 'ideal', 'klarna'], customer_accounts_enabled: true, policies: [], shipping_policy: { body: 'x', url: '/policies/shipping-policy' } },
    settings, cart: cartObject(cart), customer: null, current_page: Number(url.searchParams.get('page')) || 1,
    request: { locale: { iso_code: 'nl' }, design_mode: false, path: url.pathname, url: url.pathname + url.search, host: 'localhost' },
    routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update', cart_clear_url: '/cart/clear', predictive_search_url: '/search/suggest', product_recommendations_url: '/recommendations/products', search_url: '/search', collections_url: '/collections', all_products_collection_url: '/collections/all', account_url: '/account', account_login_url: '/account/login', account_logout_url: '/account/logout', account_register_url: '/account/register', account_addresses_url: '/account/addresses' },
    localization: { available_countries: [], available_languages: [] },
    collections: Object.fromEntries(mock.collections.map((c) => [c.handle, collectionByHandle(c.handle)])),
    all_products: Object.fromEntries(all.map((p) => [p.handle, p])),
    linklists: Object.fromEntries(Object.keys(mock.menus).map((h) => [h, linklist(h)])),
    canonical_url: url.href, content_for_header: '', page_title: 'VOLKARA', additional_checkout_buttons: false,
    recommendations: { performed: true, products: all.slice(0, 6), products_count: 6 },
  };
}
async function renderTemplate(name, ctx, onlySection) {
  const tpl = readJSON(`templates/${name}.json`);
  ctx.template = { name: name.split('.')[0], suffix: name.split('.')[1] || null, toString() { return name; } };
  if (onlySection) { const key = Object.keys(tpl.sections).find((k) => onlySection === `template--vk__${k}` || onlySection === tpl.sections[k].type); if (key) return renderSection(tpl.sections[key].type, tpl.sections[key], ctx, `template--vk__${key}`); return renderSection(onlySection, null, ctx, onlySection); }
  let body = ''; for (const k of tpl.order) body += await renderSection(tpl.sections[k].type, tpl.sections[k], ctx, `template--vk__${k}`);
  const layout = tpl.layout === 'password' ? 'password' : 'theme';
  return engine.parseAndRender(read(`layout/${layout}.liquid`), { ...ctx, content_for_layout: body, __page: ctx }, { globals: ctx });
}

function route(url) {
  const p = url.pathname; let m;
  if (p === '/') return { template: 'index' };
  if ((m = p.match(/^\/collections\/([\w-]+)$/))) return { template: 'collection', collection: m[1] };
  if (p === '/collections') return { template: 'list-collections' };
  if ((m = p.match(/^\/products\/([\w-]+)$/))) return { template: 'product', product: m[1] };
  if (p === '/cart') return { template: 'cart' };
  if (p === '/search') return { template: 'search' };
  if ((m = p.match(/^\/pages\/([\w-]+)$/))) return { template: 'page', page: m[1] };
  if (p === '/blogs/journal') return { template: 'blog' };
  if ((m = p.match(/^\/blogs\/journal\/([\w-]+)$/))) return { template: 'article', article: m[1] };
  if (p === '/account/login') return { template: 'customers/login' };
  if (p === '/password') return { template: 'password' };
  return { template: '404' };
}

async function handlePage(req, res, url) {
  const cart = cartFor(req); const r = route(url); const ctx = baseContext(req, url, cart);
  let template = r.template;
  if (r.collection) { ctx.collection = collectionByHandle(r.collection, url.searchParams); if (!ctx.collection) template = '404'; }
  if (r.product) { const p = productByHandle(r.product); if (!p) template = '404'; else { const vid = url.searchParams.get('variant'); const v = p.variants.find((x) => String(x.id) === vid); ctx.product = { ...p, selected_or_first_available_variant: v || p.variants[0], selected_variant: v || null, options_with_values: p.options_with_values.map((o, i) => ({ ...o, selected_value: (v || p.variants[0]).options[i] })) }; ctx.page_title = p.title; if (p.template_suffix && fs.existsSync(path.join(ROOT, `templates/product.${p.template_suffix}.json`))) template = `product.${p.template_suffix}`; } }
  if (r.page) { const pg = mock.pages.find((x) => x.handle === r.page); if (!pg) template = '404'; else { ctx.page = pg; if (pg.template_suffix && fs.existsSync(path.join(ROOT, `templates/page.${pg.template_suffix}.json`))) template = `page.${pg.template_suffix}`; } }
  if (template === 'blog' || template === 'article') { const arts = mock.articles.map((a) => ({ ...a, url: `/blogs/journal/${a.handle}`, image: null, excerpt_or_content: a.content, comments_count: 0, comments: [] })); ctx.blog = { title: 'Journaal', url: '/blogs/journal', articles: arts, all_tags: ['Techniek', 'Verhaal', 'Technologie'], comments_enabled_q: false }; if (r.article) { ctx.article = arts.find((a) => a.handle === r.article); if (!ctx.article) template = '404'; } }
  if (template === 'search') { const q = (url.searchParams.get('q') || '').toLowerCase(); const results = q ? allProducts().filter((p) => p.title.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)).map((p) => ({ ...p, object_type: 'product' })) : []; ctx.search = { performed: !!q, terms: q, results, results_count: results.length }; }
  if (template === 'cart' || url.pathname === '/recommendations/products') ctx.product = ctx.product || null;
  const sid = url.searchParams.get('section_id'); const sids = url.searchParams.get('sections');
  if (url.pathname === '/search/suggest') {
    const q = (url.searchParams.get('q') || '').toLowerCase(); const prods = allProducts().filter((p) => p.title.toLowerCase().includes(q)).slice(0, 6);
    ctx.predictive_search = { performed: true, terms: q, resources: { products: prods, collections: mock.collections.filter((c) => c.title.toLowerCase().includes(q)).map((c) => ({ ...c, url: `/collections/${c.handle}` })), pages: [], articles: [], queries: [] } };
    return send(res, 200, await renderSection('vk-predictive-search', null, ctx, 'vk-predictive-search'));
  }
  if (url.pathname === '/recommendations/products') {
    const p = allProducts().find((x) => String(x.id) === url.searchParams.get('product_id')); ctx.product = p;
    ctx.recommendations = { performed: true, products: allProducts().filter((x) => x !== p).slice(0, Number(url.searchParams.get('limit')) || 4), products_count: 4 };
    return send(res, 200, await renderTemplate('product', ctx, sid));
  }
  if (sid) return send(res, 200, sid.startsWith('vk-cart') ? await renderSection(sid, null, ctx, sid) : await renderTemplate(template, ctx, sid));
  if (sids) { const out = {}; for (const id of sids.split(',')) out[id] = await renderSection(id, null, ctx, id); return send(res, 200, JSON.stringify(out), 'application/json'); }
  const html = await renderTemplate(template, ctx);
  send(res, template === '404' && url.pathname !== '/404' ? 404 : 200, html);
}

/* ---------- Ajax cart ---------- */
async function body(req) { const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks).toString(); const ct = req.headers['content-type'] || '';
  if (ct.includes('json')) return JSON.parse(raw || '{}');
  if (ct.includes('multipart')) { const out = {}; const boundary = ct.split('boundary=')[1]; for (const part of raw.split('--' + boundary)) { const m = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/); if (m) out[m[1]] = m[2]; } return out; }
  return Object.fromEntries(new URLSearchParams(raw)); }
async function sectionsFor(req, ids, cart) { const out = {}; const ctx = baseContext(req, new URL('http://x/'), cart); for (const id of String(ids || '').split(',').filter(Boolean)) out[id] = await renderSection(id, null, ctx, id); return out; }
async function handleCart(req, res, url) {
  const cart = cartFor(req); const b = req.method === 'POST' ? await body(req) : {};
  if (url.pathname === '/cart.js') return send(res, 200, JSON.stringify(cartJSON(cart)), 'application/json');
  if (url.pathname === '/cart/add.js') {
    const items = []; if (b.id) items.push({ id: b.id, quantity: Number(b.quantity) || 1 });
    for (let i = 0; i < 5; i++) if (b[`items[${i}][id]`]) items.push({ id: b[`items[${i}][id]`], quantity: Number(b[`items[${i}][quantity]`]) || 1 });
    for (const it of items) { if (!findVariant(it.id)) return send(res, 422, JSON.stringify({ status: 422, description: 'Variant not found' }), 'application/json'); const ex = cart.items.find((x) => String(x.id) === String(it.id)); ex ? (ex.quantity += it.quantity) : cart.items.push(it); }
    return send(res, 200, JSON.stringify({ id: items[0]?.id, quantity: items[0]?.quantity, sections: await sectionsFor(req, b.sections, cart) }), 'application/json');
  }
  if (url.pathname === '/cart/change.js') { const line = Number(b.line) - 1; if (cart.items[line]) { if (Number(b.quantity) === 0) cart.items.splice(line, 1); else cart.items[line].quantity = Number(b.quantity); } return send(res, 200, JSON.stringify({ ...cartJSON(cart), sections: await sectionsFor(req, (b.sections || []).join ? b.sections.join(',') : b.sections, cart) }), 'application/json'); }
  if (url.pathname === '/cart/update.js') { if ('note' in b) cart.note = b.note; return send(res, 200, JSON.stringify(cartJSON(cart)), 'application/json'); }
  return send(res, 404, '{}', 'application/json');
}

function send(res, status, bodyText, type = 'text/html; charset=utf-8') { res.writeHead(status, { 'Content-Type': type, 'Set-Cookie': 'vk_sid=preview; Path=/' }); res.end(bodyText); }
const MIME = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname.startsWith('/assets/')) { const f = path.join(ROOT, 'assets', path.basename(url.pathname)); if (!fs.existsSync(f)) return send(res, 404, 'not found', 'text/plain'); res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); return res.end(fs.readFileSync(f)); }
    if (url.pathname.startsWith('/cart') && url.pathname.endsWith('.js')) return await handleCart(req, res, url);
    if (url.pathname === '/__errors') return send(res, 200, JSON.stringify(errors), 'application/json');
    await handlePage(req, res, url);
  } catch (e) { console.error(e); errors.push(String(e.message)); send(res, 500, `<pre style="color:#ffb4a8;background:#111;padding:2rem">${esc(e.stack)}</pre>`); }
}).listen(PORT, () => console.log(`VOLKARA preview → http://localhost:${PORT}`));
