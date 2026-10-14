// Generates data/products-import.csv (Shopify product CSV) from the preview mock catalog.
// Usage: npm run products:csv
import { writeFileSync } from 'node:fs';
import { products } from './preview/mock/catalog.mjs';

const head = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service',
  'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text',
  'SEO Title', 'SEO Description', 'Status',
  'Subtitle (product.metafields.custom.subtitle)', 'Badge (product.metafields.custom.badge)', 'Specs (product.metafields.custom.specs)'];
const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const money = (c) => (c == null ? '' : (c / 100).toFixed(2));
// Nederlandse SEO-omschrijving: ondertitel + een korte, controleerbare regel per soort product.
const SEO_LINE = {
  Mes: 'Mes van gelaagd damascusstaal van Volkara.',
  Accessoire: 'Accessoire van Volkara, gemaakt om bij je pannen te passen.',
};
const seoDescription = (p) => `${p.metafields.custom.subtitle} ${SEO_LINE[p.type] || 'Titanium kookoppervlak zonder coating, PFAS- en PTFE-vrij. Geschikt voor inductie en alle warmtebronnen.'}`;
const seoTitle = (p) => { const t = p.title.replace(/^Volkara /, ''); return `${t.charAt(0).toUpperCase()}${t.slice(1)} | Volkara`; };
const rows = [head];
// Preview-only fixtures (e.g. the test e-book) never go into the store import.
for (const p of products.filter((x) => !x.tags?.includes('preview-only'))) {
  const m = p.metafields.custom;
  p.variants.forEach((v, i) => {
    const first = i === 0;
    const single = v.title === 'Default Title';
    rows.push([
      p.handle, first ? p.title : '', first ? p.description : '', first ? p.vendor : '', first ? 'Home & Garden > Kitchen & Dining > Cookware & Bakeware' : '',
      first ? p.type : '', first ? [...p.tags, ...p.collections].join(', ') : '', first ? 'TRUE' : '',
      first ? (single ? 'Title' : p.options[0]) : '', v.title, v.sku, 1500, 'shopify', 0, 'deny', 'manual',
      money(v.price), money(v.compare_at_price), 'TRUE', 'TRUE', '', '', '',
      first ? seoTitle(p) : '', first ? seoDescription(p) : '', first ? 'draft' : '',
      first ? m.subtitle : '', first ? (m.badge || '') : '', first ? JSON.stringify(m.specs.value) : '',
    ]);
  });
}
writeFileSync(new URL('../data/products-import.csv', import.meta.url), rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
console.log(`Wrote ${rows.length - 1} variant rows for ${products.length} products.`);
